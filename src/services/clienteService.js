import { supabase } from '../lib/supabase.js';

export const clienteService = {
  /**
   * Lista todos os clientes do usuário autenticado
   * @returns {Promise<Array>} Lista de clientes
   */
  async listarClientes() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('uuid', user.id)
        .order('nome');

      if (error) {
        console.error('Erro ao listar clientes:', error);
        throw new Error('Erro ao carregar clientes');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no listarClientes:', error);
      throw error;
    }
  },

  /**
   * Busca clientes vinculados a um processo específico
   * @param {number} processoId - ID do processo
   * @returns {Promise<Array>} Lista de clientes vinculados
   */
  async listarClientesVinculados(processoId) {
    try {
      const { data, error } = await supabase
        .from('processo_cliente')
        .select(`
          clientes (
            id,
            nome,
            email,
            cpf,
            cnpj,
            telefone
          )
        `)
        .eq('processo_id', processoId);

      if (error) {
        console.error('Erro ao listar clientes vinculados:', error);
        throw new Error('Erro ao carregar clientes vinculados');
      }

      return data?.map(item => item.clientes) || [];
    } catch (error) {
      console.error('Erro no listarClientesVinculados:', error);
      throw error;
    }
  },

  /**
   * Vincula um cliente a um processo
   * @param {number} processoId - ID do processo
   * @param {number} clienteId - ID do cliente
   * @returns {Promise<Object>} Resultado da vinculação
   */
  async vincularClienteProcesso(processoId, clienteId) {
    try {
      const { data, error } = await supabase
        .from('processo_cliente')
        .insert([{
          processo_id: processoId,
          cliente_id: clienteId
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao vincular cliente ao processo:', error);
        throw new Error('Erro ao vincular cliente');
      }

      return data;
    } catch (error) {
      console.error('Erro no vincularClienteProcesso:', error);
      throw error;
    }
  },

  /**
   * Remove vinculação de um cliente com um processo
   * @param {number} processoId - ID do processo
   * @param {number} clienteId - ID do cliente
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async desvincularClienteProcesso(processoId, clienteId) {
    try {
      const { error } = await supabase
        .from('processo_cliente')
        .delete()
        .eq('processo_id', processoId)
        .eq('cliente_id', clienteId);

      if (error) {
        console.error('Erro ao desvincular cliente do processo:', error);
        throw new Error('Erro ao desvincular cliente');
      }

      return true;
    } catch (error) {
      console.error('Erro no desvincularClienteProcesso:', error);
      throw error;
    }
  }
}; 