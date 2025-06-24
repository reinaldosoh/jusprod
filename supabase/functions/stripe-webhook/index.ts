import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// SEMPRE usar variável de ambiente - NUNCA hardcode
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Parse do evento do Stripe
    const event = JSON.parse(body);

    console.log('Evento recebido:', event.type);

    // Processar apenas eventos de checkout completado
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Extrair dados dos metadados (agora usando subscription_data)
      const metadata = session.subscription_data?.metadata || session.metadata || {};
      const planName = metadata.plan_name;
      const billingCycle = metadata.billing_cycle || 'monthly';
      const billingPeriod = metadata.billing_period || (billingCycle === 'yearly' ? 'anual' : 'mensal');
      const isYearly = billingCycle === 'yearly';
      const customerEmail = session.customer_email || session.metadata?.customer_email;
      const userId = metadata.user_id;
      const userUuid = metadata.user_uuid;
      const tipoTransacao = metadata.tipo_transacao || 'novo';
      const planoAnterior = metadata.plano_anterior || metadata.plano_atual;
      const sessionId = session.id;
      const subscriptionId = session.subscription; // ID da assinatura criada
      const amountPaid = session.amount_total / 100; // Converter de centavos

      console.log('Processando pagamento confirmado:', {
        planName,
        billingCycle,
        billingPeriod,
        isYearly,
        customerEmail,
        userId,
        userUuid,
        tipoTransacao,
        planoAnterior,
        sessionId,
        subscriptionId,
        amountPaid
      });

      // Buscar usuário pelo UUID se disponível, senão pelo email
      let userData;
      if (userUuid) {
        const { data, error } = await supabase
          .from('usuario')
          .select('id, role_atual, email')
          .eq('uuid', userUuid)
          .single();
        userData = data;
      } else {
        const { data, error } = await supabase
          .from('usuario')
          .select('id, role_atual, email')
          .eq('email', customerEmail)
          .single();
        userData = data;
      }

      if (!userData) {
        console.error('Usuário não encontrado:', { userUuid, customerEmail });
        return new Response('Usuário não encontrado', { status: 404 });
      }

      const actualUserId = userData.id;
      const currentPlan = userData.role_atual;

      // Buscar dados do plano
      const { data: planData, error: planError } = await supabase
        .from('planos')
        .select('id')
        .eq('nome', planName)
        .single();

      if (planError || !planData) {
        console.error('Plano não encontrado:', planName);
        return new Response('Plano não encontrado', { status: 404 });
      }

      const planId = planData.id;

      // ===== LÓGICA PRINCIPAL: TRATAR UPGRADE vs NOVA ASSINATURA =====
      
      if (tipoTransacao === 'upgrade' && planoAnterior !== 'free') {
        console.log('🔄 Processando UPGRADE de assinatura');
        
        // 1. PRIMEIRO: Cancelar assinaturas antigas no Stripe (SEGURO - pagamento já confirmado)
        const subscriptionsToCancel = metadata.subscriptions_to_cancel;
        if (subscriptionsToCancel) {
          const subscriptionIds = subscriptionsToCancel.split(',').filter(id => id);
          
          console.log(`🔥 Cancelando ${subscriptionIds.length} assinatura(s) antiga(s) no Stripe`);
          
          for (const subscriptionId of subscriptionIds) {
            try {
              const cancelResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
              });
              
              if (cancelResponse.ok) {
                console.log(`✅ Assinatura ${subscriptionId} cancelada no Stripe`);
              } else {
                console.error(`❌ Erro ao cancelar assinatura ${subscriptionId}:`, await cancelResponse.text());
              }
            } catch (error) {
              console.error(`❌ Erro ao cancelar assinatura ${subscriptionId}:`, error);
            }
          }
        }
        
        // 2. SEGUNDO: Cancelar registros antigos no banco de dados
        const { error: cancelError } = await supabase
          .from('usuario_assinaturas')
          .update({ 
            status: 'cancelada',
            cancelada_em: new Date().toISOString()
          })
          .eq('usuario_id', actualUserId)
          .eq('status', 'ativa');

        if (cancelError) {
          console.error('Erro ao cancelar assinatura anterior no banco:', cancelError);
        } else {
          console.log('✅ Assinatura anterior cancelada no banco com sucesso');
        }
      }

      // Calcular datas
      const dataInicio = new Date();
      const dataFim = new Date();
      dataFim.setDate(dataInicio.getDate() + (isYearly ? 365 : 30));

      // Atualizar tabela usuario
      const { error: updateUserError } = await supabase
        .from('usuario')
        .update({
          role_atual: planName,
          assinatura_ativa: true,
          plano_atual_id: planId
        })
        .eq('id', actualUserId);

      if (updateUserError) {
        console.error('Erro ao atualizar usuário:', updateUserError);
        return new Response('Erro ao atualizar usuário', { status: 500 });
      }

      // Criar registro de nova assinatura
      const { error: subscriptionError } = await supabase
        .from('usuario_assinaturas')
        .insert({
          usuario_id: actualUserId,
          plano_id: planId,
          status: 'ativa',
          periodo: billingPeriod,
          data_inicio: dataInicio.toISOString().split('T')[0],
          data_fim: dataFim.toISOString().split('T')[0],
          preco_pago: amountPaid,
          gateway_pagamento: 'stripe',
          transaction_id: subscriptionId || sessionId, // Preferir subscription_id
          auto_renovar: true
        });

      if (subscriptionError) {
        console.error('Erro ao criar assinatura:', subscriptionError);
        return new Response('Erro ao criar assinatura', { status: 500 });
      }

      const transacaoTexto = tipoTransacao === 'upgrade' ? 'atualizada' : 'ativada';
      console.log(`✅ Assinatura ${planName} ${transacaoTexto} para usuário ${actualUserId}`);
      
      // Log adicional para upgrades
      if (tipoTransacao === 'upgrade') {
        console.log(`🎯 UPGRADE: ${planoAnterior} → ${planName} (${billingPeriod})`);
      }
    }
    
    // Processar eventos de modificação de assinatura (para upgrades diretos via API)
    else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const metadata = subscription.metadata || {};
      
      if (metadata.user_id && metadata.plan_name) {
        console.log('🔄 Processando atualização direta de assinatura');
        
        const userId = metadata.user_id;
        const planName = metadata.plan_name;
        const billingPeriod = metadata.billing_period || 'mensal';
        
        // Buscar dados do plano
        const { data: planData } = await supabase
          .from('planos')
          .select('id')
          .eq('nome', planName)
          .single();
          
        if (planData) {
          // Atualizar usuário
          await supabase
            .from('usuario')
            .update({
              role_atual: planName,
              plano_atual_id: planData.id
            })
            .eq('id', userId);
            
          // Atualizar assinatura ativa
          await supabase
            .from('usuario_assinaturas')
            .update({
              plano_id: planData.id,
              periodo: billingPeriod
            })
            .eq('usuario_id', userId)
            .eq('status', 'ativa');
            
          console.log(`✅ Assinatura atualizada diretamente: ${planName} (${billingPeriod})`);
        }
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Erro interno', { status: 500 });
  }
}); 