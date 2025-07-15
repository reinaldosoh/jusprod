import { supabase } from '../lib/supabase.js';

export const escritorioService = {
  /**
   * Verifica se o usuário tem registro na tabela escritorio
   * @returns {Promise<boolean>} Se existe registro do escritório
   */
  async verificarEscritorioExiste() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('escritorio')
        .select('id')
        .eq('uuid', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar escritório:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro no verificarEscritorioExiste:', error);
      return false;
    }
  },

  /**
   * Busca dados do escritório do usuário autenticado
   * @returns {Promise<Object|null>} Dados do escritório ou null
   */
  async buscarDadosEscritorio() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('escritorio')
        .select('*')
        .eq('uuid', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar escritório:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro no buscarDadosEscritorio:', error);
      return null;
    }
  },

  /**
   * Busca o plano atual do usuário
   * @returns {Promise<string>} Nome do plano atual
   */
  async buscarPlanoAtual() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('usuario')
        .select('role_atual')
        .eq('uuid', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar plano do usuário:', error);
        return 'FREE';
      }

      return (data?.role_atual || 'free').toUpperCase();
    } catch (error) {
      console.error('Erro no buscarPlanoAtual:', error);
      return 'FREE';
    }
  },

  /**
   * Salva os dados do escritório
   * @param {Object} dadosEscritorio - Dados do escritório
   * @returns {Promise<Object>} Dados salvos
   */
  async salvarEscritorio(dadosEscritorio) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar usuario_id
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('id')
        .eq('uuid', user.id)
        .single();

      if (userError) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      // Preparar dados para inserção
      const dadosParaInserir = {
        ...dadosEscritorio,
        usuario_id: userData.id,
        uuid: user.id
      };

      // Verificar se já existe registro
      const existeEscritorio = await this.verificarEscritorioExiste();

      if (existeEscritorio) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from('escritorio')
          .update(dadosParaInserir)
          .eq('uuid', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Inserir novo registro
        const { data, error } = await supabase
          .from('escritorio')
          .insert([dadosParaInserir])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Erro ao salvar escritório:', error);
      throw error;
    }
  }
}; 