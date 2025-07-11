<template>
  <div class="filtro-agenda-container">
    <div class="filtro-agenda-content">
      <!-- Espaçador para empurrar conteúdo para direita -->
      <div class="spacer"></div>
      
      <!-- Conteúdo alinhado à direita -->
      <div class="filtro-actions">
        <!-- Dicas -->
        <div class="dicas-section">
          <img src="/images/dica.svg" alt="Dicas" class="dica-icon">
          <span class="dicas-text">Dicas</span>
        </div>
        
        <!-- Campo de pesquisa -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <img src="/images/search.svg" alt="Pesquisar" class="search-icon">
            <input 
              type="text" 
              placeholder="Pesquisar na agenda"
              class="search-input"
              v-model="searchTerm"
              @input="handleSearch"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        
        <!-- Botão Novo Compromisso -->
        <div class="button-container">
          <button class="novo-compromisso-button" @click="abrirNovoCompromisso">
            <div class="plus-icon-container">
              <svg class="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span class="button-text">Novo compromisso</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search', 'novo-compromisso'])
const searchTerm = ref('')

const handleSearch = () => {
  emit('search', searchTerm.value)
}

const abrirNovoCompromisso = () => {
  emit('novo-compromisso')
}
</script>

<style scoped>
.filtro-agenda-container {
  width: 100%;
  background: white;
  padding: 0rem 0rem 1.5rem 0rem;
  border-bottom: 1px solid #e5e7eb;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.filtro-agenda-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1248px; /* Mesma largura máxima do Financeiro.vue */
  margin: 0 auto;
}

.spacer {
  flex: 1;
}

.filtro-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.dicas-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dica-icon {
  width: 16px;
  height: 16px;
}

.dicas-text {
  font-size: 16px;
  font-weight: 500;
  color: #0169FA;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.search-container {
  display: flex;
  align-items: center;
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
  pointer-events: none;
  z-index: 1;
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

.novo-compromisso-button {
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

.novo-compromisso-button:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.novo-compromisso-button:active {
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
  
  .filtro-actions {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .filtro-agenda-container {
    padding: 0rem 0rem 1rem 0rem;
  }
  
  .filtro-agenda-content {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .spacer {
    display: none;
  }
  
  .filtro-actions {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    align-items: stretch;
  }
  
  .dicas-section {
    justify-content: center;
  }
  
  .search-container {
    width: 100%;
  }
  
  .search-input-wrapper {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
    box-sizing: border-box;
  }
  
  .button-container {
    width: 100%;
  }
  
  .novo-compromisso-button {
    width: 100%;
    justify-content: center;
    box-sizing: border-box;
  }
}

@media (max-width: 640px) {
  .filtro-agenda-container {
    padding: 0rem 0rem 1rem 0rem;
  }
  
  .filtro-actions {
    gap: 0.75rem;
  }
  
  .dicas-text {
    font-size: 14px;
  }
  
  .search-input,
  .novo-compromisso-button {
    height: 36px;
  }
}
</style> 