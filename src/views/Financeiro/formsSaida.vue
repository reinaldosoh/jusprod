<template>
  <div class="forms-saida-container">
    <!-- Header com ícone e título -->
    <div class="header-section">
      <div class="header-content">
        <img src="/images/iconeSaidas.svg" alt="Saída" class="header-icon">
        <h2 class="header-title">{{ 
          modoVisualizacaoAtivo ? 'Visualizar Saída' : (modoEdicao ? 'Editar Saída' : 'Nova Saída')
        }}</h2>
      </div>
      <button class="close-btn" @click="fechar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Valor e Recorrência -->
    <div class="valor-recorrencia-section">
      <div class="valor-label">
        <span class="label-text">Qual o valor?</span>
      </div>
      <div class="recorrencia-toggle">
        <span class="toggle-label">Recorrência mensal</span>
        <div 
          class="toggle-container" 
          @click="toggleRecorrencia"
          :class="{ 'disabled': modoVisualizacaoAtivo }"
        >
          <div class="toggle-switch" :class="{ active: form.recorrencia_mensal, disabled: modoVisualizacaoAtivo }">
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
          v-model="form.valor" 
          @input="formatarValor"
          placeholder="R$ 0,00"
          class="input-field"
          :disabled="modoVisualizacaoAtivo"
        >
      </div>
    </div>

    <!-- Data de saída -->
    <div class="data-section">
      <div class="data-label">
        <span class="label-text">Data de saída</span>
      </div>
      <div 
        class="input-container date-input-container"
        @click="abrirCalendario"
        :class="{ 'disabled': modoVisualizacaoAtivo }"
      >
        <img 
          src="/images/calendarioMarcado.svg" 
          alt="Data" 
          class="input-icon" 
          :class="{ 'disabled': modoVisualizacaoAtivo }"
        >
        <input 
          type="date" 
          v-model="form.data_saida"
          class="input-field date-input"
          ref="dateInput"
          :disabled="modoVisualizacaoAtivo"
          @focus="abrirCalendario"
        >
      </div>
    </div>

    <!-- Categoria do gasto -->
    <div class="categoria-section">
      <div class="categoria-label">
        <span class="label-text">Categoria do gasto</span>
      </div>
      <div class="dropdown-container dropdown-categorias">
        <Dropdown 
          :key="dropdownKey"
          ref="dropdownCategorias"
          :options="opcoesCategoria"
          :default-selected="getCategoriaIndex()"
          placeholder-text="Selecione uma categoria"
          :show-placeholder-icon="true"
          icon-type="categorias"
          @option-selected="selecionarCategoria"
          :disabled="modoVisualizacaoAtivo"
        />
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
const categorias = ref([])
const arquivosSelecionados = ref([])
const documentosExistentes = ref([])
const dateInput = ref(null)
const fileInput = ref(null)
const categoriaSelecionada = ref(null)
const dropdownKey = ref(0)

const form = reactive({
  valor: '',
  recorrencia_mensal: false,
  data_saida: new Date().toISOString().split('T')[0],
  categoria_id: '',
  titulo: '',
  observacoes: ''
})

// Computed para opções da categoria
const opcoesCategoria = computed(() => {
  if (categorias.value.length === 0) {
    return [{ id: null, label: 'Carregando categorias...' }]
  }
  
  return categorias.value.map(categoria => ({
    id: categoria.id,
    label: categoria.nome
  }))
})

// Métodos
const toggleRecorrencia = () => {
  if (modoVisualizacaoAtivo.value) {
    console.log('⚠️ Toggle recorrência bloqueado - modo visualização ativo')
    return
  }
  
  console.log('🔄 Alterando recorrência mensal de', form.recorrencia_mensal, 'para', !form.recorrencia_mensal)
  form.recorrencia_mensal = !form.recorrencia_mensal
}

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

const abrirCalendario = (event) => {
  if (modoVisualizacaoAtivo.value) {
    console.log('⚠️ Calendário bloqueado - modo visualização ativo')
    return
  }
  
  console.log('📅 Tentando abrir calendário...')
  
  // Prevenir propagação se necessário
  if (event) {
    event.stopPropagation()
  }
  
  if (!dateInput.value) {
    console.log('❌ Input de data não encontrado')
    return
  }

  try {
    // Primeiro tenta usar showPicker (método moderno)
    if (typeof dateInput.value.showPicker === 'function') {
      console.log('✅ Usando showPicker()')
      dateInput.value.showPicker()
    } else {
      throw new Error('showPicker não disponível')
    }
  } catch (error) {
    console.log('⚠️ showPicker falhou, usando método alternativo:', error.message)
    
    // Método alternativo: foco + clique
    try {
      dateInput.value.focus()
      
      // Aguarda um pouco e força o clique
      setTimeout(() => {
        if (dateInput.value) {
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          })
          dateInput.value.dispatchEvent(event)
        }
      }, 50)
    } catch (fallbackError) {
      console.log('❌ Método alternativo também falhou:', fallbackError.message)
    }
  }
}

const selecionarCategoria = (categoria) => {
  categoriaSelecionada.value = categoria
  form.categoria_id = categoria.id || ''
}

const getCategoriaIndex = () => {
  if (!categoriaSelecionada.value) {
    console.log('🔍 getCategoriaIndex: Nenhuma categoria selecionada')
    return null
  }
  
  const index = opcoesCategoria.value.findIndex(option => option.id === categoriaSelecionada.value.id)
  console.log('🔍 getCategoriaIndex:', {
    categoriaSelecionada: categoriaSelecionada.value,
    opcoesDisponiveis: opcoesCategoria.value.length,
    indexEncontrado: index
  })
  
  return index >= 0 ? index : null
}

const carregarCategorias = async () => {
  console.log('🔍 Carregando categorias de gastos...')
  try {
    const { data, error } = await supabase
      .from('categoria_gastos')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('❌ Erro ao carregar categorias:', error)
      emit('mostrar-alerta-erro', 'Erro ao carregar categorias de gastos')
      return
    }

    categorias.value = data || []
    console.log('✅ Categorias carregadas:', categorias.value.length)
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar categorias:', error)
    emit('mostrar-alerta-erro', 'Erro inesperado ao carregar categorias')
  }
}

const carregarDocumentosExistentes = async () => {
  if (!modoVisualizacaoAtivo.value || !props.dadosEdicao?.id) return

  console.log('📄 Carregando documentos existentes...')
  try {
    const { data, error } = await supabase
      .from('saidas_documentos')
      .select('*')
      .eq('saida_id', props.dadosEdicao.id)

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

  if (!form.categoria_id) {
    emit('mostrar-alerta-erro', 'Por favor, selecione uma categoria')
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

const uploadArquivos = async (saidaId) => {
  if (arquivosSelecionados.value.length === 0) return

  console.log('📁 Fazendo upload de', arquivosSelecionados.value.length, 'arquivo(s)...')

  for (const arquivo of arquivosSelecionados.value) {
    try {
      const nomeArquivo = `saidas/${saidaId}/${Date.now()}_${arquivo.name}`
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
        .from('saidas_documentos')
        .insert({
          uuid: user.id,
          saida_id: saidaId,
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
  console.log('💾 Iniciando salvamento da saída...')

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Usuário não autenticado:', authError)
      emit('mostrar-alerta-erro', 'Usuário não autenticado')
      return
    }

    const valorNumerico = obterValorNumerico(form.valor)

    const dadosSaida = {
      uuid: user.id,
      valor: valorNumerico,
      titulo: form.titulo.trim(),
      data_saida: form.data_saida,
      categoria_id: parseInt(form.categoria_id),
      recorrencia_mensal: form.recorrencia_mensal,
      observacoes: form.observacoes?.trim() || null
    }

    console.log('📊 Dados da saída:', dadosSaida)

    let saidaId
    if (modoEdicao.value) {
      const { data, error } = await supabase
        .from('saidas')
        .update(dadosSaida)
        .eq('id', props.dadosEdicao.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar saída:', error)
        emit('mostrar-alerta-erro', 'Erro ao atualizar saída')
        return
      }

      saidaId = data.id
      console.log('✅ Saída atualizada com sucesso:', saidaId)
    } else {
      const { data, error } = await supabase
        .from('saidas')
        .insert(dadosSaida)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar saída:', error)
        emit('mostrar-alerta-erro', 'Erro ao salvar saída')
        return
      }

      saidaId = data.id
      console.log('✅ Saída criada com sucesso:', saidaId)
    }

    await uploadArquivos(saidaId)

    const mensagem = modoEdicao.value ? 'Saída atualizada com sucesso!' : 'Saída cadastrada com sucesso!'
    console.log('🎉 Emitindo evento de sucesso:', mensagem)
    emit('mostrar-alerta-sucesso', mensagem)
    emit('salvar')
    
    // Força atualização no componente pai
    console.log('🔄 Saída salva, componente pai deve recarregar dados')
    emit('fechar')

  } catch (error) {
    console.error('❌ Erro inesperado ao salvar:', error)
    emit('mostrar-alerta-erro', 'Erro inesperado ao salvar saída')
  } finally {
    salvando.value = false
  }
}

const fechar = () => {
  console.log('❌ Fechando formulário de saída...')
  limparFormulario()
  emit('fechar')
}

const limparFormulario = () => {
  console.log('🧹 Limpando formulário...')
  form.valor = ''
  form.recorrencia_mensal = false
  form.data_saida = new Date().toISOString().split('T')[0]
  form.categoria_id = ''
  form.titulo = ''
  form.observacoes = ''
  categoriaSelecionada.value = null
  arquivosSelecionados.value = []
  documentosExistentes.value = []
}

const inicializarFormulario = () => {
  // Primeiro limpar o formulário
  limparFormulario()
  
  if ((modoEdicao.value || modoVisualizacaoAtivo.value) && props.dadosEdicao) {
    console.log('📝 Inicializando formulário - carregando dados:', props.dadosEdicao)
    
    form.valor = `R$ ${props.dadosEdicao.valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`
    form.recorrencia_mensal = props.dadosEdicao.recorrencia_mensal
    form.data_saida = props.dadosEdicao.data_saida
    form.categoria_id = props.dadosEdicao.categoria_id
    form.titulo = props.dadosEdicao.titulo
    form.observacoes = props.dadosEdicao.observacoes || ''

    // Selecionar categoria se existir
    if (form.categoria_id) {
      console.log('🔍 Procurando categoria ID:', form.categoria_id, 'nas categorias:', categorias.value.map(c => ({id: c.id, nome: c.nome})))
      
      const categoria = categorias.value.find(c => c.id === form.categoria_id)
      if (categoria) {
        categoriaSelecionada.value = { id: categoria.id, label: categoria.nome }
        console.log('📂 Categoria selecionada:', categoria.nome)
      } else {
        console.log('❌ Categoria não encontrada para ID:', form.categoria_id)
      }
    }
    
    console.log('✅ Formulário inicializado com dados:', {
      valor: form.valor,
      titulo: form.titulo,
      categoria_id: form.categoria_id,
      data_saida: form.data_saida
    })
    
    // Forçar re-render do dropdown
    dropdownKey.value++
    console.log('🔄 Dropdown key atualizada para:', dropdownKey.value)
  } else {
    console.log('📝 Modo criação - formulário limpo')
  }
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 Iniciando formsSaida...')
  console.log('📋 Modo visualização:', modoVisualizacaoAtivo.value)
  console.log('✏️ Modo edição:', modoEdicao.value)
  console.log('📦 Dados recebidos:', props.dadosEdicao)
  
  await carregarCategorias()
  
  // Aguardar um tick para garantir que as categorias foram processadas
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
  
  // Só reinicializar se realmente houve mudança significativa
  const dadosMudaram = novosDados?.id !== dadosAnteriores?.id
  const modoMudou = novoModo !== modoAnterior
  
  if (dadosMudaram || modoMudou) {
    console.log('🔄 Reinicializando formulário devido à mudança...')
    
    // Aguardar um tick para garantir que as categorias estão carregadas
    await new Promise(resolve => setTimeout(resolve, 10))
    
    inicializarFormulario()
    await carregarDocumentosExistentes()
  }
}, { immediate: false, deep: true })
</script>

<style scoped>
.forms-saida-container {
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
  .forms-saida-container {
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
  
  .input-section,
  .dropdown-section,
  .descricao-section,
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
    height: 44px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .forms-saida-container {
    width: calc(100vw - 24px);
    padding: 16px;
    border-radius: 12px;
    height: auto;
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

.input-section {
  margin-bottom: 16px;
}

.label-text {
  font-size: 18px;
  font-weight: 600;
  color: #101828;
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
  cursor: pointer;
}

.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 3;
}

.date-input:disabled::-webkit-calendar-picker-indicator {
  opacity: 0;
  cursor: not-allowed;
}

.date-input-container {
  position: relative;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.date-input-container.disabled {
  cursor: not-allowed;
  pointer-events: none;
}

.date-input-container .input-icon {
  cursor: pointer;
  z-index: 1;
  pointer-events: none;
}

.date-input-container .input-icon.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dropdown-section {
  margin-bottom: 16px;
}

.dropdown-container {
  margin-bottom: 0;
  position: relative;
}

.descricao-section {
  margin-bottom: 16px;
}

.data-section {
  margin-bottom: 16px;
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

/* Observações */
.observacoes-section {
  margin-bottom: 16px;
}

.observacoes-label {
  margin-bottom: 8px;
}

.textarea-container {
  position: relative;
  width: 100%;
}

.textarea-field {
  width: 100%;
  min-height: 80px;
  padding: 12px 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  color: #101828;
  background: white;
  resize: vertical;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.textarea-field:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.textarea-field::placeholder {
  color: #667085;
}

.textarea-field:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
  resize: none;
}

/* Categoria */
.categoria-section {
  margin-bottom: 16px;
}

.categoria-label {
  margin-bottom: 8px;
}

/* Título */
.titulo-section {
  margin-bottom: 16px;
}

.titulo-label {
  margin-bottom: 8px;
}

/* Valor e recorrência */
.valor-recorrencia-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.valor-label {
  flex: 1;
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
  user-select: none;
  -webkit-user-select: none;
}

.toggle-container.disabled {
  cursor: not-allowed;
  pointer-events: none;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: #E4E7EC;
  border-radius: 12px;
  position: relative;
  transition: background-color 0.3s ease;
}

.toggle-switch:hover:not(.disabled) {
  background: #D1D5DB;
}

.toggle-switch.active {
  background: #0468FA;
}

.toggle-switch.active:hover:not(.disabled) {
  background: #0354CC;
}

.toggle-switch.disabled {
  opacity: 0.6;
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

/* Data */
.data-section {
  margin-bottom: 16px;
}

.data-label {
  margin-bottom: 8px;
}

/* Documentos de visualização */
.documentos-visualizacao {
  margin-bottom: 16px;
}

.documentos-label {
  margin-bottom: 8px;
}

.documentos-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.documento-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #EAECF0;
}

.documento-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.visualizar-documento {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #D0D5DD;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.visualizar-documento:hover {
  background: #F9FAFB;
  border-color: #98A2B3;
}

.acao-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.visualizar-documento:hover .acao-icon {
  opacity: 1;
}

/* Responsividade Mobile */
@media (max-width: 768px) {
  .forms-saida-container {
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
  
  .valor-recorrencia-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .recorrencia-toggle {
    width: 100%;
    justify-content: space-between;
  }
  
  .input-section,
  .categoria-section,
  .titulo-section,
  .observacoes-section,
  .data-section {
    margin-bottom: 20px;
  }
  
  .input-field {
    height: 48px;
    font-size: 16px;
  }
  
  .textarea-field {
    min-height: 100px;
    font-size: 16px;
    padding: 16px;
  }
  
  .label-text {
    font-size: 16px;
  }
  
  .anexar-section {
    margin-bottom: 24px;
  }
  
  .arquivo-anexado,
  .documento-item {
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
    height: 44px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .forms-saida-container {
    width: calc(100vw - 24px);
    padding: 16px;
    border-radius: 12px;
    height: auto;
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
  
  .textarea-field {
    min-height: 80px;
    font-size: 14px;
    padding: 12px;
  }
  
  .label-text {
    font-size: 14px;
  }
  
  .toggle-label {
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

/* Z-INDEX ESPECÍFICO PARA FORMS SAÍDAS */
::v-deep(.modal-overlay) {
  z-index: 30000 !important;
}

.forms-saida-container {
  z-index: 30100 !important;
  position: relative !important;
}

.forms-saida-container .dropdown-section .dropdown-container {
  z-index: 2000 !important;
  position: relative !important;
}

.forms-saida-container .dropdown-section .dropdown-options {
  z-index: 2000 !important;
  position: absolute !important;
}

.forms-saida-container .dropdown-section :deep(.dropdown-container) {
  z-index: 2000 !important;
  position: relative !important;
}

.forms-saida-container .dropdown-section :deep(.dropdown-options) {
  z-index: 2000 !important;
  position: absolute !important;
}

:deep(.overlay) {
  z-index: 99999 !important;
}
</style> 