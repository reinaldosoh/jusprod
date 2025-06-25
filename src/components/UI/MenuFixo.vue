<!-- The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work. -->
<template>
<div class="min-h-screen bg-white max-w-[1280px] h-[307px] mx-auto font-inter">
<!-- Header -->
<header class="bg-white shadow-sm">
<div class="px-4 py-3 flex items-center justify-between">
<div class="flex items-center">
<div class="text-blue-600 font-bold text-2xl flex items-center">
<img src="/images/logotipo.png" alt="Jusprod" style="width: 156px; height: 48px; object-fit: contain;" />
</div>
</div>
<div class="flex items-center space-x-6">
<div class="relative">
<Bell class="text-gray-600 cursor-pointer w-5 h-5" />
<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
8
</span>
</div>
        <Controlador />
<div class="flex items-center border-l border-r px-4 py-2 cursor-pointer">
<div class="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center text-gray-700 mr-2">
<span>RE</span>
</div>
<div class="flex flex-col gap-0">
<span class="text-sm font-medium">Reinaldo C...</span>
<span class="text-xs text-gray-500">Nome Escritório</span>
</div>
<ChevronDown class="ml-2 text-gray-400 w-4 h-4" />
</div>
<div @click="abrirModalLogout" class="flex items-center text-blue-500 cursor-pointer">
<LogOut class="mr-1 w-5 h-5" />
<span>Sair</span>
</div>
</div>
</div>
</header>
<!-- Main Content -->
<main class="px-4 py-6">
<h1 class="text-2xl font-medium text-gray-800 mb-8">O que você deseja fazer agora?</h1>
<!-- Navigation Tabs -->
<div class="border-b border-gray-200 mb-8">
<nav class="flex justify-between w-full -mb-px">
  <router-link to="/dashboard" custom v-slot="{ navigate }" class="flex-1">
    <a @click="navigate" class="menu-item" :class="{'menu-item-active': currentPath.startsWith('/dashboard')}">
      Dashboard
    </a>
  </router-link>
  <router-link to="/intimacoes" custom v-slot="{ navigate }" class="flex-1">
    <a @click="navigate" class="menu-item flex items-center justify-center" :class="{'menu-item-active': currentPath.startsWith('/intimacoes')}">
      Intimações
      <span class="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        9
      </span>
    </a>
  </router-link>
  <router-link to="/clientes" custom v-slot="{ navigate }" class="flex-1">
    <a @click="navigate" class="menu-item" :class="{'menu-item-active': currentPath.startsWith('/clientes')}">
      Clientes
    </a>
  </router-link>
  <router-link to="/documentos" custom v-slot="{ navigate }" class="flex-1">
    <a @click="navigate" class="menu-item" :class="{'menu-item-active': currentPath.startsWith('/documentos')}">
      Documentos
    </a>
  </router-link>
  <router-link to="/processos" custom v-slot="{ navigate }" class="flex-1">
    <a @click="navigate" class="menu-item" :class="{'menu-item-active': currentPath.startsWith('/processos')}">
      Processos
    </a>
  </router-link>
  <router-link to="/relatorios" custom v-slot="{ navigate }" class="flex-1">
    <a @click="navigate" class="menu-item" :class="{'menu-item-active': currentPath.startsWith('/relatorios')}">
      Relatórios
    </a>
  </router-link>
  <router-link to="/agenda" custom v-slot="{ navigate }" class="flex-1">
    <a @click="navigate" class="menu-item" :class="{'menu-item-active': currentPath.startsWith('/agenda')}">
      Minha agenda
    </a>
  </router-link>
  <router-link to="/financeiro" custom v-slot="{ navigate }" class="flex-1">
    <a @click="navigate" class="menu-item" :class="{'menu-item-active': currentPath.startsWith('/financeiro')}">
      Planejamento financeiro
    </a>
  </router-link>
  <router-link to="/ajuda" custom v-slot="{ navigate }" class="flex-1">
    <a @click="navigate" class="menu-item" :class="{'menu-item-active': currentPath.startsWith('/ajuda')}">
      Ajuda
    </a>
  </router-link>
</nav>
</div>
</main>
</div>

<!-- Modal de Logout -->
<Logout 
  :visible="modalLogoutVisivel" 
  @fechar="fecharModalLogout"
/>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Bell, ChevronDown, LogOut } from 'lucide-vue-next';
import Controlador from './Controlador.vue';
import Logout from './Logout.vue';

const router = useRouter();
const route = useRoute();

// Detectar a rota atual para destacar o item de menu correto
const currentPath = computed(() => route.path);

// Estado para controlar a visibilidade do modal de logout
const modalLogoutVisivel = ref(false);

// Função para abrir o modal de logout
const abrirModalLogout = () => {
  modalLogoutVisivel.value = true;
};

// Função para fechar o modal de logout
const fecharModalLogout = () => {
  modalLogoutVisivel.value = false;
};

// Logout agora é gerenciado diretamente pelo componente Logout.vue

// Removido handleUpgrade - agora é gerenciado pelo próprio componente Controlador

// Função de logout
const logout = () => {
  // Aqui você pode adicionar a lógica para fazer logout no backend
  // Por exemplo: await authService.logout();
  
  // Redirecionar para a página de login
  router.push('/login');
};

const recentProcesses = ref([
{
number: '0001/2025',
client: 'Maria Santos',
type: 'Civil',
status: 'Em andamento',
lastUpdate: '24 Jun 2025'
},
{
number: '0002/2025',
client: 'João Silva',
type: 'Trabalhista',
status: 'Concluído',
lastUpdate: '22 Jun 2025'
},
{
number: '0003/2025',
client: 'Ana Oliveira',
type: 'Tributário',
status: 'Aguardando',
lastUpdate: '20 Jun 2025'
},
{
number: '0004/2025',
client: 'Carlos Pereira',
type: 'Criminal',
status: 'Urgente',
lastUpdate: '18 Jun 2025'
},
{
number: '0005/2025',
client: 'Luiza Costa',
type: 'Administrativo',
status: 'Em andamento',
lastUpdate: '15 Jun 2025'
}
]);

const getStatusClass = (status: string) => {
switch (status) {
case 'Em andamento':
return 'bg-blue-100 text-blue-800';
case 'Concluído':
return 'bg-green-100 text-green-800';
case 'Aguardando':
return 'bg-yellow-100 text-yellow-800';
case 'Urgente':
return 'bg-red-100 text-red-800';
default:
return 'bg-gray-100 text-gray-800';
}
};
</script>
<style>
/* Apply system font for better performance */
* {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* Navigation menu styles */
.menu-item {
  padding: 16px 4px;
  font-weight: 500;
  font-size: 14px;
  color: #4b5563; /* text-gray-600 */
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  text-align: center;
  width: 100%;
  display: block;
  white-space: nowrap;
}

.menu-item:hover {
  color: #1f2937; /* text-gray-800 */
}

.menu-item-active {
  color: #0066FF; /* cor azul específica */
  border-bottom: 3px solid #0066FF; /* borda mais espessa */
  font-weight: 600;
}

/* Custom styles for input fields */
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Remove number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Ensure icons have proper size */
.lucide {
  width: 1.25rem;
  height: 1.25rem;
}

/* Ensure proper spacing and alignment */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.space-x-6 > * + * {
  margin-left: 1.5rem;
}

/* Text styles */
.text-blue-500 {
  color: #3b82f6;
}

.text-blue-600 {
  color: #2563eb;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-800 {
  color: #1f2937;
}

.text-white {
  color: #ffffff;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.bg-red-500 {
  background-color: #ef4444;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.bg-gray-300 {
  background-color: #d1d5db;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.border-blue-500 {
  border-color: #3b82f6;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

/* Sizing */
.h-5 {
  height: 1.25rem;
}

.w-5 {
  width: 1.25rem;
}

.h-8 {
  height: 2rem;
}

.w-8 {
  width: 2rem;
}

.h-2 {
  height: 0.5rem;
}

.w-32 {
  width: 8rem;
}

.w-40 {
  width: 10rem;
}

.h-3 {
  height: 0.75rem;
}

.max-w-\[1280px\] {
  max-width: 1280px;
}

/* Spacing */
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mr-1 {
  margin-right: 0.25rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-1 {
  margin-left: 0.25rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.-mb-px {
  margin-bottom: -1px;
}

.-top-2 {
  top: -0.5rem;
}

.-right-2 {
  right: -0.5rem;
}

/* Border styles */
.border-l {
  border-left-width: 1px;
}

.border-r {
  border-right-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.rounded-full {
  border-radius: 9999px;
}

.overflow-hidden {
  overflow: hidden;
}

.transition-all {
  transition: all 0.3s ease;
}

.duration-500 {
  transition-duration: 500ms;
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

/* Gap and flex styles - force override */
.gap-0 {
  gap: 0 !important;
}

.flex-col {
  flex-direction: column !important;
}

/* Other styles */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.cursor-pointer {
  cursor: pointer;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
</style>