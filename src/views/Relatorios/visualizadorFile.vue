<template>
  <div v-if="isVisible" class="visualizador-overlay" @click="handleOverlayClick">
    <div class="visualizador-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">{{ relatorio?.nome || 'Visualizar Relatório' }}</h2>
        <button class="close-button" @click="fechar">×</button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Carregando relatório...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <h3>Erro ao carregar relatório</h3>
          <p>{{ error }}</p>
          <button class="retry-btn" @click="carregarRelatorio">Tentar novamente</button>
        </div>

        <div v-else class="content-wrapper">
          <!-- Para PDFs -->
          <iframe 
            v-if="isPdf"
            :src="urlVisualizacao"
            class="pdf-viewer"
            frameborder="0"
          ></iframe>

          <!-- Para imagens -->
          <div v-else-if="isImagem" class="image-viewer">
            <img :src="urlVisualizacao" :alt="relatorio?.nome" />
          </div>

          <!-- Para documentos Word/Excel -->
          <div v-else-if="isDocumento" class="document-viewer">
            <div class="document-info">
              <div class="doc-icon">
                <img src="/images/iconeDoc.svg" alt="Documento" />
              </div>
              <div class="doc-details">
                <h3>{{ relatorio?.nome }}</h3>
                <p>Documento {{ tipoArquivo.toUpperCase() }}</p>
                <p>Para visualizar este arquivo, faça o download.</p>
              </div>
            </div>
            <div class="document-actions">
              <button class="download-btn" @click="baixarArquivo">
                <img src="/images/download.svg" alt="Download" />
                Baixar Arquivo
              </button>
            </div>
          </div>

          <!-- Fallback para outros tipos -->
          <div v-else class="unsupported-viewer">
            <div class="unsupported-info">
              <h3>Tipo de arquivo não suportado para visualização</h3>
              <p>{{ relatorio?.nome }}</p>
              <button class="download-btn" @click="baixarArquivo">
                <img src="/images/download.svg" alt="Download" />
                Baixar Arquivo
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer com ações -->
      <div class="modal-footer">
        <button class="secondary-btn" @click="baixarArquivo">
          <img src="/images/download.svg" alt="Download" />
          Baixar
        </button>
        <button class="primary-btn" @click="fechar">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  relatorio: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['fechar'])

// Estados
const loading = ref(false)
const error = ref('')
const urlVisualizacao = ref('')

// Computed para tipos de arquivo
const tipoArquivo = computed(() => {
  if (!props.relatorio?.url) return ''
  
  const url = props.relatorio.url.toLowerCase()
  if (url.includes('.pdf')) return 'pdf'
  if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png')) return 'image'
  if (url.includes('.doc') || url.includes('.docx')) return 'word'
  if (url.includes('.xls') || url.includes('.xlsx')) return 'excel'
  
  return 'unknown'
})

const isPdf = computed(() => tipoArquivo.value === 'pdf')
const isImagem = computed(() => tipoArquivo.value === 'image')
const isDocumento = computed(() => tipoArquivo.value === 'word' || tipoArquivo.value === 'excel')

// Carregar relatório
const carregarRelatorio = async () => {
  if (!props.relatorio?.url) {
    error.value = 'URL do relatório não encontrada'
    return
  }

  try {
    loading.value = true
    error.value = ''

    // Para PDFs, adicionar parâmetros para visualização inline
    if (isPdf.value) {
      urlVisualizacao.value = `${props.relatorio.url}#toolbar=1&navpanes=1&scrollbar=1`
    } else {
      urlVisualizacao.value = props.relatorio.url
    }

    console.log('📄 Carregando relatório:', urlVisualizacao.value)

  } catch (err) {
    console.error('Erro ao carregar relatório:', err)
    error.value = 'Erro ao carregar o relatório'
  } finally {
    loading.value = false
  }
}

// Baixar arquivo
const baixarArquivo = () => {
  if (!props.relatorio?.url) return

  try {
    // Criar link temporário para download
    const link = document.createElement('a')
    link.href = props.relatorio.url
    link.download = props.relatorio.nome || 'relatorio'
    link.target = '_blank'
    
    // Adicionar ao DOM temporariamente
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('📥 Download iniciado:', props.relatorio.nome)
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error)
  }
}

// Fechar modal
const fechar = () => {
  emit('fechar')
}

const handleOverlayClick = () => {
  fechar()
}

// Watch para carregar quando modal abrir
watch(() => props.isVisible, (newValue) => {
  if (newValue && props.relatorio) {
    carregarRelatorio()
  }
})

// Carregar quando component for montado se já estiver visível
onMounted(() => {
  if (props.isVisible && props.relatorio) {
    carregarRelatorio()
  }
})
</script>

<style scoped>
.visualizador-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.visualizador-modal {
  background: white;
  border-radius: 12px;
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  background: #0468FA;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  truncate: true;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  line-height: 1;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: #0468FA;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #0356D6;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
}

.image-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
  overflow: auto;
}

.image-viewer img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.document-viewer,
.unsupported-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.document-info,
.unsupported-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.doc-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
}

.doc-icon img {
  width: 48px;
  height: 48px;
}

.doc-details h3,
.unsupported-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.doc-details p,
.unsupported-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
}

.download-btn {
  background: #0468FA;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.download-btn:hover {
  background: #0356D6;
}

.download-btn img {
  width: 16px;
  height: 16px;
}

.modal-footer {
  background: #f8fafc;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.secondary-btn,
.primary-btn {
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.secondary-btn {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.secondary-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.secondary-btn img {
  width: 16px;
  height: 16px;
}

.primary-btn {
  background: #0468FA;
  color: white;
}

.primary-btn:hover {
  background: #0356D6;
}

/* Responsivo */
@media (max-width: 768px) {
  .visualizador-modal {
    width: 95vw;
    height: 85vh;
  }
  
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .modal-title {
    font-size: 1rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1rem;
    flex-direction: column;
  }
  
  .secondary-btn,
  .primary-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .visualizador-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  .document-viewer,
  .unsupported-viewer {
    padding: 1rem;
  }
  
  .doc-icon {
    width: 60px;
    height: 60px;
  }
  
  .doc-icon img {
    width: 36px;
    height: 36px;
  }
}
</style> 