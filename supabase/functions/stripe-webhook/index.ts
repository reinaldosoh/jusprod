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
      
      // Extrair dados dos metadados
      const planName = session.metadata.plan_name;
      const isYearly = session.metadata.is_yearly === 'true';
      const customerEmail = session.metadata.customer_email;
      const sessionId = session.id;
      const amountPaid = session.amount_total / 100; // Converter de centavos

      console.log('Processando pagamento confirmado:', {
        planName,
        isYearly,
        customerEmail,
        sessionId,
        amountPaid
      });

      // Buscar usuário pelo email
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('id, role_atual')
        .eq('email', customerEmail)
        .single();

      if (userError || !userData) {
        console.error('Usuário não encontrado:', customerEmail);
        return new Response('Usuário não encontrado', { status: 404 });
      }

      const userId = userData.id;
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
        .eq('id', userId);

      if (updateUserError) {
        console.error('Erro ao atualizar usuário:', updateUserError);
        return new Response('Erro ao atualizar usuário', { status: 500 });
      }

      // Criar registro de assinatura
      const { error: subscriptionError } = await supabase
        .from('usuario_assinaturas')
        .insert({
          usuario_id: userId,
          plano_id: planId,
          status: 'ativa',
          data_inicio: dataInicio.toISOString().split('T')[0],
          data_fim: dataFim.toISOString().split('T')[0],
          preco_pago: amountPaid,
          gateway_pagamento: 'stripe',
          transaction_id: sessionId,
          auto_renovar: true
        });

      if (subscriptionError) {
        console.error('Erro ao criar assinatura:', subscriptionError);
        return new Response('Erro ao criar assinatura', { status: 500 });
      }

      console.log(`Assinatura ${planName} ativada para usuário ${userId}`);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Erro interno', { status: 500 });
  }
}); 