<template>
  <div class="filtro-container">
    <div class="filtro-header">
      <h1 class="page-title">Processos</h1>
      
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
              placeholder="Pesquisar processo"
              class="search-input"
              v-model="searchTerm"
              @input="handleSearch"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        
        <!-- Botão Novo Processo -->
        <button class="new-process-button">
          <div class="plus-icon-container">
            <svg class="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <span class="button-text">Novo processo</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])
const searchTerm = ref('')
const isSearching = ref(false)

const handleSearch = () => {
  isSearching.value = true
  emit('search', searchTerm.value)
  
  // Reset loading depois de um tempo
  setTimeout(() => {
    isSearching.value = false
  }, 1000)
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

.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.search-loading {
  position: absolute;
  left: 0.75rem;
  width: 1.125rem;
  height: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  border-radius: 6px;
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

/* Botão de pesquisa removido */

.new-process-button {
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
}

.new-process-button:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.new-process-button:active {
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
  }
  
  .search-container {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-input {
    width: 100%;
  }
  
  .new-process-button {
    width: 100%;
    justify-content: center;
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
  
  .search-input {
    width: 100%;
  }
}
</style> 