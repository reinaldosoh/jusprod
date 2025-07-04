<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'
import { configureAuthInterceptor, setupTokenCheck } from './utils/authInterceptor'

const router = useRouter()

// Listener para mudanças no estado de autenticação
let authListener = null

onMounted(() => {
  // Configurar interceptor de autenticação
  configureAuthInterceptor(router)
  
  // Configurar verificação periódica do token
  setupTokenCheck()
  
  // Configurar listener para mudanças de autenticação
  authListener = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Estado de autenticação mudou:', event, session?.user?.id)
    
    // Se o usuário foi desconectado (token expirou ou logout)
    if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
      console.log('👋 Usuário desconectado - redirecionando para login')
      
      // Limpar qualquer cache de status do usuário
      const allKeys = Object.keys(localStorage)
      const userKeys = allKeys.filter(key => 
        key.startsWith('email_status_') || key.startsWith('onboarding_status_')
      )
      userKeys.forEach(key => localStorage.removeItem(key))
      
      // Redirecionar para login se não estiver em rotas públicas
      const rotasPublicas = ['login', 'cadastro', 'esqueciSenha', 'resetPassword', 'verificarEmail']
      const rotaAtual = router.currentRoute.value.name
      
      if (!rotasPublicas.includes(rotaAtual)) {
        console.log('🔄 Redirecionando para login')
        router.push({ name: 'login' })
      }
    }
    
    // Se houve erro na atualização do token
    if (event === 'TOKEN_REFRESHED' && !session) {
      console.log('❌ Erro na atualização do token - redirecionando para login')
      router.push({ name: 'login' })
    }
  })

  console.log('✅ Listener de autenticação configurado')
})

onUnmounted(() => {
  // Limpar listener quando o componente for destruído
  if (authListener) {
    authListener.data.subscription.unsubscribe()
    console.log('🧹 Listener de autenticação removido')
  }
})
</script>

<template>
  <div class="app">    
    <!-- Renderiza o componente correspondente à rota atual -->
    <router-view />
  </div>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  background-color: #ffffff;
  overflow-x: hidden;
}

.app {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

@media (max-width: 768px) {
  .app {
    min-height: 100vh;
  }
}
</style>

<!-- Importação da fonte Inter do Google Fonts -->
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
</style>
