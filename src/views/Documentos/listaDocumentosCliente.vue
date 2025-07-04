<template>
  <div class="lista-documentos-cliente-container">
    <!-- Header da tabela -->
    <div class="table-header">
      <div class="header-nome">Nome do arquivo</div>
      <div class="header-data">Data upload</div>
      <div class="header-acoes">Ações</div>
    </div>
    
    <!-- Lista de documentos -->
    <div class="documentos-list">
      <div 
        v-for="documento in documentos" 
        :key="documento.id"
        class="documento-item"
      >
        <div class="documento-info">
          <div class="documento-icon">
            <img src="/images/iconeDoc.svg" alt="Documento" class="doc-icon" />
          </div>
          <div class="documento-details">
            <div class="documento-nome">{{ documento.nome }}</div>
            <div class="documento-tipo">{{ formatarTamanhoTipo(documento) }}</div>
          </div>
        </div>
        
        <div class="documento-data">
          {{ formatarData(documento.created_at) }}
        </div>
        
        <div class="documento-acoes">
          <button 
            class="acoes-btn"
            @click="abrirAcoes(documento, $event)"
            title="Mais ações"
          >
            <img src="/images/iconMais.svg" alt="Mais ações" class="acoes-icon" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando documentos...</p>
    </div>
    
    <!-- Empty state -->
    <div v-if="!loading && documentos.length === 0">
      <EmptyDocs />
    </div>
    
    <!-- Menu de ações -->
    <AcoesDocumento
      :is-visible="mostrarMenuAcoes"
      :documento="documentoSelecionado"
      :posicao-x="posicaoMenuX"
      :posicao-y="posicaoMenuY"
      @fechar="fecharMenuAcoes"
      @acao-selecionada="handleAcaoSelecionada"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import EmptyDocs from '../../components/UI/empty_docs.vue'
import AcoesDocumento from './acoesDocumento.vue'

const emit = defineEmits(['acoes-documento', 'visualizar-documento', 'duplicar-documento', 'mover-documento', 'enviar-documento', 'exportar-documento', 'historico-documento', 'excluir-documento'])

// Props
const props = defineProps({
  pastaId: {
    type: [String, Number],
    default: null
  },
  termoBusca: {
    type: String,
    default: ''
  }
})

// Estados
const loading = ref(false)
const documentos = ref([])
const documentosOriginal = ref([])
const mostrarMenuAcoes = ref(false)
const documentoSelecionado = ref(null)
const posicaoMenuX = ref(0)
const posicaoMenuY = ref(0)

// Função para carregar documentos da pasta
const carregarDocumentosPasta = async () => {
  if (!props.pastaId) {
    documentos.value = []
    documentosOriginal.value = []
    return
  }

  try {
    loading.value = true
    
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js')
    
    // Buscar documentos da pasta
    const { data, error } = await supabase
      .from('documentos')
      .select('id, nome, html, pasta_id, created_at, url, "isFile", cliente_id')
      .eq('pasta_id', props.pastaId)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    documentosOriginal.value = data || []
    aplicarFiltro()
    
  } catch (error) {
    console.error('Erro ao carregar documentos da pasta:', error)
    documentos.value = []
    documentosOriginal.value = []
  } finally {
    loading.value = false
  }
}

// Função para aplicar filtro de busca
const aplicarFiltro = () => {
  if (!props.termoBusca || props.termoBusca.trim() === '') {
    documentos.value = documentosOriginal.value
    return
  }
  
  const termo = props.termoBusca.toLowerCase().trim()
  documentos.value = documentosOriginal.value.filter(doc => {
    // Buscar no nome do documento
    const nomeMatch = doc.nome.toLowerCase().includes(termo)
    
    // Buscar no conteúdo HTML (se existir)
    const conteudoMatch = doc.html ? doc.html.toLowerCase().includes(termo) : false
    
    return nomeMatch || conteudoMatch
  })
}

// Função para formatar tamanho e tipo do documento
const formatarTamanhoTipo = (documento) => {
  // Calcular tamanho aproximado baseado no conteúdo HTML
  const conteudo = documento.html || documento.url || ''
  const tamanhoBytes = new Blob([conteudo]).size
  const tamanhoKB = (tamanhoBytes / 1024).toFixed(1)
  const tamanhoMB = (tamanhoBytes / (1024 * 1024)).toFixed(1)
  
  let tamanhoFormatado
  if (tamanhoBytes < 1024) {
    tamanhoFormatado = `${tamanhoBytes} B`
  } else if (tamanhoBytes < 1024 * 1024) {
    tamanhoFormatado = `${tamanhoKB} KB`
  } else {
    tamanhoFormatado = `${tamanhoMB} MB`
  }
  
  // Determinar tipo baseado no isFile
  const tipo = documento.isFile ? 'FILE' : 'DOC'
  
  return `${tamanhoFormatado} • ${tipo}`
}

// Função para formatar data
const formatarData = (dataISO) => {
  if (!dataISO) return '-'
  
  const data = new Date(dataISO)
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Função para abrir ações do documento
const abrirAcoes = (documento, event) => {
  // Calcular posição do menu baseado no evento
  const rect = event.currentTarget.getBoundingClientRect()
  const scrollX = window.scrollX || document.documentElement.scrollLeft
  const scrollY = window.scrollY || document.documentElement.scrollTop
  
  // Dimensões do menu (responsivo baseado na largura da tela)
  const isMobile = window.innerWidth <= 768
  const menuWidth = window.innerWidth <= 480 ? 180 : isMobile ? 200 : 221
  const menuHeight = window.innerWidth <= 480 ? 185 : isMobile ? 205 : 233
  
  // Posição inicial: abaixo do botão, alinhado à direita
  let posX = rect.right + scrollX - menuWidth
  let posY = rect.bottom + scrollY + 8
  
  // Ajustes horizontais
  if (posX < 10) {
    posX = 10 + scrollX
  }
  if (posX + menuWidth > window.innerWidth - 10) {
    posX = window.innerWidth - menuWidth - 10 + scrollX
  }
  
  // Ajustes verticais
  const viewportBottom = window.innerHeight + scrollY
  const menuBottomPosition = posY + menuHeight
  
  if (menuBottomPosition > viewportBottom - 20) {
    // Se não couber embaixo, colocar acima do botão
    posY = rect.top + scrollY - menuHeight - 8
    
    // Se também não couber acima, ajustar para caber na tela
    if (posY < scrollY + 10) {
      posY = scrollY + 10
    }
  }
  
  posicaoMenuX.value = posX
  posicaoMenuY.value = posY
  
  documentoSelecionado.value = documento
  mostrarMenuAcoes.value = true
}

// Função para fechar menu de ações
const fecharMenuAcoes = () => {
  mostrarMenuAcoes.value = false
  documentoSelecionado.value = null
}

// Função para lidar com ações selecionadas
const handleAcaoSelecionada = (dadosAcao) => {
  const { acao, documento } = dadosAcao
  
  // Emitir evento específico para cada ação
  switch (acao) {
    case 'visualizar':
      emit('visualizar-documento', documento)
      break
    case 'duplicar':
      emit('duplicar-documento', documento)
      break
    case 'mover':
      emit('mover-documento', documento)
      break
    case 'enviar':
      emit('enviar-documento', documento)
      break
    case 'exportar':
      emit('exportar-documento', documento)
      break
    case 'historico':
      emit('historico-documento', documento)
      break
    case 'excluir':
      emit('excluir-documento', documento)
      break
    default:
      emit('acoes-documento', dadosAcao)
  }
}

// Watcher para recarregar quando pasta mudar
watch(() => props.pastaId, () => {
  carregarDocumentosPasta()
}, { immediate: true })

// Watcher para aplicar filtro quando termo de busca mudar
watch(() => props.termoBusca, () => {
  aplicarFiltro()
})

// Expor função para recarregar
defineExpose({
  recarregar: carregarDocumentosPasta
})
</script>

<style scoped>
.lista-documentos-cliente-container {
  width: 100%;
  background: white;
  max-width: 1280px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 2rem;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  margin-bottom: 0;
}

.header-nome {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-data {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 100px;
}

.header-acoes {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 60px;
  text-align: center;
}

.documentos-list {
  background: white;
  padding: 0 2rem;
}

.documento-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 2rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
  margin: 0 -2rem;
  padding-left: 2rem;
  padding-right: 2rem;
}

.documento-item:hover {
  background-color: #f9fafb;
}

.documento-item:last-child {
  border-bottom: none;
}

.documento-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.documento-icon {
  flex-shrink: 0;
}

.doc-icon {
  width: 40px;
  height: 40px;
}

.documento-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.documento-nome {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.25;
}

.documento-tipo {
  font-size: 0.75rem;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.25;
}

.documento-data {
  font-size: 0.875rem;
  font-weight: 400;
  color: #6b7280;
  min-width: 100px;
  text-align: left;
}

.documento-acoes {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.acoes-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.acoes-btn:hover {
  background-color: #f3f4f6;
}

.acoes-icon {
  width: 20px;
  height: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}



/* Responsivo */
@media (max-width: 768px) {
  .table-header {
    grid-template-columns: 1fr auto auto;
    gap: 1rem;
    padding: 0.75rem 1rem;
  }
  
  .documentos-list {
    padding: 0 1rem;
  }
  
  .documento-item {
    grid-template-columns: 1fr auto auto;
    gap: 1rem;
    padding: 0.75rem 0;
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .documento-nome {
    font-size: 0.8rem;
  }
  
  .documento-tipo {
    font-size: 0.7rem;
  }
  
  .documento-data {
    font-size: 0.8rem;
    min-width: 80px;
  }
  
  .header-nome,
  .header-data,
  .header-acoes {
    font-size: 0.7rem;
  }
  
  .header-data {
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .table-header {
    grid-template-columns: 1fr 70px 40px;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }
  
  .documentos-list {
    padding: 0 1rem;
  }
  
  .documento-item {
    grid-template-columns: 1fr 70px 40px;
    gap: 0.5rem;
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .documento-info {
    gap: 0.5rem;
  }
  
  .doc-icon {
    width: 32px;
    height: 32px;
  }
  
  .documento-data {
    font-size: 0.75rem;
    min-width: 70px;
  }
  
  .acoes-btn {
    width: 28px;
    height: 28px;
  }
  
  .acoes-icon {
    width: 16px;
    height: 16px;
  }
  
  .header-data {
    min-width: 70px;
  }
  
  .header-acoes {
    min-width: 40px;
  }
}
</style> 