<template>
  <div v-if="isVisible" class="leitor-html-overlay" @click="handleOverlayClick">
    <div class="leitor-html-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">{{ titulo }}</h2>
        <button class="close-button" @click="fechar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Barra de ações -->
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="document-info">Modelo de documento</span>
        </div>

        <div class="toolbar-right">
          <button class="use-model-btn" @click="abrirConfigurarModelo">
            Usar modelo
          </button>
        </div>
      </div>

      <!-- Área de conteúdo -->
      <div class="content-area">
        <div 
          class="viewer-content"
          v-html="conteudoHtml"
        ></div>
      </div>
    </div>

    <!-- Modal Configurar Modelo -->
    <ConfigurarModelo
      :is-visible="mostrarConfigurarModelo"
      :html-modelo="conteudoHtml"
      :nome-modelo="titulo"
      @fechar="fecharConfigurarModelo"
      @documento-criado="documentoCriado"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ConfigurarModelo from './configurarModelo.vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  titulo: {
    type: String,
    default: 'Modelo de documento'
  },
  conteudo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['fechar', 'usar-modelo', 'documento-criado'])

// Estados
const conteudoHtml = ref('')
const mostrarConfigurarModelo = ref(false)

// Watchers
watch(() => props.conteudo, (novoConteudo) => {
  conteudoHtml.value = novoConteudo
}, { immediate: true })

// Métodos
const fechar = () => {
  emit('fechar')
}

const handleOverlayClick = () => {
  fechar()
}

const abrirConfigurarModelo = () => {
  mostrarConfigurarModelo.value = true
}

const fecharConfigurarModelo = () => {
  mostrarConfigurarModelo.value = false
}

const documentoCriado = (documento) => {
  emit('documento-criado', documento)
  fecharConfigurarModelo()
  fechar() // Fechar o leitor também
}
</script>

<style scoped>
.leitor-html-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.leitor-html-modal {
  background: white;
  border-radius: 12px;
  width: 944px;
  height: 552px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background: #0468FA;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toolbar {
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.document-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.use-model-btn {
  background: #0468FA;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.use-model-btn:hover {
  background: #0353e9;
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
  background: white;
  border-radius: 0 0 12px 12px;
}

.viewer-content {
  height: 100%;
  overflow-y: auto;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.6;
  color: #374151;
  padding: 0;
  margin: 0;
}

/* Responsivo */
@media (max-width: 768px) {
  .leitor-html-modal {
    width: 90vw;
    height: 80vh;
    max-width: 944px;
    max-height: 552px;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-title {
    font-size: 1rem;
  }
  
  .toolbar {
    padding: 0.5rem 1rem;
  }
  
  .content-area {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .leitor-html-overlay {
    padding: 0.5rem;
  }
  
  .leitor-html-modal {
    width: 95vw;
    height: 85vh;
    max-width: none;
    max-height: none;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
  
  .toolbar-left {
    justify-content: center;
  }
  
  .toolbar-right {
    justify-content: center;
  }
  
  .use-model-btn {
    width: 100%;
  }
}
</style> 