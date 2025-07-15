<template>
  <div class="filtro-container">
    <!-- Abas de filtro -->
    <div class="abas-container">
      <div class="tabs-wrapper">
        <a 
          href="#" 
          @click.prevent="abaAtiva = 'nao-lidas'"
          :class="['tab-link', { 'tab-active': abaAtiva === 'nao-lidas' }]"
        >
          Não lidas
        </a>
        <a 
          href="#" 
          @click.prevent="abaAtiva = 'lidas'"
          :class="['tab-link', { 'tab-active': abaAtiva === 'lidas' }]"
        >
          Lidas
        </a>
      </div>
    </div>

    <!-- Campo de pesquisa -->
    <div class="pesquisa-container">
      <div class="pesquisa-input-wrapper">
        <svg class="pesquisa-icone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input 
          type="text" 
          v-model="termoPesquisa"
          placeholder="Pesquisar alertas"
          class="pesquisa-input"
          @input="handlePesquisa"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Estados reativos
const abaAtiva = ref('nao-lidas')
const termoPesquisa = ref('')

// Emits para comunicar com o componente pai
const emit = defineEmits(['filtro-alterado', 'pesquisa-alterada'])

// Função para lidar com mudança de aba
const handleAbaChange = (novaAba) => {
  abaAtiva.value = novaAba
  emit('filtro-alterado', novaAba)
}

// Função para lidar com pesquisa
const handlePesquisa = () => {
  emit('pesquisa-alterada', termoPesquisa.value)
}

// Watchers para emitir eventos quando os valores mudam
import { watch } from 'vue'

watch(abaAtiva, (novoValor) => {
  emit('filtro-alterado', novoValor)
})
</script>

<style scoped>
/* Container principal */
.filtro-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;
  gap: 16px;
}

/* Container das abas */
.abas-container {
  display: flex;
  flex-shrink: 0;
}

.tabs-wrapper {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* Links das abas */
.tab-link {
  padding: 16px 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
  text-decoration: none;
  display: inline-block;
  outline: none;
}

.tab-link:hover {
  color: #374151;
}

.tab-active {
  color: #0066FF !important;
  font-weight: 600;
}

.tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #0066FF;
}

/* Container de pesquisa */
.pesquisa-container {
  display: flex;
  justify-content: flex-end;
  flex: 1;
}

.pesquisa-input-wrapper {
  position: relative;
  max-width: 320px;
  width: 100%;
  display: flex;
  align-items: center;
}

.pesquisa-icone {
  position: absolute;
  left: 0.75rem;
  width: 1.125rem;
  height: 1.125rem;
  color: #6b7280;
  stroke-width: 2;
  pointer-events: none;
  z-index: 1;
}

.pesquisa-input {
  width: 100%;
  height: 40px;
  padding: 0 0.875rem 0 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.pesquisa-input::placeholder {
  color: #9ca3af;
}

.pesquisa-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

/* Responsividade */

/* Small Mobile (até 480px) */
@media (max-width: 480px) {
  .filtro-container {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .abas-container {
    justify-content: center;
  }
  
  .tabs-wrapper {
    gap: 24px;
    justify-content: center;
  }
  
  .tab-link {
    padding: 12px 0;
    font-size: 13px;
  }
  
  .pesquisa-container {
    justify-content: stretch;
  }
  
  .pesquisa-input-wrapper {
    max-width: none;
  }
  
  .pesquisa-input {
    width: 100%;
    box-sizing: border-box;
  }
}

/* Medium Mobile (481px - 768px) */
@media (min-width: 481px) and (max-width: 768px) {
  .filtro-container {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .abas-container {
    justify-content: center;
  }
  
  .tabs-wrapper {
    gap: 28px;
    justify-content: center;
  }
  
  .pesquisa-container {
    justify-content: center;
  }
  
  .pesquisa-input-wrapper {
    max-width: 400px;
  }
  
  .pesquisa-input {
    width: 100%;
    box-sizing: border-box;
  }
}

/* Tablet (769px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .filtro-container {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .pesquisa-input-wrapper {
    max-width: 280px;
  }
  
  .pesquisa-input {
    width: 100%;
    box-sizing: border-box;
  }
}

/* Desktop Small (1025px - 1279px) */
@media (min-width: 1025px) and (max-width: 1279px) {
  .pesquisa-input-wrapper {
    max-width: 300px;
  }
  
  .pesquisa-input {
    width: 100%;
    box-sizing: border-box;
  }
}

/* Desktop Large (1280px+) */
@media (min-width: 1280px) {
  .pesquisa-input-wrapper {
    max-width: 320px;
  }
  
  .pesquisa-input {
    width: 100%;
    box-sizing: border-box;
  }
}

/* Ultra Wide (1440px+) */
@media (min-width: 1440px) {
  .filtro-container {
    margin-bottom: 32px;
  }
  
  .pesquisa-input-wrapper {
    max-width: 360px;
  }
  
  .pesquisa-input {
    width: 100%;
    box-sizing: border-box;
  }
}

/* Smooth transitions for all screen sizes */
.filtro-container,
.tab-link,
.pesquisa-input {
  transition: all 0.3s ease;
}

/* Better accessibility for touch devices */
@media (hover: none) and (pointer: coarse) {
  .tab-link,
  .pesquisa-input {
    -webkit-tap-highlight-color: transparent;
  }
  
  .tab-link {
    padding: 14px 18px;
  }
  
  .pesquisa-input {
    padding: 0 0.875rem 0 2.5rem;
    height: 44px;
  }
}

/* Estados de foco melhorados para acessibilidade */
.tab-link:focus {
  outline: none;
}

.pesquisa-input:focus {
  outline: none;
}
</style> 