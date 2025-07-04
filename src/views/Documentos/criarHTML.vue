<template>
  <div v-if="isVisible" class="criar-html-overlay" @click="handleOverlayClick">
    <div class="criar-html-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">Criar novo documento</h2>
        <button class="close-button" @click="fechar">×</button>
      </div>

      <!-- Campo para nome do documento -->
      <div class="document-name-section">
        <label for="documentName" class="document-name-label">Nome do documento</label>
        <input 
          id="documentName"
          v-model="nomeDocumento"
          type="text"
          class="document-name-input"
          placeholder="Digite o nome do documento..."
          @keypress.enter="focusEditor"
        />
      </div>

      <!-- Toolbar de Edição -->
      <div class="editor-toolbar">
        <div class="toolbar-group">
          <button 
            class="toolbar-btn" 
            @click="execCommand('bold')"
            :class="{ active: isActive('bold') }"
            title="Negrito"
          >
            B
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('italic')"
            :class="{ active: isActive('italic') }"
            title="Itálico"
          >
            I
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('underline')"
            :class="{ active: isActive('underline') }"
            title="Sublinhado"
          >
            U
          </button>
        </div>

        <div class="toolbar-separator"></div>

        <div class="toolbar-group">
          <button 
            class="toolbar-btn" 
            @click="execCommand('justifyLeft')"
            title="Alinhar à esquerda"
          >
            ←
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('justifyCenter')"
            title="Centralizar"
          >
            ↔
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('justifyRight')"
            title="Alinhar à direita"
          >
            →
          </button>
        </div>

        <div class="toolbar-separator"></div>

        <div class="toolbar-group">
          <button 
            class="toolbar-btn" 
            @click="execCommand('insertUnorderedList')"
            title="Lista"
          >
            •
          </button>
          
          <button 
            class="toolbar-btn" 
            @click="execCommand('insertOrderedList')"
            title="Lista numerada"
          >
            1.
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
          <span class="document-info">Novo documento HTML</span>
        </div>

        <div class="toolbar-right">
          <button class="cancel-btn" @click="cancelar">
            Cancelar
          </button>
          <button class="save-btn" @click="salvar" :disabled="!nomeDocumento.trim() || salvando">
            {{ salvando ? 'Salvando...' : 'Salvar documento' }}
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
          data-placeholder="Comece a digitar o conteúdo do seu documento..."
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  pastaId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['fechar', 'documento-criado', 'erro'])

// Estados
const nomeDocumento = ref('')
const conteudoHtml = ref('')
const editorRef = ref(null)
const activeStates = ref({})
const inputTimeout = ref(null)
const salvando = ref(false)

// Watchers
watch(() => props.isVisible, (visible) => {
  if (visible) {
    // Limpar campos ao abrir
    nomeDocumento.value = ''
    conteudoHtml.value = ''
    
    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.innerHTML = ''
        
        // Focar no campo nome primeiro
        const nameInput = document.getElementById('documentName')
        if (nameInput) {
          nameInput.focus()
        }
      }
    })
  }
})

// Métodos do editor
const execCommand = (command, value = null) => {
  if (!editorRef.value) return
  
  editorRef.value.focus()
  document.execCommand(command, false, value)
  updateToolbar()
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
    editorRef.value?.focus()
    document.execCommand('formatBlock', false, `<${format}>`)
    updateToolbar()
    event.target.value = ''
  }
}

const handleInput = (event) => {
  if (inputTimeout.value) {
    clearTimeout(inputTimeout.value)
  }
  
  inputTimeout.value = setTimeout(() => {
    if (editorRef.value) {
      conteudoHtml.value = editorRef.value.innerHTML
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

const focusEditor = () => {
  if (editorRef.value) {
    editorRef.value.focus()
  }
}

const cancelar = () => {
  if (nomeDocumento.value.trim() || conteudoHtml.value.trim()) {
    if (confirm('Tem certeza que deseja cancelar? O documento não será salvo.')) {
      emit('fechar')
    }
  } else {
    emit('fechar')
  }
}

const salvar = async () => {
  if (!nomeDocumento.value.trim()) {
    alert('Por favor, digite um nome para o documento.')
    return
  }

  const htmlContent = editorRef.value?.innerHTML || ''
  if (!htmlContent.trim()) {
    alert('Por favor, digite algum conteúdo para o documento.')
    return
  }

  try {
    salvando.value = true
    
    // Preparar dados para inserção
    const dadosDocumento = {
      nome: nomeDocumento.value.trim(),
      html: htmlContent,
      isFile: false,
      url: null,
      pasta_id: props.pastaId
    }

    // Inserir no Supabase
    const { data, error } = await supabase
      .from('documentos')
      .insert([dadosDocumento])
      .select()

    if (error) {
      throw error
    }

    // Emitir evento de sucesso
    emit('documento-criado', data[0])
    
    // Fechar modal
    emit('fechar')

  } catch (error) {
    console.error('Erro ao salvar documento:', error)
    emit('erro', 'Erro ao salvar documento: ' + error.message)
  } finally {
    salvando.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Configurar editor quando montado
  if (editorRef.value) {
    updateToolbar()
  }
})

onUnmounted(() => {
  if (inputTimeout.value) {
    clearTimeout(inputTimeout.value)
  }
})
</script>

<style scoped>
.criar-html-overlay {
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

.criar-html-modal {
  background: white;
  border-radius: 12px;
  width: 944px;
  height: 700px;
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
  font-size: 1.5rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.document-name-section {
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
}

.document-name-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.document-name-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  transition: border-color 0.2s ease;
}

.document-name-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
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
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
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

.save-btn:hover:not(:disabled) {
  background: #0353e9;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
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

/* Responsivo */
@media (max-width: 768px) {
  .criar-html-overlay {
    padding: 0.5rem;
  }
  
  .criar-html-modal {
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
  
  .document-name-section {
    padding: 0.75rem 1rem;
  }
  
  .document-name-input {
    padding: 0.75rem;
  }
  
  .editor-toolbar {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }
  
  .toolbar-btn {
    padding: 0.625rem;
    min-width: 40px;
    min-height: 40px;
  }
  
  .action-toolbar {
    padding: 0.75rem 1rem;
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
  .criar-html-overlay {
    padding: 0.25rem;
  }
  
  .criar-html-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .toolbar-separator {
    display: none;
  }
  
  .action-toolbar {
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
  
  .cancel-btn,
  .save-btn {
    flex: 1;
  }
}
</style> 