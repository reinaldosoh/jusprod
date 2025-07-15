<template>
  <div class="filtro-container">
    <div class="filtro-header">
      <h1 class="page-title">Intimações</h1>
      
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
              placeholder="Pesquisar intimação"
              class="search-input"
              v-model="searchTerm"
              @input="handleSearch"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  initialSearchTerm: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['search'])

// Estados
const searchTerm = ref(props.initialSearchTerm || '')
const isSearching = ref(false)

// Watchers
watch(() => props.initialSearchTerm, (newValue) => {
  if (newValue !== searchTerm.value) {
    searchTerm.value = newValue || ''
  }
})

// Funções
const handleSearch = () => {
  const termo = searchTerm.value?.trim() || ''
  console.log('🔍 Emitindo busca:', termo)
  emit('search', termo)
}
</script>

<style scoped>
.filtro-container {
  width: 100%;
  padding: 1.5rem 2rem 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.filtro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.filtro-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 320px;
  height: 44px;
  padding: 0 1rem 0 2.75rem;
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
  border-color: #0468FA;
  box-shadow: 0 0 0 3px rgba(4, 104, 250, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  pointer-events: none;
  z-index: 1;
}

.spinner {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsivo */
@media (max-width: 768px) {
  .filtro-container {
    padding: 1rem;
  }

  .filtro-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
    text-align: center;
  }

  .filtro-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-input {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .filtro-container {
    padding: 0.75rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .search-input {
    height: 40px;
    font-size: 0.8rem;
  }
}
</style> 