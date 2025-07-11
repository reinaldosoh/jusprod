import { supabase } from '../lib/supabase';

/**
 * Serviço para gerenciar processos com controle de limites do plano
 */
export const processoService = {
  /**
   * Obtém o status atual dos processos do usuário
   * @returns {Promise<Object>} Status com contadores e limites
   */
  async obterStatusProcessos() {
    try {
      console.log('🔄 Obtendo status dos processos...');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 Usuário autenticado:', user.id);

      // Contar processos ativos (não arquivados)
      const { count: processosAtivos, error: countError } = await supabase
        .from('processos')
        .select('*', { count: 'exact', head: true })
        .eq('uuid', user.id)
        .eq('arquivado', false);

      if (countError) {
        console.error('❌ Erro ao contar processos ativos:', countError);
        throw countError;
      }

      console.log('📊 Processos ativos contados:', processosAtivos);

      // Buscar dados do usuário para obter o plano (tabela correta: 'usuario')
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('role_atual')
        .eq('uuid', user.id)
        .single();

      if (userError) {
        console.log('⚠️ Erro ao buscar plano do usuário, usando Free como padrão:', userError);
      }

      const plano = userData?.role_atual || 'free';
      console.log('📋 Plano do usuário:', plano);
      
      // Definir limites por plano
      const limitesPorPlano = {
        free: 5,
        silver: 45,
        gold: 150,
        platinum: 350
      };

      const maxProcessos = limitesPorPlano[plano.toLowerCase()] || 5;
      const processosDisponiveis = maxProcessos - (processosAtivos || 0);

      const status = {
        processos_ativos: processosAtivos || 0,
        max_processos: maxProcessos,
        processos_disponiveis: Math.max(0, processosDisponiveis),
        pode_ativar_processo: processosDisponiveis > 0,
        plano_nome: plano
      };

      console.log('✅ Status calculado:', status);
      return status;

    } catch (error) {
      console.error('❌ Erro ao obter status:', error);
      
      // Retornar valores padrão em caso de erro total
      const statusDefault = {
        processos_ativos: 0,
        max_processos: 5,
        processos_disponiveis: 5,
        pode_ativar_processo: true,
        plano_nome: 'free'
      };
      
      console.log('🔄 Retornando status padrão:', statusDefault);
      return statusDefault;
    }
  },

  /**
   * Ativa um processo (remove do arquivo)
   * @param {number} processoId - ID do processo
   * @returns {Promise<Object>} Resultado da operação
   */
  async ativarProcesso(processoId) {
    try {
      const { data, error } = await supabase.functions.invoke('gerenciar-processo', {
        body: { 
          processoId: parseInt(processoId),
          acao: 'ativar' 
        }
      });

      if (error) {
        console.error('Erro ao ativar processo:', error);
        throw new Error('Erro ao ativar processo');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido ao ativar processo');
      }

      return {
        success: true,
        message: data.message,
        status: data.data
      };
    } catch (error) {
      console.error('Erro no ativarProcesso:', error);
      throw error;
    }
  },

  /**
   * Arquiva um processo
   * @param {number} processoId - ID do processo
   * @returns {Promise<Object>} Resultado da operação
   */
  async arquivarProcesso(processoId) {
    try {
      const { data, error } = await supabase.functions.invoke('gerenciar-processo', {
        body: { 
          processoId: parseInt(processoId),
          acao: 'arquivar' 
        }
      });

      if (error) {
        console.error('Erro ao arquivar processo:', error);
        throw new Error('Erro ao arquivar processo');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido ao arquivar processo');
      }

      return {
        success: true,
        message: data.message,
        status: data.data
      };
    } catch (error) {
      console.error('Erro no arquivarProcesso:', error);
      throw error;
    }
  },

  /**
   * Lista todos os processos do usuário
   * @param {Object} filtros - Filtros opcionais
   * @returns {Promise<Array>} Lista de processos
   */
  async listarProcessos(filtros = {}) {
    try {
      let query = supabase
        .from('processos')
        .select(`
          *,
          clientes (
            id,
            nome,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.arquivado !== undefined) {
        query = query.eq('arquivado', filtros.arquivado);
      }

      if (filtros.busca) {
        query = query.or(`
          nome.ilike.%${filtros.busca}%,
          autor.ilike.%${filtros.busca}%,
          reu.ilike.%${filtros.busca}%
        `);
      }

      if (filtros.limite) {
        query = query.limit(filtros.limite);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar processos:', error);
        throw new Error('Erro ao carregar processos');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no listarProcessos:', error);
      throw error;
    }
  },

  /**
   * Cria um novo processo (sempre arquivado por padrão)
   * @param {Object} dadosProcesso - Dados do processo
   * @returns {Promise<Object>} Processo criado
   */
  async criarProcesso(dadosProcesso) {
    try {
      // Garantir que o processo seja criado como arquivado por padrão
      const processoData = {
        ...dadosProcesso,
        arquivado: true // Sempre criar como arquivado
      };

      const { data, error } = await supabase
        .from('processos')
        .insert([processoData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar processo:', error);
        throw new Error('Erro ao criar processo');
      }

      return data;
    } catch (error) {
      console.error('Erro no criarProcesso:', error);
      throw error;
    }
  },

  /**
   * Obtém um processo específico
   * @param {number} processoId - ID do processo
   * @returns {Promise<Object>} Dados do processo
   */
  async obterProcesso(processoId) {
    try {
      const { data, error } = await supabase
        .from('processos')
        .select(`
          *,
          clientes (
            id,
            nome,
            email,
            cpf,
            cnpj
          )
        `)
        .eq('id', processoId)
        .single();

      if (error) {
        console.error('Erro ao obter processo:', error);
        throw new Error('Processo não encontrado');
      }

      return data;
    } catch (error) {
      console.error('Erro no obterProcesso:', error);
      throw error;
    }
  },

  /**
   * Atualiza dados de um processo (exceto status arquivado)
   * @param {number} processoId - ID do processo
   * @param {Object} dadosAtualizacao - Dados para atualizar
   * @returns {Promise<Object>} Processo atualizado
   */
  async atualizarProcesso(processoId, dadosAtualizacao) {
    try {
      // Remover campo 'arquivado' se estiver presente (deve usar ativarProcesso/arquivarProcesso)
      const { arquivado, ...dadosLimpos } = dadosAtualizacao;

      const { data, error } = await supabase
        .from('processos')
        .update(dadosLimpos)
        .eq('id', processoId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar processo:', error);
        throw new Error('Erro ao atualizar processo');
      }

      return data;
    } catch (error) {
      console.error('Erro no atualizarProcesso:', error);
      throw error;
    }
  },

  /**
   * Exclui um processo permanentemente
   * @param {number} processoId - ID do processo
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async excluirProcesso(processoId) {
    try {
      const { error } = await supabase
        .from('processos')
        .delete()
        .eq('id', processoId);

      if (error) {
        console.error('Erro ao excluir processo:', error);
        throw new Error('Erro ao excluir processo');
      }

      return true;
    } catch (error) {
      console.error('Erro no excluirProcesso:', error);
      throw error;
    }
  },

  /**
   * Verifica se pode ativar mais processos
   * @returns {Promise<boolean>} Se pode ativar processo
   */
  async podeAtivarProcesso() {
    try {
      const status = await this.obterStatusProcessos();
      return status.pode_ativar_processo;
    } catch (error) {
      console.error('Erro ao verificar se pode ativar processo:', error);
      return false;
    }
  },

  /**
   * Monitora um processo usando integração com Escavador
   * Faz todas as chamadas necessárias e cadastra intimações
   * @param {number} processoId - ID do processo
   * @returns {Promise<Object>} Resultado da operação
   */
  async monitorarProcesso(processoId) {
    try {
      console.log('🔄 Monitorando processo:', processoId);
      
      // Garantir que temos o token JWT válido
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || !session.access_token) {
        console.error('❌ Erro de sessão:', sessionError);
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }
      
      console.log('✅ Sessão válida obtida');
      
      // Chamar função de monitoramento do Escavador
      const { data, error } = await supabase.functions.invoke('monitorar-processo', {
        body: { 
          processo_id: parseInt(processoId)
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('❌ Erro da edge function:', error);
        
        // Verificar se o erro contém dados estruturados
        if (error.context && error.context.status) {
          const status = error.context.status;
          console.error(`Status HTTP: ${status}`);
          
          if (status === 404) {
            throw new Error('Processo não foi encontrado na base de dados do Escavador. Verifique se o número do CNJ está correto.');
          }
          
          if (status === 400) {
            // Tentar extrair mensagem detalhada do erro
            if (data && data.error) {
              throw new Error(data.error);
            }
            throw new Error('Dados do processo inválidos. Verifique as informações fornecidas.');
          }
          
          if (status === 429) {
            throw new Error('Limite de requisições atingido. Tente novamente em alguns minutos.');
          }
          
          if (status === 500) {
            throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
          }
          
          throw new Error(`Erro na consulta ao Escavador (${status}). Tente novamente.`);
        }
        
        // Fallback para erros sem contexto estruturado
        throw new Error(`Erro na edge function: ${error.message || 'Erro desconhecido'}`);
      }

      if (!data || !data.success) {
        console.error('❌ Resposta da função sem sucesso:', data);
        
        if (data && data.codigo === 'LIMITE_ATINGIDO') {
          throw new Error(data.error || 'Limite de processos atingido para seu plano atual.');
        }
        
        if (data && data.codigo === 'PROCESSO_NAO_ENCONTRADO_ESCAVADOR') {
          throw new Error('Processo não foi encontrado na base de dados do Escavador. Verifique se o número do CNJ está correto.');
        }
        
        throw new Error(data?.error || 'Erro desconhecido ao monitorar processo');
      }

      console.log('✅ Processo monitorado com sucesso');
      return {
        success: true,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      console.error('❌ Erro ao monitorar processo:', error);
      throw error;
    }
  },

  /**
   * Obtém estatísticas resumidas dos processos
   * @returns {Promise<Object>} Estatísticas
   */
  async obterEstatisticas() {
    try {
      const [status, todosProcessos] = await Promise.all([
        this.obterStatusProcessos(),
        this.listarProcessos()
      ]);

      const arquivados = todosProcessos.filter(p => p.arquivado).length;
      const total = todosProcessos.length;

      return {
        ...status,
        total_processos: total,
        processos_arquivados: arquivados,
        percentual_uso: total > 0 ? Math.round((status.processos_ativos / status.max_processos) * 100) : 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
};

// Exportar também como default para facilitar imports
export default processoService; 