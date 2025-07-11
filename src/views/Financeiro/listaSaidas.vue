<template>
  <div class="lista-saidas-container">
    <!-- Lista de saídas -->
    <div class="saidas-list">
      <div 
        v-for="saida in saidasFiltradas" 
        :key="saida.id"
        class="saida-item"
      >
        <!-- Cliente info with avatar -->
        <div class="saida-cliente">
          <div class="cliente-avatar">
            <span class="avatar-initials">{{ getInitials(saida.titulo) }}</span>
          </div>
          <div class="cliente-info">
            <div class="cliente-nome">{{ saida.titulo || 'Título não informado' }}</div>
            <div class="categoria-info">
              {{ saida.categoria_nome || 'Categoria não informada' }}
            </div>
          </div>
        </div>
        
        <!-- Transaction type -->
        <div class="saida-tipo">
          <span class="tipo-saida">Saída</span>
        </div>
        
        <!-- Date -->
        <div class="saida-data">
          {{ formatarData(saida.data_saida) }}
        </div>
        
        <!-- Value -->
        <div class="saida-valor">
          {{ formatarMoeda(saida.valor) }}
        </div>
        
        <!-- Actions -->
        <div class="saida-acoes">
          <button 
            class="acao-btn"
            @click="visualizarSaida(saida)"
            title="Visualizar"
          >
            <img src="/images/olhoinativo.svg" alt="Visualizar" class="acao-icon" />
          </button>
          <button 
            class="acao-btn"
            @click="editarSaida(saida)"
            title="Editar"
          >
            <img src="/images/editar.svg" alt="Editar" class="acao-icon" />
          </button>
          <button 
            class="acao-btn"
            @click="excluirSaida(saida)"
            title="Excluir"
          >
            <img src="/images/lixeira.svg" alt="Excluir" class="acao-icon" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando saídas...</p>
    </div>
    
    <!-- Empty state -->
    <div v-if="!loading && saidasFiltradas.length === 0" class="empty-state">
      <div v-if="props.termoPesquisa && saidas.length > 0" class="no-results">
        <h3>Nenhum resultado encontrado</h3>
        <p>Não encontramos saídas que correspondam à sua pesquisa por "{{ props.termoPesquisa }}"</p>
        <p>Tente usar termos diferentes ou remova o filtro de pesquisa.</p>
      </div>
      <EmptyFinanceiro v-else />
    </div>
  </div>

  <!-- Modal de confirmação de exclusão -->
  <ConfirmarExclusao
    v-if="showConfirmarExclusao && saidaParaExcluir"
    :item="saidaParaExcluir"
    :visible="showConfirmarExclusao"
    tipo="saida"
    @cancelar="handleCancelarExclusao"
    @excluir="handleConfirmarExclusao"
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import EmptyFinanceiro from '../../components/UI/empty_financeiro.vue'
import ConfirmarExclusao from './confirmarExclusao.vue'

const emit = defineEmits(['visualizar-saida', 'editar-saida', 'excluir-saida'])

// Props
const props = defineProps({
  dataInicio: {
    type: String,
    default: null
  },
  dataFinal: {
    type: String,
    default: null
  },
  termoPesquisa: {
    type: String,
    default: ''
  }
})

// Estados
const loading = ref(false)
const saidas = ref([])
const saidasFiltradas = ref([])

// Estados do modal de confirmação
const showConfirmarExclusao = ref(false)
const saidaParaExcluir = ref(null)

// Função para filtrar saídas baseado no termo de pesquisa
const filtrarSaidas = () => {
  if (!props.termoPesquisa || props.termoPesquisa.trim() === '') {
    saidasFiltradas.value = saidas.value
    return
  }
  
  const termo = props.termoPesquisa.toLowerCase().trim()
  saidasFiltradas.value = saidas.value.filter(saida => {
    // Filtrar por título
    const titulo = (saida.titulo || '').toLowerCase()
    
    // Filtrar por categoria se existir
    const categoria = (saida.categoria_nome || '').toLowerCase()
    
    // Filtrar por valor (converter para string para busca)
    const valor = (saida.valor || '').toString()
    
    return titulo.includes(termo) || 
           categoria.includes(termo) || 
           valor.includes(termo)
  })
}

// Função para carregar saídas
const carregarSaidas = async () => {
  try {
    console.log('🔄 Iniciando carregamento de saídas...')
    loading.value = true
    
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js')
    
    // Verificar autenticação diretamente do Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError)
      return
    }
    
    console.log('👤 Usuário autenticado:', user.id)
    
    console.log('📋 Construindo query para tabela saidas...')
    
    // Buscar saídas (query simplificada primeiro)
    let query = supabase
      .from('saidas')
      .select(`
        id,
        valor,
        titulo,
        data_saida,
        observacoes,
        recorrencia_mensal,
        ativo,
        cliente_id,
        categoria_id
      `)
      .eq('uuid', user.id)
      .eq('ativo', true)
      .order('data_saida', { ascending: false })
    
    console.log('🔍 Executando query...')
    
    // Aplicar filtros de data se fornecidos
    if (props.dataInicio) {
      query = query.gte('data_saida', props.dataInicio)
    }
    if (props.dataFinal) {
      query = query.lte('data_saida', props.dataFinal)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro na query:', error)
      throw error
    }
    
    // Mapear dados das saídas (sem joins por enquanto)
    saidas.value = (data || []).map(item => ({
      id: item.id,
      titulo: item.titulo,
      cliente_nome: 'Cliente não informado', // Temporário até configurar joins
      categoria_nome: 'Categoria não informada', // Temporário até configurar joins
      valor: item.valor,
      data_saida: item.data_saida,
      observacoes: item.observacoes,
      recorrencia_mensal: item.recorrencia_mensal,
      cliente_id: item.cliente_id,
      categoria_id: item.categoria_id
    }))
    
    console.log('✅ Saídas carregadas:', saidas.value.length)
    console.log('📊 Dados das saídas:', saidas.value)
    
  } catch (error) {
    console.error('Erro ao carregar saídas:', error)
    saidas.value = []
    saidasFiltradas.value = []
  } finally {
    loading.value = false
    // Aplicar filtro após carregar os dados
    filtrarSaidas()
  }
}

// Função para obter iniciais do nome
const getInitials = (nome) => {
  if (!nome) return '??'
  
  const nomes = nome.split(' ')
  if (nomes.length >= 2) {
    return (nomes[0][0] + nomes[1][0]).toUpperCase()
  }
  return nome.substring(0, 2).toUpperCase()
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

// Função para formatar moeda
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

// Funções de ações
const visualizarSaida = (saida) => {
  console.log('👁️ Visualizando saída:', saida.id)
  emit('visualizar-saida', saida)
}

const editarSaida = (saida) => {
  console.log('✏️ Editando saída:', saida.id)
  emit('editar-saida', saida)
}

const excluirSaida = (saida) => {
  console.log('🗑️ Iniciando processo de exclusão da saída:', saida.id)
  saidaParaExcluir.value = saida
  showConfirmarExclusao.value = true
}

// Handlers do modal de confirmação
const handleCancelarExclusao = () => {
  console.log('❌ Cancelando exclusão')
  showConfirmarExclusao.value = false
  saidaParaExcluir.value = null
}

const handleConfirmarExclusao = () => {
  console.log('✅ [ListaSaidas] Exclusão confirmada - recarregando lista e notificando pai')
  const itemExcluido = saidaParaExcluir.value
  
  showConfirmarExclusao.value = false
  saidaParaExcluir.value = null
  
  // Recarregar lista após exclusão
  console.log('🔄 [ListaSaidas] Recarregando lista de saídas...')
  carregarSaidas()
  
  // Emitir evento para o pai recarregar os cards
  console.log('📢 [ListaSaidas] Emitindo evento excluir-saida para o pai')
  emit('excluir-saida', itemExcluido)
}

// Watchers para recarregar quando filtros mudarem
watch([() => props.dataInicio, () => props.dataFinal], () => {
  carregarSaidas()
})

// Watcher para filtrar quando termo de pesquisa mudar
watch(() => props.termoPesquisa, () => {
  filtrarSaidas()
})

// Lifecycle
onMounted(() => {
  carregarSaidas()
})

// Expor função para recarregar
defineExpose({
  recarregar: carregarSaidas
})
</script>

<style scoped>
.lista-saidas-container {
  width: 890px;
  background: transparent;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.saidas-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.saida-item {
  background: white;
  border-radius: 8px;
  border: 1px solid #EAECF0;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: 1fr 140px 100px 120px 140px;
  gap: 1rem;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
}

.saida-item:hover {
  background: #F9FAFB;
  border-color: #D0D5DD;
}

.saida-cliente {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.cliente-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F2F4F7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #E4E7EC;
}

.avatar-initials {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475467;
}

.cliente-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cliente-nome {
  font-size: 0.875rem;
  font-weight: 500;
  color: #101828;
  line-height: 1.25;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.descricao-info {
  font-size: 0.75rem;
  font-weight: 400;
  color: #667085;
  line-height: 1.25;
  margin: 0;
}

.saida-tipo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 140px;
}

.tipo-saida {
  font-size: 0.875rem;
  font-weight: 500;
  color: #F04438;
  background: transparent;
  padding: 0;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.saida-data {
  font-size: 0.875rem;
  font-weight: 400;
  color: #475467;
  text-align: left;
  min-width: 100px;
}

.saida-valor {
  font-size: 0.875rem;
  font-weight: 600;
  color: #101828;
  text-align: right;
  min-width: 120px;
}

.saida-acoes {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 140px;
}

.acao-btn {
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
}

.acao-btn:hover {
  background: #F9FAFB;
  border-color: #98A2B3;
}

.acao-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.acao-btn:hover .acao-icon {
  opacity: 1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #E4E7EC;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #E4E7EC;
  border-top: 2px solid #1570EF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 0.875rem;
  color: #667085;
  font-weight: 400;
  margin: 0;
}

.empty-state {
  width: 100%;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #E4E7EC;
}

.no-results h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #101828;
  margin-bottom: 8px;
}

.no-results p {
  font-size: 0.875rem;
  color: #667085;
  margin-bottom: 4px;
  max-width: 400px;
  line-height: 1.5;
}

/* Responsivo */
@media (max-width: 1200px) {
  .lista-saidas-container {
    width: 100%;
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .lista-saidas-container {
    padding: 16px;
    margin: 0;
    width: 100%;
    max-width: 100%;
  }
  
  .saidas-list {
    gap: 12px;
  }
  
  .saida-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
  }
  
  .saida-cliente {
    width: 100%;
    gap: 12px;
  }
  
  .cliente-avatar {
    width: 40px;
    height: 40px;
  }
  
  .avatar-initials {
    font-size: 0.875rem;
  }
  
  .cliente-nome {
    font-size: 1rem;
    font-weight: 500;
  }
  
  .descricao-info {
    font-size: 0.875rem;
  }
  
  .saida-detalhes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
  }
  
  .saida-valor {
    font-size: 1.125rem;
    font-weight: 600;
    color: #101828;
    grid-column: 1 / -1;
    text-align: left;
    padding: 12px 0;
  }
  
  .saida-data {
    font-size: 0.875rem;
    color: #667085;
    text-align: left;
  }
  
  .saida-tipo {
    justify-self: end;
    min-width: auto;
  }
  
  .tipo-saida {
    font-size: 0.875rem;
  }
  
  .saida-acoes {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
    margin-top: 8px;
  }
  
  .acao-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }
  
  .acao-icon {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .lista-saidas-container {
    padding: 12px;
  }
  
  .saidas-list {
    gap: 8px;
  }
  
  .saida-item {
    padding: 12px;
  }
  
  .cliente-nome {
    font-size: 0.875rem;
  }
  
  .saida-valor {
    font-size: 1rem;
  }
  
  .acao-btn {
    width: 32px;
    height: 32px;
  }
  
  .acao-icon {
    width: 16px;
    height: 16px;
  }
}
</style> 