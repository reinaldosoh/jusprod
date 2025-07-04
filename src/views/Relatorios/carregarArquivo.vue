<template>
  <div v-if="isVisible" class="carregar-arquivo-overlay" @click="handleOverlayClick">
    <div class="carregar-arquivo-modal" @click.stop>
      <!-- Header azul -->
      <div class="modal-header">
        <h2 class="modal-title">Novo relatório</h2>
        <button class="close-button" @click="fechar">×</button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <!-- Área de upload -->
        <div class="upload-area" 
             :class="{ 'upload-area--dragover': isDragOver, 'upload-area--error': uploadError }"
             @drop="handleDrop"
             @dragover.prevent="handleDragOver"
             @dragleave="handleDragLeave"
             @click="triggerFileInput">
          
          <div class="upload-content">
            <div class="upload-icon">
              <img v-if="!arquivo" src="/images/iploudCompleto.svg" alt="Upload" />
              <img v-else src="/images/arquivocarregado.svg" alt="Arquivo carregado" />
            </div>
            
            <div class="upload-text">
              <h3 v-if="!arquivo">Insira um arquivo aqui</h3>
              <h3 v-else class="arquivo-selecionado">{{ arquivo.name }}</h3>
              <p v-if="!arquivo">
                <span class="link-text">Clique para carregar</span> ou arraste e solte<br>
                .DOC, PDF, XLS, JPG, JPEG ou PNG (Tamanho máximo 5 MB)
              </p>
              <p v-else class="arquivo-info">
                Arquivo selecionado: {{ formatarTamanhoArquivo(arquivo.size) }}<br>
                <span class="link-text">Clique para alterar</span>
              </p>
            </div>
          </div>
          
          <!-- Input file oculto -->
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none;"
            accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.jpeg,.png"
            @change="handleFileSelect"
          />
        </div>

        <!-- Campos do formulário -->
        <div class="form-fields">
          <!-- Título e Categoria na mesma linha -->
          <div class="dropdown-row">
            <!-- Campo Título -->
            <div class="field-group">
              <div class="input-with-icon">
                <img src="/images/papel.svg" alt="Título" class="field-icon" />
                <input 
                  type="text" 
                  placeholder="Insira um título"
                  class="field-input"
                  v-model="titulo"
                />
              </div>
            </div>

            <!-- Dropdown Categoria -->
            <div class="field-group">
              <Dropdown
                :options="opcoesCategoria"
                placeholder-text="Categoria"
                :show-placeholder-icon="true"
                icon-type="categorias"
                :default-selected="null"
                @option-selected="handleCategoriaSelected"
              />
            </div>
          </div>

          <!-- Dropdowns Cliente e Processo na mesma linha -->
          <div class="dropdown-row">
            <!-- Dropdown Cliente -->
            <div class="field-group">
              <Dropdown
                :options="opcoesCliente"
                placeholder-text="Selecione um cliente"
                :show-placeholder-icon="true"
                icon-type="user"
                :default-selected="null"
                @option-selected="handleClienteSelected"
              />
            </div>

            <!-- Dropdown Processo -->
            <div class="field-group">
              <Dropdown
                :options="opcoesProcesso"
                placeholder-text="Selecione o processo"
                :show-placeholder-icon="true"
                icon-type="balanca"
                :disabled="!clienteSelecionado"
                :default-selected="null"
                @option-selected="handleProcessoSelected"
              />
            </div>
          </div>
        </div>

        <!-- Botões -->
        <div class="modal-buttons">
          <button class="cancel-btn" @click="cancelar">
            Cancelar
          </button>
          <button 
            class="save-btn" 
            @click="salvar"
            :disabled="!podeSubmeter"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Dropdown from '../../components/UI/Dropdown.vue'
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

const emit = defineEmits(['fechar', 'arquivo-carregado', 'erro'])

// Estados
const titulo = ref('')
const arquivo = ref(null)
const categoriaSelecionada = ref(null)
const clienteSelecionado = ref(null)
const processoSelecionado = ref(null)
const isDragOver = ref(false)
const uploadError = ref(false)
const fileInput = ref(null)
const salvando = ref(false)

// Opções dos dropdowns
const opcoesCategoria = ref([
  { id: 1, label: 'Relatório Geral' },
  { id: 2, label: 'Relatório de Audiência' },
  { id: 3, label: 'Relatório de Reunião' },
  { id: 4, label: 'Relatório de Andamento' },
  { id: 5, label: 'Relatório de Análise' }
])

const opcoesCliente = ref([])
const opcoesProcesso = ref([])

// Computed
const podeSubmeter = computed(() => {
  return titulo.value.trim() && arquivo.value && categoriaSelecionada.value
})

// Carregar dados
const carregarClientes = async () => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('id, nome')
      .order('nome')

    if (error) throw error

    opcoesCliente.value = data.map(cliente => ({
      id: cliente.id,
      label: cliente.nome
    }))
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

const carregarProcessos = async (clienteId) => {
  try {
    const { data, error } = await supabase
      .from('processos')
      .select('id, numerocnj, titulo')
      .eq('cliente_id', clienteId)
      .order('numerocnj')

    if (error) throw error

    opcoesProcesso.value = data.map(processo => ({
      id: processo.id,
      label: processo.numerocnj || processo.titulo || `Processo ${processo.id}`
    }))
  } catch (error) {
    console.error('Erro ao carregar processos:', error)
    opcoesProcesso.value = []
  }
}

// Handlers dos dropdowns
const handleCategoriaSelected = (opcao) => {
  categoriaSelecionada.value = opcao
}

const handleClienteSelected = (opcao) => {
  clienteSelecionado.value = opcao
  processoSelecionado.value = null
  if (opcao && opcao.id) {
    carregarProcessos(opcao.id)
  } else {
    opcoesProcesso.value = []
  }
}

const handleProcessoSelected = (opcao) => {
  processoSelecionado.value = opcao
}

// Handlers de arquivo
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processarArquivo(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  uploadError.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processarArquivo(files[0])
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
  uploadError.value = false
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const processarArquivo = (file) => {
  // Validar tipo de arquivo
  const tiposPermitidos = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]
  
  if (!tiposPermitidos.includes(file.type)) {
    uploadError.value = true
    emit('erro', 'Tipo de arquivo não permitido. Use .DOC, .PDF, .XLS, .JPG, .JPEG ou .PNG')
    return
  }
  
  // Validar tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = true
    emit('erro', 'Arquivo muito grande. Tamanho máximo: 5 MB')
    return
  }
  
  arquivo.value = file
  
  // Se não houver título, usar o nome do arquivo
  if (!titulo.value.trim()) {
    titulo.value = file.name.replace(/\.[^/.]+$/, "")
  }
}

// Controles do modal
const fechar = () => {
  limparFormulario()
  emit('fechar')
}

const handleOverlayClick = () => {
  // Não fechar automaticamente para evitar perda de dados
}

const cancelar = () => {
  if (titulo.value.trim() || arquivo.value) {
    if (confirm('Tem certeza que deseja cancelar? O relatório não será salvo.')) {
      fechar()
    }
  } else {
    fechar()
  }
}

const limparFormulario = () => {
  titulo.value = ''
  arquivo.value = null
  categoriaSelecionada.value = null
  clienteSelecionado.value = null
  processoSelecionado.value = null
  isDragOver.value = false
  uploadError.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const salvar = async () => {
  if (!podeSubmeter.value) return
  
  try {
    salvando.value = true
    
    // Bucket 'relatorios' para relatórios
    console.log('💾 Iniciando upload do relatório...')
    
    // Upload do arquivo para o Supabase Storage
    // Organizar por UUID do usuário para segurança
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')
    
    const nomeArquivo = `${user.id}/${Date.now()}_${arquivo.value.name}`
    console.log('Fazendo upload do relatório:', nomeArquivo)
    
    // Tentar fazer upload - se arquivo já existe, usar upsert
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('relatorios')
      .upload(nomeArquivo, arquivo.value, {
        upsert: true // Substitui se arquivo já existe
      })
    
    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      throw new Error(`Falha no upload: ${uploadError.message}`)
    }
    
    console.log('✅ Upload concluído:', uploadData)
    
    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('relatorios')
      .getPublicUrl(nomeArquivo)
    
    console.log('URL pública gerada:', publicUrl)
    
    // Preparar dados do relatório
    const dadosRelatorio = {
      nome: titulo.value.trim(),
      url: publicUrl,
      tipo: 'FILE',
      html: null,
      isFile: true,
      processocnj: processoSelecionado.value?.label || null,
      pasta_id: props.pastaId,
      cliente_id: clienteSelecionado.value?.id || null,
      processo_id: processoSelecionado.value?.id || null,
      categoria: categoriaSelecionada.value?.label || 'Relatório Geral',
      uuid: user.id
    }
    
    console.log('Salvando dados no banco:', dadosRelatorio)
    
    // Salvar no banco
    const { data, error } = await supabase
      .from('relatorios')
      .insert([dadosRelatorio])
      .select()
    
    if (error) {
      console.error('Erro ao salvar no banco:', error)
      throw new Error(`Falha ao salvar no banco: ${error.message}`)
    }
    
    // Emitir sucesso - garantir que nenhum erro foi lançado até aqui
    console.log('✅ Relatório carregado com sucesso:', data[0])
    
    // Aguardar um pouco para garantir que tudo foi processado
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Emitir evento de sucesso e fechar modal
    emit('arquivo-carregado', data[0])
    
    // Aguardar um pouco antes de fechar para garantir que o evento foi processado
    await new Promise(resolve => setTimeout(resolve, 50))
    fechar()
    
  } catch (error) {
    console.error('❌ Erro ao carregar relatório:', error)
    
    // Melhorar mensagem de erro
    let mensagemErro = 'Erro desconhecido'
    if (error.message) {
      mensagemErro = error.message
    }
    
    // Aguardar um pouco para garantir que não interfere com eventos de sucesso
    await new Promise(resolve => setTimeout(resolve, 100))
    
    emit('erro', mensagemErro)
  } finally {
    salvando.value = false
  }
}

// Utilitários
const formatarTamanhoArquivo = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const tamanhos = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i]
}

// Lifecycle
onMounted(() => {
  carregarClientes()
})

// Watch para limpar form quando modal abrir
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    limparFormulario()
    carregarClientes()
  }
})
</script>

<style scoped>
.carregar-arquivo-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  overflow: auto;
}

.carregar-arquivo-modal {
  background: white;
  border-radius: 12px;
  width: 646px;
  min-height: 412px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: visible;
  z-index: 1201;
  position: relative;
}

.modal-header {
  background: #0468FA;
  color: white;
  padding: 0 1.5rem;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
  position: relative;
}

.modal-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  line-height: 1;
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: visible;
  flex: 1;
  padding-bottom: 3rem;
}

.upload-area {
  border: 2px dashed #D0D5DD;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #F9FAFB;
  width: 600px;
  height: 108px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #0468FA;
  background: #F8FAFC;
}

.upload-area--dragover {
  border-color: #0468FA;
  background: #EFF6FF;
}

.upload-area--error {
  border-color: #EF4444;
  background: #FEF2F2;
}

.upload-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.upload-icon {
  width: 47px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.upload-icon img {
  width: 47px;
  height: 46px;
}

.upload-text h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #101828;
  margin: 0 0 0.25rem 0;
}

.upload-text p {
  font-size: 0.875rem;
  color: #667085;
  margin: 0;
  line-height: 1.4;
}

.arquivo-selecionado {
  color: #16a34a !important;
  font-weight: 600;
}

.arquivo-info {
  color: #16a34a !important;
  font-weight: 500;
}

.link-text {
  color: #0468FA;
  font-weight: 500;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.dropdown-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  z-index: 1;
}

.field-input {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 42px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 14px;
  color: #101828;
  background: white;
  transition: border-color 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.field-input:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.field-input::placeholder {
  color: #667085;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 0.5rem;
}

.cancel-btn {
  background: white;
  color: #344054;
  border: 1px solid #D0D5DD;
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
  background: #F9FAFB;
  border-color: #98A2B3;
}

.save-btn {
  background: #0468FA;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0;
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
}

.save-btn:hover:not(:disabled) {
  background: #0356D6;
}

.save-btn:disabled {
  background: #D0D5DD;
  cursor: not-allowed;
}

/* Responsivo */
@media (max-width: 768px) {
  .carregar-arquivo-modal {
    width: 95vw;
    height: auto;
    overflow: visible;
  }
  
  .modal-content {
    padding: 1rem;
    gap: 1rem;
  }
  
  .upload-area {
    width: 100%;
    height: auto;
    min-height: 108px;
    padding: 1rem;
  }
  
  .upload-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .dropdown-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .modal-buttons {
    flex-direction: column;
    align-items: flex-end;
  }
  
  .cancel-btn,
  .save-btn {
    width: 176px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .carregar-arquivo-modal {
    width: 100vw;
    height: auto;
    border-radius: 0;
    overflow: visible;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .upload-area {
    width: 100%;
    height: auto;
    min-height: 80px;
  }
  
  .upload-text h3 {
    font-size: 0.9rem;
  }
  
  .upload-text p {
    font-size: 0.8rem;
  }
}
</style> 