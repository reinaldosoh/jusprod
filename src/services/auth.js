import { supabase } from '../lib/supabase'

/**
 * Serviço de autenticação para gerenciar operações relacionadas a usuários
 */
export const authService = {
  /**
   * Realiza login com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise} Resultado da operação
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Erro ao fazer login:', error.message)
      throw error
    }
  },

  /**
   * Realiza cadastro com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise} Resultado da operação
   */
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Erro ao cadastrar:', error.message)
      throw error
    }
  },

  /**
   * Realiza logout do usuário atual
   * @returns {Promise} Resultado da operação
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Erro ao fazer logout:', error.message)
      throw error
    }
  },

  /**
   * Recupera a sessão atual do usuário
   * @returns {Promise} Sessão do usuário
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error.message)
      throw error
    }
  },

  /**
   * Recupera o usuário atual
   * @returns {Promise} Usuário atual
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data.user
    } catch (error) {
      console.error('Erro ao recuperar usuário atual:', error.message)
      throw error
    }
  },

  /**
   * Envia email para recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise} Resultado da operação
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error.message)
      throw error
    }
  }
}
