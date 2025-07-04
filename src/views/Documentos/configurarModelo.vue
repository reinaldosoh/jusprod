<template>
  <teleport to="body">
    <!-- Modal completo -->
    <div v-if="isVisible" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-container">
        <!-- Cabeçalho azul -->
        <div class="header-bar">
          <h2 class="modal-title">Novo documento</h2>
          <button class="close-button" @click="fecharModal">×</button>
        </div>

        <!-- Conteúdo do formulário -->
        <div class="form-content">
          <h2 class="form-title">Configure seu documento</h2>

          <!-- Nome do documento -->
          <div class="campo-formulario full-width">
            <label for="nome-documento">Nome do documento<span class="campo-obrigatorio">*</span></label>
            <div class="input-with-icon">
              <div class="input-icon">
                <img src="/images/papel.svg" alt="Documento" style="width: 16px; height: 16px;">
              </div>
              <input
                v-model="formData.nomeDocumento"
                type="text"
                id="nome-documento"
                placeholder="Digite o nome do documento"
                class="input-field"
                :class="{ 'input-error': errors.nomeDocumento }"
              />
            </div>
            <span v-if="errors.nomeDocumento" class="error-text">{{ errors.nomeDocumento }}</span>
          </div>

          <!-- Cliente -->
          <div class="campo-formulario full-width dropdown-cliente">
            <label for="cliente">Cliente<span class="campo-obrigatorio">*</span></label>
            <Dropdown
              :options="clientesOptions"
              placeholder-text="Selecione um cliente"
              :show-placeholder-icon="true"
              icon-type="user"
              @option-selected="selecionarCliente"
            />
            <span v-if="errors.cliente" class="error-text">{{ errors.cliente }}</span>
          </div>

          <!-- Processo -->
          <div class="campo-formulario full-width dropdown-processo">
            <label for="processo">Processo<span class="campo-obrigatorio">*</span></label>
            <Dropdown
              :options="processosOptions"
              :placeholder-text="clienteSelecionado ? 'Selecione um processo' : 'Selecione um cliente primeiro'"
              :show-placeholder-icon="true"
              icon-type="balanca"
              @option-selected="selecionarProcesso"
              :disabled="!clienteSelecionado"
            />
            <span v-if="errors.processo" class="error-text">{{ errors.processo }}</span>
          </div>

          <!-- Pasta -->
          <div class="campo-formulario full-width dropdown-pasta">
            <label for="pasta">Pasta<span class="campo-obrigatorio">*</span></label>
            <Dropdown
              :options="pastasOptions"
              placeholder-text="Selecione uma pasta"
              :show-placeholder-icon="true"
              icon-type="pasta"
              @option-selected="selecionarPasta"
            />
            <span v-if="errors.pasta" class="error-text">{{ errors.pasta }}</span>
          </div>

          <!-- Exibir mensagens de erro -->
          <div class="error-message" v-if="mensagensErro">
            {{ mensagensErro }}
          </div>

          <!-- Botões de ação -->
          <div class="buttons-container">
            <Button 
              @click="fecharModal" 
              label="Cancelar"
              type="secondary"
              buttonType="button"
              :disabled="isLoading"
            />
            <Button 
              @click="salvarDocumento" 
              :label="isLoading ? 'Salvando...' : 'Salvar'"
              type="primary"
              buttonType="button"
              :disabled="isLoading || !isFormValid"
            />
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Dropdown from '@/components/UI/Dropdown.vue'
import Button from '@/components/UI/Button.vue'
import { supabase } from '@/lib/supabase'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  modeloHtml: {
    type: String,
    default: ''
  },
  htmlModelo: {
    type: String,
    default: ''
  },
  nomeModelo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['fechar', 'documento-salvo', 'documento-criado'])

const authStore = useAuthStore()

const isLoading = ref(false)
const mensagensErro = ref('')

const formData = ref({
  nomeDocumento: '',
  cliente: null,
  processo: null,
  pasta: null
})

const errors = ref({})

const clientesOptions = ref([])
const processosOptions = ref([])
const pastasOptions = ref([])

const clienteSelecionado = ref(null)
const processoSelecionado = ref(null)
const pastaSelecionada = ref(null)

// Computed
const isFormValid = computed(() => {
  return formData.value.nomeDocumento.trim() && 
         clienteSelecionado.value && 
         processoSelecionado.value && 
         pastaSelecionada.value
})

const htmlToProcess = computed(() => {
  return props.htmlModelo || props.modeloHtml || ''
})

// Watch para resetar form quando modal abre
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    resetForm()
    carregarDados()
  }
})

// Methods
const resetForm = () => {
  formData.value = {
    nomeDocumento: '',
    cliente: null,
    processo: null,
    pasta: null
  }
  errors.value = {}
  clienteSelecionado.value = null
  processoSelecionado.value = null
  pastaSelecionada.value = null
  processosOptions.value = []
  mensagensErro.value = ''
}

const fecharModal = () => {
  console.log('🚀 FECHANDO MODAL - função chamada!')
  resetForm()
  emit('fechar')
}

const carregarDados = async () => {
  await Promise.all([
    carregarClientes(),
    carregarPastas()
  ])
}

const selecionarCliente = (cliente) => {
  clienteSelecionado.value = cliente
  formData.value.cliente = cliente
  errors.value.cliente = ''
  
  // Reset processo quando cliente muda
  processoSelecionado.value = null
  formData.value.processo = null
  processosOptions.value = []
  
  if (cliente && cliente.id) {
    carregarProcessos(cliente.id)
  }
}

const selecionarProcesso = (processo) => {
  processoSelecionado.value = processo
  formData.value.processo = processo
  errors.value.processo = ''
}

const selecionarPasta = (pasta) => {
  pastaSelecionada.value = pasta
  formData.value.pasta = pasta
  errors.value.pasta = ''
}

const validarFormulario = () => {
  errors.value = {}
  mensagensErro.value = ''
  
  if (!formData.value.nomeDocumento.trim()) {
    errors.value.nomeDocumento = 'Nome do documento é obrigatório'
  }
  
  if (!clienteSelecionado.value) {
    errors.value.cliente = 'Cliente é obrigatório'
  }
  
  if (!processoSelecionado.value) {
    errors.value.processo = 'Processo é obrigatório'
  }
  
  if (!pastaSelecionada.value) {
    errors.value.pasta = 'Pasta é obrigatória'
  }
  
  return Object.keys(errors.value).length === 0
}

const carregarClientes = async () => {
  try {
    const userUuid = authStore.user.value?.id
    if (!userUuid) {
      console.error('UUID do usuário não encontrado')
      return
    }

    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('id, nome, cnpj, cpf, empresa')
      .eq('uuid', userUuid)
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao carregar clientes:', error)
      return
    }

    clientesOptions.value = clientes.map(cliente => {
      const displayName = cliente.empresa 
        ? `${cliente.nome} (${cliente.cnpj || 'CNPJ não informado'})`
        : `${cliente.nome} (${cliente.cpf || 'CPF não informado'})`
      
      return {
        id: cliente.id,
        label: displayName,
        icon: '/images/user.svg',
        iconeBranco: '/images/user.svg',
        ...cliente
      }
    })
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

const carregarProcessos = async (clienteId) => {
  try {
    const userUuid = authStore.user.value?.id
    if (!userUuid) {
      console.error('UUID do usuário não encontrado')
      return
    }

    // Buscar processos pela tabela processo_cliente
    const { data: processosCliente, error: pcError } = await supabase
      .from('processo_cliente')
      .select(`
        processo_id,
        processos!inner(id, cnpj, autor, reu, nome)
      `)
      .eq('uuid', userUuid)
      .eq('cliente_id', clienteId)

    if (pcError) {
      console.error('Erro ao carregar relação processo-cliente:', pcError)
      return
    }

    if (!processosCliente || processosCliente.length === 0) {
      processosOptions.value = []
      return
    }

    processosOptions.value = processosCliente.map(pc => {
      const processo = pc.processos
      const displayName = processo.cnpj || processo.autor || processo.nome || `Processo ${processo.id}`
      
      return {
        id: processo.id,
        label: displayName,
        icon: '/images/balanca.svg',
        iconeBranco: '/images/balanca.svg',
        ...processo
      }
    })
  } catch (error) {
    console.error('Erro ao carregar processos:', error)
  }
}

const carregarPastas = async () => {
  try {
    const userUuid = authStore.user.value?.id
    if (!userUuid) {
      console.error('UUID do usuário não encontrado')
      return
    }

    const { data: pastas, error } = await supabase
      .from('pasta_documentos')
      .select('id, titulo')
      .eq('uuid', userUuid)
      .order('titulo')

    if (error) {
      console.error('Erro ao carregar pastas:', error)
      return
    }

    pastasOptions.value = pastas.map(pasta => ({
      id: pasta.id,
      label: pasta.titulo,
      icon: '/images/iconPasta.svg',
      iconeBranco: '/images/iconPasta.svg',
      ...pasta
    }))
  } catch (error) {
    console.error('Erro ao carregar pastas:', error)
  }
}

const processarTags = (html, cliente, processo, usuario, oab) => {
  let htmlProcessado = html

  // Tags do cliente
  if (cliente) {
    htmlProcessado = htmlProcessado.replace(/\[NOME_CLIENTE_PJ\]/g, cliente.nome || '')
    htmlProcessado = htmlProcessado.replace(/\[CNPJ_CLIENTE\]/g, cliente.cnpj || '')
    htmlProcessado = htmlProcessado.replace(/\[CPF_CLIENTE\]/g, cliente.cpf || '')
    htmlProcessado = htmlProcessado.replace(/\[NOME_FANTASIA_CLIENTE\]/g, cliente.nome_fantasia || '')
    htmlProcessado = htmlProcessado.replace(/\[EMAIL_CLIENTE\]/g, cliente.email || '')
    htmlProcessado = htmlProcessado.replace(/\[TELEFONE_CLIENTE\]/g, cliente.telefone || '')
    htmlProcessado = htmlProcessado.replace(/\[ENDERECO_CLIENTE\]/g, `${cliente.rua || ''} ${cliente.numero || ''} ${cliente.complemento || ''}`.trim())
    htmlProcessado = htmlProcessado.replace(/\[CIDADE_CLIENTE\]/g, cliente.cidade || '')
    htmlProcessado = htmlProcessado.replace(/\[ESTADO_CLIENTE\]/g, cliente.estado || '')
    htmlProcessado = htmlProcessado.replace(/\[CEP_CLIENTE\]/g, cliente.cep || '')
  }

  // Tags do processo
  if (processo) {
    htmlProcessado = htmlProcessado.replace(/\[NUMERO_PROCESSO\]/g, processo.cnpj || '')
    htmlProcessado = htmlProcessado.replace(/\[TITULO_PROCESSO\]/g, processo.nome || '')
    htmlProcessado = htmlProcessado.replace(/\[AUTOR_PROCESSO\]/g, processo.autor || '')
    htmlProcessado = htmlProcessado.replace(/\[REU_PROCESSO\]/g, processo.reu || '')
    htmlProcessado = htmlProcessado.replace(/\[TRIBUNAL_PROCESSO\]/g, processo.tribunal || '')
    htmlProcessado = htmlProcessado.replace(/\[VARA_PROCESSO\]/g, processo.orgao_julgador || '')
    htmlProcessado = htmlProcessado.replace(/\[CLASSE_PROCESSO\]/g, processo.classe || '')
    htmlProcessado = htmlProcessado.replace(/\[ASSUNTO_PROCESSO\]/g, processo.assunto || '')
    htmlProcessado = htmlProcessado.replace(/\[VALOR_CAUSA_PROCESSO\]/g, processo.valor_causa || '')
  }

  // Tags do advogado/usuário
  if (usuario) {
    htmlProcessado = htmlProcessado.replace(/\[NOME_USUARIO_1\]/g, usuario.nome || '')
    htmlProcessado = htmlProcessado.replace(/\[EMAIL_USUARIO_1\]/g, usuario.email || '')
    htmlProcessado = htmlProcessado.replace(/\[CPF_USUARIO_1\]/g, usuario.cpf || '')
    htmlProcessado = htmlProcessado.replace(/\[WHATSAPP_USUARIO_1\]/g, usuario.whatsapp || '')
  }

  // Tags da OAB
  if (oab) {
    htmlProcessado = htmlProcessado.replace(/\[OAB_USUARIO_1\]/g, oab.OAB_num || '')
    htmlProcessado = htmlProcessado.replace(/\[UF_OAB_USUARIO_1\]/g, oab.OAB_uf || '')
  }

  return htmlProcessado
}

const buscarDadosUsuario = async () => {
  try {
    const userUuid = authStore.user.value?.id
    if (!userUuid) return { usuario: null, oab: null }

    // Buscar dados do usuário
    const { data: usuario, error: userError } = await supabase
      .from('usuario')
      .select('id, nome, email, cpf, whatsapp')
      .eq('uuid', userUuid)
      .single()

    if (userError) {
      console.error('Erro ao buscar usuário:', userError)
      return { usuario: null, oab: null }
    }

    // Buscar dados da OAB
    const { data: oab, error: oabError } = await supabase
      .from('OAB')
      .select('OAB_num, OAB_uf')
      .eq('uuid', userUuid)
      .single()

    if (oabError) {
      console.error('Erro ao buscar OAB:', oabError)
    }

    return { usuario, oab }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    return { usuario: null, oab: null }
  }
}

const salvarDocumento = async () => {
  if (!validarFormulario()) return

  isLoading.value = true

  try {
    const userUuid = authStore.user.value?.id
    if (!userUuid) {
      throw new Error('UUID do usuário não encontrado')
    }

    // Buscar dados do usuário e OAB
    const { usuario, oab } = await buscarDadosUsuario()

    // Processar o HTML com as tags
    const htmlProcessado = processarTags(
      htmlToProcess.value,
      clienteSelecionado.value,
      processoSelecionado.value,
      usuario,
      oab
    )

    // Salvar documento na tabela documentos
    const { data, error } = await supabase
      .from('documentos')
      .insert({
        nome: formData.value.nomeDocumento,
        html: htmlProcessado,
        cliente_id: clienteSelecionado.value.id,
        processo_id: processoSelecionado.value.id,
        pasta_id: pastaSelecionada.value.id,
        uuid: userUuid,
        isFile: false
      })
      .select()

    if (error) {
      throw error
    }

    emit('documento-salvo', data[0])
    emit('documento-criado', data[0])
    fecharModal()
  } catch (error) {
    console.error('Erro ao salvar documento:', error)
    mensagensErro.value = `Erro ao salvar documento: ${error.message || 'Erro desconhecido'}`
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  /* z-index controlado pelo dropdown-fix.css */
}

.modal-container {
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  background-color: white;
  border-radius: 12px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
  position: relative;
  /* z-index controlado pelo dropdown-fix.css */
}

/* Cabeçalho */
.header-bar {
  background-color: #0468FA;
  color: white;
  height: 35px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  flex: 1;
  line-height: 35px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

/* Conteúdo do formulário */
.form-content {
  padding: 24px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
}

/* Estilos para campos do formulário */
.campo-formulario {
  margin-bottom: 16px;
  flex: 1;
  position: relative;
}

.full-width {
  width: 100%;
}

.campo-formulario label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 6px;
}

.campo-obrigatorio {
  color: #EF4444;
  margin-left: 2px;
}

.input-field {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background-color: white;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 1px rgba(4, 104, 250, 0.2);
}

.fields-row {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}

.fields-row .campo-formulario {
  flex: 1;
  margin-bottom: 0;
}

/* Estilos para input com ícone */
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  width: 16px;
  height: 44px;
}

.input-with-icon .input-field {
  padding-left: 40px;
  padding-right: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  height: 44px;
  line-height: 1;
}

.error-text {
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
}

/* Botões de ação */
.buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.buttons-container :deep(.button) {
  width: 176px;
  height: 44px;
}

/* Estilos para mensagens de erro */
.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border-left: 3px solid #EF4444;
  padding: 12px 16px;
  margin: 16px 0;
  font-size: 14px;
  border-radius: 4px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Estilos responsivos */
@media (max-width: 640px) {
  .fields-row {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 90%;
    margin: 0 auto;
  }
  
  .form-content {
    padding: 20px;
  }

  .campo-formulario {
    width: 100%;
  }

  .buttons-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .buttons-container :deep(.button) {
    width: 100%;
  }
}

/* Garantindo que botões e elementos interativos fiquem na frente */
.buttons-container :deep(.button) {
  position: relative;
}

/* Dropdowns - z-index controlado pelo dropdown-fix.css */
.campo-formulario :deep(.dropdown-container) {
  position: relative;
}

.campo-formulario :deep(.dropdown-options) {
  position: absolute;
}

/* FORÇAR Z-INDEX PARA DROPDOWNS ESPECÍFICOS */
.dropdown-cliente :deep(.dropdown-container) {
  z-index: 20100 !important;
  position: relative !important;
}

.dropdown-cliente :deep(.dropdown-options) {
  z-index: 20101 !important;
  position: absolute !important;
}

.dropdown-processo :deep(.dropdown-container) {
  z-index: 20200 !important;
  position: relative !important;
}

.dropdown-processo :deep(.dropdown-options) {
  z-index: 20201 !important;
  position: absolute !important;
}

.dropdown-pasta :deep(.dropdown-container) {
  z-index: 20300 !important;
  position: relative !important;
}

.dropdown-pasta :deep(.dropdown-options) {
  z-index: 20301 !important;
  position: absolute !important;
}

/* QUANDO DROPDOWN ESTÁ ABERTO - PRIORIDADE MÁXIMA */
.dropdown-cliente :deep(.dropdown-container.dropdown-open) {
  z-index: 25100 !important;
}

.dropdown-cliente :deep(.dropdown-container.dropdown-open .dropdown-options) {
  z-index: 25101 !important;
}

.dropdown-processo :deep(.dropdown-container.dropdown-open) {
  z-index: 25200 !important;
}

.dropdown-processo :deep(.dropdown-container.dropdown-open .dropdown-options) {
  z-index: 25201 !important;
}

.dropdown-pasta :deep(.dropdown-container.dropdown-open) {
  z-index: 25300 !important;
}

.dropdown-pasta :deep(.dropdown-container.dropdown-open .dropdown-options) {
  z-index: 25301 !important;
}
</style> 