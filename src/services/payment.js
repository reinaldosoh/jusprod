import { supabase } from '../lib/supabase.js';

// Mapeamento dos planos para os price IDs do Stripe
const STRIPE_PRICE_IDS = {
  silver: {
    monthly: 'price_1RdCCnQodJis8Zpg7xaReK6k',
    yearly: 'price_1RdCFCQodJis8Zpg4gdV9gHA'
  },
  gold: {
    monthly: 'price_1RdCHKQodJis8Zpgz0EU95R2',
    yearly: 'price_1RdCGJQodJis8ZpgSukT48LP'
  },
  platinum: {
    monthly: 'price_1RdCIIQodJis8ZpgzZfvaM6K',
    yearly: 'price_1RdCJEQodJis8ZpglV5vnL6j'
  }
};

/**
 * Cria uma sessão de checkout do Stripe
 * @param {string} plano - Nome do plano (silver, gold, platinum)
 * @param {boolean} isAnual - Se é assinatura anual
 * @param {string} userUuid - UUID do usuário autenticado
 * @returns {Promise<string>} - URL de redirecionamento para o checkout
 */
export async function createCheckoutSession(plano, isAnual, userUuid) {
  try {
    // Validar se o plano existe
    if (!STRIPE_PRICE_IDS[plano]) {
      throw new Error(`Plano ${plano} não encontrado`);
    }

    const billingCycle = isAnual ? 'yearly' : 'monthly';
    const priceId = STRIPE_PRICE_IDS[plano][billingCycle];
    
    console.log('🚀 Criando checkout session:', { plano, billingCycle, priceId, userUuid });
    
    // Chamar a edge function para criar a sessão de checkout
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        planId: plano, // Enviar o nome do plano (não o price ID)
        billingCycle: billingCycle,
        userUuid: userUuid
      }
    });

    if (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      throw error;
    }

    // Verificar se foi um upgrade direto (sem checkout necessário)
    if (data?.upgrade_success) {
      console.log('✅ Upgrade realizado diretamente:', data.message);
      return { upgrade_success: true, message: data.message };
    }

    if (!data?.checkout_url) {
      throw new Error('URL de checkout não recebida');
    }

    console.log('✅ Checkout session criada:', data.session_id);
    return data.checkout_url;
  } catch (error) {
    console.error('Erro no createCheckoutSession:', error);
    throw error;
  }
}

/**
 * Verifica o plano atual do usuário autenticado
 * @returns {Promise<Object>} - Dados do plano atual
 */
export async function getCurrentUserPlan() {
  try {
    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('usuario')
      .select(`
        id,
        uuid,
        role_atual,
        assinatura_ativa,
        plano_atual_id,
        planos:plano_atual_id (
          id,
          nome,
          descricao,
          preco
        )
      `)
      .eq('uuid', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar plano do usuário:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro no getCurrentUserPlan:', error);
    throw error;
  }
}

/**
 * Atualiza o plano do usuário após pagamento confirmado
 * @param {string} userId - ID do usuário
 * @param {string} planName - Nome do plano
 * @param {string} transactionId - ID da transação do Stripe
 * @param {number} pricePaid - Valor pago
 * @param {boolean} isYearly - Se é assinatura anual
 * @returns {Promise<Object>} - Resultado da atualização
 */
export async function updateUserPlan(userId, planName, transactionId, pricePaid, isYearly) {
  try {
    // Buscar o ID do plano pelo nome
    const { data: planoData, error: planoError } = await supabase
      .from('planos')
      .select('id')
      .eq('nome', planName)
      .single();

    if (planoError) {
      console.error('Erro ao buscar plano:', planoError);
      throw planoError;
    }

    const planId = planoData.id;

    // Calcular data de fim da assinatura
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataInicio.getDate() + (isYearly ? 365 : 30));

    // Atualizar tabela usuario
    const { error: usuarioError } = await supabase
      .from('usuario')
      .update({
        role_atual: planName,
        assinatura_ativa: true,
        plano_atual_id: planId
      })
      .eq('id', userId);

    if (usuarioError) {
      console.error('Erro ao atualizar usuário:', usuarioError);
      throw usuarioError;
    }

    // Criar registro na tabela usuario_assinaturas
    const { error: assinaturaError } = await supabase
      .from('usuario_assinaturas')
      .insert({
        usuario_id: userId,
        plano_id: planId,
        status: 'ativa',
        data_inicio: dataInicio.toISOString().split('T')[0],
        data_fim: dataFim.toISOString().split('T')[0],
        preco_pago: pricePaid,
        gateway_pagamento: 'stripe',
        transaction_id: transactionId,
        auto_renovar: true
      });

    if (assinaturaError) {
      console.error('Erro ao criar assinatura:', assinaturaError);
      throw assinaturaError;
    }

    return { success: true };
  } catch (error) {
    console.error('Erro no updateUserPlan:', error);
    throw error;
  }
}

/**
 * Verifica se o usuário pode fazer upgrade (não é plano free)
 * @param {string} currentPlan - Plano atual do usuário
 * @returns {boolean} - Se é upgrade
 */
export function isUpgrade(currentPlan) {
  return currentPlan && currentPlan !== 'free';
} 