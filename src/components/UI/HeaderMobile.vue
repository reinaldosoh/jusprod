<!-- Header Mobile -->
<template>
  <header class="bg-white shadow-sm md:hidden sticky top-0 z-30">
    <div class="px-4 py-3 flex items-center justify-between">
      <!-- Botão Hamburger -->
      <button 
        @click="$emit('toggle-menu')"
        class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- Logo -->
      <div class="flex-1 flex justify-center">
        <img 
          src="/images/logotipo.png" 
          alt="Jusprod" 
          class="h-8 object-contain"
        />
      </div>

      <!-- Notificações -->
      <div class="relative">
        <button 
          @click="navegarParaAlerta"
          class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.91 32.91 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0016 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9.574 2 2 0 01-.261.967A2 2 0 0110 18a2 2 0 01-1.689-1.516 2 2 0 01-.261-.967c1.325-.094 2.641-.26 3.9-.574z"></path>
          </svg>
        </button>
        <span 
          v-if="alertasNaoVisualizados > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        >
          {{ alertasNaoVisualizados }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertas } from '../../composables/useAlertas'
import { supabase } from '../../lib/supabase'

// Emits
defineEmits(['toggle-menu'])

// Router
const router = useRouter()

// Composable de alertas
const { alertasNaoVisualizados, buscarContadorAlertas, configurarListenerAlertas, removerListenerAlertas } = useAlertas()

// Estados para realtime updates
let alertasSubscription = null

// Função para navegar para a página de alertas
const navegarParaAlerta = () => {
  router.push('/alerta')
}

// Função para inicializar dados de alertas
const inicializarDadosAlertas = async () => {
  try {
    console.log('🔄 HeaderMobile: Inicializando dados de alertas...')
    
    // Verificar se há usuário autenticado
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log('❌ HeaderMobile: Usuário não autenticado ainda, tentando novamente em 1s...')
      // Tentar novamente em 1 segundo
      setTimeout(inicializarDadosAlertas, 1000)
      return
    }
    
    console.log('✅ HeaderMobile: Usuário autenticado encontrado:', user.id)
    
    // Buscar contagem inicial de alertas não visualizados
    await buscarContadorAlertas()
    
    // Configurar listener para alertas
    if (!alertasSubscription) {
      alertasSubscription = configurarListenerAlertas()
    }
    
    console.log('✅ HeaderMobile: Dados de alertas inicializados com sucesso')
  } catch (error) {
    console.error('❌ HeaderMobile: Erro ao inicializar dados de alertas:', error)
    // Tentar novamente em 2 segundos em caso de erro
    setTimeout(inicializarDadosAlertas, 2000)
  }
}

// Inicializar dados quando componente for montado
onMounted(async () => {
  await inicializarDadosAlertas()
})

// Limpar subscription quando componente for desmontado
onUnmounted(() => {
  // Remover listener de alertas
  removerListenerAlertas(alertasSubscription)
  alertasSubscription = null
})
</script>

<style scoped>
/* Header Mobile Styles */
header {
  background-color: white;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  position: sticky;
  top: 0;
  z-index: 30;
}

@media (min-width: 768px) {
  header {
    display: none;
  }
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.flex-1 {
  flex: 1 1 0%;
}

.p-2 {
  padding: 0.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.text-gray-600 {
  color: rgb(75 85 99);
}

.text-gray-900 {
  color: rgb(17 24 39);
}

.bg-gray-100 {
  background-color: rgb(243 244 246);
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.w-6 {
  width: 1.5rem;
}

.h-6 {
  height: 1.5rem;
}

.h-8 {
  height: 2rem;
}

.object-contain {
  object-fit: contain;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.-top-1 {
  top: -0.25rem;
}

.-right-1 {
  right: -0.25rem;
}

.bg-red-500 {
  background-color: rgb(239 68 68);
}

.text-white {
  color: rgb(255 255 255);
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.rounded-full {
  border-radius: 9999px;
}

.h-5 {
  height: 1.25rem;
}

.w-5 {
  width: 1.25rem;
}

button:hover {
  color: rgb(17 24 39);
  background-color: rgb(243 244 246);
}

button {
  border: none;
  background: transparent;
  cursor: pointer;
}
</style> 