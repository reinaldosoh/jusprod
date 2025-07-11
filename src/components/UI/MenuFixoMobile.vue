<!-- Menu Lateral Mobile -->
<template>
  <!-- Overlay para fechar o menu -->
  <div 
    v-if="isVisible" 
    class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    @click="$emit('close')"
  ></div>

  <!-- Menu Lateral -->
  <div 
    :class="[
      'fixed top-0 right-0 h-screen w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden menu-sidebar',
      isVisible ? 'translate-x-0' : 'translate-x-full'
    ]"
  >
    <!-- Header do Menu -->
    <div class="p-4 border-b border-gray-200">
      <!-- Informações do Usuário -->
      <div class="flex items-center mb-4">
        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
          {{ userInitials }}
        </div>
        <div class="flex-1">
          <div class="font-medium text-gray-800">{{ userName }}</div>
          <div class="text-sm text-gray-500 flex items-center">
            {{ userCompany }}
            <svg class="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Controlador de Uso/Plano -->
      <div class="bg-gray-50 rounded-lg p-3 mb-2">
        <Controlador />
      </div>
    </div>

    <!-- Menu de Navegação -->
    <nav class="flex-1 py-4 overflow-y-auto">
      <div class="space-y-1 px-4">
        <!-- Dashboard -->
        <router-link 
          to="/dashboard" 
          class="menu-item-mobile"
          :class="{'menu-item-mobile-active': currentPath.startsWith('/dashboard')}"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Dashboard
        </router-link>

        <!-- Intimações -->
        <router-link 
          to="/intimacoes" 
          class="menu-item-mobile"
          :class="{'menu-item-mobile-active': currentPath.startsWith('/intimacoes')}"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span class="flex-1">Intimações</span>
          <span 
            v-if="intimacoesNaoVisualizadas > 0"
            class="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {{ intimacoesNaoVisualizadas }}
          </span>
        </router-link>

        <!-- Clientes -->
        <router-link 
          to="/clientes" 
          class="menu-item-mobile"
          :class="{'menu-item-mobile-active': currentPath.startsWith('/clientes')}"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Clientes
        </router-link>

        <!-- Documentos -->
        <router-link 
          to="/documentos" 
          class="menu-item-mobile"
          :class="{'menu-item-mobile-active': currentPath.startsWith('/documentos')}"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Documentos
        </router-link>

        <!-- Processos -->
        <router-link 
          to="/processos" 
          class="menu-item-mobile"
          :class="{'menu-item-mobile-active': currentPath.startsWith('/processos')}"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          Processos
        </router-link>

        <!-- Relatórios -->
        <router-link 
          to="/relatorios" 
          class="menu-item-mobile"
          :class="{'menu-item-mobile-active': currentPath.startsWith('/relatorios')}"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Relatórios
        </router-link>

        <!-- Minha agenda -->
        <router-link 
          to="/agenda" 
          class="menu-item-mobile"
          :class="{'menu-item-mobile-active': currentPath.startsWith('/agenda')}"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Minha agenda
        </router-link>

        <!-- Planejamento financeiro -->
        <router-link 
          to="/financeiro" 
          class="menu-item-mobile"
          :class="{'menu-item-mobile-active': currentPath.startsWith('/financeiro')}"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Planejamento financeiro
        </router-link>

        <!-- Separador -->
        <div class="border-t border-gray-200 my-2"></div>

        <!-- Ajuda -->
        <router-link 
          to="/ajuda" 
          class="menu-item-mobile"
          :class="{'menu-item-mobile-active': currentPath.startsWith('/ajuda')}"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Ajuda
        </router-link>

        <!-- Sair -->
        <button 
          @click="handleLogout"
          class="menu-item-mobile text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Sair
        </button>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-gray-200 p-4">
      <!-- Botão Excluir Conta -->
      <button 
        @click="handleDeleteAccount"
        class="text-white text-sm font-medium transition-colors flex items-center px-3 py-2 rounded-md w-full justify-center delete-account-button"
        style="background-color: #dc2626; color: white;"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        Excluir minha conta
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useUsuario } from '../../composables/useUsuario'
import { useIntimacoes } from '../../composables/useIntimacoes'
import { supabase } from '../../lib/supabase'
import Controlador from './Controlador.vue'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'logout', 'upgrade', 'delete-account'])

// Composables
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { buscarDadosUsuario, nomeUsuario, iniciaisUsuario, dadosUsuario } = useUsuario()
const { intimacoesNaoVisualizadas, buscarContadorIntimacoes, configurarListenerIntimacoes, removerListenerIntimacoes } = useIntimacoes()

// Computed
const currentPath = computed(() => route.path)

// Usa o nome do composable useUsuario
const userName = computed(() => nomeUsuario.value)

const userCompany = computed(() => {
  return dadosUsuario.value?.role_atual || authStore.user?.value?.user_metadata?.company || 'Advocacia'
})

// Usa as iniciais do composable useUsuario
const userInitials = computed(() => iniciaisUsuario.value)

// Estados para realtime updates
let intimacoesSubscription = null

// Função para inicializar dados do usuário e intimações
const inicializarDados = async () => {
  try {
    console.log('🔄 MenuFixoMobile: Inicializando dados do usuário e intimações...')
    
    // Verificar se há usuário autenticado
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log('❌ MenuFixoMobile: Usuário não autenticado ainda, tentando novamente em 1s...')
      // Tentar novamente em 1 segundo
      setTimeout(inicializarDados, 1000)
      return
    }
    
    console.log('✅ MenuFixoMobile: Usuário autenticado encontrado:', user.id)
    
    // Buscar dados do usuário
    await buscarDadosUsuario()
    
    // Buscar contagem inicial de intimações não visualizadas
    await buscarContadorIntimacoes()
    
    // Configurar listener para atualizações em tempo real apenas uma vez
    if (!intimacoesSubscription) {
      intimacoesSubscription = configurarListenerIntimacoes()
    }
    
    console.log('✅ MenuFixoMobile: Dados inicializados com sucesso')
  } catch (error) {
    console.error('❌ MenuFixoMobile: Erro ao inicializar dados:', error)
    // Tentar novamente em 2 segundos em caso de erro
    setTimeout(inicializarDados, 2000)
  }
}

// Busca os dados do usuário e intimações quando o componente é montado
onMounted(async () => {
  // Inicializar dados imediatamente
  await inicializarDados()
})

// Limpar subscription quando componente for desmontado
onUnmounted(() => {
  // Usar o novo método de remoção do composable
  removerListenerIntimacoes()
  intimacoesSubscription = null
})

// Methods
const handleNavigation = () => {
  emit('close')
}

const handleLogout = () => {
  emit('logout')
  emit('close')
}

const handleUpgrade = () => {
  emit('upgrade')
  router.push('/planos')
  emit('close')
}

const handleDeleteAccount = () => {
  emit('delete-account')
  emit('close')
}
</script>

<style scoped>
/* Overlay */
.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-black {
  background-color: rgb(0 0 0);
}

.bg-opacity-50 {
  background-color: rgb(0 0 0 / 0.5);
}

.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 9999;
}

.md\:hidden {
  display: none;
}

@media (max-width: 767px) {
  .md\:hidden {
    display: block;
  }
}

/* Menu Lateral */
.w-80 {
  width: 20rem;
}

.h-full {
  height: 100%;
}

.h-screen {
  height: 100vh;
  min-height: 100vh;
}

.bg-white {
  background-color: rgb(255 255 255);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.transform {
  transform: translateX(var(--tw-translate-x, 0));
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.translate-x-0 {
  --tw-translate-x: 0px;
}

.-translate-x-full {
  --tw-translate-x: -100%;
}

.translate-x-full {
  --tw-translate-x: 100%;
}

/* Layout */
.p-4 {
  padding: 1rem;
}

.border-b {
  border-bottom-width: 1px;
}

.border-gray-200 {
  border-color: rgb(229 231 235);
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.text-gray-600 {
  color: rgb(75 85 99);
}

.text-gray-800 {
  color: rgb(31 41 55);
}

.text-gray-500 {
  color: rgb(107 114 128);
}

.text-gray-400 {
  color: rgb(156 163 175);
}

.text-gray-700 {
  color: rgb(55 65 81);
}

.text-blue-500 {
  color: rgb(59 130 246);
}

.text-blue-600 {
  color: rgb(37 99 235);
}

.text-red-600 {
  color: rgb(220 38 38);
}

.text-white {
  color: rgb(255 255 255);
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-medium {
  font-weight: 500;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.w-5 {
  width: 1.25rem;
}

.h-5 {
  height: 1.25rem;
}

.w-10 {
  width: 2.5rem;
}

.h-10 {
  height: 2.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded {
  border-radius: 0.25rem;
}

.border-2 {
  border-width: 2px;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.ml-1 {
  margin-left: 0.25rem;
}

.ml-auto {
  margin-left: auto;
}

.bg-red-500 {
  background-color: rgb(239 68 68);
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-1 {
  top: 0.25rem;
  right: 0.25rem;
  bottom: 0.25rem;
  left: 0.25rem;
}

.bg-orange-400 {
  background-color: rgb(251 146 60);
}

.bg-gray-200 {
  background-color: rgb(229 231 235);
}

.bg-gray-400 {
  background-color: rgb(156 163 175);
}

.bg-blue-500 {
  background-color: rgb(59 130 246);
}

.bg-blue-600 {
  background-color: rgb(37 99 235);
}

.bg-blue-50 {
  background-color: rgb(239 246 255);
}

.bg-gray-100 {
  background-color: rgb(243 244 246);
}

.bg-red-50 {
  background-color: rgb(254 242 242);
}

.h-2 {
  height: 0.5rem;
}

.w-full {
  width: 100%;
}

.flex-1 {
  flex: 1 1 0%;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.space-y-1 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.25rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.border-t {
  border-top-width: 1px;
}

.my-2 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.cursor-default {
  cursor: default;
}

.cursor-pointer {
  cursor: pointer;
}

.text-left {
  text-align: left;
}

.border-r-2 {
  border-right-width: 2px;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Componentes customizados */
.menu-item-mobile {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  color: rgb(55 65 81);
  border-radius: 0.5rem;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  text-decoration: none;
}

.menu-item-mobile:hover {
  background-color: rgb(243 244 246);
}

.menu-item-mobile-active {
  background-color: rgb(239 246 255);
  color: rgb(37 99 235);
  border-right: 2px solid rgb(37 99 235);
}

.hover\:bg-gray-100:hover {
  background-color: rgb(243 244 246);
}

.hover\:text-blue-600:hover {
  color: rgb(37 99 235);
}

.hover\:bg-red-50:hover {
  background-color: rgb(254 242 242);
}

.hover\:text-red-700:hover {
  color: rgb(185 28 28);
}

.overflow-y-auto {
  overflow-y: auto;
}

.flex-col {
  flex-direction: column;
}

/* Garantir que o menu tenha layout flex correto */
.menu-sidebar {
  display: flex !important;
  flex-direction: column !important;
  height: 100vh !important;
  min-height: 100vh !important;
  max-height: 100vh !important;
  position: fixed !important;
  top: 0 !important;
  bottom: 0 !important;
  right: 0 !important;
  width: 20rem !important;
  background-color: white !important;
  z-index: 9999 !important;
  box-shadow: -10px 0 15px -3px rgb(0 0 0 / 0.1) !important;
  overflow: hidden !important;
}

/* Botão de excluir conta */
.delete-account-button:hover {
  background-color: #b91c1c !important; /* Vermelho mais escuro no hover */
}

/* Forçar altura em viewport móvel */
@media (max-width: 767px) {
  .menu-sidebar {
    height: 100vh !important;
    height: 100dvh !important; /* Altura dinâmica para mobile */
  }
  
  .menu-sidebar > * {
    flex-shrink: 0;
  }
  
  .menu-sidebar nav {
    flex: 1 !important;
    overflow-y: auto !important;
    max-height: calc(100vh - 200px) !important;
  }
}

/* Estilos específicos para o Controlador no mobile */
.bg-gray-50 {
  background-color: rgb(249 250 251);
}

.rounded-lg {
  border-radius: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

/* Ajustes para o Controlador no mobile - força texto menor */
.bg-gray-50 .flex {
  flex-wrap: wrap;
}

.bg-gray-50 .text-sm {
  font-size: 0.75rem !important;
  line-height: 1rem !important;
}

.bg-gray-50 .text-xs {
  font-size: 0.65rem !important;
  line-height: 0.9rem !important;
}

/* Força altura menor na barra de progresso para mobile */
.bg-gray-50 > div > div > div[style*="height: 0.75rem"] {
  height: 0.5rem !important;
}

.bg-gray-50 > div > div > div[style*="width: 10rem"] {
  width: 8rem !important;
}
</style>