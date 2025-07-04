<template>
  <div class="filtro-container">
    <div class="filtro-header">
      <h1 class="page-title">Relatórios</h1>
      
      <div class="filtro-actions">
        <!-- Campo de pesquisa -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg v-if="!isSearching" class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <div v-else class="spinner"></div>
            <input 
              type="text" 
              placeholder="Pesquisar pastas de relatórios"
              class="search-input"
              v-model="searchTerm"
              @input="handleSearch"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        
        <!-- Botão Nova Pasta -->
        <div class="button-container">
          <button class="new-pasta-button" @click="abrirNovaPasta">
            <div class="plus-icon-container">
              <svg class="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span class="button-text">Nova pasta</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Criar Pasta -->
  <CriarPasta 
    v-if="mostrarModalCriarPasta"
    @close="fecharModalCriarPasta"
    @pasta-criada="handlePastaCriada"
    @pasta-criada-sucesso="handlePastaCriadaSucesso"
  />

  <!-- Alerta de Sucesso -->
  <AlertaSucesso 
    v-if="mostrarSucesso"
    mensagem="Pasta de relatórios criada com sucesso!"
    @fechar="fecharSucesso"
  />
</template>

<script setup>
import { ref } from 'vue'
import CriarPasta from './criarPasta.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'

const emit = defineEmits(['search', 'nova-pasta', 'pasta-criada'])
const searchTerm = ref('')
const isSearching = ref(false)
const mostrarModalCriarPasta = ref(false)
const mostrarSucesso = ref(false)

const handleSearch = () => {
  isSearching.value = true
  emit('search', searchTerm.value)
  
  // Reset loading depois de um tempo
  setTimeout(() => {
    isSearching.value = false
  }, 1000)
}

const abrirNovaPasta = () => {
  mostrarModalCriarPasta.value = true
}

const fecharModalCriarPasta = () => {
  mostrarModalCriarPasta.value = false
}

const handlePastaCriada = () => {
  emit('pasta-criada')
}

const handlePastaCriadaSucesso = () => {
  mostrarSucesso.value = true
}

const fecharSucesso = () => {
  mostrarSucesso.value = false
  emit('pasta-criada')
}
</script>

<style scoped>
.filtro-container {
  width: 100%;
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  max-width: 1280px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.filtro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  white-space: nowrap;
}

.filtro-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.search-container, .button-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.125rem;
  height: 1.125rem;
  color: #6b7280;
  stroke-width: 2;
  pointer-events: none;
  z-index: 1;
}

.spinner {
  position: absolute;
  left: 0.75rem;
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-input {
  width: 320px;
  height: 40px;
  padding: 0 0.875rem 0 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.search-input::placeholder {
  color: #9ca3af;
}

.new-pasta-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 40px;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  white-space: nowrap;
  width: 100%;
}

.new-pasta-button:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.new-pasta-button:active {
  transform: translateY(0);
}

.plus-icon {
  width: 0.875rem;
  height: 0.875rem;
  stroke-width: 2.5;
  color: #3b82f6;
}

.plus-icon-container {
  width: 24px;
  height: 24px;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.button-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
}

/* Responsivo */
@media (max-width: 1024px) {
  .search-input {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .filtro-container {
    padding: 1rem;
  }
  
  .filtro-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .filtro-actions {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  .search-container, .button-container {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  
  .search-input-wrapper {
    width: 100%;
    margin: 0;
    padding: 0;
  }
  
  .search-input {
    width: 100%;
    box-sizing: border-box;
    margin: 0;
  }
  
  .new-pasta-button {
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
    margin: 0;
  }
  
  /* Garante que o input e o botão tenham exatamente a mesma largura */
  .search-input-wrapper, .button-container, .search-input, .new-pasta-button {
    min-width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .page-title {
    text-align: center;
  }
}

@media (max-width: 640px) {
  .filtro-container {
    padding: 1rem 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  /* Garante que o input e o botão tenham exatamente a mesma largura */
  .search-input,
  .search-input-wrapper,
  .button-container,
  .new-pasta-button {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}
</style> 