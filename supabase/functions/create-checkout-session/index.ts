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

    // Buscar dados do usuário
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
    
    const priceId = priceIds[planId]?.[billingCycle];
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Plano ou período inválido' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Determinar URLs de redirecionamento simples
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';
    const successUrl = `${baseUrl}/dashboard`;
    const cancelUrl = `${baseUrl}/planos`;

    // Criar sessão no Stripe com TODOS os metadados necessários
    const checkoutData = new URLSearchParams({
      'mode': 'subscription',
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      'customer_email': userData.email,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'metadata[plan_name]': planId,
      'metadata[plan_id]': planData.id.toString(),
      'metadata[plan_destino_id]': planData.id.toString(),
      'metadata[user_id]': userData.id.toString(),
      'metadata[user_uuid]': userUuid,
      'metadata[billing_cycle]': billingCycle,
      'metadata[tipo_transacao]': userData.role_atual === 'free' ? 'novo' : 'upgrade',
      'metadata[plano_atual]': userData.role_atual,
      'metadata[previous_plan]': userData.role_atual
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
      console.error('Erro do Stripe:', errorText);
      return new Response(
        JSON.stringify({ error: `Erro do Stripe: ${stripeResponse.status}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    const session = await stripeResponse.json();

    return new Response(
      JSON.stringify({ 
        checkout_url: session.url,
        session_id: session.id 
      }),
      { status: 200, headers: corsHeaders }
    );

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