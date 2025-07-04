<template>
  <div class="lista-documento-container">
    <div class="header-documento">
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
              placeholder="Pesquisar documentos"
              class="busca-input"
              v-model="termoBusca"
              @input="handleBusca"
            />
          </div>
        </div>
        
        <!-- Botão Novo Documento -->
        <div v-if="mostrarBotaoNovo" class="button-container" ref="buttonContainer">
          <button class="new-documento-button" @click="abrirNovoDocumento">
            <div class="plus-icon-container">
              <svg class="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span class="button-text">Novo documento</span>
          </button>
          
          <!-- Componente Tipo de Arquivo -->
          <div 
            v-if="mostrarTipoArquivo" 
            class="tipo-arquivo-dropdown"
            :style="dropdownPosition"
          >
            <TipoDeArquivo 
              v-model="tipoSelecionado"
              @criar-documento="handleCriarDocumento"
              @criar-documento-html="handleCriarDocumentoHTML"
              @carregar-arquivo="handleCarregarArquivo"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Overlay para fechar dropdown -->
    <div 
      v-if="mostrarTipoArquivo" 
      class="overlay" 
      @click="fecharTipoArquivo"
    ></div>
    
    <!-- Componente Criar HTML -->
    <CriarHTML 
      :is-visible="mostrarCriarHTML"
      :pasta-id="pastaId"
      @fechar="fecharCriarHTML"
      @documento-criado="handleDocumentoCriado"
      @erro="handleErroCriarDocumento"
    />
    
    <!-- Componente Carregar Arquivo -->
    <CarregarArquivo 
      :is-visible="mostrarCarregarArquivo"
      :pasta-id="pastaId"
      @fechar="fecharCarregarArquivo"
      @arquivo-carregado="handleArquivoCarregado"
      @erro="handleErroCarregarArquivo"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import TipoDeArquivo from './tipodeArquivo.vue'
import CriarHTML from './criarHTML.vue'
import CarregarArquivo from './carregarArquivo.vue'

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

const emit = defineEmits(['buscar', 'novo-documento', 'criar-documento', 'carregar-arquivo', 'documento-criado', 'erro'])

const termoBusca = ref('')
const mostrarTipoArquivo = ref(false)
const mostrarCriarHTML = ref(false)
const mostrarCarregarArquivo = ref(false)
const tipoSelecionado = ref(null)
const buttonContainer = ref(null)
const dropdownPosition = ref({})

const handleBusca = () => {
  emit('buscar', termoBusca.value)
}

const abrirNovoDocumento = async () => {
  mostrarTipoArquivo.value = !mostrarTipoArquivo.value
  
  if (mostrarTipoArquivo.value) {
    await nextTick()
    calcularPosicaoDropdown()
  }
}

const calcularPosicaoDropdown = () => {
  if (buttonContainer.value) {
    const rect = buttonContainer.value.getBoundingClientRect()
    dropdownPosition.value = {
      position: 'absolute',
      top: `${rect.height + 8}px`,
      left: '0px',
      zIndex: '1000'
    }
  }
}

const fecharTipoArquivo = () => {
  mostrarTipoArquivo.value = false
  tipoSelecionado.value = null
}

const handleCriarDocumento = () => {
  fecharTipoArquivo()
  emit('criar-documento')
}

const handleCriarDocumentoHTML = () => {
  fecharTipoArquivo()
  mostrarCriarHTML.value = true
}

const handleCarregarArquivo = () => {
  fecharTipoArquivo()
  mostrarCarregarArquivo.value = true
}

const fecharCriarHTML = () => {
  mostrarCriarHTML.value = false
}

const fecharCarregarArquivo = () => {
  mostrarCarregarArquivo.value = false
}

const handleDocumentoCriado = (documento) => {
  emit('documento-criado', documento)
}

const handleErroCriarDocumento = (erro) => {
  emit('erro', erro)
}

const handleArquivoCarregado = (arquivo) => {
  console.log('📄 Arquivo carregado recebido no filtroDocumentos:', arquivo)
  emit('documento-criado', arquivo)
}

const handleErroCarregarArquivo = (erro) => {
  console.error('❌ Erro carregamento arquivo recebido no filtroDocumentos:', erro)
  emit('erro', erro)
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
.lista-documento-container {
  width: 100%;
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  max-width: 1280px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.header-documento {
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

.new-documento-button {
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

.new-documento-button:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.new-documento-button:active {
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
  .lista-documento-container {
    padding: 1rem;
  }
  
  .header-documento {
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
  
  .new-documento-button {
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
    margin: 0;
  }
  
  /* Garante que o input e o botão tenham exatamente a mesma largura */
  .busca-input-wrapper, .button-container, .busca-input, .new-documento-button {
    min-width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 640px) {
  .lista-documento-container {
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
  .new-documento-button {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

/* Estilos para o dropdown do tipo de arquivo */
.button-container {
  position: relative;
}

.tipo-arquivo-dropdown {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
}

/* Responsivo para o dropdown */
@media (max-width: 768px) {
  .tipo-arquivo-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: auto;
  }
  
  .overlay {
    background: rgba(0, 0, 0, 0.3);
  }
}
</style> 