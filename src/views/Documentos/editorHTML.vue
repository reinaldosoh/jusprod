<template>
  <div v-if="isVisible" class="editor-html-overlay" @click="handleOverlayClick">
    <div class="editor-html-modal" @click.stop>
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

      <!-- Toolbar de Edição -->
      <div class="editor-toolbar">
        <div class="toolbar-group">
          <button 
            class="toolbar-btn" 
            @click="execCommand('bold')"
            :class="{ active: isActive('bold') }"
            title="Negrito (Ctrl+B)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            </svg>
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('italic')"
            :class="{ active: isActive('italic') }"
            title="Itálico (Ctrl+I)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="4" x2="10" y2="4"></line>
              <line x1="14" y1="20" x2="5" y2="20"></line>
              <line x1="15" y1="4" x2="9" y2="20"></line>
            </svg>
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('underline')"
            :class="{ active: isActive('underline') }"
            title="Sublinhado (Ctrl+U)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
              <line x1="4" y1="21" x2="20" y2="21"></line>
            </svg>
          </button>
        </div>

        <div class="toolbar-separator"></div>

        <div class="toolbar-group">
          <button 
            class="toolbar-btn" 
            @click="execCommand('justifyLeft')"
            :class="{ active: isActive('justifyLeft') }"
            title="Alinhar à esquerda"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="17" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="3" y2="14"></line>
              <line x1="17" y1="18" x2="3" y2="18"></line>
            </svg>
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('justifyCenter')"
            :class="{ active: isActive('justifyCenter') }"
            title="Centralizar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="10" x2="6" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="3" y2="14"></line>
              <line x1="18" y1="18" x2="6" y2="18"></line>
            </svg>
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('justifyRight')"
            :class="{ active: isActive('justifyRight') }"
            title="Alinhar à direita"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="21" y1="10" x2="7" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="3" y2="14"></line>
              <line x1="21" y1="18" x2="7" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="toolbar-separator"></div>

        <div class="toolbar-group">
          <button 
            class="toolbar-btn" 
            @click="execCommand('insertUnorderedList')"
            :class="{ active: isActive('insertUnorderedList') }"
            title="Lista com marcadores"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('insertOrderedList')"
            :class="{ active: isActive('insertOrderedList') }"
            title="Lista numerada"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="10" y1="6" x2="21" y2="6"></line>
              <line x1="10" y1="12" x2="21" y2="12"></line>
              <line x1="10" y1="18" x2="21" y2="18"></line>
              <path d="M4 6h1v4"></path>
              <path d="M4 10h2"></path>
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
            </svg>
          </button>
        </div>

        <div class="toolbar-separator"></div>

        <div class="toolbar-group">
          <select class="format-select" @change="changeFormat($event)">
            <option value="">Formato</option>
            <option value="h1">Título 1</option>
            <option value="h2">Título 2</option>
            <option value="h3">Título 3</option>
            <option value="p">Parágrafo</option>
          </select>
        </div>
      </div>

      <!-- Barra de ações -->
      <div class="action-toolbar">
        <div class="toolbar-left">
          <span class="document-info">Editor de documento</span>
        </div>

        <div class="toolbar-right">
          <button class="cancel-btn" @click="cancelar">
            Cancelar
          </button>
          <button class="save-btn" @click="salvar">
            Salvar alterações
          </button>
        </div>
      </div>

      <!-- Área de edição -->
      <div class="content-area">
        <div 
          class="editor-content"
          ref="editorRef"
          contenteditable="true"
          @input="handleInput"
          @keydown="handleKeydown"
          @mouseup="updateToolbar"
          @keyup="updateToolbar"
          @touchend="updateToolbar"
          @focusin="updateToolbar"
          data-placeholder="Comece a digitar ou cole seu conteúdo aqui..."
          :class="{ 'mobile-editor': isMobileDevice }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  titulo: {
    type: String,
    default: 'Editor de documento'
  },
  conteudo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['fechar', 'salvar', 'cancelar'])

// Estados
const conteudoHtml = ref('')
const editorRef = ref(null)
const activeStates = ref({})
const inputTimeout = ref(null)
const isMobileDevice = ref(false)

// Watchers
watch(() => props.conteudo, (novoConteudo) => {
  conteudoHtml.value = novoConteudo || ''
  
  if (editorRef.value) {
    editorRef.value.innerHTML = novoConteudo || ''
  }
}, { immediate: true })

watch(() => props.isVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.innerHTML = props.conteudo || ''
        conteudoHtml.value = props.conteudo || ''
        
        // Melhorar foco em mobile
        if (isMobile()) {
          // Aguardar um pouco mais para garantir que o modal esteja totalmente renderizado
          setTimeout(() => {
            editorRef.value.focus()
            // Colocar cursor no final do texto
            const range = document.createRange()
            const selection = window.getSelection()
            range.selectNodeContents(editorRef.value)
            range.collapse(false)
            selection.removeAllRanges()
            selection.addRange(range)
          }, 300)
        } else {
          editorRef.value.focus()
        }
      }
    })
  }
})

// Métodos para preservar posição do cursor
const saveSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    return selection.getRangeAt(0)
  }
  return null
}

const restoreSelection = (range) => {
  if (range) {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

const updateEditorContent = (content) => {
  if (editorRef.value) {
    editorRef.value.innerHTML = content || ''
    conteudoHtml.value = content || ''
  }
}

// Métodos do editor
const execCommand = (command, value = null) => {
  if (!editorRef.value) return
  
  const range = saveSelection()
  
  editorRef.value.focus()
  
  // Melhorar execução de comandos em mobile
  if (isMobile()) {
    // Aguardar um pouco mais para garantir que o foco esteja correto
    setTimeout(() => {
      document.execCommand(command, false, value)
      updateToolbar()
      if (range) {
        restoreSelection(range)
      }
    }, 50)
  } else {
    document.execCommand(command, false, value)
    setTimeout(() => {
      updateToolbar()
      if (range) {
        restoreSelection(range)
      }
    }, 0)
  }
}

const isActive = (command) => {
  return activeStates.value[command] || false
}

const updateToolbar = () => {
  if (!editorRef.value) return
  
  const commands = ['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'insertUnorderedList', 'insertOrderedList']
  commands.forEach(command => {
    try {
      activeStates.value[command] = document.queryCommandState(command)
    } catch (e) {
      activeStates.value[command] = false
    }
  })
}

const changeFormat = (event) => {
  const format = event.target.value
  if (format) {
    const range = saveSelection()
    editorRef.value?.focus()
    document.execCommand('formatBlock', false, `<${format}>`)
    setTimeout(() => {
      updateToolbar()
      if (range) {
        restoreSelection(range)
      }
    }, 0)
    event.target.value = ''
  }
}

const handleInput = (event) => {
  // Evitar propagação desnecessária
  event.stopPropagation()
  
  // Debounce para evitar múltiplas atualizações
  if (inputTimeout.value) {
    clearTimeout(inputTimeout.value)
  }
  
  inputTimeout.value = setTimeout(() => {
    if (editorRef.value) {
      const novoConteudo = editorRef.value.innerHTML
      if (novoConteudo !== conteudoHtml.value) {
        conteudoHtml.value = novoConteudo
      }
    }
  }, 100)
}

const handleKeydown = (event) => {
  // Atalhos de teclado
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault()
        execCommand('bold')
        break
      case 'i':
        event.preventDefault()
        execCommand('italic')
        break
      case 'u':
        event.preventDefault()
        execCommand('underline')
        break
      case 's':
        event.preventDefault()
        salvar()
        break
    }
  }
}

// Métodos de controle
const fechar = () => {
  emit('fechar')
}

const handleOverlayClick = () => {
  // Não fechar automaticamente para evitar perda de dados
}

const cancelar = () => {
  if (confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.')) {
    emit('cancelar')
  }
}

const salvar = () => {
  const htmlContent = editorRef.value?.innerHTML || ''
  emit('salvar', htmlContent)
}

// Detectar se é mobile
const isMobile = () => {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Atualizar status mobile
const updateMobileStatus = () => {
  isMobileDevice.value = isMobile()
}

// Listener para mudanças de tamanho
const handleResize = () => {
  updateMobileStatus()
}

// Métodos específicos para mobile
const handleTouchStart = (event) => {
  // Melhorar experiência touch
  if (isMobile()) {
    event.target.focus()
  }
}

const scrollToElement = (element) => {
  if (isMobile() && element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Lifecycle
onMounted(() => {
  // Atualizar status mobile inicial
  updateMobileStatus()
  
  // Adicionar listener para mudanças de tamanho
  window.addEventListener('resize', handleResize)
  
  // Configurar editor quando montado
  if (editorRef.value) {
    const conteudoParaCarregar = props.conteudo || conteudoHtml.value || ''
    editorRef.value.innerHTML = conteudoParaCarregar
    conteudoHtml.value = conteudoParaCarregar
    updateToolbar()
    
    // Adicionar event listeners para mobile
    if (isMobile()) {
      editorRef.value.addEventListener('touchstart', handleTouchStart)
      
      // Prevenir zoom em double tap em iOS
      editorRef.value.addEventListener('touchend', (e) => {
        const now = new Date().getTime()
        const timeSince = now - (editorRef.value.lastTap || 0)
        if (timeSince < 300 && timeSince > 0) {
          e.preventDefault()
        }
        editorRef.value.lastTap = now
      })
    }
  }
})

onUnmounted(() => {
  // Cleanup timeouts
  if (inputTimeout.value) {
    clearTimeout(inputTimeout.value)
  }
  
  // Remover event listeners
  window.removeEventListener('resize', handleResize)
  
  // Cleanup mobile event listeners
  if (editorRef.value && isMobile()) {
    editorRef.value.removeEventListener('touchstart', handleTouchStart)
  }
})
</script>

<style scoped>
.editor-html-overlay {
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

.editor-html-modal {
  background: white;
  border-radius: 12px;
  width: 944px;
  height: 650px;
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

.editor-toolbar {
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.toolbar-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: #d1d5db;
  margin: 0 0.5rem;
}

.format-select {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.format-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.action-toolbar {
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
  gap: 0.75rem;
}

.document-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.cancel-btn {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.save-btn {
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

.save-btn:hover {
  background: #0353e9;
}

.content-area {
  flex: 1;
  overflow: hidden;
  background: white;
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: column;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  outline: none;
  min-height: 200px;
}

.editor-content:focus {
  outline: none;
}

.editor-content:empty:before {
  content: attr(data-placeholder);
  color: #9ca3af;
  font-style: italic;
}

/* Estilos para o conteúdo editável */
.editor-content h1,
.editor-content h2,
.editor-content h3 {
  margin: 1em 0 0.5em 0;
  font-weight: bold;
}

.editor-content h1 {
  font-size: 1.5em;
}

.editor-content h2 {
  font-size: 1.3em;
}

.editor-content h3 {
  font-size: 1.1em;
}

.editor-content p {
  margin: 0.5em 0;
}

.editor-content ul,
.editor-content ol {
  margin: 0.5em 0;
  padding-left: 2em;
}

/* Mobile específico */
.mobile-editor {
  -webkit-touch-callout: none;
  -webkit-user-select: text;
  -khtml-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
  touch-action: manipulation;
}

/* Evitar zoom em input em iOS */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .editor-content {
    font-size: 16px !important;
  }
}

/* Melhorar touch feedback */
@media (hover: none) and (pointer: coarse) {
  .toolbar-btn {
    -webkit-tap-highlight-color: rgba(59, 130, 246, 0.1);
  }
  
  .toolbar-btn:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
  
  .cancel-btn:active,
  .save-btn:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .close-button:active {
    transform: scale(0.9);
    transition: transform 0.1s ease;
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .editor-html-overlay {
    padding: 0.5rem;
  }
  
  .editor-html-modal {
    width: 95vw;
    height: 90vh;
    max-width: none;
    max-height: none;
  }
  
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .modal-title {
    font-size: 1rem;
  }
  
  .close-button {
    padding: 0.5rem;
  }
  
  .editor-toolbar {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .toolbar-group {
    gap: 0.25rem;
  }
  
  .toolbar-btn {
    padding: 0.625rem;
    min-width: 40px;
    min-height: 40px;
  }
  
  .format-select {
    padding: 0.625rem;
    min-height: 40px;
  }
  
  .action-toolbar {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }
  
  .cancel-btn,
  .save-btn {
    padding: 0.75rem 1rem;
    min-height: 44px;
  }
  
  .editor-content {
    padding: 1rem;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .editor-html-overlay {
    padding: 0.25rem;
  }
  
  .editor-html-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-width: none;
    max-height: none;
  }
  
  .modal-header {
    padding: 0.75rem 1rem;
    border-radius: 0;
  }
  
  .modal-title {
    font-size: 0.95rem;
  }
  
  .close-button {
    padding: 0.5rem;
  }
  
  .editor-toolbar {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .toolbar-group {
    gap: 0.125rem;
  }
  
  .toolbar-btn {
    padding: 0.5rem;
    min-width: 36px;
    min-height: 36px;
  }
  
  .toolbar-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .toolbar-separator {
    display: none;
  }
  
  .format-select {
    padding: 0.5rem;
    min-height: 36px;
    font-size: 0.8rem;
  }
  
  .action-toolbar {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    flex-wrap: wrap;
  }
  
  .toolbar-left {
    order: 2;
    width: 100%;
    justify-content: center;
  }
  
  .toolbar-right {
    order: 1;
    width: 100%;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .document-info {
    font-size: 0.8rem;
  }
  
  .cancel-btn,
  .save-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    min-height: 44px;
    font-size: 0.9rem;
  }
  
  .content-area {
    border-radius: 0;
  }
  
  .editor-content {
    padding: 1rem;
    font-size: 16px;
    line-height: 1.5;
  }
}

@media (max-width: 360px) {
  .editor-html-modal {
    width: 100vw;
    height: 100vh;
  }
  
  .modal-header {
    padding: 0.5rem 0.75rem;
  }
  
  .modal-title {
    font-size: 0.9rem;
  }
  
  .editor-toolbar {
    padding: 0.5rem 0.75rem;
    gap: 0.25rem;
  }
  
  .toolbar-btn {
    padding: 0.4rem;
    min-width: 32px;
    min-height: 32px;
  }
  
  .toolbar-btn svg {
    width: 12px;
    height: 12px;
  }
  
  .format-select {
    padding: 0.4rem;
    min-height: 32px;
    font-size: 0.75rem;
  }
  
  .action-toolbar {
    padding: 0.5rem 0.75rem;
  }
  
  .cancel-btn,
  .save-btn {
    padding: 0.625rem 0.75rem;
    min-height: 40px;
    font-size: 0.85rem;
  }
  
  .editor-content {
    padding: 0.75rem;
    font-size: 15px;
  }
}
</style> 