<template>
  <div v-show="isVisible" class="visualizar-logotipo-overlay" @click="handleOverlayClick">
    <div class="visualizar-logotipo-modal" @click.stop>
      <!-- Header azul -->
      <div class="modal-header">
        <h2 class="modal-title">Visualizar logotipo</h2>
        <button class="close-button" @click="fechar">
          <img src="/images/x-close.svg" alt="Fechar" class="close-icon" />
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <div class="logotipo-container">
          <div v-if="urlLogotipo" class="logotipo-wrapper">
            <img :src="urlLogotipo" alt="Logotipo do Escritório" class="logotipo-image" />
          </div>
          <div v-else class="no-logotipo">
            <img src="/images/alert-triangle.svg" alt="Sem logotipo" class="no-logotipo-icon" />
            <p>Não há logotipo disponível</p>
          </div>
        </div>

        <div class="modal-buttons">
          <button class="cancel-btn" @click="fechar">
            Fechar
          </button>
          <a v-if="urlLogotipo" :href="urlLogotipo" target="_blank" download class="download-btn">
            <img src="/images/download.svg" alt="Download" class="download-icon" />
            Download
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  urlLogotipo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['fechar'])

onMounted(() => {
  console.log('VisualizarLogotipo montado')
  console.log('Props recebidas:', props)
})

// Observar mudanças na visibilidade
watch(() => props.isVisible, (newVal) => {
  console.log('isVisible alterado para:', newVal)
})

// Observar mudanças na URL
watch(() => props.urlLogotipo, (newVal) => {
  console.log('urlLogotipo alterado para:', newVal)
})

const fechar = () => {
  console.log('Método fechar chamado')
  emit('fechar')
}

const handleOverlayClick = (event) => {
  // Fechar apenas se clicou exatamente no overlay
  if (event.target.classList.contains('visualizar-logotipo-overlay')) {
    fechar()
  }
}

</script>

<style scoped>
.visualizar-logotipo-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.visualizar-logotipo-modal {
  background: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  background: #0468FA;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-icon {
  width: 16px;
  height: 16px;
}

.modal-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.logotipo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 2rem;
  min-height: 200px;
}

.logotipo-wrapper {
  max-width: 100%;
  text-align: center;
}

.logotipo-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.no-logotipo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  gap: 1rem;
}

.no-logotipo-icon {
  width: 48px;
  height: 48px;
  opacity: 0.6;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  margin-top: auto;
}

.cancel-btn {
  background: #FFFFFF;
  color: #0468FA;
  border: 1px solid #0468FA;
  border-radius: 8px;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  width: 176px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn:hover {
  background: #F0F7FF;
}

.download-btn {
  background: #0468FA;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Inter', sans-serif;
  width: 176px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  gap: 0.5rem;
}

.download-btn:hover {
  background: #0356D6;
}

.download-icon {
  width: 16px;
  height: 16px;
}

/* Responsivo */
@media (max-width: 768px) {
  .visualizar-logotipo-modal {
    width: 95vw;
    height: auto;
    max-height: 95vh;
  }
  
  .modal-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .visualizar-logotipo-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .logotipo-container {
    padding: 1rem;
  }
}
</style>
