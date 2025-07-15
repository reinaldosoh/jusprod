<template>
  <div v-if="isVisible" class="relatorio-despesas-overlay" @click="handleOverlayClick">
    <div class="relatorio-despesas-modal" @click.stop>
      <!-- Header azul -->
      <div class="modal-header">
        <h2 class="modal-title">Emitir relatório</h2>
        <button class="close-button" @click="fechar">
          <img src="/images/fechaBranco.svg" alt="Fechar" />
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <h3 class="section-title">Emita um relatório</h3>

        <!-- Dropdowns Cliente e Processo -->
        <div class="dropdown-row">
          <!-- Dropdown Cliente -->
          <div class="field-group" style="position: relative; z-index: 1005;">
            <Dropdown
              :options="opcoesCliente"
              placeholder-text="Vincule a um cliente"
              :show-placeholder-icon="true"
              icon-type="user"
              :default-selected="null"
              @option-selected="handleClienteSelected"
            />
          </div>

          <!-- Dropdown Processo -->
          <div class="field-group" style="position: relative; z-index: 1004;">
            <Dropdown
              :options="opcoesProcesso"
              placeholder-text="Todos os processos"
              :show-placeholder-icon="true"
              icon-type="balanca"
              :disabled="!clienteSelecionado"
              :default-selected="null"
              @option-selected="handleProcessoSelected"
            />
          </div>
        </div>

        <!-- Dropdown Tipo de Relatório -->
        <div class="field-group" style="position: relative; z-index: 1003;">
          <label class="field-label">Tipo de relatório</label>
          <Dropdown
            :options="opcoesTipoRelatorio"
            placeholder-text="Selecione o tipo"
            :show-placeholder-icon="true"
            icon-type="documento"
            :default-selected="opcoesTipoRelatorio[0]"
            @option-selected="handleTipoRelatorioSelected"
          />
        </div>

        <!-- Seções de Processo (Dinâmicas) -->
        <div class="processos-container">
          <div 
            v-for="(processoInfo, index) in processosParaRelatorio"
            :key="processoInfo.id"
            class="processo-section"
          >
            <!-- Campo Processo -->
            <div class="field-group">
              <label class="field-label">Processo</label>
              <input 
                type="text" 
                class="field-input"
                :value="processoInfo.cnpj"
                readonly
              />
            </div>

            <!-- Prognóstico -->
            <div class="prognostico-section">
              <label class="field-label">Prognóstico</label>
              
              <div class="prognostico-grid">
                <!-- Provável -->
                <div class="prognostico-field">
                  <label class="prognostico-label">Provável</label>
                  <input 
                    type="text" 
                    class="field-input currency-input"
                    v-model="processoInfo.prognostico.provavel"
                    @input="formatCurrency($event, processoInfo, 'provavel')"
                    @blur="calcularTotal(processoInfo)"
                    placeholder="R$ 100.000,00"
                  />
                </div>

                <!-- Possível -->
                <div class="prognostico-field">
                  <label class="prognostico-label">Possível</label>
                  <input 
                    type="text" 
                    class="field-input currency-input"
                    v-model="processoInfo.prognostico.possivel"
                    @input="formatCurrency($event, processoInfo, 'possivel')"
                    @blur="calcularTotal(processoInfo)"
                    placeholder="R$ 0,00"
                  />
                </div>

                <!-- Remota -->
                <div class="prognostico-field">
                  <label class="prognostico-label">Remota</label>
                  <input 
                    type="text" 
                    class="field-input currency-input"
                    v-model="processoInfo.prognostico.remota"
                    @input="formatCurrency($event, processoInfo, 'remota')"
                    @blur="calcularTotal(processoInfo)"
                    placeholder="R$ 0,00"
                  />
                </div>

                <!-- Total -->
                <div class="prognostico-field">
                  <label class="prognostico-label">Total</label>
                  <input 
                    type="text" 
                    class="field-input currency-input"
                    :value="processoInfo.prognostico.total"
                    readonly
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
            </div>

            <!-- Campo de Observação -->
            <div class="field-group">
              <label class="field-label">Observação</label>
              <textarea 
                class="field-textarea"
                v-model="processoInfo.observacao"
                placeholder="Faça uma uma observação se necessário"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Botões -->
        <div class="modal-buttons">
          <button class="cancel-btn" @click="cancelar">
            Cancelar
          </button>
          <button 
            class="emit-btn" 
            @click="emitir"
            :disabled="!podeEmitir"
          >
            Emitir
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
import pdfService from '@/services/pdfService'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fechar', 'relatorio-gerado', 'erro'])

// Estados
const clienteSelecionado = ref(null)
const processoSelecionado = ref(null)
const tipoRelatorioSelecionado = ref(null)
const processosParaRelatorio = ref([])
const gerando = ref(false)

// Opções dos dropdowns
const opcoesCliente = ref([])
const opcoesProcesso = ref([])
const opcoesTipoRelatorio = ref([
  { 
    id: 1, 
    label: 'Andamento processual tributário auditoria - Demandas ativas' 
  }
])

// Computed
const podeEmitir = computed(() => {
  return clienteSelecionado.value && 
         tipoRelatorioSelecionado.value && 
         processosParaRelatorio.value.length > 0
})

// Carregar dados
const carregarClientes = async () => {
  try {
    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError)
      return
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('id, nome')
      .eq('uuid', user.id)
      .order('nome')

    if (error) throw error

    opcoesCliente.value = data.map(cliente => ({
      id: cliente.id,
      label: cliente.nome,
      nome: cliente.nome
    }))
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

const carregarProcessos = async (clienteId) => {
  if (!clienteId) {
    opcoesProcesso.value = []
    return
  }
  
  try {
    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError)
      return
    }

    // Buscar processos pela tabela processo_cliente
    const { data: processosCliente, error } = await supabase
      .from('processo_cliente')
      .select(`
        processo_id,
        processos!inner(id, cnpj, autor, reu, nome, uuid)
      `)
      .eq('cliente_id', clienteId)
      .eq('processos.uuid', user.id)
    
    if (error) throw error
    
    if (!processosCliente || processosCliente.length === 0) {
      opcoesProcesso.value = []
      return
    }
    
    // Adicionar opção "Todos os processos"
    const opcoes = [
      { id: 'todos', label: 'Todos os processos' }
    ]
    
    // Mapear os processos individuais
    processosCliente.forEach(pc => {
      const processo = pc.processos
      const displayName = (processo.nome && processo.nome.trim() !== '') 
        ? processo.nome 
        : (processo.cnpj || `Processo ${processo.id}`)
      opcoes.push({
        id: processo.id,
        label: displayName,
        cnpj: processo.cnpj,
        processo: processo
      })
    })
    
    opcoesProcesso.value = opcoes
    
  } catch (error) {
    console.error('Erro ao carregar processos:', error)
    opcoesProcesso.value = []
  }
}

// Handlers dos dropdowns
const handleClienteSelected = (opcao) => {
  clienteSelecionado.value = opcao
  processoSelecionado.value = null
  processosParaRelatorio.value = []
  
  if (opcao && opcao.id) {
    carregarProcessos(opcao.id)
  } else {
    opcoesProcesso.value = []
  }
}

const handleProcessoSelected = (opcao) => {
  processoSelecionado.value = opcao
  atualizarProcessosParaRelatorio()
}

const handleTipoRelatorioSelected = (opcao) => {
  tipoRelatorioSelecionado.value = opcao
}

const atualizarProcessosParaRelatorio = () => {
  if (!processoSelecionado.value) {
    processosParaRelatorio.value = []
    return
  }

  if (processoSelecionado.value.id === 'todos') {
    // Todos os processos exceto o primeiro item que é "Todos os processos"
    const processosIndividuais = opcoesProcesso.value.slice(1)
    processosParaRelatorio.value = processosIndividuais.map(processo => ({
      id: processo.id,
      cnpj: processo.cnpj || `${processo.id}`,
      nome: processo.label,
      prognostico: {
        provavel: 'R$ 0,00',
        possivel: 'R$ 0,00',
        remota: 'R$ 0,00',
        total: 'R$ 0,00'
      },
      observacao: ''
    }))
  } else {
    // Processo específico
    const processo = processoSelecionado.value
    processosParaRelatorio.value = [{
      id: processo.id,
      cnpj: processo.cnpj || `${processo.id}`,
      nome: processo.label,
      prognostico: {
        provavel: 'R$ 0,00',
        possivel: 'R$ 0,00',
        remota: 'R$ 0,00',
        total: 'R$ 0,00'
      },
      observacao: ''
    }]
  }

  // Calcular totais iniciais
  processosParaRelatorio.value.forEach(processo => {
    calcularTotal(processo)
  })
}

// Formatação de moeda
const formatCurrency = (event, processoInfo, campo) => {
  const valor = event.target.value
  const valorNumerico = valor.replace(/[^\d]/g, '')
  
  if (valorNumerico === '') {
    processoInfo.prognostico[campo] = 'R$ 0,00'
    return
  }
  
  const valorFormatado = formatarMoeda(parseInt(valorNumerico))
  processoInfo.prognostico[campo] = valorFormatado
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(valor / 100)
}

const calcularTotal = (processoInfo) => {
  const provavel = parseFloat(processoInfo.prognostico.provavel.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  const possivel = parseFloat(processoInfo.prognostico.possivel.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  const remota = parseFloat(processoInfo.prognostico.remota.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  
  const total = provavel + possivel + remota
  processoInfo.prognostico.total = formatarMoeda(total * 100)
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
  if (confirm('Tem certeza que deseja cancelar? Os dados não serão salvos.')) {
    fechar()
  }
}

const limparFormulario = () => {
  clienteSelecionado.value = null
  processoSelecionado.value = null
  tipoRelatorioSelecionado.value = null
  processosParaRelatorio.value = []
}

const emitir = async () => {
  if (!podeEmitir.value) return
  
  try {
    gerando.value = true
    
    // Preparar dados do relatório
    const dadosRelatorio = {
      clienteSelecionado: clienteSelecionado.value,
      processoSelecionado: processoSelecionado.value,
      tipoRelatorio: tipoRelatorioSelecionado.value,
      processosParaRelatorio: processosParaRelatorio.value,
      dataGeracao: new Date().toISOString()
    }
    
    console.log('📄 Gerando relatório PDF:', dadosRelatorio)
    
    // Gerar relatório PDF
    await pdfService.gerarRelatorioPDF(dadosRelatorio)
    
    // Emitir evento de sucesso
    emit('relatorio-gerado', dadosRelatorio)
    fechar()
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    emit('erro', 'Erro ao gerar relatório: ' + error.message)
  } finally {
    gerando.value = false
  }
}

// Lifecycle
onMounted(() => {
  carregarClientes()
  // Definir tipo de relatório padrão
  tipoRelatorioSelecionado.value = opcoesTipoRelatorio.value[0]
})

// Watch para limpar form quando modal abrir
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    limparFormulario()
    carregarClientes()
    tipoRelatorioSelecionado.value = opcoesTipoRelatorio.value[0]
  }
})
</script>

<style scoped>
.relatorio-despesas-overlay {
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

.relatorio-despesas-modal {
  background: white;
  border-radius: 12px;
  width: 646px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
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

.close-button img {
  width: 24px;
  height: 24px;
}

.modal-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  flex: 1;
  position: relative;
  z-index: 1002;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #101828;
  margin: 0;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #344054;
  margin-bottom: 0.25rem;
}

.dropdown-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;
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

.field-input:read-only {
  background: #F9FAFB;
  color: #667085;
}

.field-input::placeholder {
  color: #667085;
}

.field-textarea {
  width: 100%;
  min-height: 88px;
  padding: 12px 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 14px;
  color: #101828;
  background: white;
  transition: border-color 0.2s ease;
  font-family: 'Inter', sans-serif;
  resize: vertical;
}

.field-textarea:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.field-textarea::placeholder {
  color: #667085;
}

.processos-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.processo-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #E4E7EC;
  border-radius: 8px;
  background: #F9FAFB;
}

.prognostico-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prognostico-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.prognostico-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prognostico-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #344054;
}

.currency-input {
  text-align: right;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E4E7EC;
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

.emit-btn {
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

.emit-btn:hover:not(:disabled) {
  background: #0356D6;
}

.emit-btn:disabled {
  background: #D0D5DD;
  cursor: not-allowed;
}

/* Responsivo */
@media (max-width: 768px) {
  .relatorio-despesas-modal {
    width: 95vw;
    max-height: 95vh;
  }
  
  .modal-content {
    padding: 1rem;
    gap: 1rem;
  }
  
  .dropdown-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .prognostico-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .modal-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .cancel-btn,
  .emit-btn {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .relatorio-despesas-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .prognostico-grid {
    grid-template-columns: 1fr;
  }
  
  .processo-section {
    padding: 0.75rem;
  }
}

.relatorio-despesas-overlay {
  z-index: 1000;
}

.relatorio-despesas-modal {
  z-index: 1001;
}

/* Garantir que dropdowns dentro do modal tenham z-index alto */
.relatorio-despesas-overlay .field-group :deep(.dropdown-options) {
  z-index: 1010 !important;
}

.relatorio-despesas-overlay :deep(.dropdown-options) {
  z-index: 1010 !important;
}

.relatorio-despesas-overlay :deep(.dropdown-container) {
  z-index: 1005 !important;
}

/* Z-index específico para cada dropdown por ordem de prioridade */
.field-group[style*="z-index: 1005"] :deep(.dropdown-options) {
  z-index: 1015 !important;
}

.field-group[style*="z-index: 1004"] :deep(.dropdown-options) {
  z-index: 1014 !important;
}

.field-group[style*="z-index: 1003"] :deep(.dropdown-options) {
  z-index: 1013 !important;
}

.field-group[style*="z-index: 1002"] :deep(.dropdown-options) {
  z-index: 1012 !important;
}

.field-group[style*="z-index: 1001"] :deep(.dropdown-options) {
  z-index: 1011 !important;
}

/* Garantir que as opções dos dropdowns apareçam corretamente */
.field-group :deep(.dropdown-options) {
  position: absolute !important;
  background: white !important;
  border: 1px solid #0468FA !important;
  border-top: none !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.field-group :deep(.dropdown-option) {
  background: white !important;
  border: none !important;
}

.field-group :deep(.dropdown-option:hover) {
  background: #f5f7fa !important;
}
</style> 