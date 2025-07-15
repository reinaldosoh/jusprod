<template>
  <div v-if="isVisible" class="cadastro-escritorio-overlay" @click="handleOverlayClick">
    <div class="cadastro-escritorio-modal" @click.stop>
      <!-- Header azul -->
      <div class="modal-header">
        <h2 class="modal-title">{{ props.modoEdicao ? 'Atualizar informações do escritório' : 'Adicione as informações do seu escritório' }}</h2>
        <button class="close-button" @click="fechar">
          <img src="/images/x-close.svg" alt="Fechar" class="close-icon" />
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <!-- Título da seção -->
        <h3 class="section-title">Informações do escritório</h3>

        <!-- Primeira linha: Nome do escritório e URL do site -->
        <div class="form-row">
          <div class="field-group">
            <label class="field-label">Nome do escritório</label>
            <input 
              type="text" 
              v-model="formData.nome_escritorio"
              placeholder="Insira o nome do escritório" 
              class="field-input"
              @input="validar('nome_escritorio')"
            />
          </div>
          <div class="field-group">
            <label class="field-label">URL do site</label>
            <input 
              type="text" 
              v-model="formData.site"
              placeholder="Insira o link do site" 
              class="field-input"
            />
          </div>
        </div>

        <!-- Upload de logotipo -->
        <div class="field-group">
          <label class="field-label">Insira o logotipo do escritório <span class="field-hint">(Resolução sugerida 140x60px)</span></label>
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
                <h3 v-if="!arquivo">Insira o logotipo do escritório</h3>
                <h3 v-else class="arquivo-selecionado">{{ arquivo.name }}</h3>
                <p v-if="!arquivo">
                  <span class="upload-link">Clique para carregar</span> ou arraste e solte<br>
                  JPEG, JPG ou PNG (Tamanho máximo 5 MB)
                </p>
                <p v-else class="arquivo-info">
                  Arquivo selecionado: {{ formatarTamanhoArquivo(arquivo.size) }}<br>
                  <span class="upload-link">Clique para alterar</span>
                </p>
              </div>
            </div>
            
            <!-- Input file oculto -->
            <input 
              type="file" 
              ref="fileInput" 
              style="display: none;"
              accept=".jpg,.jpeg,.png"
              @change="handleFileSelect"
            />
          </div>
        </div>

        <!-- CEP -->
        <div class="field-group">
          <label class="field-label">CEP</label>
          <input 
            type="text" 
            v-model="formData.cep"
            placeholder="Insira o CEP" 
            class="field-input"
            @input="buscarCep"
            @keyup="formatarCep"
            maxlength="9"
          />
        </div>

        <!-- Rua e Número -->
        <div class="form-row">
          <div class="field-group">
            <label class="field-label">Rua</label>
            <input 
              type="text" 
              v-model="formData.rua"
              placeholder="Insira o nome do logradouro" 
              class="field-input"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Número</label>
            <input 
              type="text" 
              v-model="formData.numero"
              placeholder="Insira o número" 
              class="field-input"
            />
          </div>
        </div>

        <!-- Bairro, Cidade e Estado -->
        <div class="form-row form-row-three">
          <div class="field-group">
            <label class="field-label">Bairro<span class="required">*</span></label>
            <input 
              type="text" 
              placeholder="Insira"
              class="field-input"
              v-model="formData.bairro"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Cidade<span class="required">*</span></label>
            <input 
              type="text" 
              placeholder="Insira"
              class="field-input"
              v-model="formData.cidade"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Estado<span class="required">*</span></label>
            <input 
              type="text" 
              placeholder="Insira"
              class="field-input"
              v-model="formData.estado"
            />
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
            :disabled="!podeSubmeter || salvando"
          >
            {{ props.modoEdicao ? (salvando ? 'Atualizando...' : 'Atualizar') : (salvando ? 'Salvando...' : 'Concluir') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { escritorioService } from '../../services/escritorioService'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  modoEdicao: {
    type: Boolean,
    default: false
  },
  dadosEscritorio: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['fechar', 'escritorio-salvo', 'erro'])
const router = useRouter()

// Estados
const formData = ref({
  nome_escritorio: '',
  site: '',
  url_logotipo: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: ''
})

// Função para carregar dados no formulário
const carregarDadosFormulario = () => {
  if (!props.dadosEscritorio) {
    console.warn('Tentativa de carregar dados, mas props.dadosEscritorio está vazio');
    return;
  }
  
  console.log('Carregando dados do escritório para edição:', props.dadosEscritorio);
  
  nextTick(() => {
    // Fazer cópia para não modificar props diretamente
    const dados = { ...props.dadosEscritorio };
    
    // Atribuir diretamente os valores
    formData.value = {
      nome_escritorio: dados.nome_escritorio || '',
      site: dados.site || '',
      url_logotipo: dados.url_logotipo || '',
      cep: dados.cep || '',
      rua: dados.rua || '',
      numero: dados.numero || '',
      bairro: dados.bairro || '',
      cidade: dados.cidade || '',
      estado: dados.estado || ''
    };
    
    // Se tiver uma URL de logotipo, mostrar como já carregado visualmente
    if (dados.url_logotipo) {
      arquivo.value = {
        name: 'logotipo_atual.png',
        size: 1000,
        type: 'image/png'
      };
    } else {
      arquivo.value = null;
    }
    
    console.log('Dados carregados no formulário:', formData.value);
  });
}

// Carregar dados iniciais quando estiver no modo de edição
onMounted(() => {
  if (props.modoEdicao && props.dadosEscritorio) {
    carregarDadosFormulario();
  }
});

// Observar mudanças de visibilidade e modo de edição
watch(() => props.isVisible, (isVisible) => {
  if (isVisible && props.modoEdicao && props.dadosEscritorio) {
    carregarDadosFormulario();
  } else if (isVisible && !props.modoEdicao) {
    limparFormulario()
  }
}, { immediate: true });

// Observar mudanças nos dados do escritório
watch(() => props.dadosEscritorio, (novosDados) => {
  if (props.isVisible && props.modoEdicao && novosDados) {
    console.log('Dados do escritório atualizados:', novosDados)
    carregarDadosFormulario();
  }
}, { deep: true });


const arquivo = ref(null)
const isDragOver = ref(false)
const uploadError = ref(false)
const fileInput = ref(null)
const salvando = ref(false)

// Computed
const podeSubmeter = computed(() => {
  return formData.value.nome_escritorio.trim() && 
         formData.value.bairro.trim() && 
         formData.value.cidade.trim() && 
         formData.value.estado.trim()
})

// Funções de upload
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
  console.log('🔄 Processando arquivo:', file.name, file.type, formatarTamanhoArquivo(file.size));
  
  // Limpar estados de erro
  uploadError.value = false
  
  // Validar tipo de arquivo
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png']
  
  if (!tiposPermitidos.includes(file.type)) {
    uploadError.value = true
    emit('erro', 'Tipo de arquivo não permitido. Use JPEG, JPG ou PNG')
    console.error('❌ Tipo de arquivo inválido:', file.type);
    return
  }
  
  // Validar tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = true
    emit('erro', 'Arquivo muito grande. Tamanho máximo: 5 MB')
    console.error('❌ Arquivo muito grande:', formatarTamanhoArquivo(file.size));
    return
  }
  
  // Sucesso - salvar o arquivo
  arquivo.value = file
  console.log('✅ Arquivo processado com sucesso:', file.name);
}

// Funções de CEP
const formatarCep = (event) => {
  let valor = event.target.value.replace(/\D/g, '')
  if (valor.length >= 6) {
    valor = valor.replace(/^(\d{5})(\d)/, '$1-$2')
  }
  formData.value.cep = valor
}

const buscarCep = async () => {
  const cep = formData.value.cep.replace(/\D/g, '')
  
  if (cep.length === 8) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        formData.value.rua = data.logradouro || ''
        formData.value.bairro = data.bairro || ''
        formData.value.cidade = data.localidade || ''
        formData.value.estado = data.uf || ''
      } else {
        emit('erro', 'CEP não encontrado')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      emit('erro', 'Erro ao buscar CEP')
    }
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
  if (Object.values(formData.value).some(val => val.trim()) || arquivo.value) {
    if (confirm('Tem certeza que deseja cancelar? As informações não serão salvas.')) {
      fechar()
    }
  } else {
    fechar()
  }
}

const limparFormulario = () => {
  formData.value = {
    nome_escritorio: '',
    site: '',
    url_logotipo: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  }
  arquivo.value = null
  isDragOver.value = false
  uploadError.value = false
  salvando.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const salvar = async () => {
  if (!podeSubmeter.value || salvando.value) return
  
  try {
    salvando.value = true
    
    // Se houver arquivo, fazer upload primeiro
    if (arquivo.value) {
      console.log('💾 Fazendo upload do logotipo...')
      
      // Obter dados do usuário
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      // Criar nome único para o arquivo
      const nomeArquivo = `${user.id}/logotipo_${Date.now()}_${arquivo.value.name}`
      
      // Upload do arquivo para o storage 'escritorio'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('escritorio')
        .upload(nomeArquivo, arquivo.value)
      
      if (uploadError) throw uploadError
      
      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('escritorio')
        .getPublicUrl(nomeArquivo)
      
      // Atualizar formData com a URL do logotipo
      formData.value.url_logotipo = publicUrl
      console.log('✅ Upload do logotipo concluído:', publicUrl)
    }
    
    // Salvar no banco usando o serviço
    console.log('💾 Salvando escritório no banco...')
    await escritorioService.salvarEscritorio(formData.value)
    
    console.log('✅ Escritório salvo com sucesso!')
    emit('escritorio-salvo', formData.value)
    fechar()
    
    // Redirecionar para meu-perfil
    router.push('/meu-perfil')
    
  } catch (error) {
    console.error('Erro ao salvar escritório:', error)
    emit('erro', 'Erro ao salvar escritório: ' + error.message)
  } finally {
    salvando.value = false
  }
}

// Função para formatar tamanho do arquivo
const formatarTamanhoArquivo = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const tamanhos = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i]
}

// Watch para limpar form quando modal abrir
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    limparFormulario()
  }
})
</script>

<style scoped>
.cadastro-escritorio-overlay {
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

.cadastro-escritorio-modal {
  background: white;
  border-radius: 12px;
  width: 646px;
  height: 723px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
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
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
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
  gap: 1rem;
  overflow-y: auto;
  flex: 1;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #101828;
  margin: 0 0 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;
}

.form-row-three {
  grid-template-columns: 1fr 1fr 1fr;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.field-hint {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 400;
}

.required {
  color: #EF4444;
}

.field-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
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

.upload-area {
  border: 2px dashed #D0D5DD;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #F9FAFB;
  height: 120px;
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

.upload-link {
  color: #0468FA;
  font-weight: 500;
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

.save-btn {
  background: #0468FA;
  color: #FFFFFF;
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
  .cadastro-escritorio-modal {
    width: 95vw;
    height: auto;
    max-height: 95vh;
  }
  
  .modal-content {
    padding: 1rem;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-row-three {
    grid-template-columns: 1fr;
  }
  
  .modal-buttons {
    flex-direction: column;
    align-items: flex-end;
  }
}

@media (max-width: 480px) {
  .cadastro-escritorio-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .upload-area {
    height: 100px;
    padding: 1rem;
  }
}
</style> 