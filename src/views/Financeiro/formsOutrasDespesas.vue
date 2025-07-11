<template>
  <div class="forms-outras-despesas-container">
    <!-- Header com ícone e título -->
    <div class="header-section">
      <div class="header-content">
        <img src="/images/iconeSaidas.svg" alt="Outras Despesas" class="header-icon">
        <h2 class="header-title">{{ 
          modoVisualizacaoAtivo ? 'Visualizar Outras Despesas' : (modoEdicao ? 'Editar Outras Despesas' : 'Nova Outras Despesas')
        }}</h2>
      </div>
      <button class="close-btn" @click="fechar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Valor -->
    <div class="valor-section">
      <div class="valor-label">
        <span class="label-text">Qual o valor?</span>
      </div>
    </div>

    <!-- Input de Valor -->
    <div class="input-section">
      <div class="input-container">
        <img src="/images/moeda.svg" alt="Valor" class="input-icon">
        <input 
          type="text" 
          v-model="form.valor" 
          @input="formatarValor"
          placeholder="R$ 0,00"
          class="input-field"
          :disabled="modoVisualizacaoAtivo"
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
          :disabled="modoVisualizacaoAtivo"
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
          :disabled="!clienteSelecionado || modoVisualizacaoAtivo"
          @option-selected="selecionarProcesso"
        />
      </div>
    </div>

    <!-- Data de saída -->
    <div class="data-section">
      <div class="data-label">
        <span class="label-text">Data de saída</span>
      </div>
      <div class="input-container date-input-container">
        <img 
          src="/images/calendarioMarcado.svg" 
          alt="Data" 
          class="input-icon" 
          @click="!modoVisualizacaoAtivo && abrirCalendario"
          :class="{ 'disabled': modoVisualizacaoAtivo }"
        >
        <input 
          type="date" 
          v-model="form.data_saida"
          class="input-field date-input"
          ref="dateInput"
          :disabled="modoVisualizacaoAtivo"
        >
      </div>
    </div>

    <!-- Título/Descrição -->
    <div class="titulo-section">
      <div class="titulo-label">
        <span class="label-text">Título/Descrição</span>
      </div>
      <div class="input-container">
        <img src="/images/papel.svg" alt="Descrição" class="input-icon">
        <input 
          type="text" 
          v-model="form.titulo"
          placeholder="Digite uma descrição"
          class="input-field"
          :disabled="modoVisualizacaoAtivo"
        >
      </div>
    </div>

    <!-- Observações -->
    <div class="observacoes-section">
      <div class="observacoes-label">
        <span class="label-text">Observações</span>
      </div>
      <div class="textarea-container">
        <textarea
          v-model="form.observacoes"
          rows="3"
          placeholder="Observações adicionais"
          class="textarea-field"
          :disabled="modoVisualizacaoAtivo"
        ></textarea>
      </div>
    </div>

    <!-- Anexar documento -->
    <div class="anexar-section" v-if="!modoVisualizacaoAtivo">
      <div class="anexar-content" @click="selecionarArquivo">
        <img src="/images/anexar.svg" alt="Anexar" class="anexar-icon">
        <span class="anexar-text">Anexar documento</span>
      </div>
      <input 
        ref="fileInput"
        type="file" 
        @change="anexarArquivo"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        style="display: none;"
        multiple
      />
      
      <!-- Lista de arquivos anexados -->
      <div v-if="arquivosSelecionados.length > 0" class="arquivos-lista">
        <div 
          v-for="(arquivo, index) in arquivosSelecionados" 
          :key="index"
          class="arquivo-anexado"
        >
          <div class="arquivo-info">
            <img :src="getFileIcon(arquivo.type)" :alt="arquivo.type" class="arquivo-icon">
            <span class="arquivo-nome">{{ arquivo.name }}</span>
            <span class="arquivo-tamanho">{{ formatarTamanhoArquivo(arquivo.size) }}</span>
          </div>
          <button class="remover-arquivo" @click="removerArquivo(index)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="#F04438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Documentos anexados (visualização apenas) -->
    <div class="documentos-visualizacao" v-if="modoVisualizacaoAtivo && documentosExistentes.length > 0">
      <div class="documentos-label">
        <span class="label-text">Documentos anexados</span>
      </div>
      <div class="documentos-lista">
        <div 
          v-for="documento in documentosExistentes" 
          :key="documento.id"
          class="documento-item"
        >
          <div class="documento-info">
            <img :src="getFileIcon(documento.tipo_arquivo)" :alt="documento.tipo_arquivo" class="arquivo-icon">
            <span class="arquivo-nome">{{ documento.nome }}</span>
            <span class="arquivo-tamanho">{{ formatarTamanhoArquivo(documento.tamanho) }}</span>
          </div>
          <a :href="documento.url" target="_blank" class="visualizar-documento">
            <img src="/images/olhoinativo.svg" alt="Visualizar" class="acao-icon">
          </a>
        </div>
      </div>
    </div>

    <!-- Botões -->
    <div class="botoes-section">
      <Button 
        v-if="!modoVisualizacaoAtivo"
        label="Cancelar" 
        type="outline" 
        @click="fechar"
        class="botao-cancelar"
        :disabled="salvando"
      />
      <Button 
        v-if="modoVisualizacaoAtivo"
        label="Fechar" 
        type="primary" 
        @click="fechar"
        class="botao-fechar"
      />
      <Button 
        v-if="!modoVisualizacaoAtivo"
        :label="salvando ? (modoEdicao ? 'Atualizando...' : 'Salvando...') : (modoEdicao ? 'Atualizar' : 'Salvar')"
        type="primary" 
        @click="salvar"
        class="botao-salvar"
        :disabled="salvando"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase.js'
import Button from '../../components/UI/Button.vue'
import Dropdown from '../../components/UI/Dropdown.vue'

// Emits
const emit = defineEmits(['fechar', 'mostrar-alerta-sucesso', 'mostrar-alerta-erro', 'salvar'])

// Props
const props = defineProps({
  dadosEdicao: {
    type: Object,
    default: null
  },
  modoVisualizacao: {
    type: Boolean,
    default: false
  }
})

// Estados reativos
const modoEdicao = computed(() => !!props.dadosEdicao && !props.modoVisualizacao)
const modoVisualizacaoAtivo = computed(() => props.modoVisualizacao)
const salvando = ref(false)

// Estados para clientes e processos (igual ao formsRecebiveis)
const clientes = ref([])
const processos = ref([])
const carregandoClientes = ref(false)
const carregandoProcessos = ref(false)
const clienteSelecionado = ref(null)
const processoSelecionado = ref(null)

const arquivosSelecionados = ref([])
const documentosExistentes = ref([])
const dateInput = ref(null)
const fileInput = ref(null)

const form = reactive({
  valor: '',
  data_saida: new Date().toISOString().split('T')[0],
  titulo: '',
  observacoes: ''
})

// Computed para opções dos dropdowns (igual ao formsRecebiveis)
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
  
  if (opcoes.length === 0) {
    return [{ id: null, label: 'Nenhum processo encontrado' }]
  }
  
  return opcoes
})

// Funções para carregar clientes e processos (igual ao formsRecebiveis)
const carregarClientes = async () => {
  try {
    carregandoClientes.value = true
    
    const { data, error } = await supabase
      .from('clientes')
      .select('id, nome, nome_fantasia')
      .order('nome')
    
    if (error) throw error
    
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

const carregarProcessos = async (clienteId) => {
  if (!clienteId) {
    processos.value = []
    return
  }
  
  try {
    carregandoProcessos.value = true
    
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

// Métodos
const formatarValor = (event) => {
  // Não formatar se estiver no modo visualização
  if (modoVisualizacaoAtivo.value) {
    return
  }
  
  let valor = event.target.value.replace(/\D/g, '')
  
  if (valor === '') {
    form.valor = ''
    return
  }
  
  const valorNumericoCalculado = parseFloat(valor) / 100
  
  form.valor = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valorNumericoCalculado)
}

const abrirCalendario = () => {
  if (dateInput.value) {
    try {
      dateInput.value.showPicker()
    } catch (error) {
      dateInput.value.focus()
      dateInput.value.click()
    }
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

const carregarDocumentosExistentes = async () => {
  if (!modoVisualizacaoAtivo.value || !props.dadosEdicao?.id) return

  console.log('📄 Carregando documentos existentes...')
  try {
    const { data, error } = await supabase
      .from('outras_despesas_documentos')
      .select('*')
              .eq('outra_despesa_id', props.dadosEdicao.id)

    if (error) {
      console.error('❌ Erro ao carregar documentos:', error)
      return
    }

    documentosExistentes.value = data || []
    console.log('✅ Documentos carregados:', documentosExistentes.value.length)
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar documentos:', error)
  }
}

const selecionarArquivo = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const anexarArquivo = (event) => {
  const arquivos = Array.from(event.target.files)
  
  for (const arquivo of arquivos) {
    if (arquivo.size > 10 * 1024 * 1024) {
      emit('mostrar-alerta-erro', `Arquivo "${arquivo.name}" é muito grande. Tamanho máximo: 10MB`)
      continue
    }

    arquivosSelecionados.value.push(arquivo)
  }

  event.target.value = ''
}

const removerArquivo = (index) => {
  arquivosSelecionados.value.splice(index, 1)
}

const formatarTamanhoArquivo = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const tamanhos = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i]
}

const getFileIcon = (tipo) => {
  return '/images/anexar.svg'
}

const validarFormulario = () => {
  if (!form.valor || form.valor === 'R$ 0,00') {
    emit('mostrar-alerta-erro', 'Por favor, informe um valor válido')
    return false
  }

  if (!form.data_saida) {
    emit('mostrar-alerta-erro', 'Por favor, informe a data de saída')
    return false
  }

  if (!form.titulo.trim()) {
    emit('mostrar-alerta-erro', 'Por favor, informe um título/descrição')
    return false
  }

  return true
}

const obterValorNumerico = (valorFormatado) => {
  return parseFloat(valorFormatado.replace(/[R$\s.]/g, '').replace(',', '.')) || 0
}

const uploadArquivos = async (outrasDesp) => {
  if (arquivosSelecionados.value.length === 0) return

  console.log('📁 Fazendo upload de', arquivosSelecionados.value.length, 'arquivo(s)...')

  for (const arquivo of arquivosSelecionados.value) {
    try {
      const nomeArquivo = `outras_despesas/${outrasDesp}/${Date.now()}_${arquivo.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(nomeArquivo, arquivo)

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError)
        emit('mostrar-alerta-erro', `Erro ao fazer upload do arquivo "${arquivo.name}"`)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(nomeArquivo)

      const { data: { user } } = await supabase.auth.getUser()

      const { error: dbError } = await supabase
        .from('outras_despesas_documentos')
        .insert({
          uuid: user.id,
          outra_despesa_id: outrasDesp,
          nome: arquivo.name,
          url: urlData.publicUrl,
          tamanho: arquivo.size,
          tipo_arquivo: arquivo.type
        })

      if (dbError) {
        console.error('❌ Erro ao salvar documento na DB:', dbError)
        emit('mostrar-alerta-erro', `Erro ao salvar documento "${arquivo.name}"`)
      }
    } catch (error) {
      console.error('❌ Erro inesperado no upload:', error)
      emit('mostrar-alerta-erro', `Erro inesperado ao fazer upload de "${arquivo.name}"`)
    }
  }
}

const salvar = async () => {
  if (!validarFormulario()) return

  salvando.value = true
  console.log('💾 Iniciando salvamento de outras despesas...')

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Usuário não autenticado:', authError)
      emit('mostrar-alerta-erro', 'Usuário não autenticado')
      return
    }

    const valorNumerico = obterValorNumerico(form.valor)

    const dadosOutrasDespesas = {
      uuid: user.id,
      valor: valorNumerico,
      titulo: form.titulo.trim(),
      data_saida: form.data_saida,
      cliente_id: clienteSelecionado.value?.id || null,
      processo_id: processoSelecionado.value?.id || null,
      observacoes: form.observacoes?.trim() || null
    }

    console.log('📊 Dados das outras despesas:', dadosOutrasDespesas)

    let outrasDesp
    if (modoEdicao.value) {
      const { data, error } = await supabase
        .from('outras_despesas')
        .update(dadosOutrasDespesas)
        .eq('id', props.dadosEdicao.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar outras despesas:', error)
        emit('mostrar-alerta-erro', 'Erro ao atualizar outras despesas')
        return
      }

      outrasDesp = data.id
      console.log('✅ Outras despesas atualizada com sucesso:', outrasDesp)
    } else {
      const { data, error } = await supabase
        .from('outras_despesas')
        .insert(dadosOutrasDespesas)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar outras despesas:', error)
        emit('mostrar-alerta-erro', 'Erro ao salvar outras despesas')
        return
      }

      outrasDesp = data.id
      console.log('✅ Outras despesas criada com sucesso:', outrasDesp)
    }

    await uploadArquivos(outrasDesp)

    const mensagem = modoEdicao.value ? 'Outras despesas atualizada com sucesso!' : 'Outras despesas cadastrada com sucesso!'
    console.log('🎉 Emitindo evento de sucesso:', mensagem)
    emit('mostrar-alerta-sucesso', mensagem)
    emit('salvar')
    
    console.log('🔄 Outras despesas salva, componente pai deve recarregar dados')
    emit('fechar')

  } catch (error) {
    console.error('❌ Erro inesperado ao salvar:', error)
    emit('mostrar-alerta-erro', 'Erro inesperado ao salvar outras despesas')
  } finally {
    salvando.value = false
  }
}

const fechar = () => {
  console.log('❌ Fechando formulário de outras despesas...')
  limparFormulario()
  emit('fechar')
}

const limparFormulario = () => {
  console.log('🧹 Limpando formulário...')
  form.valor = ''
  form.data_saida = new Date().toISOString().split('T')[0]
  form.titulo = ''
  form.observacoes = ''
  clienteSelecionado.value = null
  processoSelecionado.value = null
  arquivosSelecionados.value = []
  documentosExistentes.value = []
}

const inicializarFormulario = () => {
  limparFormulario()
  
  if ((modoEdicao.value || modoVisualizacaoAtivo.value) && props.dadosEdicao) {
    console.log('📝 Inicializando formulário - carregando dados:', props.dadosEdicao)
    
    form.valor = `R$ ${props.dadosEdicao.valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`
    form.data_saida = props.dadosEdicao.data_saida
    form.titulo = props.dadosEdicao.titulo
    form.observacoes = props.dadosEdicao.observacoes || ''

    // Selecionar cliente se existir
    if (props.dadosEdicao.cliente_id) {
      const cliente = clientes.value.find(c => c.id === props.dadosEdicao.cliente_id)
      if (cliente) {
        clienteSelecionado.value = cliente
        carregarProcessos(cliente.id)
        
        // Selecionar processo se existir
        if (props.dadosEdicao.processo_id) {
          setTimeout(() => {
            const processo = processos.value.find(p => p.id === props.dadosEdicao.processo_id)
            if (processo) {
              processoSelecionado.value = processo
            }
          }, 500)
        }
      }
    }
    
    console.log('✅ Formulário inicializado com dados:', {
      valor: form.valor,
      titulo: form.titulo,
      data_saida: form.data_saida
    })
  } else {
    console.log('📝 Modo criação - formulário limpo')
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

// Lifecycle
onMounted(async () => {
  console.log('🚀 Iniciando formsOutrasDespesas...')
  console.log('📋 Modo visualização:', modoVisualizacaoAtivo.value)
  console.log('✏️ Modo edição:', modoEdicao.value)
  console.log('📦 Dados recebidos:', props.dadosEdicao)
  
  await carregarClientes()
  
  await new Promise(resolve => setTimeout(resolve, 10))
  
  inicializarFormulario()
  await carregarDocumentosExistentes()
})

// Watcher para reinicializar quando dados mudarem
watch([() => props.dadosEdicao, () => props.modoVisualizacao], async (newValues, oldValues) => {
  const [novosDados, novoModo] = newValues
  const [dadosAnteriores, modoAnterior] = oldValues || []
  
  console.log('🔄 Detectada mudança:', {
    dadosMudaram: novosDados?.id !== dadosAnteriores?.id,
    modoMudou: novoModo !== modoAnterior,
    novosDados: novosDados,
    novoModo: novoModo
  })
  
  const dadosMudaram = novosDados?.id !== dadosAnteriores?.id
  const modoMudou = novoModo !== modoAnterior
  
  if (dadosMudaram || modoMudou) {
    console.log('🔄 Reinicializando formulário devido à mudança...')
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    inicializarFormulario()
    await carregarDocumentosExistentes()
  }
}, { immediate: false, deep: true })
</script>

<style scoped>
.forms-outras-despesas-container {
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
  .forms-outras-despesas-container {
    width: calc(100vw - 32px);
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 16px;
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
  
  .input-section,
  .processo-section,
  .titulo-section,
  .categoria-section,
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
  .forms-outras-despesas-container {
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
  color: #F04438;
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

.valor-recorrencia-section {
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

.recorrencia-toggle {
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

.toggle-switch.disabled {
  background-color: #E0E0E0;
  cursor: not-allowed;
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

.toggle-switch.disabled .toggle-slider {
  background-color: #B0B0B0;
}

.input-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-container.disabled {
  cursor: not-allowed;
}

.documentos-visualizacao {
  margin-bottom: 24px;
}

.documentos-label {
  margin-bottom: 8px;
}

.documentos-lista {
  background: #F9FAFB;
  border: 1px solid #EAECF0;
  border-radius: 8px;
  padding: 8px;
}

.documento-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
}

.documento-item:last-child {
  margin-bottom: 0;
}

.documento-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.visualizar-documento {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  text-decoration: none;
}

.visualizar-documento:hover {
  background-color: #F3F4F6;
}

.acao-icon {
  width: 16px;
  height: 16px;
}

.botao-fechar {
  flex: 1;
  height: 44px;
  border-radius: 8px;
}

.input-section,
.data-section,
.categoria-section,
.titulo-section,
.observacoes-section {
  margin-bottom: 16px;
}

.data-label,
.categoria-label,
.titulo-label,
.observacoes-label {
  margin-bottom: 8px;
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

.dropdown-categorias :deep(.dropdown-container) {
  z-index: 99999 !important;
  position: relative !important;
}

.dropdown-categorias :deep(.dropdown-options) {
  z-index: 99999 !important;
  position: absolute !important;
}

.dropdown-categorias :deep(.dropdown-item) {
  z-index: 99999 !important;
}

.textarea-container {
  margin-bottom: 0;
}

.textarea-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  color: #101828;
  background: white;
  transition: border-color 0.2s ease;
  resize: none;
}

.textarea-field:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.textarea-field::placeholder {
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

.arquivos-lista {
  margin-top: 8px;
}

.arquivo-anexado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
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

.botoes-section {
  display: flex;
  gap: 16px;
}

.botao-cancelar,
.botao-salvar {
  flex: 1;
  height: 44px;
  border-radius: 8px;
}

/* Z-index específico para forms outras despesas */
.forms-outras-despesas-container {
  z-index: 30100 !important;
  position: relative !important;
}

/* Dropdown de categorias - z-index alto */
.dropdown-categorias {
  z-index: 99999 !important;
  position: relative !important;
}

.dropdown-categorias :deep(.dropdown-container) {
  z-index: 99999 !important;
  position: relative !important;
}

.dropdown-categorias :deep(.dropdown-options) {
  z-index: 99999 !important;
  position: absolute !important;
}

.dropdown-categorias :deep(.dropdown-item) {
  z-index: 99999 !important;
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

/* Z-INDEX ESPECÍFICO PARA FORMS OUTRAS DESPESAS */
::v-deep(.modal-overlay) {
  z-index: 30000 !important;
}

:deep(.overlay) {
  z-index: 99999 !important;
}
</style> 