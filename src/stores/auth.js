import { ref, readonly } from 'vue'
import { authService } from '../services/auth'

// Estado da autenticação
const user = ref(null)
const session = ref(null)
const loading = ref(true)
const error = ref(null)

// Inicializa o estado de autenticação
const initAuth = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Verifica se há uma sessão ativa
    const currentSession = await authService.getSession()
    
    if (currentSession) {
      session.value = currentSession
      const currentUser = await authService.getCurrentUser()
      user.value = currentUser
    }
  } catch (err) {
    error.value = err.message
    console.error('Erro ao inicializar autenticação:', err)
  } finally {
    loading.value = false
  }
}

// Login
const login = async (email, password, rememberMe = false) => {
  loading.value = true
  error.value = null
  
  try {
    const { user: authUser, session: authSession } = await authService.signIn(email, password)
    user.value = authUser
    session.value = authSession
    return { user: authUser, session: authSession }
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

// Cadastro
const register = async (email, password) => {
  loading.value = true
  error.value = null
  
  try {
    const { user: authUser, session: authSession } = await authService.signUp(email, password)
    user.value = authUser
    session.value = authSession
    return { user: authUser, session: authSession }
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

// Logout
const logout = async () => {
  loading.value = true
  error.value = null
  
  try {
    await authService.signOut()
    user.value = null
    session.value = null
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

// Recuperação de senha
const resetPassword = async (email) => {
  loading.value = true
  error.value = null
  
  try {
    await authService.resetPassword(email)
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

// Verifica se o usuário está autenticado
const isAuthenticated = () => {
  return !!user.value && !!session.value
}

// Inicializa automaticamente
let initialized = false

// Exporta o store de autenticação
export const useAuthStore = () => {
  // Inicializa o estado de autenticação quando o store é usado pela primeira vez
  if (!initialized) {
    initialized = true
    initAuth()
  }
  
  return {
    // Estado (somente leitura)
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),
    
    // Ações
    login,
    register,
    logout,
    resetPassword,
    isAuthenticated
  }
}
