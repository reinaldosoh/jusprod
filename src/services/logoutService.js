import { supabase } from '../lib/supabase';
import { loginCache } from './authService';

export const logoutService = {
  /**
   * Faz logout do usuário, limpando a sessão
   * @returns {Promise<Object>} Resultado da operação
   */
  async logout() {
    try {
      console.log('🔄 Fazendo logout do usuário...');
      
      // Obter ID do usuário antes do logout para limpar cache
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro ao fazer logout:', error);
        throw new Error('Erro ao fazer logout: ' + error.message);
      }
      
      // Limpar cache do localStorage após logout bem-sucedido
      if (userId) {
        loginCache.clearCache(userId);
        console.log('🧹 Cache de verificações limpo');
      }
      
      console.log('✅ Logout realizado com sucesso');
      
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro no logoutService:', error);
      throw error;
    }
  },

  /**
   * Verifica se o usuário está autenticado
   * @returns {Promise<boolean>} Se o usuário está autenticado
   */
  async isAuthenticated() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  },

  /**
   * Obtém informações do usuário atual
   * @returns {Promise<Object|null>} Dados do usuário ou null
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Erro no getCurrentUser:', error);
      return null;
    }
  }
};

export default logoutService; 