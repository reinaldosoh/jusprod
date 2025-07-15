<template>
  <div class="forms-recebiveis-container">
    <!-- Header com ícone e título -->
    <div class="header-section">
      <div class="header-content">
        <img src="/images/iconeRecebiveis.svg" alt="Recebíveis" class="header-icon">
        <h2 class="header-title">{{ 
          modo === 'visualizar' ? 'Visualizar Recebível' : 
          modo === 'editar' ? 'Editar Recebível' : 
          'Recebíveis' 
        }}</h2>
      </div>
      <button class="close-btn" @click="fecharForm">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Valor e Parcelamento -->
    <div class="valor-parcelamento-section">
      <div class="valor-label">
        <span class="label-text">Qual o valor?</span>
      </div>
      <div class="parcelamento-toggle">
        <span class="toggle-label">Parcelamento</span>
        <div 
          class="toggle-container" 
          @click="(modo === 'criar' || modo === 'editar') ? toggleParcelamento() : null"
          :class="{ disabled: modo === 'visualizar' }"
        >
          <div class="toggle-switch" :class="{ active: parcelamentoAtivo }">
            <div class="toggle-slider"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input de Valor -->
    <div class="input-section">
      <div class="input-container">
        <img src="/images/moeda.svg" alt="Valor" class="input-icon">
        <input 
          type="text" 
          v-model="valorFormatado" 
          @input="formatarValor"
          placeholder="R$ 0,00"
          class="input-field"
          :disabled="modo === 'visualizar'"
        >
      </div>
    </div>

    <!-- Dropdown de Clientes -->
    <div class="input-section dropdown-clientes-section">
      <div class="dropdown-container dropdown-clientes">
        <Dropdown 
          ref="dropdownClientes"
          :options="opcoesClientes"
          :default-selected="getClienteIndex()"
          placeholder-text="Selecione um cliente"
          :show-placeholder-icon="true"
          icon-type="user"
          @option-selected="selecionarCliente"
          :disabled="modo === 'visualizar'"
        />
      </div>

    </div>

    <!-- Selecione o processo -->
    <div class="processo-section dropdown-processos-section">
      <div class="processo-label">
        <span class="label-text">Selecione o processo</span>
      </div>
      <div class="dropdown-container dropdown-processos">
        <Dropdown 
          ref="dropdownProcessos"
          :options="opcoesProcessos"
          :default-selected="getProcessoIndex()"
          placeholder-text="Selecione um processo"
          :show-placeholder-icon="true"
          icon-type="balanca"
          :disabled="!clienteSelecionado || modo === 'visualizar'"
          @option-selected="selecionarProcesso"
        />
      </div>
    </div>

    <!-- Descrição -->
    <div class="descricao-section">
      <div class="descricao-label">
        <span class="label-text">Descrição</span>
      </div>
      <div class="input-container">
        <img src="/images/papel.svg" alt="Descrição" class="input-icon">
        <input 
          type="text" 
          v-model="descricao"
          placeholder="Faça uma breve descrição"
          class="input-field"
          :disabled="modo === 'visualizar'"
        >
      </div>
    </div>

    <!-- Quantas vezes (só visível quando parcelamento ativo) -->
    <div v-if="parcelamentoAtivo" class="quantas-vezes-section">
      <div class="quantas-vezes-label">
        <span class="label-text">Quantas vezes</span>
      </div>
      <div class="dropdown-container">
        <Dropdown 
          ref="dropdownParcelas"
          :options="opcoesQuantidadeParcelas"
          :default-selected="getParcelaIndex()"
          placeholder-text="1x"
          @option-selected="selecionarQuantidadeParcelas"
          :disabled="modo === 'visualizar'"
        />
      </div>
    </div>

    <!-- Data do primeiro recebimento -->
    <div class="data-section">
      <div class="data-label">
        <span class="label-text">Data do primeiro recebimento</span>
      </div>
      <div class="input-container date-input-container">
        <img src="/images/calendarioMarcado.svg" alt="Data" class="input-icon" @click="abrirCalendario">
        <input 
          type="date" 
          v-model="dataPrimeiroRecebimento"
          class="input-field date-input"
          ref="dateInput"
          :disabled="modo === 'visualizar'"
        >
      </div>
    </div>

    <!-- Lista de parcelas (só visível quando parcelamento ativo) -->
    <div v-if="parcelamentoAtivo && parcelas.length > 0" class="parcelas-section">
      <div 
        v-for="(parcela, index) in parcelas" 
        :key="index"
        class="parcela-item"
      >
        <span class="parcela-numero">{{ parcela.numero }}-</span>
        <span class="parcela-valor">{{ formatarMoeda(parcela.valor) }}</span>
        <span class="parcela-data">{{ parcela.data }}</span>
      </div>
    </div>

    <!-- Anexar documento -->
    <div class="anexar-section">
      <div v-if="modo === 'criar' || modo === 'editar'" class="anexar-content" @click="selecionarArquivo">
        <img src="/images/anexar.svg" alt="Anexar" class="anexar-icon">
        <span class="anexar-text">Anexar documento</span>
      </div>
      <input 
        ref="fileInput"
        type="file" 
        @change="anexarArquivo"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        style="display: none;"
        :disabled="modo === 'visualizar'"
      />
      <div v-if="arquivoAnexado" class="arquivo-anexado">
        <div class="arquivo-info">
          <img :src="getFileIcon(arquivoAnexado.tipo)" :alt="arquivoAnexado.tipo" class="arquivo-icon">
          <span class="arquivo-nome">{{ arquivoAnexado.nome }}</span>
          <span class="arquivo-tamanho">{{ formatarTamanho(arquivoAnexado.tamanho) }}</span>
        </div>
        <button 
          v-if="modo === 'criar' || modo === 'editar'" 
          class="remover-arquivo" 
          @click="removerArquivo"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="#F04438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button 
          v-if="modo === 'visualizar'" 
          class="download-arquivo" 
          @click="baixarArquivo"
          title="Baixar arquivo"
        >
          <img src="/images/download.svg" alt="Download" class="download-icon">
        </button>
      </div>
    </div>

    <!-- Botões -->
    <div class="botoes-section">
      <Button 
        v-if="modo === 'criar' || modo === 'editar'" 
        label="Cancelar" 
        type="outline" 
        @click="cancelarForm"
        class="botao-cancelar"
        :disabled="salvando"
      />
      <Button 
        v-if="modo === 'criar' || modo === 'editar'" 
        :label="salvando ? (modo === 'editar' ? 'Atualizando...' : 'Salvando...') : (modo === 'editar' ? 'Atualizar' : 'Salvar')"
        type="primary" 
        @click="salvarForm"
        class="botao-salvar"
        :disabled="salvando"
      />
      <Button 
        v-if="modo === 'visualizar'" 
        label="Fechar" 
        type="primary" 
        @click="fecharForm"
        class="botao-fechar"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import Dropdown from '../../components/UI/Dropdown.vue'
import Button from '../../components/UI/Button.vue'
import { alertaService } from '../../services/alertaService.js'

// Store de autenticação
const authStore = useAuthStore()

// Emits
const emit = defineEmits(['fechar', 'salvar', 'recarregar', 'mostrar-alerta-sucesso', 'mostrar-alerta-erro'])

// Props
const props = defineProps({
  modo: {
    type: String,
    default: 'criar', // 'criar', 'editar' ou 'visualizar'
    validator: (value) => ['criar', 'editar', 'visualizar'].includes(value)
  },
  dadosRecebivel: {
    type: Object,
    default: null
  }
})

// Estados reativos
const parcelamentoAtivo = ref(false)
const valorFormatado = ref('')
const valorNumerico = ref(0)
const clienteSelecionado = ref(null)
const processoSelecionado = ref(null)
const descricao = ref('')
const quantidadeParcelas = ref(1)
const dataPrimeiroRecebimento = ref('')
const arquivoAnexado = ref(null)
const dateInput = ref(null)
const fileInput = ref(null)
const recebivelEditandoId = ref(null)

// Estados para dados do banco
const clientes = ref([])
const processos = ref([])
const carregandoClientes = ref(false)
const carregandoProcessos = ref(false)
const salvando = ref(false)
const ultimoSalvamento = ref(null)

// Opções para dropdowns (computadas baseadas nos dados reais)
const opcoesClientes = computed(() => {
  if (carregandoClientes.value) {
    return [{ id: null, label: 'Carregando clientes...' }]
  }
  
  if (clientes.value.length === 0) {
    return [{ id: null, label: 'Selecione um cliente' }]
  }
  
  return clientes.value.map(cliente => ({
    id: cliente.id,
    label: cliente.nome_razao_social || cliente.nome || 'Cliente sem nome'
  }))
})

const opcoesProcessos = computed(() => {
  if (!clienteSelecionado.value) {
    return [{ id: null, label: 'Selecione um processo' }]
  }
  
  if (carregandoProcessos.value) {
    return [{ id: null, label: 'Carregando processos...' }]
  }
  
  const opcoes = []
  processos.value.forEach(processo => {
    // Priorizar nome, se não tiver usar cnpj
    const displayName = (processo.nome && processo.nome.trim() !== '') ? processo.nome : (processo.cnpj || `Processo ${processo.id}`)
    opcoes.push({
      id: processo.id,
      label: displayName
    })
  })
  
  // Se não há processos, retornar array vazio para não mostrar dropdown
  if (opcoes.length === 0) {
    return [{ id: null, label: 'Nenhum processo encontrado' }]
  }
  
  return opcoes
})

const opcoesQuantidadeParcelas = ref((() => {
  const opcoes = []
  for (let i = 1; i <= 72; i++) {
    opcoes.push({ id: i, label: `${i}x` })
  }
  return opcoes
})())

// Função para carregar clientes
const carregarClientes = async () => {
  try {
    carregandoClientes.value = true
    
    const { supabase } = await import('../../lib/supabase.js')
    
    const { data, error } = await supabase
      .from('clientes')
      .select('id, nome, nome_fantasia')
      .order('nome')
    
    if (error) throw error
    
    // Mapear nome_razao_social usando nome ou nome_fantasia
    clientes.value = (data || []).map(cliente => ({
      ...cliente,
      nome_razao_social: cliente.nome || cliente.nome_fantasia || 'Cliente sem nome'
    }))
    
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    clientes.value = []
  } finally {
    carregandoClientes.value = false
  }
}

// Função para carregar processos por cliente
const carregarProcessos = async (clienteId) => {
  if (!clienteId) {
    processos.value = []
    return
  }
  
  try {
    carregandoProcessos.value = true
    const { supabase } = await import('../../lib/supabase.js')
    
    // Buscar processos pela tabela processo_cliente (seguindo padrão do configurarModelo.vue)
    const { data: processosCliente, error } = await supabase
      .from('processo_cliente')
      .select(`
        processo_id,
        processos!inner(id, cnpj, autor, reu, nome)
      `)
      .eq('cliente_id', clienteId)
    
    if (error) throw error
    
    if (!processosCliente || processosCliente.length === 0) {
      processos.value = []
      return
    }
    
    // Mapear os processos para o formato esperado
    processos.value = processosCliente.map(pc => {
      const processo = pc.processos
      return {
        id: processo.id,
        numerocnj: processo.cnpj,
        titulo: processo.autor,
        nome: processo.nome,
        cnj: processo.cnpj,
        ...processo
      }
    })
    
  } catch (error) {
    console.error('Erro ao carregar processos:', error)
    processos.value = []
  } finally {
    carregandoProcessos.value = false
  }
}

// Estado para parcelas carregadas do banco (visualização)
const parcelasVisualizacao = ref([])

// Computed para calcular parcelas
const parcelas = computed(() => {
  // No modo visualizar, usar as parcelas carregadas do banco
  if (props.modo === 'visualizar') {
    return parcelasVisualizacao.value
  }
  
  if (!parcelamentoAtivo.value || !valorNumerico.value || !dataPrimeiroRecebimento.value || quantidadeParcelas.value < 1) {
    return []
  }

  const parcelas = []
  const valorParcela = valorNumerico.value / quantidadeParcelas.value
  
  // Extrair ano, mês e dia da string para evitar problemas de fuso horário
  const [ano, mes, dia] = dataPrimeiroRecebimento.value.split('-').map(Number)

  // Incluir todas as parcelas (primeira + demais)
  for (let i = 0; i < quantidadeParcelas.value; i++) {
    // Criar nova data usando ano, mês e dia específicos
    const dataParcela = new Date(ano, mes - 1 + i, dia) // mes-1 porque Date usa 0-based para meses
    
    const parcela = {
      numero: i + 1,
      valor: valorParcela,
      data: dataParcela.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      dataVencimento: `${ano}-${String(mes + i).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    }
    
    parcelas.push(parcela)
  }

  return parcelas
})

// Métodos
const toggleParcelamento = () => {
  parcelamentoAtivo.value = !parcelamentoAtivo.value
}

const formatarValor = (event) => {
  let valor = event.target.value.replace(/\D/g, '')
  
  if (valor === '') {
    valorFormatado.value = ''
    valorNumerico.value = 0
    return
  }
  
  const valorNumericoCalculado = parseFloat(valor) / 100
  valorNumerico.value = valorNumericoCalculado
  
  valorFormatado.value = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valorNumericoCalculado)
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

// Função para formatação de data para exibição
const formatarDataParaExibicao = (dataString) => {
  if (!dataString) return ''
  
  try {
    const data = new Date(dataString + 'T00:00:00')
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return dataString
  }
}

const selecionarCliente = (cliente) => {
  clienteSelecionado.value = cliente
  processoSelecionado.value = null // Reset processo quando cliente muda
  
  if (cliente && cliente.id) {
    carregarProcessos(cliente.id)
  } else {
    processos.value = []
  }
}

const selecionarProcesso = (processo) => {
  processoSelecionado.value = processo
}

const selecionarQuantidadeParcelas = (opcao) => {
  quantidadeParcelas.value = parseInt(opcao.label.replace('x', ''))
}

const abrirCalendario = () => {
  if (dateInput.value) {
    try {
      dateInput.value.showPicker()
    } catch (error) {
      // Fallback para browsers que não suportam showPicker()
      dateInput.value.focus()
      dateInput.value.click()
    }
  }
}

const selecionarArquivo = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const anexarArquivo = (event) => {
  const arquivo = event.target.files[0]
  if (arquivo) {
          // Validar tamanho do arquivo (máximo 10MB)
      if (arquivo.size > 10 * 1024 * 1024) {
        console.log('❌ Emitindo erro: Arquivo muito grande')
        emit('mostrar-alerta-erro', 'Arquivo muito grande. O tamanho máximo é 10MB.')
        return
      }
    
    arquivoAnexado.value = {
      nome: arquivo.name,
      tamanho: arquivo.size,
      tipo: arquivo.type,
      arquivo: arquivo
    }
  }
}

const removerArquivo = () => {
  arquivoAnexado.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatarTamanho = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (tipo) => {
  return '/images/anexar.svg'
}

const fecharForm = () => {
  if (props.modo === 'criar') {
    resetarForm()
  }
  emit('fechar')
}

const cancelarForm = () => {
  if (props.modo === 'criar') {
    resetarForm()
  }
  emit('fechar')
}

// Função para verificar duplicatas
const verificarDuplicata = async (supabase, user) => {
  try {
    const { data: recebivelExistente, error } = await supabase
      .from('recebiveis')
      .select('id')
      .eq('uuid', user.id)
      .eq('cliente_id', clienteSelecionado.value?.id || null)
      .eq('processo_id', processoSelecionado.value?.id || null)
      .eq('valor_total', valorNumerico.value)
      .eq('descricao', descricao.value.trim())
      .eq('data_lancamento', dataPrimeiroRecebimento.value)
      .gte('created_at', new Date(Date.now() - 5000).toISOString()) // Últimos 5 segundos
    
    if (error) throw error
    
    if (recebivelExistente && recebivelExistente.length > 0) {
      console.log('Recebível duplicado encontrado:', recebivelExistente[0].id)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Erro ao verificar duplicata:', error)
    return false
  }
}

// Função para resetar o formulário
const resetarForm = () => {
  // Não resetar no modo visualização ou edição
  if (props.modo === 'visualizar' || props.modo === 'editar') {
    return
  }
  
  // Verificar se já foi resetado recentemente
  if (ultimoSalvamento.value === null) {
    console.log('Formulário já resetado, pulando...')
    return
  }
  
  console.log('Resetando formulário...')
  
  parcelamentoAtivo.value = false
  valorFormatado.value = ''
  valorNumerico.value = 0
  clienteSelecionado.value = null
  processoSelecionado.value = null
  descricao.value = ''
  quantidadeParcelas.value = 1
  dataPrimeiroRecebimento.value = ''
  arquivoAnexado.value = null
  processos.value = []
  ultimoSalvamento.value = null
  recebivelEditandoId.value = null
  parcelasVisualizacao.value = []
  
  // Limpar alertas (resetar estados no pai)
  // Alertas são agora gerenciados pelo componente pai
  
  // Limpar input de arquivo
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  console.log('Formulário resetado com sucesso')
}

// Função para fazer upload do arquivo para o Supabase Storage
const uploadArquivo = async (arquivo) => {
  if (!arquivo) return null
  
  try {
    const { supabase } = await import('../../lib/supabase.js')
    
    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const extensao = arquivo.name.split('.').pop()
    const nomeUnico = `recebiveis/${timestamp}_${arquivo.name}`
    
    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(nomeUnico, arquivo)
    
    if (error) throw error
    
    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('documentos')
      .getPublicUrl(nomeUnico)
    
    return {
      nome: arquivo.name,
      url: urlData.publicUrl,
      tamanho: arquivo.size,
      tipo: arquivo.type
    }
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error)
    throw error
  }
}

const salvarForm = async () => {
  console.log('Iniciando salvamento do formulário...')
  
  // Proteção contra múltiplas submissões
  if (salvando.value) {
    console.log('Salvamento já em andamento, ignorando nova tentativa')
    return
  }
  
  // Criar ID único para este salvamento
  const salvamentoId = Date.now()
  
  // Verificar se não foi salvo recentemente (menos de 2 segundos)
  if (ultimoSalvamento.value && (salvamentoId - ultimoSalvamento.value) < 2000) {
    console.log('Salvamento muito recente, ignorando nova tentativa')
    return
  }
  
  const { supabase } = await import('../../lib/supabase.js')
  
  // Obter usuário autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.log('❌ Emitindo erro: Usuário não autenticado')
    emit('mostrar-alerta-erro', 'Usuário não autenticado. Faça login novamente.')
    return
  }
  
  // Validações básicas
  if (!valorNumerico.value || valorNumerico.value <= 0) {
    console.log('❌ Emitindo erro: Valor inválido')
    emit('mostrar-alerta-erro', 'Por favor, informe um valor válido.')
    return
  }
  
  if (!dataPrimeiroRecebimento.value) {
    console.log('❌ Emitindo erro: Data não informada')
    emit('mostrar-alerta-erro', 'Por favor, selecione a data do primeiro recebimento.')
    return
  }
  
  if (!descricao.value || descricao.value.trim() === '') {
    console.log('❌ Emitindo erro: Descrição vazia')
    emit('mostrar-alerta-erro', 'Por favor, informe uma descrição.')
    return
  }
  
  try {
    salvando.value = true
    ultimoSalvamento.value = salvamentoId
    
    console.log('Iniciando salvamento com ID:', salvamentoId)
    
    // Verificar duplicatas apenas no modo criar
    if (props.modo === 'criar') {
      const isDuplicata = await verificarDuplicata(supabase, user)
      if (isDuplicata) {
        console.log('Recebível duplicado detectado, cancelando salvamento')
        console.log('❌ Emitindo erro: Recebível duplicado')
        emit('mostrar-alerta-erro', 'Este recebível já foi salvo recentemente.')
        return
      }
    }
    
    // Usar RPC para salvamento transacional
    const dadosCompletos = {
      // Dados do recebível principal
      uuid: user.id,
      cliente_id: clienteSelecionado.value?.id || null,
      processo_id: processoSelecionado.value?.id || null,
      valor_total: valorNumerico.value,
      descricao: descricao.value.trim(),
      data_lancamento: dataPrimeiroRecebimento.value,
      quantidade_parcelas: parcelamentoAtivo.value ? quantidadeParcelas.value : 1,
      ativo: true,
      // Dados das parcelas
      parcelas: []
    }
    
    // Preparar dados das parcelas
    if (parcelamentoAtivo.value && parcelas.value.length > 0) {
      dadosCompletos.parcelas = parcelas.value.map(parcela => ({
        numero_parcela: parcela.numero,
        valor_parcela: parcela.valor,
        data_vencimento: parcela.dataVencimento,
        pago: false,
        uuid: user.id
      }))
    } else {
      // Se não é parcelado, criar uma única parcela
      dadosCompletos.parcelas = [{
        numero_parcela: 1,
        valor_parcela: valorNumerico.value,
        data_vencimento: dataPrimeiroRecebimento.value,
        pago: false,
        uuid: user.id
      }]
    }
    
    let recebivelId
    
    if (props.modo === 'editar' && recebivelEditandoId.value) {
      // MODO EDITAR - Atualizar recebível existente
      console.log('Atualizando recebível existente ID:', recebivelEditandoId.value)
      
      const { error: recebivelError } = await supabase
        .from('recebiveis')
        .update({
          cliente_id: dadosCompletos.cliente_id,
          processo_id: dadosCompletos.processo_id,
          valor_total: dadosCompletos.valor_total,
          descricao: dadosCompletos.descricao,
          data_lancamento: dadosCompletos.data_lancamento,
          quantidade_parcelas: dadosCompletos.quantidade_parcelas
        })
        .eq('id', recebivelEditandoId.value)
        .eq('uuid', user.id)
      
      if (recebivelError) {
        console.error('Erro ao atualizar recebível:', recebivelError)
        throw recebivelError
      }
      
      recebivelId = recebivelEditandoId.value
      console.log('Recebível atualizado com ID:', recebivelId)
      
    } else {
      // MODO CRIAR - Inserir novo recebível
      console.log('Salvando recebível principal...')
      
      const { data: recebivelData, error: recebivelError } = await supabase
        .from('recebiveis')
        .insert([{
          uuid: dadosCompletos.uuid,
          cliente_id: dadosCompletos.cliente_id,
          processo_id: dadosCompletos.processo_id,
          valor_total: dadosCompletos.valor_total,
          descricao: dadosCompletos.descricao,
          data_lancamento: dadosCompletos.data_lancamento,
          quantidade_parcelas: dadosCompletos.quantidade_parcelas,
          ativo: dadosCompletos.ativo
        }])
        .select()
        .single()
      
      if (recebivelError) {
        console.error('Erro ao salvar recebível:', recebivelError)
        throw recebivelError
      }
      
      recebivelId = recebivelData.id
      console.log('Recebível salvo com ID:', recebivelId)
    }
    
    if (props.modo === 'editar') {
      // MODO EDITAR - Deletar parcelas existentes e inserir novas
      console.log('Deletando parcelas existentes para atualização...')
      
      const { error: deleteError } = await supabase
        .from('recebiveis_parcelas')
        .delete()
        .eq('recebivel_id', recebivelId)
        .eq('uuid', user.id)
      
      if (deleteError) {
        console.error('Erro ao deletar parcelas existentes:', deleteError)
        throw deleteError
      }
      
      console.log('Parcelas existentes deletadas, inserindo novas...')
      
      // Inserir novas parcelas
      for (const parcela of dadosCompletos.parcelas) {
        const { error: parcelaError } = await supabase
          .from('recebiveis_parcelas')
          .insert([{
            recebivel_id: recebivelId,
            numero_parcela: parcela.numero_parcela,
            valor_parcela: parcela.valor_parcela,
            data_vencimento: parcela.data_vencimento,
            pago: parcela.pago,
            uuid: parcela.uuid
          }])
        
        if (parcelaError) {
          console.error('Erro ao salvar nova parcela:', parcelaError)
          throw parcelaError
        }
      }
      
      console.log('Novas parcelas salvas com sucesso')
      
    } else {
      // MODO CRIAR - Verificar se parcelas já existem (proteção adicional)
      const { data: parcelasExistentes, error: checkError } = await supabase
        .from('recebiveis_parcelas')
        .select('numero_parcela')
        .eq('recebivel_id', recebivelId)
      
      if (checkError) throw checkError
      
      if (parcelasExistentes && parcelasExistentes.length > 0) {
        console.log('Parcelas já existem para este recebível, pulando inserção')
      } else {
        console.log('Salvando parcelas...')
        
        // Salvar parcelas uma por uma para melhor controle
        for (const parcela of dadosCompletos.parcelas) {
          const { error: parcelaError } = await supabase
            .from('recebiveis_parcelas')
            .insert([{
              recebivel_id: recebivelId,
              numero_parcela: parcela.numero_parcela,
              valor_parcela: parcela.valor_parcela,
              data_vencimento: parcela.data_vencimento,
              pago: parcela.pago,
              uuid: parcela.uuid
            }])
          
          if (parcelaError) {
            console.error('Erro ao salvar parcela:', parcelaError)
            throw parcelaError
          }
        }
        
        console.log('Parcelas salvas com sucesso')
      }
    }
    
    // 3. Salvar documento se anexado
    if (arquivoAnexado.value) {
      console.log('Salvando documento...')
      
      try {
        const arquivoUploadado = await uploadArquivo(arquivoAnexado.value.arquivo)
        
        if (arquivoUploadado) {
          const { error: documentoError } = await supabase
            .from('recebiveis_documentos')
            .insert([{
              recebivel_id: recebivelId,
              nome: arquivoUploadado.nome,
              url: arquivoUploadado.url,
              uuid: user.id
            }])
          
          if (documentoError) {
            console.error('Erro ao salvar documento:', documentoError)
            throw documentoError
          }
          
          console.log('Documento salvo com sucesso')
        }
              } catch (uploadError) {
          console.error('Erro ao fazer upload do documento:', uploadError)
          // Não bloquear o salvamento se houver erro no upload
          // Emitir alerta de sucesso com aviso ANTES de fechar o formulário
          const mensagemSucessoComAviso = `Recebível ${props.modo === 'editar' ? 'atualizado' : 'salvo'} com sucesso, mas houve erro ao anexar o documento.`
          console.log('🎉 Emitindo evento de sucesso com aviso:', mensagemSucessoComAviso)
          emit('mostrar-alerta-sucesso', mensagemSucessoComAviso)
          
          // Fechar formulário
          resetarForm() // Limpar formulário após salvamento
          emit('salvar')
          emit('recarregar')
          emit('fechar')
          return // Parar execução aqui
        }
    }
    
    // Sucesso
    console.log(`${props.modo === 'editar' ? 'Atualização' : 'Salvamento'} concluído com sucesso!`)
    
    // Criar alertas automáticos (apenas para novos recebíveis, não para edições)
    if (props.modo === 'criar') {
      try {
        console.log('💰 Criando alertas para o novo recebível...')
        
        // Buscar dados do cliente e processo para o alerta
        const clienteData = clienteSelecionado.value
        const processoData = processoSelecionado.value
        
        // Criar dados do recebível para o alerta
        const recebivelDataCompleto = {
          id: recebivelId,
          descricao: descricao.value.trim(),
          valor_total: valorNumerico.value,
          data_lancamento: dataPrimeiroRecebimento.value,
          quantidade_parcelas: quantidadeParcelas.value
        }
        
        if (parcelamentoAtivo.value && dadosCompletos.parcelas.length > 0) {
          // Criar alertas para cada parcela
          await alertaService.criarAlertasParcelas(
            recebivelDataCompleto,
            dadosCompletos.parcelas,
            { uuid: user.id, id: user.id },
            clienteData,
            processoData
          )
        } else {
          // Criar alerta único para recebível não parcelado
          await alertaService.criarAlertaRecebivel(
            recebivelDataCompleto,
            { uuid: user.id, id: user.id },
            clienteData,
            processoData
          )
        }
        
        console.log('✅ Alertas criados com sucesso para o recebível')
      } catch (alertaError) {
        console.error('❌ Erro ao criar alertas para recebível:', alertaError)
        // Não bloquear o salvamento se houver erro no alerta
      }
    }
    
    // Emitir alerta de sucesso ANTES de fechar o formulário
    const mensagemSucesso = `Recebível ${props.modo === 'editar' ? 'atualizado' : 'salvo'} com sucesso!`
    console.log('🎉 Emitindo evento de sucesso:', mensagemSucesso)
    emit('mostrar-alerta-sucesso', mensagemSucesso)
    
    // Fechar formulário
    resetarForm() // Limpar formulário após salvamento
    emit('salvar')
    emit('recarregar')
    emit('fechar')
    
  } catch (error) {
    console.error('Erro ao salvar recebível:', error)
    
            // Tentar limpar registros órfãos se houver erro apenas no modo criar
        if (props.modo === 'criar' && error.code === '23505' && error.message.includes('recebiveis_parcelas')) {
          console.log('Tentando limpar registros órfãos...')
          
          try {
            // Buscar recebíveis sem parcelas
            const { data: recebivelsSemParcelas, error: searchError } = await supabase
              .from('recebiveis')
              .select(`
                id,
                recebiveis_parcelas(id)
              `)
              .eq('uuid', user.id)
              .order('created_at', { ascending: false })
              .limit(5)
            
            if (searchError) throw searchError
            
            // Limpar recebíveis que não têm parcelas
            for (const recebivel of recebivelsSemParcelas || []) {
              if (!recebivel.recebiveis_parcelas || recebivel.recebiveis_parcelas.length === 0) {
                console.log('Removendo recebível órfão:', recebivel.id)
                await supabase
                  .from('recebiveis')
                  .delete()
                  .eq('id', recebivel.id)
              }
            }
            
            console.log('Limpeza concluída')
            
          } catch (cleanError) {
            console.error('Erro ao limpar registros órfãos:', cleanError)
          }
        }
        
        const mensagemErroSalvar = `Erro ao ${props.modo === 'editar' ? 'atualizar' : 'salvar'} recebível. Tente novamente.`
        console.log('❌ Emitindo erro no catch:', mensagemErroSalvar)
        emit('mostrar-alerta-erro', mensagemErroSalvar)
    
    // Resetar controle de salvamento em caso de erro
    ultimoSalvamento.value = null
  } finally {
    salvando.value = false
  }
}

// Função para carregar dados do recebível no modo visualização
const carregarDadosRecebivel = async () => {
  if ((props.modo !== 'visualizar' && props.modo !== 'editar') || !props.dadosRecebivel) {
    return
  }
  
  try {
    const recebivel = props.dadosRecebivel
    console.log('Carregando dados do recebível para visualização:', recebivel)
    
    // Primeiro carregar todos os clientes
    await carregarClientes()
    
    // Buscar dados completos do recebível principal se for uma parcela
    let dadosCompletos = recebivel
    if (recebivel.recebivel_id) {
      dadosCompletos = await carregarDadosCompletosParcela(recebivel.recebivel_id)
      recebivelEditandoId.value = recebivel.recebivel_id // Armazenar ID para edição
    } else {
      recebivelEditandoId.value = recebivel.id // ID direto do recebível
    }
    
    // Carregar dados básicos (usar dados completos se disponível)
    valorNumerico.value = dadosCompletos.valor_total || recebivel.valor || 0
    valorFormatado.value = formatarMoeda(valorNumerico.value)
    descricao.value = dadosCompletos.descricao || recebivel.descricao || ''
    dataPrimeiroRecebimento.value = dadosCompletos.data_lancamento || recebivel.data_vencimento || ''
    
    // Verificar se é parcelado usando dados completos
    if (dadosCompletos.quantidade_parcelas && dadosCompletos.quantidade_parcelas > 1) {
      parcelamentoAtivo.value = true
      quantidadeParcelas.value = dadosCompletos.quantidade_parcelas
      // Gerar lista de parcelas para visualização (tanto visualizar quanto editar)
      if (props.modo === 'visualizar' || props.modo === 'editar') {
        await gerarParcelasVisualizacao(dadosCompletos)
      }
    } else if (recebivel.parcela_numero && recebivel.parcela_numero > 1) {
      parcelamentoAtivo.value = true
      quantidadeParcelas.value = recebivel.parcela_numero
    }
    
    // Carregar e selecionar cliente
    if (dadosCompletos.cliente_id || recebivel.cliente_nome) {
      let cliente = null
      
      // Primeiro tentar pelo ID se disponível
      if (dadosCompletos.cliente_id) {
        cliente = clientes.value.find(c => c.id === dadosCompletos.cliente_id)
      }
      
      // Se não encontrou por ID, tentar pelo nome
      if (!cliente && recebivel.cliente_nome) {
        cliente = clientes.value.find(c => 
          (c.nome && c.nome === recebivel.cliente_nome) ||
          (c.nome_fantasia && c.nome_fantasia === recebivel.cliente_nome) ||
          (c.nome_razao_social && c.nome_razao_social === recebivel.cliente_nome)
        )
      }
      
      if (cliente) {
        clienteSelecionado.value = cliente
        console.log('Cliente selecionado:', cliente)
        
        // Carregar processos deste cliente
        await carregarProcessos(cliente.id)
        
        // Aguardar um pouco para garantir que os processos foram carregados
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Selecionar processo se tiver
        if (dadosCompletos.processo_id) {
          console.log('Procurando processo com ID:', dadosCompletos.processo_id)
          console.log('Processos disponíveis:', processos.value)
          
          const processo = processos.value.find(p => p.id === dadosCompletos.processo_id)
          if (processo) {
            processoSelecionado.value = processo
            console.log('Processo selecionado:', processo)
          } else {
            console.warn('Processo não encontrado com ID:', dadosCompletos.processo_id)
            // Buscar processo diretamente no banco se não foi encontrado na lista
            const processoDb = await buscarProcessoPorId(dadosCompletos.processo_id)
            if (processoDb) {
              processoSelecionado.value = processoDb
              console.log('Processo encontrado no banco:', processoDb)
            }
          }
        }
      } else {
        // Criar cliente temporário com o nome
        clienteSelecionado.value = {
          id: dadosCompletos.cliente_id || null,
          nome_razao_social: recebivel.cliente_nome,
          label: recebivel.cliente_nome
        }
        console.log('Cliente temporário criado:', clienteSelecionado.value)
      }
    }
    
    // Carregar documento anexado se existir
    await carregarDocumentoRecebivel(recebivel.recebivel_id || recebivel.id)
    
    // Aguardar o próximo tick para garantir que o DOM foi atualizado
    await nextTick()
    
    // Forçar atualização dos dropdowns manualmente
    forcarAtualizacaoDropdowns()
    
  } catch (error) {
    console.error('Erro ao carregar dados do recebível:', error)
  }
}

// Função para carregar dados completos de uma parcela específica
const carregarDadosCompletosParcela = async (recebivelId) => {
  if (!recebivelId) return null
  
  try {
    const { supabase } = await import('../../lib/supabase.js')
    
    // Buscar dados completos do recebível
    const { data: recebivelCompleto, error } = await supabase
      .from('recebiveis')
      .select(`
        id,
        processo_id,
        quantidade_parcelas,
        valor_total,
        data_lancamento,
        descricao,
        cliente_id,
        clientes (
          id,
          nome,
          nome_fantasia
        )
      `)
      .eq('id', recebivelId)
      .single()
    
    if (error) throw error
    
    if (recebivelCompleto) {
      console.log('Dados completos do recebível carregados:', recebivelCompleto)
      return recebivelCompleto
    }
    
    return null
    
  } catch (error) {
    console.error('Erro ao carregar dados completos da parcela:', error)
    return null
  }
}

// Função para carregar documento do recebível
const carregarDocumentoRecebivel = async (recebivelId) => {
  if (!recebivelId) return
  
  try {
    const { supabase } = await import('../../lib/supabase.js')
    
    const { data, error } = await supabase
      .from('recebiveis_documentos')
      .select('*')
      .eq('recebivel_id', recebivelId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
      throw error
    }
    
    if (data) {
      arquivoAnexado.value = {
        nome: data.nome,
        url: data.url,
        tamanho: 0, // Não temos o tamanho salvo
        tipo: 'application/pdf' // Tipo padrão
      }
    }
  } catch (error) {
    console.error('Erro ao carregar documento:', error)
  }
}

// Função para baixar arquivo
const baixarArquivo = () => {
  if (arquivoAnexado.value && arquivoAnexado.value.url) {
    // Criar link temporário para download
    const link = document.createElement('a')
    link.href = arquivoAnexado.value.url
    link.download = arquivoAnexado.value.nome || 'documento'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}



// Funções para obter índices corretos nos dropdowns
const getClienteIndex = () => {
  if (!clienteSelecionado.value) return null
  return opcoesClientes.value.findIndex(option => option.id === clienteSelecionado.value.id)
}

const getProcessoIndex = () => {
  if (!processoSelecionado.value) return null
  return opcoesProcessos.value.findIndex(option => option.id === processoSelecionado.value.id)
}

const getParcelaIndex = () => {
  if (!quantidadeParcelas.value) return 0
  return opcoesQuantidadeParcelas.value.findIndex(option => option.id === quantidadeParcelas.value)
}

// Função para gerar lista de parcelas para visualização
const gerarParcelasVisualizacao = async (dadosCompletos) => {
  try {
    const { supabase } = await import('../../lib/supabase.js')
    
    // Buscar parcelas do recebível
    const { data: parcelasDb, error } = await supabase
      .from('recebiveis_parcelas')
      .select('*')
      .eq('recebivel_id', dadosCompletos.id)
      .order('data_vencimento')
    
    if (error) throw error
    
    if (parcelasDb && parcelasDb.length > 0) {
      parcelasVisualizacao.value = parcelasDb.map(parcela => ({
        numero: `${parcela.numero_parcela}`,
        valor: parcela.valor_parcela,
        data: formatarDataParaExibicao(parcela.data_vencimento)
      }))
    } else {
      // Se não encontrar parcelas no DB, gerar baseado nos dados básicos
      const valorParcela = dadosCompletos.valor_total / dadosCompletos.quantidade_parcelas
      const dataInicial = new Date(dadosCompletos.data_lancamento)
      
      parcelasVisualizacao.value = []
      for (let i = 0; i < dadosCompletos.quantidade_parcelas; i++) {
        const dataParcela = new Date(dataInicial)
        dataParcela.setMonth(dataParcela.getMonth() + i)
        
        parcelasVisualizacao.value.push({
          numero: `${i + 1}`,
          valor: valorParcela,
          data: formatarDataParaExibicao(dataParcela.toISOString().split('T')[0])
        })
      }
    }
    
    console.log('Parcelas geradas para visualização:', parcelasVisualizacao.value)
    
  } catch (error) {
    console.error('Erro ao gerar parcelas para visualização:', error)
  }
}

// Função para forçar atualização dos dropdowns
const forcarAtualizacaoDropdowns = () => {
  if (props.modo !== 'visualizar') return
  
  console.log('Forçando atualização dos dropdowns...')
  
  // Força trigger de reatividade nos refs dos dropdowns
  const dropdownClientesRef = ref(null)
  const dropdownProcessosRef = ref(null) 
  const dropdownParcelasRef = ref(null)
  
  // Simular seleção para forçar atualização visual
  if (clienteSelecionado.value && dropdownClientesRef.value) {
    const clienteOption = opcoesClientes.value.find(option => option.id === clienteSelecionado.value.id)
    if (clienteOption) {
      console.log('Atualizando dropdown clientes com:', clienteOption)
    }
  }
  
  if (processoSelecionado.value && dropdownProcessosRef.value) {
    const processoOption = opcoesProcessos.value.find(option => option.id === processoSelecionado.value.id)
    if (processoOption) {
      console.log('Atualizando dropdown processos com:', processoOption)
    }
  }
}

// Watchers para forçar re-render dos dropdowns
watch([clienteSelecionado, opcoesClientes], () => {
  if (props.modo === 'visualizar' && clienteSelecionado.value) {
    console.log('Cliente selecionado mudou:', clienteSelecionado.value)
    nextTick(() => {
      // Forçar re-render através da key do componente ou atualizar diretamente
      const dropdownClientes = document.querySelector('.dropdown-clientes .dropdown-header-content')
      if (dropdownClientes && clienteSelecionado.value) {
        dropdownClientes.textContent = clienteSelecionado.value.nome_razao_social || clienteSelecionado.value.label
      }
    })
  }
}, { deep: true })

watch([processoSelecionado, opcoesProcessos], () => {
  if (props.modo === 'visualizar' && processoSelecionado.value) {
    console.log('Processo selecionado mudou:', processoSelecionado.value)
    nextTick(() => {
      const dropdownProcessos = document.querySelector('.dropdown-processos .dropdown-header-content')
      if (dropdownProcessos && processoSelecionado.value) {
        dropdownProcessos.textContent = processoSelecionado.value.numero_processo || processoSelecionado.value.label
      }
    })
  }
}, { deep: true })

// Watcher para reagir a mudanças nas props
watch([() => props.modo, () => props.dadosRecebivel], async () => {
  if ((props.modo === 'visualizar' || props.modo === 'editar') && props.dadosRecebivel) {
    await carregarDadosRecebivel()
  }
}, { immediate: false })

// Lifecycle
onMounted(async () => {
  if (props.modo === 'criar') {
    carregarClientes()
  } else if (props.modo === 'visualizar' || props.modo === 'editar') {
    await carregarDadosRecebivel()
  }
})
</script>

<style scoped>
.forms-recebiveis-container {
  width: 339px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  padding: 24px;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: visible !important;
}

/* === RESPONSIVIDADE MOBILE === */
@media (max-width: 768px) {
  .forms-recebiveis-container {
    width: calc(100vw - 32px);
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 16px;
    height: auto;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .header-section {
    margin-bottom: 20px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .header-title {
    font-size: 16px;
  }
  
  .valor-parcelamento-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .parcelamento-toggle {
    width: 100%;
    justify-content: space-between;
  }
  
  .input-section,
  .processo-section,
  .descricao-section,
  .quantas-vezes-section,
  .data-section {
    margin-bottom: 20px;
  }
  
  .input-field {
    height: 48px;
    font-size: 16px;
  }
  
  .label-text {
    font-size: 16px;
  }
  
  .parcelas-section {
    margin-bottom: 20px;
  }
  
  .parcela-item {
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .parcela-item:last-child {
    border-bottom: none;
  }
  
  .anexar-section {
    margin-bottom: 24px;
  }
  
  .arquivo-anexado {
    padding: 12px;
    margin-top: 12px;
  }
  
  .arquivo-nome {
    font-size: 14px;
    max-width: calc(100% - 80px);
  }
  
  .botoes-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .botao-cancelar,
  .botao-salvar,
  .botao-fechar {
    width: 100%;
    height: 48px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .forms-recebiveis-container {
    width: calc(100vw - 24px);
    padding: 16px;
    border-radius: 12px;
  }
  
  .header-title {
    font-size: 14px;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .input-field {
    height: 44px;
    font-size: 14px;
  }
  
  .label-text {
    font-size: 14px;
  }
  
  .toggle-label {
    font-size: 14px;
  }
  
  .parcela-item {
    font-size: 12px;
  }
  
  .arquivo-nome {
    font-size: 12px;
  }
  
  .botao-cancelar,
  .botao-salvar,
  .botao-fechar {
    height: 44px;
    font-size: 14px;
  }
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 56px;
  height: 56px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #0468FA;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.valor-parcelamento-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.valor-label {
  flex: 1;
}

.label-text {
  font-size: 18px;
  font-weight: 600;
  color: #101828;
}

.parcelamento-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  font-size: 16px;
  font-weight: 500;
  color: #344054;
}

.toggle-container {
  cursor: pointer;
}

.toggle-container.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: #D0D5DD;
  border-radius: 12px;
  position: relative;
  transition: background-color 0.2s ease;
}

.toggle-switch.active {
  background: #0468FA;
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

.input-section {
  margin-bottom: 16px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  z-index: 1;
}

.input-field {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 44px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  color: #101828;
  background: white;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.input-field::placeholder {
  color: #667085;
}

.input-field:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.date-input {
  color-scheme: light;
  position: relative;
}

.date-input::-webkit-calendar-picker-indicator {
  display: none;
}

.date-input-container {
  position: relative;
}

.date-input-container .input-icon {
  cursor: pointer;
  z-index: 2;
}

.dropdown-container {
  margin-bottom: 0;
  position: relative;
}

.processo-section {
  margin-bottom: 16px;
}

.processo-label {
  margin-bottom: 8px;
}

.descricao-section {
  margin-bottom: 16px;
}

.descricao-label {
  margin-bottom: 8px;
}

.quantas-vezes-section {
  margin-bottom: 16px;
}

.quantas-vezes-label {
  margin-bottom: 8px;
}

.data-section {
  margin-bottom: 16px;
}

.data-label {
  margin-bottom: 8px;
}

.parcelas-section {
  margin-bottom: 16px;
}

.parcela-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #344054;
}

.parcela-numero {
  font-weight: 500;
}

.parcela-valor {
  font-weight: 500;
}

.parcela-data {
  color: #667085;
}

.anexar-section {
  margin-bottom: 24px;
}

.anexar-content {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 0;
}

.anexar-icon {
  width: 24px;
  height: 24px;
}

.anexar-text {
  font-size: 16px;
  font-weight: 500;
  color: #0468FA;
}

.arquivo-anexado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 8px 12px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #EAECF0;
}

.arquivo-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.arquivo-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.arquivo-nome {
  font-size: 14px;
  color: #344054;
  font-weight: 500;
  word-break: break-word;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  max-width: calc(100% - 120px);
  line-height: 1.4;
}

.arquivo-tamanho {
  font-size: 12px;
  color: #667085;
  margin-left: 4px;
}

.remover-arquivo {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.remover-arquivo:hover {
  background-color: #FEF3F2;
}

.download-arquivo {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-arquivo:hover {
  background-color: #EBF8FF;
}

.download-icon {
  width: 16px;
  height: 16px;
}

.botoes-section {
  display: flex;
  gap: 16px;
}

.botao-cancelar,
.botao-salvar,
.botao-fechar {
  flex: 1;
  height: 44px;
  border-radius: 8px;
}

/* Ajustes para dropdowns */
:deep(.dropdown-container) {
  font-family: 'Inter', sans-serif;
}

:deep(.dropdown-header) {
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
}

:deep(.dropdown-arrow path) {
  stroke: #0468FA;
}

:deep(.dropdown-options) {
  border-radius: 0 0 8px 8px;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
}

:deep(.dropdown-item) {
  height: 44px;
  font-size: 16px;
}

/* Mobile dropdown adjustments */
@media (max-width: 768px) {
  :deep(.dropdown-header) {
    height: 48px;
    font-size: 16px;
  }
  
  :deep(.dropdown-item) {
    height: 48px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  :deep(.dropdown-header) {
    height: 44px;
    font-size: 14px;
  }
  
  :deep(.dropdown-item) {
    height: 44px;
    font-size: 14px;
  }
}

/* Z-INDEX ESPECÍFICO PARA FORMS RECEBÍVEIS - SEGUINDO PADRÃO DO DROPDOWN-FIX.CSS */

/* Modal overlay tem z-index alto */
::v-deep(.modal-overlay) {
  z-index: 30000 !important;
}

/* Container do forms */
.forms-recebiveis-container {
  z-index: 30100 !important;
  position: relative !important;
}

/* DROPDOWN DE CLIENTES - Z-INDEX EXTREMAMENTE ALTO */
.forms-recebiveis-container .input-section:nth-of-type(2) .dropdown-container {
  z-index: 99999 !important;
  position: relative !important;
}

.forms-recebiveis-container .input-section:nth-of-type(2) .dropdown-options {
  z-index: 99999 !important;
  position: absolute !important;
}

/* DROPDOWN DE PROCESSOS - Z-INDEX BAIXO */
.forms-recebiveis-container .processo-section .dropdown-container {
  z-index: 1000 !important;
  position: relative !important;
}

.forms-recebiveis-container .processo-section .dropdown-options {
  z-index: 1000 !important;
  position: absolute !important;
}

/* DROPDOWN DE QUANTAS VEZES - Z-INDEX BAIXO */
.forms-recebiveis-container .quantas-vezes-section .dropdown-container {
  z-index: 2000 !important;
  position: relative !important;
}

.forms-recebiveis-container .quantas-vezes-section .dropdown-options {
  z-index: 2000 !important;
  position: absolute !important;
}

/* FORÇA EXTREMA PARA DROPDOWN DE CLIENTES */
.forms-recebiveis-container .input-section:nth-of-type(2) :deep(.dropdown-container) {
  z-index: 99999 !important;
  position: relative !important;
}

.forms-recebiveis-container .input-section:nth-of-type(2) :deep(.dropdown-options) {
  z-index: 99999 !important;
  position: absolute !important;
}

.forms-recebiveis-container .input-section:nth-of-type(2) :deep(.dropdown-item) {
  z-index: 99999 !important;
}

/* QUANDO DROPDOWNS ESTÃO ABERTOS - Z-INDEX AINDA MAIOR PARA CLIENTE */
.forms-recebiveis-container .input-section:nth-of-type(2) .dropdown-container.dropdown-open {
  z-index: 99999 !important;
}

.forms-recebiveis-container .input-section:nth-of-type(2) .dropdown-container.dropdown-open .dropdown-options {
  z-index: 99999 !important;
}

/* REGRAS ESPECÍFICAS POR CLASSE - FORÇA MÁXIMA */
.dropdown-clientes-section {
  z-index: 99999 !important;
  position: relative !important;
}

.dropdown-clientes {
  z-index: 99999 !important;
  position: relative !important;
}

.dropdown-clientes .dropdown-container {
  z-index: 99999 !important;
  position: relative !important;
}

.dropdown-clientes :deep(.dropdown-container) {
  z-index: 99999 !important;
  position: relative !important;
}

.dropdown-clientes :deep(.dropdown-options) {
  z-index: 99999 !important;
  position: absolute !important;
}

.dropdown-clientes :deep(.dropdown-item) {
  z-index: 99999 !important;
}

.dropdown-processos-section {
  z-index: 1000 !important;
  position: relative !important;
}

.dropdown-processos {
  z-index: 1000 !important;
  position: relative !important;
}

.dropdown-processos :deep(.dropdown-container) {
  z-index: 1000 !important;
  position: relative !important;
}

.dropdown-processos :deep(.dropdown-options) {
  z-index: 1000 !important;
  position: absolute !important;
}

/* ALERTA DE SUCESSO - Z-INDEX MAIOR QUE O MODAL */
:deep(.overlay) {
  z-index: 99999 !important;
}
</style> 