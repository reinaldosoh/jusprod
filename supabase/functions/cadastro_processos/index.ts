import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ESCAVADOR_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjA3MGU0MTUxNmEyYzkwOGFjMTMwZGZkNzQ2NTk1M2NjN2NkYTY2OGViZDYwOTNmZTkwNDg3YTY0Yjk5Y2IyYzBhNWQ2OTYwZGM4ODMwODgiLCJpYXQiOjE3MTMyMDQ0NTEuMzE4NTAxLCJuYmYiOjE3MTMyMDQ0NTEuMzE4NTAyLCJleHAiOjIwMjg3MzcyNTEuMzE2MDU0LCJzdWIiOiIxMTAzMTQ0Iiwic2NvcGVzIjpbImFjZXNzYXJfYXBpX3BhZ2EiXX0.nMu3a4qOuz36yGHbjnYms4q19sUyOFWHq5JjN3IlTePitS8_Prrpd3gBTRtXovbFbSiplbOkmkYXg0jzYXD_bI-hqdFct9co-fmPYl6GYBayRc6SlB7z4z5EX6msDGuihrl4CS76thcs4AQYKzEVSNBq0ZbCjSLEI6XRbUhGP9NMRmuAPkdVIjP7oncqHGfeMcMl-iK5CK6VG8FY3AMPViUInq54HRz0IwMs6iP0XydlmQy2wszhnuov3qmJYVVqHzLwcc1DiF6jrb2AO-eYmlZ2pQ3hnRJgUsPT8ad3N_AO8-aKfLcaasRBXgEqEThoN72YsOVlAdxIoHEoHB1kRCiLEXhqja41TxZvSvftrgcNUMy7IOnROYkcG5IKIs1frsMTCE1J78RYgh7OC0bxVVPnUQVwwzjc2VLb5TaN6Hj1BjTOkhI-SiHNPgF4UiTfQEdsys-xuYYVh6hgeTcRLqZWa99JssKSc5FKrz7Un30njoR2ceF3ibmTGFGIK7xm62WAhmhX6NFgc8wIbgh3llOlVEfodTf5xyFESjTotnl4WVvYpww0UcCwFjZSSNJdRTv9y2Z9eSmPuGiECnP6JvUABh9V6FZNrcBwPA4L8yTfRSbBhzfsQZ3M6Ni2vnSlRw8u3KEL8TX1kTolQrw4rJeNFxP03ozQtVzMp77q7b4';

interface ProcessoEscavador {
  numero_cnj: string;
  titulo_polo_ativo?: string;
  titulo_polo_passivo?: string;
  data_inicio: string;
  data_ultima_movimentacao: string;
  quantidade_movimentacoes: number;
  fontes: Array<{
    sigla: string;
    descricao: string;
    data_ultima_movimentacao: string;
    capa?: {
      area?: string;
      classe?: string;
      assunto?: string;
      orgao_julgador?: string;
    };
  }>;
}

interface EscavadorResponse {
  items: ProcessoEscavador[];
  links: {
    next?: string;
  };
}

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

    // Obter dados da requisição
    const { userUuid } = await req.json();
    
    if (!userUuid) {
      return new Response(
        JSON.stringify({ error: 'userUuid é obrigatório' }),
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
      .select('id, uuid')
      .eq('uuid', userUuid)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Buscar OABs cadastradas do usuário
    const { data: oabsData, error: oabsError } = await supabase
      .from('OAB')
      .select('OAB_num, OAB_uf')
      .eq('uuid', userUuid);

    if (oabsError) {
      console.error('Erro ao buscar OABs:', oabsError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar OABs do usuário' }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!oabsData || oabsData.length === 0) {
      console.log('Nenhuma OAB encontrada para o usuário');
      return new Response(
        JSON.stringify({ 
          message: 'Nenhuma OAB cadastrada para este usuário',
          processosInseridos: 0,
          oabsProcessadas: 0
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    console.log(`Iniciando busca de processos para usuário ${userData.id} com ${oabsData.length} OAB(s)`);

    let allProcesses: ProcessoEscavador[] = [];
    let oabsProcessadas = 0;

    // Loop para processar cada OAB
    for (const oab of oabsData) {
      console.log(`Processando OAB: ${oab.OAB_num}/${oab.OAB_uf}`);
      
      let nextUrl = `https://api.escavador.com/api/v2/advogado/processos?oab_estado=${oab.OAB_uf}&oab_numero=${oab.OAB_num}`;
      let pageCount = 0;
      
      // Loop para buscar todas as páginas desta OAB
      while (nextUrl && pageCount < 50) { // Limite de segurança de 50 páginas
        pageCount++;
        console.log(`OAB ${oab.OAB_num}/${oab.OAB_uf} - Página ${pageCount}: ${nextUrl}`);

        const response = await fetch(nextUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ESCAVADOR_API_TOKEN}`,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`Erro na API do Escavador para OAB ${oab.OAB_num}/${oab.OAB_uf} (página ${pageCount}):`, response.status, response.statusText);
          const errorText = await response.text();
          console.error('Resposta do erro:', errorText);
          
          if (pageCount === 1) {
            // Se falhou na primeira página desta OAB, pula para a próxima OAB
            console.log(`Pulando OAB ${oab.OAB_num}/${oab.OAB_uf} devido a erro na primeira página`);
            break;
          } else {
            // Se falhou em páginas subsequentes, para o loop mas processa o que já foi coletado
            console.log(`Falha na página ${pageCount} da OAB ${oab.OAB_num}/${oab.OAB_uf}, processando o que foi coletado`);
            break;
          }
        }

        const data: EscavadorResponse = await response.json();
        
        if (data.items && data.items.length > 0) {
          allProcesses = allProcesses.concat(data.items);
          console.log(`OAB ${oab.OAB_num}/${oab.OAB_uf} - Página ${pageCount}: coletados ${data.items.length} processos. Total geral: ${allProcesses.length}`);
        }

        // Verificar se há próxima página
        nextUrl = data.links?.next || null;
        
        if (!nextUrl) {
          console.log(`OAB ${oab.OAB_num}/${oab.OAB_uf} - Fim da paginação na página ${pageCount}`);
          break;
        }

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      oabsProcessadas++;
      
      // Delay entre OABs
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Busca finalizada. Total de processos coletados: ${allProcesses.length} de ${oabsProcessadas} OAB(s)`);

    if (allProcesses.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Nenhum processo encontrado para as OABs cadastradas',
          processosInseridos: 0,
          oabsProcessadas: oabsProcessadas
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Preparar dados para inserção
    const processosParaInserir = allProcesses.map(processo => {
      const fonte = processo.fontes?.[0] || {};
      
      return {
        cnpj: processo.numero_cnj,
        autor: processo.titulo_polo_ativo || null,
        reu: processo.titulo_polo_passivo || null,
        tribunal: fonte.sigla || null,
        ultima_movimentacao: fonte.data_ultima_movimentacao || processo.data_ultima_movimentacao || null,
        ultimaMovimentacao: processo.data_ultima_movimentacao ? new Date(processo.data_ultima_movimentacao) : null,
        data_inicio: processo.data_inicio,
        dataInicio: processo.data_inicio ? new Date(processo.data_inicio) : null,
        qdt_movimentacao: processo.quantidade_movimentacoes?.toString() || '0',
        tribunalDesc: fonte.descricao || null,
        area: fonte.capa?.area || null,
        classe: fonte.capa?.classe || null,
        assunto: fonte.capa?.assunto || null,
        orgao_julgador: fonte.capa?.orgao_julgador || null,
        valor_causa: '0',
        arquivado: true,
        usuario_id: userData.id,
        uuid: userData.uuid
      };
    });

    // Inserir processos no banco em lotes
    const BATCH_SIZE = 100;
    let totalInseridos = 0;
    let errosInsercao = 0;

    for (let i = 0; i < processosParaInserir.length; i += BATCH_SIZE) {
      const lote = processosParaInserir.slice(i, i + BATCH_SIZE);
      
      try {
        const { data, error } = await supabase
          .from('processos')
          .insert(lote)
          .select('id');

        if (error) {
          console.error(`Erro ao inserir lote ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
          errosInsercao += lote.length;
        } else {
          totalInseridos += data?.length || lote.length;
          console.log(`Lote ${Math.floor(i / BATCH_SIZE) + 1} inserido com sucesso: ${data?.length || lote.length} processos`);
        }
      } catch (err) {
        console.error(`Erro de exceção no lote ${Math.floor(i / BATCH_SIZE) + 1}:`, err);
        errosInsercao += lote.length;
      }

      // Pequeno delay entre lotes
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`Finalização: ${totalInseridos} processos inseridos, ${errosInsercao} erros`);

    return new Response(
      JSON.stringify({ 
        message: 'Processos cadastrados com sucesso',
        processosColetados: allProcesses.length,
        processosInseridos: totalInseridos,
        errosInsercao: errosInsercao,
        oabsProcessadas: oabsProcessadas
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Erro na Edge Function cadastro_processos:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}); 