import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// SEMPRE usar variável de ambiente - NUNCA hardcode
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { status: 405, headers: corsHeaders }
      );
    }

    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'STRIPE_SECRET_KEY não configurada' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { planId, billingCycle, userUuid } = body;
    
    if (!planId || !billingCycle || !userUuid) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados do usuário incluindo assinatura atual
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('id, role_atual, email')
      .eq('uuid', userUuid)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Buscar assinatura ativa no banco
    const { data: assinaturaData } = await supabase
      .from('usuario_assinaturas')
      .select('transaction_id, status')
      .eq('usuario_id', userData.id)
      .eq('status', 'ativa')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Buscar dados do plano de destino
    const { data: planData, error: planError } = await supabase
      .from('planos')
      .select('id, nome')
      .eq('nome', planId)
      .single();

    if (planError || !planData) {
      return new Response(
        JSON.stringify({ error: 'Plano não encontrado no banco de dados' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Mapear price IDs corretos
    const priceIds = {
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
    
    const newPriceId = priceIds[planId]?.[billingCycle];
    if (!newPriceId) {
      return new Response(
        JSON.stringify({ error: 'Plano ou período inválido' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Definir o período em português
    const billingPeriod = billingCycle === 'yearly' ? 'anual' : 'mensal';
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';
    
    // ===== LÓGICA PRINCIPAL: UPGRADE/DOWNGRADE vs NOVA ASSINATURA =====
    
    if (assinaturaData && userData.role_atual !== 'free') {
      // CENÁRIO 1: USUÁRIO JÁ TEM ASSINATURA ATIVA - CRIAR NOVA (N8N FARÁ CANCELAMENTO)
      console.log('🔄 Usuário tem assinatura ativa, criando nova sessão (n8n fará cancelamento após pagamento)');
      
      // Criar nova sessão de checkout (assinatura atual permanece ativa até n8n processar)
      const checkoutData = new URLSearchParams({
        'mode': 'subscription',
        'success_url': `${baseUrl}/dashboard?upgrade=success&plano=${planId}&periodo=${billingCycle}`,
        'cancel_url': `${baseUrl}/planos`,
        'customer_email': userData.email,
        'line_items[0][price]': newPriceId,
        'line_items[0][quantity]': '1',
        // Metadados no checkout session (para checkout.session.completed)
        'metadata[plan_id]': planId,
        'metadata[plan_destino_id]': planData.id.toString(),
        'metadata[user_id]': userData.id.toString(),
        'metadata[user_uuid]': userUuid,
        'metadata[tipo_transacao]': 'upgrade',
        'metadata[plano_atual]': userData.role_atual,
        'metadata[billing_cycle]': billingCycle,
        // Metadados na subscription (para invoice.payment_succeeded)
        'subscription_data[metadata][plan_name]': planId,
        'subscription_data[metadata][plan_id]': planData.id.toString(),
        'subscription_data[metadata][plan_destino_id]': planData.id.toString(),
        'subscription_data[metadata][user_id]': userData.id.toString(),
        'subscription_data[metadata][user_uuid]': userUuid,
        'subscription_data[metadata][tipo_transacao]': 'upgrade',
        'subscription_data[metadata][plano_atual]': userData.role_atual,
        'subscription_data[metadata][billing_cycle]': billingCycle,
        'subscription_data[metadata][billing_period]': billingPeriod,
        'allow_promotion_codes': 'true'
      });

      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: checkoutData.toString()
      });

      if (!stripeResponse.ok) {
        const errorText = await stripeResponse.text();
        console.error('Erro do Stripe (upgrade):', errorText);
        return new Response(
          JSON.stringify({ error: `Erro do Stripe: ${stripeResponse.status}` }),
          { status: 500, headers: corsHeaders }
        );
      }

      const session = await stripeResponse.json();

      return new Response(
        JSON.stringify({ 
          checkout_url: session.url,
          session_id: session.id,
          type: 'upgrade'
        }),
        { status: 200, headers: corsHeaders }
      );
      
    } else {
      // CENÁRIO 2: USUÁRIO FREE OU SEM ASSINATURA - CRIAR NOVA ASSINATURA
      console.log('🆕 Criando nova assinatura para usuário free');
      
      const checkoutData = new URLSearchParams({
        'mode': 'subscription',
        'success_url': `${baseUrl}/pagamento-confirmado?assinaturarealizadasucesso=true`,
        'cancel_url': `${baseUrl}/planos`,
        'customer_email': userData.email,
        'line_items[0][price]': newPriceId,
        'line_items[0][quantity]': '1',
        // Metadados no checkout session (para checkout.session.completed)
        'metadata[plan_id]': planId,
        'metadata[plan_destino_id]': planData.id.toString(),
        'metadata[user_id]': userData.id.toString(),
        'metadata[user_uuid]': userUuid,
        'metadata[tipo_transacao]': 'novo',
        'metadata[plano_atual]': userData.role_atual,
        'metadata[billing_cycle]': billingCycle,
        // Metadados na subscription (para invoice.payment_succeeded)
        'subscription_data[metadata][plan_name]': planId,
        'subscription_data[metadata][plan_id]': planData.id.toString(),
        'subscription_data[metadata][plan_destino_id]': planData.id.toString(),
        'subscription_data[metadata][user_id]': userData.id.toString(),
        'subscription_data[metadata][user_uuid]': userUuid,
        'subscription_data[metadata][tipo_transacao]': 'novo',
        'subscription_data[metadata][plano_atual]': userData.role_atual,
        'subscription_data[metadata][billing_cycle]': billingCycle,
        'subscription_data[metadata][billing_period]': billingPeriod,
        'allow_promotion_codes': 'true'
      });

      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: checkoutData.toString()
      });

      if (!stripeResponse.ok) {
        const errorText = await stripeResponse.text();
        console.error('Erro do Stripe (nova assinatura):', errorText);
        return new Response(
          JSON.stringify({ error: `Erro do Stripe: ${stripeResponse.status}` }),
          { status: 500, headers: corsHeaders }
        );
      }

      const session = await stripeResponse.json();

      return new Response(
        JSON.stringify({ 
          checkout_url: session.url,
          session_id: session.id,
          type: 'new_subscription'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}); 