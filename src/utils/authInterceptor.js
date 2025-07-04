import { supabase } from '../lib/supabase'

let router = null

// Configurar o router para redirecionamento
export function configureAuthInterceptor(routerInstance) {
  router = routerInstance
  console.log('✅ Interceptor de autenticação configurado')
}

// Interceptar erros de autenticação
export function handleAuthError(error, context = '') {
  console.error(`❌ Erro de autenticação ${context}:`, error)
  
  // Verificar se é erro de token expirado ou sessão inválida
  const isAuthError = error?.message?.includes('JWT expired') ||
                     error?.message?.includes('Invalid token') ||
                     error?.message?.includes('Invalid refresh token') ||
                     error?.message?.includes('session_not_found') ||
                     error?.message?.includes('not_authenticated') ||
                     error?.code === 'PGRST301' || // JWT expired
                     error?.code === 'PGRST116' || // Row not found (pode ser problema de auth)
                     error?.status === 401 || // Unauthorized
                     error?.status === 403    // Forbidden
  
  if (isAuthError) {
    console.log('🔄 Detectado erro de autenticação - fazendo logout automático')
    
    // Fazer logout silencioso (sem esperar resultado)
    supabase.auth.signOut().catch(console.error)
    
    // Limpar cache local
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('email_status_') || key.startsWith('onboarding_status_')
    )
    keys.forEach(key => localStorage.removeItem(key))
    
    // Redirecionar para login
    if (router) {
      const rotasPublicas = ['login', 'cadastro', 'esqueciSenha', 'resetPassword', 'verificarEmail']
      const rotaAtual = router.currentRoute.value.name
      
      if (!rotasPublicas.includes(rotaAtual)) {
        console.log('🔄 Redirecionando para login devido a erro de autenticação')
        router.push({ name: 'login' })
      }
    }
    
    return true // Indica que foi tratado como erro de auth
  }
  
  return false // Não é erro de auth
}

// Wrapper para chamadas do Supabase com tratamento de erro
export async function supabaseWithAuth(operation, context = '') {
  try {
    const result = await operation()
    return result
  } catch (error) {
    const wasAuthError = handleAuthError(error, context)
    if (!wasAuthError) {
      throw error // Re-throw se não foi erro de auth
    }
    // Se foi erro de auth, retornar erro específico
    throw new Error('Sessão expirada. Por favor, faça login novamente.')
  }
}

// Verificar se o token está próximo do vencimento
export function checkTokenExpiration() {
  try {
    const { data } = supabase.auth.getSession()
    if (!data.session) return false
    
    const expiresAt = data.session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = expiresAt - now
    
    // Se restam menos de 5 minutos, tentar refresh
    if (timeLeft < 300) {
      console.log('⏰ Token expirando em menos de 5 minutos, tentando refresh...')
      supabase.auth.refreshSession().catch(error => {
        console.error('❌ Erro ao fazer refresh do token:', error)
        handleAuthError(error, 'tokenRefresh')
      })
    }
    
    return timeLeft > 0
  } catch (error) {
    console.error('❌ Erro ao verificar expiração do token:', error)
    return false
  }
}

// Configurar verificação periódica do token
export function setupTokenCheck() {
  // Verificar a cada 1 minuto
  setInterval(checkTokenExpiration, 60000)
  console.log('✅ Verificação periódica de token configurada')
} 