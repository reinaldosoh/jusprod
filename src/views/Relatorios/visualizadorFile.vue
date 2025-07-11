<template>
  <div v-if="isVisible" class="visualizador-overlay" @click="handleOverlayClick">
    <div class="visualizador-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-info">
          <h2 class="modal-title">{{ relatorio?.nome || 'Visualizar Relatório' }}</h2>
          <span class="file-type">{{ tipoArquivo.toUpperCase() }}</span>
        </div>
        <button class="close-button" @click="fechar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Área de visualização -->
      <div class="visualizador-content">
        <div v-if="carregando" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Carregando relatório...</p>
        </div>

        <div v-else-if="erro" class="error-container">
          <div class="error-icon">⚠️</div>
          <h3>Erro ao carregar relatório</h3>
          <p>{{ erro }}</p>
          <button class="retry-button" @click="carregarRelatorio">Tentar novamente</button>
        </div>

        <!-- Visualizar Imagens -->
        <div v-else-if="isImagem" class="image-container">
          <img 
            :src="urlArquivo" 
            :alt="relatorio?.nome"
            class="preview-image"
            @load="onImageLoad"
            @error="onImageError"
          />
        </div>

        <!-- Visualizar PDF -->
        <div v-else-if="isPdf" class="pdf-container">
          <iframe 
            :src="urlArquivo"
            class="pdf-viewer"
            frameborder="0"
            @load="onPDFLoad"
            @error="onPDFError"
          ></iframe>
        </div>

        <!-- Documentos Office (DOC, XLS) - Download -->
        <div v-else-if="isDocumentoOffice" class="document-container">
          <div class="document-preview">
            <div class="document-icon">
              <img v-if="tipoArquivo === 'doc' || tipoArquivo === 'docx'" src="/images/iconeDoc.svg" alt="Documento" />
              <img v-else-if="tipoArquivo === 'xls' || tipoArquivo === 'xlsx'" src="/images/iconeMoedas.svg" alt="Planilha" />
              <img v-else src="/images/iconPasta.svg" alt="Arquivo" />
            </div>
            <div class="document-info">
              <h3>{{ relatorio?.nome }}</h3>
              <p>Arquivo {{ tipoArquivo.toUpperCase() }}</p>
              <p class="file-note">Você pode visualizar este arquivo online ou baixá-lo para abrir em um programa compatível.</p>
              <p class="file-note-small">💡 Tente as duas opções de visualização caso uma não funcione.</p>
            </div>
          </div>
          
          <div class="document-actions">
            <button class="download-button" @click="baixarArquivo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Baixar arquivo
            </button>
            
            <button class="open-button" @click="abrirArquivo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Visualizar (Google)
            </button>
            
            <button class="open-button" @click="visualizarOfficeOnline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Visualizar (Office)
            </button>
          </div>
        </div>

        <!-- Tipo não suportado -->
        <div v-else class="unsupported-container">
          <div class="unsupported-icon">❌</div>
          <h3>Tipo de arquivo não suportado</h3>
          <p>Não é possível visualizar arquivos do tipo {{ tipoArquivo.toUpperCase() }}</p>
          <button class="download-button" @click="baixarArquivo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Baixar arquivo
          </button>
        </div>
      </div>

      <!-- Footer com ações -->
      <div class="modal-footer">
        <div class="footer-info">
          <span class="file-size">{{ formatarTamanhoArquivo(0) }}</span>
        </div>
        <div class="footer-actions">
          <button class="footer-btn secondary" @click="fechar">Fechar</button>
          <button class="footer-btn primary" @click="baixarArquivo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'

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
const carregando = ref(false)
const erro = ref('')
const urlArquivo = ref('')

// Computed para tipos de arquivo
const tipoArquivo = computed(() => {
  if (!props.relatorio?.url) return ''
  const url = props.relatorio.url
  const extension = url.split('.').pop()?.toLowerCase() || ''
  return extension
})

const isImagem = computed(() => {
  const tiposImagem = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  return tiposImagem.includes(tipoArquivo.value)
})

const isPdf = computed(() => {
  return tipoArquivo.value === 'pdf'
})

const isDocumentoOffice = computed(() => {
  const tiposOffice = ['doc', 'docx', 'xls', 'xlsx']
  return tiposOffice.includes(tipoArquivo.value)
})

// Watchers
watch(() => props.isVisible, (visible) => {
  if (visible && props.relatorio) {
    carregarRelatorio()
  } else {
    resetarEstado()
  }
})

// Carregar relatório
const carregarRelatorio = async () => {
  if (!props.relatorio?.url) {
    erro.value = 'URL do relatório não encontrada'
    return
  }

  try {
    carregando.value = true
    erro.value = ''
    
    // Para arquivos no Supabase Storage, obter URL assinada para acesso seguro
    if (props.relatorio.url.includes('supabase')) {
      // Extrair path do arquivo da URL
      const urlObj = new URL(props.relatorio.url)
      const pathSegments = urlObj.pathname.split('/')
      const fileName = pathSegments[pathSegments.length - 1]
      
      // Buscar usuário atual para construir o path correto
      const { data: { user } } = await supabase.auth.getUser()
      const filePath = `${user.id}/${fileName}`
      
      // Obter URL assinada
      const { data, error } = await supabase.storage
        .from('relatorios')
        .createSignedUrl(filePath, 3600) // 1 hora de validade
      
      if (error) throw error
      
      urlArquivo.value = data.signedUrl
    } else {
      // Para outras URLs, usar diretamente
      urlArquivo.value = props.relatorio.url
    }
    
  } catch (error) {
    console.error('Erro ao carregar relatório:', error)
    erro.value = 'Não foi possível carregar o relatório. Verifique se ele ainda existe.'
  } finally {
    carregando.value = false
  }
}

// Resetar estado quando o modal for fechado
const resetarEstado = () => {
  carregando.value = false
  erro.value = ''
  urlArquivo.value = ''
}

// Fechar modal
const fechar = () => {
  emit('fechar')
}

const handleOverlayClick = () => {
  fechar()
}

// Baixar arquivo
const baixarArquivo = () => {
  if (urlArquivo.value) {
    const link = document.createElement('a')
    link.href = urlArquivo.value
    link.download = props.relatorio?.nome || 'arquivo'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Abrir arquivo no Google Docs/Sheets
const abrirArquivo = () => {
  if (urlArquivo.value) {
    if (isDocumentoOffice.value) {
      // Para documentos Office, usar Google Docs Viewer para visualização
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(urlArquivo.value)}`
      window.open(googleDocsUrl, '_blank')
    } else {
      // Para outros tipos, abrir diretamente
      window.open(urlArquivo.value, '_blank')
    }
  }
}

// Visualizar documento no Office Online
const visualizarOfficeOnline = () => {
  if (urlArquivo.value) {
    // Alternativa usando Office Online
    const officeOnlineUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(urlArquivo.value)}`
    window.open(officeOnlineUrl, '_blank')
  }
}

// Event handlers para carregamento
const onImageLoad = () => {
  console.log('Imagem carregada com sucesso')
}

const onImageError = () => {
  erro.value = 'Erro ao carregar a imagem'
}

const onPDFLoad = () => {
  console.log('PDF carregado com sucesso')
}

const onPDFError = () => {
  erro.value = 'Erro ao carregar o PDF'
}

// Formatar tamanho de arquivo
const formatarTamanhoArquivo = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const tamanhos = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i]
}
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
  z-index: 1000;
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.visualizador-modal {
  background: white;
  border-radius: 12px;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
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

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.file-type {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  align-self: flex-start;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.visualizador-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f8f9fa;
}

.loading-container,
.error-container,
.unsupported-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.unsupported-icon {
  font-size: 3rem;
}

.error-container h3,
.unsupported-container h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.error-container p,
.unsupported-container p {
  color: #6b7280;
  margin: 0;
}

.retry-button,
.download-button,
.open-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #0468FA;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-button:hover,
.download-button:hover,
.open-button:hover {
  background: #0353e9;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pdf-container {
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}

.document-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
}

.document-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.document-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
}

.document-icon img {
  width: 50px;
  height: 50px;
}

.document-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.document-info p {
  color: #6b7280;
  margin: 0.25rem 0;
}

.file-note {
  font-size: 0.875rem;
  color: #9ca3af;
  font-style: italic;
}

.file-note-small {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.document-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.modal-footer {
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.footer-info {
  display: flex;
  align-items: center;
}

.file-size {
  font-size: 0.875rem;
  color: #6b7280;
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-btn.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.footer-btn.secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.footer-btn.primary {
  background: #0468FA;
  color: white;
}

.footer-btn.primary:hover {
  background: #0353e9;
}

/* Responsivo */
@media (max-width: 768px) {
  .visualizador-overlay {
    padding: 0.5rem;
  }
  
  .visualizador-modal {
    width: 95vw;
    height: 95vh;
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
    gap: 1rem;
  }
  
  .footer-actions {
    width: 100%;
    justify-content: center;
  }
  
  .document-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  
  .download-button,
  .open-button {
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
  
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .modal-title {
    font-size: 0.95rem;
  }
  
  .file-type {
    font-size: 0.7rem;
  }
  
  .document-container {
    padding: 1rem;
  }
  
  .document-icon {
    width: 60px;
    height: 60px;
  }
  
  .document-icon img {
    width: 35px;
    height: 35px;
  }
}
</style> 