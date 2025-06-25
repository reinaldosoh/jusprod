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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Para debug - retornar informações básicas em GET (sem autenticação)
  if (req.method === 'GET') {
    console.log('Edge function GET - funcionando normalmente');
    return new Response(
      JSON.stringify({ 
        message: 'Edge function monitorar-processo está funcionando',
        timestamp: new Date().toISOString(),
        version: 7
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header:', authHeader ? 'presente' : 'ausente');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extraído:', token.substring(0, 50) + '...');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError) {
      console.error('Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Token inválido',
          details: authError.message 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.error('Usuário não encontrado');
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário autenticado:', user.id);

    const { processo_id } = await req.json();
    console.log('processo_id recebido:', processo_id);

    if (!processo_id) {
      return new Response(
        JSON.stringify({ error: 'processo_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verificar se o usuário pode ativar mais processos
    const { data: limites, error: limitesError } = await supabaseClient
      .rpc('pode_ativar_processo', { user_uuid: user.id });

    if (limitesError) {
      console.error('Erro ao verificar limites:', limitesError);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!limites) {
      return new Response(
        JSON.stringify({ 
          error: 'Limite de processos atingido para seu plano atual',
          codigo: 'LIMITE_ATINGIDO'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Buscar dados do processo
    const { data: processo, error: processoError } = await supabaseClient
      .from('processos')
      .select('cnpj, uuid, autor, reu, tribunal')
      .eq('id', processo_id)
      .eq('uuid', user.id)
      .single();

    if (processoError) {
      console.error('Erro ao buscar processo:', processoError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar processo no banco' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!processo) {
      console.error('Processo não encontrado para o usuário:', user.id, 'processo_id:', processo_id);
      return new Response(
        JSON.stringify({ error: 'Processo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processo encontrado:', { id: processo_id, cnpj: processo.cnpj });

    const cnj = processo.cnpj;  // O campo no banco se chama 'cnpj' mas contém o CNJ
    // Formatar CNJ para o Escavador: remover pontos e traços, apenas números
    const cnjLimpo = cnj.replace(/[.-]/g, '');
    console.log(`CNJ original: ${cnj}, CNJ formatado: ${cnjLimpo}`);
    
    const escavadorToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjA3MGU0MTUxNmEyYzkwOGFjMTMwZGZkNzQ2NTk1M2NjN2NkYTY2OGViZDYwOTNmZTkwNDg3YTY0Yjk5Y2IyYzBhNWQ2OTYwZGM4ODMwODgiLCJpYXQiOjE3MTMyMDQ0NTEuMzE4NTAxLCJuYmYiOjE3MTMyMDQ0NTEuMzE4NTAyLCJleHAiOjIwMjg3MzcyNTEuMzE2MDU0LCJzdWIiOiIxMTAzMTQ0Iiwic2NvcGVzIjpbImFjZXNzYXJfYXBpX3BhZ2EiXX0.nMu3a4qOuz36yGHbjnYms4q19sUyOFWHq5JjN3IlTePitS8_Prrpd3gBTRtXovbFbSiplbOkmkYXg0jzYXD_bI-hqdFct9co-fmPYl6GYBayRc6SlB7z4z5EX6msDGuihrl4CS76thcs4AQYKzEVSNBq0ZbCjSLEI6XRbUhGP9NMRmuAPkdVIjP7oncqHGfeMcMl-iK5CK6VG8FY3AMPViUInq54HRz0IwMs6iP0XydlmQy2wszhnuov3qmJYVVqHzLwcc1DiF6jrb2AO-eYmlZ2pQ3hnRJgUsPT8ad3N_AO8-aKfLcaasRBXgEqEThoN72YsOVlAdxIoHEoHB1kRCiLEXhqja41TxZvSvftrgcNUMy7IOnROYkcG5IKIs1frsMTCE1J78RYgh7OC0bxVVPnUQVwwzjc2VLb5TaN6Hj1BjTOkhI-SiHNPgF4UiTfQEdsys-xuYYVh6hgeTcRLqZWa99JssKSc5FKrz7Un30njoR2ceF3ibmTGFGIK7xm62WAhmhX6NFgc8wIbgh3llOlVEfodTf5xyFESjTotnl4WVvYpww0UcCwFjZSSNJdRTv9y2Z9eSmPuGiECnP6JvUABh9V6FZNrcBwPA4L8yTfRSbBhzfsQZ3M6Ni2vnSlRw8u3KEL8TX1kTolQrw4rJeNFxP03ozQtVzMp77q7b4';

    const escavadorHeaders = {
      'Authorization': `Bearer ${escavadorToken}`,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    };

    // 3. Primeira chamada ao Escavador - buscar dados do processo
    console.log(`Buscando processo no Escavador: ${cnjLimpo}`);
    const processoResponse = await fetch(
      `https://api.escavador.com/api/v1/processos/numero/${cnjLimpo}`,
      {
        method: 'GET',
        headers: escavadorHeaders
      }
    );

    if (!processoResponse.ok) {
      console.error('Erro na API do Escavador (processo):', processoResponse.status);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar processo no Escavador' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

        const processoData = await processoResponse.json();
    console.log('Dados do processo do Escavador:', JSON.stringify(processoData).substring(0, 300) + '...');
    
    // Verificar se a API retornou resultados
    if (!Array.isArray(processoData) || processoData.length === 0) {
      console.error('Nenhum processo encontrado no Escavador para CNJ:', cnjLimpo);
      return new Response(
        JSON.stringify({ 
          error: 'Processo não encontrado no Escavador',
          details: `O processo com CNJ ${cnj} não foi encontrado na base de dados do Escavador. Verifique se o número está correto.`,
          codigo: 'PROCESSO_NAO_ENCONTRADO_ESCAVADOR'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // A API retorna uma lista, pegar o primeiro processo
    const processoEscavador = processoData[0];
    const processId = processoEscavador?.id;

    if (!processId) {
      console.error('Process ID não encontrado no objeto retornado. Dados recebidos:', processoEscavador);
      return new Response(
        JSON.stringify({ 
          error: 'Dados do processo inválidos no Escavador',
          details: 'O processo foi encontrado mas não possui um ID válido.',
          codigo: 'DADOS_INVALIDOS_ESCAVADOR'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Process ID encontrado:', processId);

    // 4. Segunda chamada ao Escavador - buscar última movimentação
    console.log(`Buscando movimentações do processo: ${processId}`);
    const movimentacaoResponse = await fetch(
      `https://api.escavador.com/api/v1/processos/${processId}/movimentacoes?limit=1`,
      {
        method: 'GET',
        headers: escavadorHeaders
      }
    );

    if (!movimentacaoResponse.ok) {
      console.error('Erro na API do Escavador (movimentação):', movimentacaoResponse.status);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar movimentações no Escavador' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const movimentacaoData = await movimentacaoResponse.json();
    const ultimaMovimentacao: EscavadorMovimentacao | null = movimentacaoData.items?.[0] || null;

    // 5. Terceira chamada ao Escavador - criar monitoramento
    console.log(`Criando monitoramento para processo: ${processId}`);
    const monitoramentoResponse = await fetch(
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

    if (!monitoramentoResponse.ok) {
      console.error('Erro na API do Escavador (monitoramento):', monitoramentoResponse.status);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar monitoramento no Escavador' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const monitoramentoData: EscavadorMonitoramento = await monitoramentoResponse.json();
    const monitoramentoId = monitoramentoData.id;
    
    console.log('Resposta do monitoramento do Escavador:', JSON.stringify(monitoramentoData));
    console.log('monitoramentoId extraído:', monitoramentoId, 'tipo:', typeof monitoramentoId);

    // 6. Cadastrar intimação (se houver movimentação)
    let intimacaoId = null;
    if (ultimaMovimentacao) {
      // Validar e converter monitoramentoId
      const monitoramentoIdNumerico = parseInt(monitoramentoId);
      console.log('monitoramentoId convertido para número:', monitoramentoIdNumerico, 'isNaN:', isNaN(monitoramentoIdNumerico));
      
      if (isNaN(monitoramentoIdNumerico)) {
        console.error('ERRO: monitoramentoId não é um número válido:', monitoramentoId);
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
      
      console.log('Dados da intimação a serem inseridos:', JSON.stringify(dadosIntimacao));
      
      const { data: intimacao, error: intimacaoError } = await supabaseClient
        .from('intimacoes')
        .insert(dadosIntimacao)
        .select('id, monitoramento_id')
        .single();

      if (intimacaoError) {
        console.error('Erro ao criar intimação:', intimacaoError);
        console.error('Dados que causaram erro:', JSON.stringify(dadosIntimacao));
        // Não falha a operação, apenas loga o erro
      } else {
        intimacaoId = intimacao?.id;
        console.log('Intimação criada com sucesso:', { id: intimacaoId, monitoramento_id: intimacao?.monitoramento_id });
      }
    } else {
      console.log('Nenhuma movimentação encontrada, não criando intimação');
    }

    // 7. Atualizar processo para arquivado = false
    const { error: updateError } = await supabaseClient
      .from('processos')
      .update({ 
        arquivado: false
      })
      .eq('id', processo_id)
      .eq('uuid', user.id);

    if (updateError) {
      console.error('Erro ao atualizar processo:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao ativar processo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Retornar sucesso
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Processo monitorado com sucesso',
        data: {
          processo_id,
          monitoramento_id: monitoramentoId,
          intimacao_id: intimacaoId,
          tem_movimentacao: !!ultimaMovimentacao
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na função monitorar-processo:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 