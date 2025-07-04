<template>
  <div class="lista-relatorio-container">
    <div class="header-relatorio">
      <!-- Título da pasta selecionada -->
      <div class="titulo-info">
        <h1 class="titulo-pasta">{{ tituloPasta }}</h1>
        <p class="subtitulo-pasta">Todos os resultados para a categoria acima</p>
      </div>
      
      <!-- Campo de busca e botão -->
      <div class="filtro-actions">
        <!-- Campo de busca -->
        <div v-if="mostrarBusca" class="search-container">
          <div class="busca-input-wrapper">
            <img src="/images/search.svg" alt="Buscar" class="search-icon" />
            <input 
              type="text" 
              placeholder="Pesquisar relatórios"
              class="busca-input"
              v-model="termoBusca"
              @input="handleBusca"
            />
          </div>
        </div>
        
        <!-- Botão Novo Relatório -->
        <div v-if="mostrarBotaoNovo" class="button-container" ref="buttonContainer">
          <button class="new-relatorio-button" @click="abrirNovoRelatorio">
            <div class="plus-icon-container">
              <svg class="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span class="button-text">Novo relatório</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tituloPasta: {
    type: String,
    default: 'Modelos padrão'
  },
  mostrarBusca: {
    type: Boolean,
    default: true
  },
  mostrarBotaoNovo: {
    type: Boolean,
    default: true
  },
  pastaId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['buscar', 'novo-relatorio', 'criar-relatorio', 'carregar-relatorio', 'relatorio-criado', 'erro'])

const termoBusca = ref('')

const handleBusca = () => {
  emit('buscar', termoBusca.value)
}

const abrirNovoRelatorio = () => {
  console.log('Abrir novo relatório')
  emit('novo-relatorio')
}

const limparBusca = () => {
  termoBusca.value = ''
  emit('buscar', '')
}

// Expor função para componente pai
defineExpose({
  limparBusca
})
</script>

<style scoped>
.lista-relatorio-container {
  width: 100%;
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  max-width: 1280px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.header-relatorio {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.titulo-info {
  flex: 1;
}

.titulo-pasta {
  font-size: 1.875rem;
  font-weight: 600;
  color: #3b82f6;
  margin: 0 0 0.5rem 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.subtitulo-pasta {
  font-size: 1rem;
  font-weight: 400;
  color: #6b7280;
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.filtro-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  margin-top: 10px;
}

.search-container, .button-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.busca-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  pointer-events: none;
  z-index: 1;
}

.busca-input {
  width: 320px;
  height: 40px;
  padding: 0 0.875rem 0 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.busca-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.busca-input::placeholder {
  color: #9ca3af;
}

.new-relatorio-button {
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

.new-relatorio-button:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.new-relatorio-button:active {
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
  .busca-input {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .lista-relatorio-container {
    padding: 1rem;
  }
  
  .header-relatorio {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .titulo-pasta {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .subtitulo-pasta {
    text-align: center;
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
  
  .busca-input-wrapper {
    width: 100%;
    margin: 0;
    padding: 0;
  }
  
  .busca-input {
    width: 100%;
    box-sizing: border-box;
    margin: 0;
  }
  
  .new-relatorio-button {
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
    margin: 0;
  }
  
  /* Garante que o input e o botão tenham exatamente a mesma largura */
  .busca-input-wrapper, .button-container, .busca-input, .new-relatorio-button {
    min-width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 640px) {
  .lista-relatorio-container {
    padding: 1rem;
  }
  
  .titulo-pasta {
    font-size: 1.25rem;
  }
  
  .subtitulo-pasta {
    font-size: 0.875rem;
  }
  
  /* Garante que o input e o botão tenham exatamente a mesma largura */
  .busca-input,
  .busca-input-wrapper,
  .button-container,
  .new-relatorio-button {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}
</style> 