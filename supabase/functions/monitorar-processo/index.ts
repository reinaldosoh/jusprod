import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface EscavadorProcesso {
  process_id: string;
}

interface EscavadorMovimentacao {
  intimacaoID: string;
  secao: string;
  processo_id: string;
  tipo: string;
  conteudo: string;
  snippet: string;
  descricao_pequena: string;
  data: string;
}

interface EscavadorMonitoramento {
  id: string;
}

// Função para validar formato do CNJ
const validarFormatoCNJ = (cnj: string): boolean => {
  if (!cnj) return false;
  
  // Remover formatação
  const apenasNumeros = cnj.replace(/[.-]/g, '');
  
  // CNJ deve ter 20 dígitos: NNNNNNN-DD.AAAA.J.TR.OOOO
  if (apenasNumeros.length !== 20) return false;
  
  // Verificar se são todos números
  if (!/^\d{20}$/.test(apenasNumeros)) return false;
  
  return true;
};

// Função para formatar CNJ para logs
const formatarCNJParaLog = (cnj: string): string => {
  if (!cnj) return 'VAZIO';
  
  const apenasNumeros = cnj.replace(/[.-]/g, '');
  if (apenasNumeros.length === 20) {
    return `${apenasNumeros.substring(0, 7)}-${apenasNumeros.substring(7, 9)}.${apenasNumeros.substring(9, 13)}.${apenasNumeros.substring(13, 14)}.${apenasNumeros.substring(14, 16)}.${apenasNumeros.substring(16, 20)}`;
  }
  
  return `${cnj} (${apenasNumeros.length} dígitos)`;
};

Deno.serve(async (req) => {
  console.log('🚀 [INICIO] Edge function monitorar-processo iniciada - versão 29');
  console.log('🚀 [INICIO] Método HTTP:', req.method);
  console.log('🚀 [INICIO] URL:', req.url);
  console.log('🚀 [INICIO] Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🚀 [CORS] Respondendo OPTIONS com CORS headers');
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Para debug - retornar informações básicas em GET (sem autenticação)
  if (req.method === 'GET') {
    console.log('🚀 [GET] Request GET - funcionando normalmente');
    return new Response(
      JSON.stringify({ 
        message: 'Edge function monitorar-processo está funcionando',
        timestamp: new Date().toISOString(),
        version: 29
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('🔧 [SETUP] Criando cliente Supabase...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔧 [SETUP] SUPABASE_URL:', supabaseUrl ? 'PRESENTE' : 'AUSENTE');
    console.log('🔧 [SETUP] SERVICE_ROLE_KEY:', serviceRoleKey ? 'PRESENTE' : 'AUSENTE');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ [SETUP] Variáveis de ambiente ausentes');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor inválida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
    console.log('✅ [SETUP] Cliente Supabase criado com sucesso');

    if (req.method !== 'POST') {
      console.log('❌ [METODO] Método não permitido:', req.method);
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar autenticação
    console.log('🔐 [AUTH] Verificando autenticação...');
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 [AUTH] Auth header:', authHeader ? 'PRESENTE' : 'AUSENTE');
    
    if (!authHeader) {
      console.log('❌ [AUTH] Token de autorização ausente');
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔐 [AUTH] Token extraído (primeiros 50 chars):', token.substring(0, 50) + '...');
    
    console.log('🔐 [AUTH] Verificando usuário com token...');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError) {
      console.error('❌ [AUTH] Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Token inválido',
          details: authError.message 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.error('❌ [AUTH] Usuário não encontrado');
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [AUTH] Usuário autenticado:', user.id);

    console.log('📥 [REQUEST] Lendo body da requisição...');
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 [REQUEST] Body recebido:', JSON.stringify(requestBody));
    } catch (error) {
      console.error('❌ [REQUEST] Erro ao fazer parse do JSON:', error);
      return new Response(
        JSON.stringify({ error: 'JSON inválido no body da requisição' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { processo_id } = requestBody;
    console.log('📥 [REQUEST] processo_id extraído:', processo_id);

    if (!processo_id) {
      console.log('❌ [REQUEST] processo_id ausente');
      return new Response(
        JSON.stringify({ error: 'processo_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verificar se o usuário pode ativar mais processos
    console.log('📊 [LIMITES] Verificando limites do usuário...');
    let limites;
    try {
      const { data: limitesData, error: limitesError } = await supabaseClient
        .rpc('pode_ativar_processo', { user_uuid: user.id });

      if (limitesError) {
        console.error('❌ [LIMITES] Erro ao verificar limites:', limitesError);
        return new Response(
          JSON.stringify({ error: 'Erro interno do servidor - limites' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      limites = limitesData;
      console.log('📊 [LIMITES] Resultado da verificação:', limites);
    } catch (error) {
      console.error('❌ [LIMITES] Exceção ao verificar limites:', error);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor - exceção limites' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!limites) {
      console.log('❌ [LIMITES] Limite de processos atingido');
      return new Response(
        JSON.stringify({ 
          error: 'Limite de processos atingido para seu plano atual',
          codigo: 'LIMITE_ATINGIDO'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [LIMITES] Usuário pode ativar mais processos');

    // 2. Buscar dados do processo
    console.log('🔍 [PROCESSO] Buscando processo no banco de dados...');
    let processo;
    try {
      const { data: processoData, error: processoError } = await supabaseClient
        .from('processos')
        .select('cnpj, uuid, autor, reu, tribunal')
        .eq('id', processo_id)
        .eq('uuid', user.id)
        .single();

      if (processoError) {
        console.error('❌ [PROCESSO] Erro ao buscar processo:', processoError);
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar processo no banco' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      processo = processoData;
      console.log('🔍 [PROCESSO] Processo encontrado:', { 
        id: processo_id, 
        cnpj: processo?.cnpj,
        autor: processo?.autor,
        reu: processo?.reu,
        tribunal: processo?.tribunal
      });
    } catch (error) {
      console.error('❌ [PROCESSO] Exceção ao buscar processo:', error);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor - buscar processo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!processo) {
      console.error('❌ [PROCESSO] Processo não encontrado para o usuário:', user.id, 'processo_id:', processo_id);
      return new Response(
        JSON.stringify({ error: 'Processo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cnj = processo.cnpj;  // O campo no banco se chama 'cnpj' mas contém o CNJ
    console.log('🔍 [CNJ] CNJ original (campo cnpj):', formatarCNJParaLog(cnj));
    
    // Validar formato do CNJ antes de prosseguir
    if (!validarFormatoCNJ(cnj)) {
      console.error('❌ [CNJ] CNJ inválido! Formato incorreto:', formatarCNJParaLog(cnj));
      console.error('❌ [CNJ] CNJ deve ter 20 dígitos no formato: NNNNNNN-DD.AAAA.J.TR.OOOO');
      
      return new Response(
        JSON.stringify({ 
          error: 'CNJ inválido. Verifique se o número do processo está no formato correto.',
          details: `CNJ fornecido: ${formatarCNJParaLog(cnj)}. Deve ter 20 dígitos no formato: NNNNNNN-DD.AAAA.J.TR.OOOO`,
          codigo: 'CNJ_INVALIDO'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Formatar CNJ para o Escavador: remover pontos e traços, apenas números
    const cnjLimpo = cnj.replace(/[.-]/g, '');
    console.log(`🔍 [CNJ] CNJ formatado para Escavador: ${cnjLimpo} (${cnjLimpo.length} dígitos)`);
    
    const escavadorToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjA3MGU0MTUxNmEyYzkwOGFjMTMwZGZkNzQ2NTk1M2NjN2NkYTY2OGViZDYwOTNmZTkwNDg3YTY0Yjk5Y2IyYzBhNWQ2OTYwZGM4ODMwODgiLCJpYXQiOjE3MTMyMDQ0NTEuMzE4NTAxLCJuYmYiOjE3MTMyMDQ0NTEuMzE4NTAyLCJleHAiOjIwMjg3MzcyNTEuMzE2MDU0LCJzdWIiOiIxMTAzMTQ0Iiwic2NvcGVzIjpbImFjZXNzYXJfYXBpX3BhZ2EiXX0.nMu3a4qOuz36yGHbjnYms4q19sUyOFWHq5JjN3IlTePitS8_Prrpd3gBTRtXovbFbSiplbOkmkYXg0jzYXD_bI-hqdFct9co-fmPYl6GYBayRc6SlB7z4z5EX6msDGuihrl4CS76thcs4AQYKzEVSNBq0ZbCjSLEI6XRbUhGP9NMRmuAPkdVIjP7oncqHGfeMcMl-iK5CK6VG8FY3AMPViUInq54HRz0IwMs6iP0XydlmQy2wszhnuov3qmJYVVqHzLwcc1DiF6jrb2AO-eYmlZ2pQ3hnRJgUsPT8ad3N_AO8-aKfLcaasRBXgEqEThoN72YsOVlAdxIoHEoHB1kRCiLEXhqja41TxZvSvftrgcNUMy7IOnROYkcG5IKIs1frsMTCE1J78RYgh7OC0bxVVPnUQVwwzjc2VLb5TaN6Hj1BjTOkhI-SiHNPgF4UiTfQEdsys-xuYYVh6hgeTcRLqZWa99JssKSc5FKrz7Un30njoR2ceF3ibmTGFGIK7xm62WAhmhX6NFgc8wIbgh3llOlVEfodTf5xyFESjTotnl4WVvYpww0UcCwFjZSSNJdRTv9y2Z9eSmPuGiECnP6JvUABh9V6FZNrcBwPA4L8yTfRSbBhzfsQZ3M6Ni2vnSlRw8u3KEL8TX1kTolQrw4rJeNFxP03ozQtVzMp77q7b4';

    const escavadorHeaders = {
      'Authorization': `Bearer ${escavadorToken}`,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    };

    console.log('🔐 [ESCAVADOR] Headers configurados para API');

    // 3. Primeira chamada ao Escavador - buscar dados do processo
    console.log(`🌐 [ESCAVADOR-1] Buscando processo no Escavador`);
    console.log(`🌐 [ESCAVADOR-1] URL: https://api.escavador.com/api/v2/processos/numero_cnj/${cnjLimpo}`);
    console.log(`🌐 [ESCAVADOR-1] CNJ sendo buscado: ${formatarCNJParaLog(cnj)} -> ${cnjLimpo}`);
    
    let processoResponse;
    let processoData;
    
    try {
      processoResponse = await fetch(
        `https://api.escavador.com/api/v2/processos/numero_cnj/${cnjLimpo}`,
        {
          method: 'GET',
          headers: escavadorHeaders
        }
      );

      console.log('🌐 [ESCAVADOR-1] Status da resposta:', processoResponse.status);
      console.log('🌐 [ESCAVADOR-1] Headers da resposta:', Object.fromEntries(processoResponse.headers.entries()));

      if (!processoResponse.ok) {
        console.error('❌ [ESCAVADOR-1] Erro na API do Escavador (processo):', processoResponse.status);
        
        // Capturar corpo da resposta de erro
        const errorText = await processoResponse.text();
        console.error('❌ [ESCAVADOR-1] Corpo da resposta de erro:', errorText);
        console.error('❌ [ESCAVADOR-1] CNJ que causou o erro:', formatarCNJParaLog(cnj));
        console.error('❌ [ESCAVADOR-1] CNJ enviado para API:', cnjLimpo);
        
        // Se for 404, é processo não encontrado no Escavador
        if (processoResponse.status === 404) {
          return new Response(
            JSON.stringify({ 
              error: 'Processo não foi encontrado na base de dados do Escavador. Verifique se o número do CNJ está correto.',
              details: `CNJ: ${formatarCNJParaLog(cnj)} não foi encontrado no Escavador`,
              codigo: 'PROCESSO_NAO_ENCONTRADO_ESCAVADOR',
              cnj_buscado: formatarCNJParaLog(cnj),
              cnj_enviado: cnjLimpo
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao buscar processo no Escavador', 
            details: errorText,
            cnj_buscado: formatarCNJParaLog(cnj),
            cnj_enviado: cnjLimpo
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      processoData = await processoResponse.json();
      console.log('🌐 [ESCAVADOR-1] Dados recebidos (primeiros 500 chars):', JSON.stringify(processoData).substring(0, 500) + '...');
      console.log('🌐 [ESCAVADOR-1] Tipo dos dados:', typeof processoData);
      console.log('🌐 [ESCAVADOR-1] É array?', Array.isArray(processoData));
      console.log('🌐 [ESCAVADOR-1] Length (se array):', Array.isArray(processoData) ? processoData.length : 'N/A');
    } catch (error) {
      console.error('❌ [ESCAVADOR-1] Exceção ao buscar processo:', error);
      console.error('❌ [ESCAVADOR-1] CNJ que causou exceção:', formatarCNJParaLog(cnj));
      return new Response(
        JSON.stringify({ 
          error: 'Erro interno - chamada Escavador processo',
          cnj_buscado: formatarCNJParaLog(cnj),
          cnj_enviado: cnjLimpo
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verificar se a API retornou resultados
    // API v2 retorna um objeto único, não um array
    if (!processoData || (typeof processoData === 'object' && Object.keys(processoData).length === 0)) {
      console.error('❌ [ESCAVADOR-1] Nenhum processo encontrado no Escavador');
      console.error('❌ [ESCAVADOR-1] CNJ buscado:', formatarCNJParaLog(cnj));
      console.error('❌ [ESCAVADOR-1] CNJ enviado:', cnjLimpo);
      console.error('❌ [ESCAVADOR-1] Resposta recebida:', JSON.stringify(processoData));
      
      return new Response(
        JSON.stringify({ 
          error: 'Processo não foi encontrado na base de dados do Escavador. Verifique se o número do CNJ está correto.',
          details: `CNJ ${formatarCNJParaLog(cnj)} não foi encontrado no Escavador`,
          codigo: 'PROCESSO_NAO_ENCONTRADO_ESCAVADOR',
          cnj_buscado: formatarCNJParaLog(cnj),
          cnj_enviado: cnjLimpo,
          resposta_escavador: processoData
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // A API v2 retorna um objeto único, não um array
    const processoEscavador = processoData;
    console.log('🌐 [ESCAVADOR-1] Processo extraído:', JSON.stringify(processoEscavador));
    console.log('🌐 [ESCAVADOR-1] Tipo de processoEscavador:', typeof processoEscavador);
    console.log('🌐 [ESCAVADOR-1] Tem propriedade fontes?', 'fontes' in processoEscavador);
    
    // Para API v2, precisa extrair o process_id das fontes
    const fontes = processoEscavador?.fontes;
    console.log('🌐 [ESCAVADOR-1] Fontes extraídas:', JSON.stringify(fontes));
    console.log('🌐 [ESCAVADOR-1] Tipo de fontes:', typeof fontes);
    console.log('🌐 [ESCAVADOR-1] É array?', Array.isArray(fontes));
    console.log('🌐 [ESCAVADOR-1] Length das fontes:', fontes ? fontes.length : 'N/A');
    
    let processId;
    
    if (fontes && Array.isArray(fontes) && fontes.length > 0) {
      // Pegar o processo_fonte_id da primeira fonte
      console.log('🌐 [ESCAVADOR-1] Primeira fonte:', JSON.stringify(fontes[0]));
      console.log('🌐 [ESCAVADOR-1] Tem processo_fonte_id?', 'processo_fonte_id' in fontes[0]);
      processId = fontes[0]?.processo_fonte_id;
      console.log('🌐 [ESCAVADOR-1] Process ID extraído das fontes:', processId);
      console.log('🌐 [ESCAVADOR-1] Tipo do processId:', typeof processId);
    } else {
      console.error('❌ [ESCAVADOR-1] Fontes não válidas ou vazias');
      console.error('❌ [ESCAVADOR-1] fontes:', fontes);
      console.error('❌ [ESCAVADOR-1] Array.isArray(fontes):', Array.isArray(fontes));
      console.error('❌ [ESCAVADOR-1] fontes.length:', fontes ? fontes.length : 'N/A');
    }
    
    if (!processId) {
      console.error('❌ [ESCAVADOR-1] Process ID não encontrado no objeto. Dados recebidos:', processoEscavador);
      console.error('❌ [ESCAVADOR-1] Fontes disponíveis:', fontes);
      return new Response(
        JSON.stringify({ 
          error: 'Dados do processo inválidos no Escavador',
          details: 'O processo foi encontrado mas não possui um ID válido nas fontes.',
          codigo: 'DADOS_INVALIDOS_ESCAVADOR'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [ESCAVADOR-1] Process ID encontrado:', processId);

    // 4. Segunda chamada ao Escavador - buscar última movimentação
    console.log(`🌐 [ESCAVADOR-2] Buscando movimentações do processo: ${processId}`);
    let movimentacaoResponse;
    let movimentacaoData;
    
    try {
      movimentacaoResponse = await fetch(
        `https://api.escavador.com/api/v1/processos/${processId}/movimentacoes?limit=1`,
        {
          method: 'GET',
          headers: escavadorHeaders
        }
      );

      console.log('🌐 [ESCAVADOR-2] Status da resposta:', movimentacaoResponse.status);

      if (!movimentacaoResponse.ok) {
        console.error('❌ [ESCAVADOR-2] Erro na API do Escavador (movimentação):', movimentacaoResponse.status);
        const errorText = await movimentacaoResponse.text();
        console.error('❌ [ESCAVADOR-2] Corpo da resposta de erro:', errorText);
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar movimentações no Escavador', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      movimentacaoData = await movimentacaoResponse.json();
      console.log('🌐 [ESCAVADOR-2] Dados recebidos:', JSON.stringify(movimentacaoData));
    } catch (error) {
      console.error('❌ [ESCAVADOR-2] Exceção ao buscar movimentações:', error);
      return new Response(
        JSON.stringify({ error: 'Erro interno - chamada Escavador movimentações' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ultimaMovimentacao: EscavadorMovimentacao | null = movimentacaoData.items?.[0] || null;
    console.log('🌐 [ESCAVADOR-2] Última movimentação extraída:', ultimaMovimentacao ? 'ENCONTRADA' : 'NENHUMA');

    // 5. Terceira chamada ao Escavador - criar monitoramento
    console.log(`🌐 [ESCAVADOR-3] Criando monitoramento para processo: ${processId}`);
    let monitoramentoResponse;
    
    try {
      monitoramentoResponse = await fetch(
        'https://api.escavador.com/api/v1/monitoramentos',
        {
          method: 'POST',
          headers: escavadorHeaders,
          body: JSON.stringify({
            tipo: 'processo',
            processo_id: processId
          })
        }
      );

      console.log('🌐 [ESCAVADOR-3] Status da resposta:', monitoramentoResponse.status);
      console.log('🌐 [ESCAVADOR-3] Headers da resposta:', Object.fromEntries(monitoramentoResponse.headers.entries()));
    } catch (error) {
      console.error('❌ [ESCAVADOR-3] Exceção ao criar monitoramento:', error);
      return new Response(
        JSON.stringify({ error: 'Erro interno - chamada Escavador monitoramento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!monitoramentoResponse.ok) {
      console.error('❌ [ESCAVADOR-3] Erro na API do Escavador (monitoramento):', monitoramentoResponse.status);
      
      // Verificar se é erro de processo já monitorado
      try {
        const errorText = await monitoramentoResponse.text();
        console.log('❌ [ESCAVADOR-3] Corpo da resposta de erro (texto):', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.log('❌ [ESCAVADOR-3] Erro parseado como JSON:', JSON.stringify(errorData));
        } catch (parseError) {
          console.log('❌ [ESCAVADOR-3] Erro não é JSON válido, usando texto:', errorText);
          errorData = { message: errorText };
        }
        
        // Verificar todas as possíveis variações da mensagem de erro
        const errorString = JSON.stringify(errorData).toLowerCase();
        console.log('❌ [ESCAVADOR-3] String de erro para verificação:', errorString);
        
        const jaMonitorado = (
          (errorData.status === 'failed' && 
           errorData.errors && 
           Array.isArray(errorData.errors) && 
           errorData.errors.some((error: string) => 
             error.toLowerCase().includes('já monitora') || 
             error.toLowerCase().includes('already monitoring') ||
             error.toLowerCase().includes('already exists')
           )) ||
          errorString.includes('já monitora') ||
          errorString.includes('already monitoring') ||
          errorString.includes('already exists')
        );
        
        console.log('🔍 [ESCAVADOR-3] Verificação "já monitorado":', jaMonitorado);
        
        if (jaMonitorado) {
          console.log('✅ [ESCAVADOR-3] Processo já está sendo monitorado no Escavador, continuando fluxo...');
          
          // Continuar fluxo sem criar novo monitoramento
          // Retornar sucesso indicando que já está monitorado
          console.log('💾 [UPDATE] Atualizando processo para não arquivado...');
          
          try {
            const { error: updateError } = await supabaseClient
              .from('processos')
              .update({ 
                arquivado: false
              })
              .eq('id', processo_id)
              .eq('uuid', user.id);

            if (updateError) {
              console.error('❌ [UPDATE] Erro ao atualizar processo:', updateError);
              return new Response(
                JSON.stringify({ error: 'Erro ao ativar processo' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            console.log('✅ [UPDATE] Processo atualizado com sucesso');
          } catch (error) {
            console.error('❌ [UPDATE] Exceção ao atualizar processo:', error);
            return new Response(
              JSON.stringify({ error: 'Erro interno - atualizar processo' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('🎉 [SUCCESS] Retornando sucesso - processo já monitorado');
          return new Response(
            JSON.stringify({ 
              success: true,
              message: 'Processo já estava sendo monitorado e foi ativado com sucesso',
              data: {
                processo_id,
                monitoramento_id: null, // Não criamos novo monitoramento
                intimacao_id: null,     // Não criamos nova intimação
                tem_movimentacao: false,
                ja_monitorado: true
              }
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } catch (jsonError) {
        console.error('❌ [ESCAVADOR-3] Erro ao processar resposta de erro do Escavador:', jsonError);
      }
      
      console.error('❌ [ESCAVADOR-3] Erro não tratado do Escavador - retornando erro 500');
      return new Response(
        JSON.stringify({ error: 'Erro ao criar monitoramento no Escavador' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Monitoramento criado com sucesso
    console.log('🌐 [ESCAVADOR-3] Monitoramento criado com sucesso');
    let monitoramentoData: EscavadorMonitoramento;
    
    try {
      monitoramentoData = await monitoramentoResponse.json();
      console.log('🌐 [ESCAVADOR-3] Resposta do monitoramento:', JSON.stringify(monitoramentoData));
    } catch (error) {
      console.error('❌ [ESCAVADOR-3] Erro ao fazer parse da resposta de sucesso:', error);
      return new Response(
        JSON.stringify({ error: 'Erro interno - parse resposta monitoramento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const monitoramentoId = monitoramentoData.id;
    console.log('🌐 [ESCAVADOR-3] monitoramentoId extraído:', monitoramentoId, 'tipo:', typeof monitoramentoId);

    // 6. Cadastrar intimação (se houver movimentação)
    console.log('💾 [INTIMACAO] Verificando se há movimentação para criar intimação...');
    let intimacaoId = null;
    
    if (ultimaMovimentacao) {
      console.log('💾 [INTIMACAO] Movimentação encontrada, criando intimação...');
      
      // Validar e converter monitoramentoId
      const monitoramentoIdNumerico = parseInt(monitoramentoId);
      console.log('💾 [INTIMACAO] monitoramentoId convertido para número:', monitoramentoIdNumerico, 'isNaN:', isNaN(monitoramentoIdNumerico));
      
      if (isNaN(monitoramentoIdNumerico)) {
        console.error('❌ [INTIMACAO] ERRO: monitoramentoId não é um número válido:', monitoramentoId);
        return new Response(
          JSON.stringify({ error: 'Erro: ID do monitoramento inválido recebido do Escavador' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const dadosIntimacao = {
        intimacaoID: ultimaMovimentacao.intimacaoID,
        secao: ultimaMovimentacao.secao,
        processoID: processId,
        tipo: ultimaMovimentacao.tipo,
        conteudo: ultimaMovimentacao.conteudo,
        snippet: ultimaMovimentacao.snippet,
        dscPequena: ultimaMovimentacao.descricao_pequena,
        data: ultimaMovimentacao.data,
        monitoramento_id: monitoramentoIdNumerico,
        uuid: user.id,
        processo_id: processo_id,
        cnj: processo.cnpj,  // O campo 'cnpj' contém o CNJ
        autor: processo.autor,
        reu: processo.reu,
        tribunal: processo.tribunal
      };
      
      console.log('💾 [INTIMACAO] Dados da intimação a serem inseridos:', JSON.stringify(dadosIntimacao));
      
      try {
        const { data: intimacao, error: intimacaoError } = await supabaseClient
          .from('intimacoes')
          .insert(dadosIntimacao)
          .select('id, monitoramento_id')
          .single();

        if (intimacaoError) {
          console.error('❌ [INTIMACAO] Erro ao criar intimação:', intimacaoError);
          console.error('❌ [INTIMACAO] Dados que causaram erro:', JSON.stringify(dadosIntimacao));
          // Não falha a operação, apenas loga o erro
        } else {
          intimacaoId = intimacao?.id;
          console.log('✅ [INTIMACAO] Intimação criada com sucesso:', { id: intimacaoId, monitoramento_id: intimacao?.monitoramento_id });
        }
      } catch (error) {
        console.error('❌ [INTIMACAO] Exceção ao criar intimação:', error);
        // Não falha a operação, apenas loga o erro
      }
    } else {
      console.log('💾 [INTIMACAO] Nenhuma movimentação encontrada, não criando intimação');
    }

    // 7. Atualizar processo para arquivado = false
    console.log('💾 [UPDATE] Atualizando processo para não arquivado...');
    
    try {
      const { error: updateError } = await supabaseClient
        .from('processos')
        .update({ 
          arquivado: false
        })
        .eq('id', processo_id)
        .eq('uuid', user.id);

      if (updateError) {
        console.error('❌ [UPDATE] Erro ao atualizar processo:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao ativar processo' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ [UPDATE] Processo atualizado com sucesso');
    } catch (error) {
      console.error('❌ [UPDATE] Exceção ao atualizar processo:', error);
      return new Response(
        JSON.stringify({ error: 'Erro interno - atualizar processo final' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Retornar sucesso
    console.log('🎉 [SUCCESS] Processo monitorado com sucesso - retornando resposta');
    console.log('🎉 [SUCCESS] CNJ processado:', formatarCNJParaLog(cnj));
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Processo monitorado com sucesso',
        data: {
          processo_id,
          monitoramento_id: monitoramentoId,
          intimacao_id: intimacaoId,
          tem_movimentacao: !!ultimaMovimentacao,
          cnj_processado: formatarCNJParaLog(cnj)
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 [ERRO-GERAL] Erro geral na função monitorar-processo:', error);
    console.error('💥 [ERRO-GERAL] Stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 