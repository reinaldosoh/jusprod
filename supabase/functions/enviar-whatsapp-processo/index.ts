import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WhatsAppData {
  cnpj: string;
  autor: string;
  reu: string;
  tribunal: string;
  titulo: string;
  mensagem: string;
  whatsapp: string;
}

interface RequestBody {
  processoId: string | number;
  titulo: string;
  mensagem: string;
  telefonesAdicionais?: Array<{ ddi: string; numero: string }>;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'JSON inválido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { processoId, titulo, mensagem, telefonesAdicionais = [] } = body;

    // Validate required fields
    if (!processoId || !titulo || !mensagem) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor inválida' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get process data
    const { data: processo, error: processoError } = await supabase
      .from('processos')
      .select('cnpj, autor, reu, tribunal')
      .eq('id', processoId)
      .single();

    if (processoError || !processo) {
      console.error('Erro ao buscar processo:', processoError);
      return new Response(
        JSON.stringify({ error: 'Processo não encontrado' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Get linked clients
    const { data: clientesVinculados, error: clientesError } = await supabase
      .from('processo_cliente')
      .select(`
        cliente:clientes(
          id,
          nome,
          lista_whatsapp
        )
      `)
      .eq('processo_id', processoId);

    if (clientesError) {
      console.error('Erro ao buscar clientes vinculados:', clientesError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar clientes vinculados' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Prepare WhatsApp list
    const whatsappsParaEnvio: WhatsAppData[] = [];

    // Add WhatsApps from linked clients
    if (clientesVinculados && clientesVinculados.length > 0) {
      for (const vinculo of clientesVinculados) {
        const cliente = vinculo.cliente;
        if (cliente && cliente.lista_whatsapp) {
          let listaWhatsapp: string[] = [];
          try {
            listaWhatsapp = typeof cliente.lista_whatsapp === 'string'
              ? JSON.parse(cliente.lista_whatsapp)
              : Array.isArray(cliente.lista_whatsapp)
              ? cliente.lista_whatsapp
              : [cliente.lista_whatsapp];
          } catch (e) {
            console.warn(`Erro ao parsear lista_whatsapp do cliente ${cliente.id}:`, e);
            continue;
          }

          for (const whatsapp of listaWhatsapp) {
            if (whatsapp && typeof whatsapp === 'string' && whatsapp.trim()) {
              whatsappsParaEnvio.push({
                cnpj: processo.cnpj || '',
                autor: processo.autor || '',
                reu: processo.reu || '',
                tribunal: processo.tribunal || '',
                titulo,
                mensagem,
                whatsapp: whatsapp.trim(),
              });
            }
          }
        }
      }
    }

    // 4. Add additional phones
    if (telefonesAdicionais && telefonesAdicionais.length > 0) {
      for (const telefone of telefonesAdicionais) {
        if (telefone.numero && telefone.numero.trim()) {
          const numeroLimpo = telefone.numero.replace(/\D/g, '');
          const whatsappCompleto = `${telefone.ddi}${numeroLimpo}`;

          whatsappsParaEnvio.push({
            cnpj: processo.cnpj || '',
            autor: processo.autor || '',
            reu: processo.reu || '',
            tribunal: processo.tribunal || '',
            titulo,
            mensagem,
            whatsapp: whatsappCompleto,
          });
        }
      }
    }

    // 5. Check if there are WhatsApps to send
    if (whatsappsParaEnvio.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum WhatsApp encontrado para envio' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 6. Send to N8N webhook
    const webhookUrl = 'https://n8nwebhook.estruturadeapi.com/webhook/3968cb00-16b4-4ca6-a122-9ac73c24fa5e';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappsParaEnvio),
    });

    if (!response.ok) {
      console.error('Erro ao enviar para webhook:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar mensagens' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 7. Return success
    return new Response(
      JSON.stringify({
        success: true,
        totalEnvios: whatsappsParaEnvio.length,
        mensagem: `Mensagem enviada para ${whatsappsParaEnvio.length} WhatsApp(s)`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro interno:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 