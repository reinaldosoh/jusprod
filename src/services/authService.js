import { supabase } from '../lib/supabase';
import { translateError } from '../utils/errorTranslator';
import { handleAuthError } from '../utils/authInterceptor';

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

// Cache para verificações (compartilhado com router)
const loginCache = {
  setEmailStatus: (userId, status) => {
    // Armazena no localStorage para persistir entre sessões
    localStorage.setItem(`email_status_${userId}`, JSON.stringify({
      value: status,
      timestamp: Date.now(),
      permanent: status === true
    }));
  },
  
  setOnboardingStatus: (userId, status) => {
    // Armazena no localStorage para persistir entre sessões  
    localStorage.setItem(`onboarding_status_${userId}`, JSON.stringify({
      value: status,
      timestamp: Date.now(),
      permanent: status === true
    }));
  },
  
  getEmailStatus: (userId) => {
    const cached = localStorage.getItem(`email_status_${userId}`);
    return cached ? JSON.parse(cached) : null;
  },
  
  getOnboardingStatus: (userId) => {
    const cached = localStorage.getItem(`onboarding_status_${userId}`);
    return cached ? JSON.parse(cached) : null;
  },
  
  clearCache: (userId) => {
    localStorage.removeItem(`email_status_${userId}`);
    localStorage.removeItem(`onboarding_status_${userId}`);
  }
};

// Exportar loginCache para uso em outros lugares
export { loginCache };

// Função para verificar e cachear status completo no login
async function initializeUserStatus(userId) {
  try {
    console.log('🔄 Inicializando cache de status do usuário...');
    
    // Verificar email diretamente na tabela
    const { data: emailData, error: emailError } = await supabase
      .from('usuario')
      .select('email_confirmado')
      .eq('uuid', userId)
      .single();
    
    const emailValidado = !emailError && emailData && emailData.email_confirmado === true;
    loginCache.setEmailStatus(userId, emailValidado);
    
    // Verificar onboarding diretamente na tabela
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding')
      .select('finalizado')
      .eq('uuid', userId)
      .single();
    
    const naoTemRegistro = onboardingError?.code === 'PGRST116';
    const onboardingFinalizado = !naoTemRegistro && onboardingData && onboardingData.finalizado === true;
    loginCache.setOnboardingStatus(userId, onboardingFinalizado);
    
    console.log('✅ Cache inicializado:', { 
      emailValidado, 
      onboardingFinalizado 
    });
    
    return { emailValidado, onboardingFinalizado };
    
  } catch (error) {
    console.error('❌ Erro ao inicializar status:', error);
    // Tratar erro de autenticação
    handleAuthError(error, 'initializeUserStatus');
    return { emailValidado: false, onboardingFinalizado: false };
  }
}

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
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        // Tratar erro de autenticação
        handleAuthError(error, 'getSession');
        throw error;
      }
      
    return data;
    } catch (error) {
      // Tratar erro de autenticação
      handleAuthError(error, 'getSession');
      throw error;
    }
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

export { initializeUserStatus };

export default authService;
