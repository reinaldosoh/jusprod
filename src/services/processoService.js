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
      const { data, error } = await supabase.functions.invoke('gerenciar-processo', {
        body: { acao: 'status' }
      });

      if (error) {
        console.error('Erro ao obter status dos processos:', error);
        throw new Error('Erro ao carregar status dos processos');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido ao obter status');
      }

      return data.data;
    } catch (error) {
      console.error('Erro no obterStatusProcessos:', error);
      throw error;
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