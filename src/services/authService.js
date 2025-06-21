import { supabase } from '../lib/supabase';
import { translateError } from '../utils/errorTranslator';

// Constante para armazenamento local
const STORAGE_KEY = 'jusprod_session_preference';

// Tempo de inatividade padrão em milissegundos (30 minutos)
const DEFAULT_INACTIVITY_TIMEOUT = 30 * 60 * 1000;

// Constantes para tipos de erro
const ERROR_TYPES = {
  EMAIL_RECOVERY: 'email_recovery',
  AUTHENTICATION: 'authentication',
  UNKNOWN: 'unknown'
};

/**
 * Serviço de autenticação para operações com Supabase
 */
export const authService = {
  /**
   * Envia um email de redefinição de senha
   * @param {string} email - Email do usuário
   * @param {string} redirectUrl - URL para redirecionamento após redefinição
   * @returns {Promise<{data, error}>} - Resultado da operação
   */
  async resetPassword(email, redirectUrl) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl || window.location.origin
      });
      
      if (error) {
        // Identificar especificamente o erro de envio de email
        if (error.message.includes('Error sending recovery email') || error.code === 'unexpected_failure') {
          return { 
            data: null, 
            error: { 
              type: ERROR_TYPES.EMAIL_RECOVERY,
              message: translateError('Error sending recovery email'),
              originalError: error
            } 
          };
        }
        
        return { 
          data: null, 
          error: { 
            type: ERROR_TYPES.AUTHENTICATION,
            message: translateError(error.message),
            originalError: error
          } 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      
      // Verificar se o erro capturado é relacionado ao envio de email
      const isEmailError = error.message && (
        error.message.includes('Error sending recovery email') || 
        (error.code === 'unexpected_failure')
      );
      
      return { 
        data: null, 
        error: { 
          type: isEmailError ? ERROR_TYPES.EMAIL_RECOVERY : ERROR_TYPES.UNKNOWN,
          message: isEmailError 
            ? translateError('Error sending recovery email')
            : translateError(error.message) || 'Erro ao processar solicitação de redefinição de senha',
          originalError: error
        } 
      };
    }
  },
  
  /**
   * Faz login com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<{data, error}>} - Resultado da operação
   */
  /**
   * Faz login com email e senha e configura a sessão de acordo com a preferência do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {boolean} keepLoggedIn - Se deve manter o usuário conectado
   * @returns {Promise<{data, error}>} - Resultado da operação
   */
  async signIn(email, password, keepLoggedIn = false) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { 
          data: null, 
          error: { 
            message: translateError(error.message),
            originalError: error
          } 
        };
      }
      
      // Configurar a sessão de acordo com a preferência do usuário
      this.configureSessionTimeout(keepLoggedIn);
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { 
        data: null, 
        error: { 
          message: translateError(error.message) || 'Erro ao processar solicitação de login',
          originalError: error
        } 
      };
    }
  },
  
  /**
   * Verifica se o usuário está autenticado
   * @returns {Promise<{user, session}>} - Dados do usuário e sessão
   */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data;
  },
  
  /**
   * Configura o timeout da sessão com base na preferência do usuário
   * @param {boolean} keepLoggedIn - Se deve manter o usuário conectado
   */
  configureSessionTimeout(keepLoggedIn) {
    // Salvar a preferência do usuário
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ keepLoggedIn }));
    
    // Limpar qualquer timer existente
    if (window._sessionTimeoutId) {
      clearTimeout(window._sessionTimeoutId);
      window._sessionTimeoutId = null;
    }
    
    // Se não for para manter conectado, configurar o timer de inatividade
    if (!keepLoggedIn) {
      this.setupInactivityTimer();
    }
    
    // Configurar os listeners de eventos para resetar o timer quando houver interação
    this.setupActivityListeners(!keepLoggedIn);
  },
  
  /**
   * Configura o timer de inatividade
   */
  setupInactivityTimer() {
    window._sessionTimeoutId = setTimeout(() => {
      // Fazer logout após o tempo de inatividade
      this.signOut();
    }, DEFAULT_INACTIVITY_TIMEOUT);
  },
  
  /**
   * Configura os listeners de eventos para detectar atividade do usuário
   * @param {boolean} active - Se deve ativar os listeners
   */
  setupActivityListeners(active) {
    // Remover listeners existentes para evitar duplicação
    ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(eventType => {
      document.removeEventListener(eventType, this.resetInactivityTimer);
    });
    
    // Se não for para manter conectado, adicionar os listeners
    if (active) {
      ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, this.resetInactivityTimer);
      });
    }
  },
  
  /**
   * Reseta o timer de inatividade quando o usuário interage com a página
   */
  resetInactivityTimer() {
    if (window._sessionTimeoutId) {
      clearTimeout(window._sessionTimeoutId);
    }
    
    // Verificar se o usuário optou por não permanecer conectado
    const preference = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!preference.keepLoggedIn) {
      authService.setupInactivityTimer();
    }
  },
  
  /**
   * Faz logout do usuário
   * @returns {Promise<{error}>} - Resultado da operação
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Limpar preferências e timers
      localStorage.removeItem(STORAGE_KEY);
      if (window._sessionTimeoutId) {
        clearTimeout(window._sessionTimeoutId);
        window._sessionTimeoutId = null;
      }
      
      // Remover listeners de eventos
      this.setupActivityListeners(false);
      
      return { error };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { 
        error: { 
          message: 'Erro ao encerrar a sessão',
          originalError: error
        } 
      };
    }
  }
};

export default authService;
