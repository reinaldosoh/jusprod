<template>
  <div class="lista-recebiveis-container">
    <!-- Lista de recebíveis -->
    <div class="recebiveis-list">
      <div 
        v-for="recebivel in recebiveisFiltrados" 
        :key="recebivel.id"
        class="recebivel-item"
      >
        <!-- Cliente info with avatar -->
        <div class="recebivel-cliente">
          <div class="cliente-avatar">
            <span class="avatar-initials">{{ getInitials(recebivel.cliente_nome) }}</span>
          </div>
          <div class="cliente-info">
            <div class="cliente-nome">{{ recebivel.cliente_nome }}</div>
            <div v-if="recebivel.parcela_numero" class="parcela-info">
              Parcela {{ recebivel.parcela_numero }}
            </div>
          </div>
        </div>
        
        <!-- Transaction type -->
        <div class="recebivel-tipo">
          <span class="tipo-entrada">Entrada</span>
        </div>
        
        <!-- Date -->
        <div class="recebivel-data">
          {{ formatarData(recebivel.data_vencimento) }}
        </div>
        
        <!-- Value -->
        <div class="recebivel-valor">
          {{ formatarMoeda(recebivel.valor) }}
        </div>
        
        <!-- Actions -->
        <div class="recebivel-acoes">
          <button 
            class="acao-btn"
            @click="visualizarRecebivel(recebivel)"
            title="Visualizar"
          >
            <img src="/images/olhoinativo.svg" alt="Visualizar" class="acao-icon" />
          </button>
          <button 
            class="acao-btn"
            @click="editarRecebivel(recebivel)"
            title="Editar"
          >
            <img src="/images/editar.svg" alt="Editar" class="acao-icon" />
          </button>
          <button 
            class="acao-btn"
            @click="excluirRecebivel(recebivel)"
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
      <p>Carregando recebíveis...</p>
    </div>
    
    <!-- Empty state -->
    <div v-if="!loading && recebiveisFiltrados.length === 0" class="empty-state">
      <div v-if="props.termoPesquisa && recebiveis.length > 0" class="no-results">
        <h3>Nenhum resultado encontrado</h3>
        <p>Não encontramos recebíveis que correspondam à sua pesquisa por "{{ props.termoPesquisa }}"</p>
        <p>Tente usar termos diferentes ou remova o filtro de pesquisa.</p>
      </div>
      <EmptyFinanceiro v-else />
    </div>
  </div>

  <!-- Modal de confirmação de exclusão -->
  <ConfirmarExclusao
    v-if="showConfirmarExclusao && recebivelParaExcluir"
    :item="recebivelParaExcluir"
    :visible="showConfirmarExclusao"
    tipo="recebivel"
    @cancelar="handleCancelarExclusao"
    @excluir="handleConfirmarExclusao"
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import EmptyFinanceiro from '../../components/UI/empty_financeiro.vue'
import ConfirmarExclusao from './confirmarExclusao.vue'

const emit = defineEmits(['visualizar-recebivel', 'editar-recebivel', 'excluir-recebivel'])

// Props
const props = defineProps({
  tipoFiltro: {
    type: String,
    default: 'recebiveis'
  },
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
const recebiveis = ref([])
const recebiveisFiltrados = ref([])

// Estados do modal de confirmação
const showConfirmarExclusao = ref(false)
const recebivelParaExcluir = ref(null)

// Removidos dados de exemplo - apenas dados reais

// Função para filtrar recebíveis baseado no termo de pesquisa
const filtrarRecebiveis = () => {
  if (!props.termoPesquisa || props.termoPesquisa.trim() === '') {
    recebiveisFiltrados.value = recebiveis.value
    return
  }
  
  const termo = props.termoPesquisa.toLowerCase().trim()
  recebiveisFiltrados.value = recebiveis.value.filter(recebivel => {
    // Filtrar por nome do cliente
    const nomeCliente = (recebivel.cliente_nome || '').toLowerCase()
    
    // Filtrar por descrição se existir
    const descricao = (recebivel.descricao || '').toLowerCase()
    
    // Filtrar por valor (converter para string para busca)
    const valor = (recebivel.valor || '').toString()
    
    return nomeCliente.includes(termo) || 
           descricao.includes(termo) || 
           valor.includes(termo)
  })
}

// Função para carregar recebíveis
const carregarRecebiveis = async () => {
  try {
    loading.value = true
    
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js')
    
    // Verificar autenticação diretamente do Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('Erro de autenticação:', authError)
      return
    }
    
    // Buscar dados baseados no tipo de filtro
    let query
    
              if (props.tipoFiltro === 'recebiveis') {
      // Buscar parcelas com dados básicos primeiro
      const { data: parcelasData, error: parcelasError } = await supabase
        .from('recebiveis_parcelas')
        .select('*')
        .eq('uuid', user.id)
        .order('data_vencimento', { ascending: false })
      
      if (parcelasError) throw parcelasError
      
      if (parcelasData && parcelasData.length > 0) {
        // Buscar dados dos recebiveis separadamente
        const recebivelIds = [...new Set(parcelasData.map(p => p.recebivel_id))]
        
        const { data: recebivelData, error: recebivelError } = await supabase
          .from('recebiveis')
          .select(`
            id,
            descricao,
            cliente_id,
            clientes (
              nome,
              nome_fantasia
            )
          `)
          .in('id', recebivelIds)
        
        if (recebivelError) throw recebivelError
        
        // Mapear dados manualmente
        recebiveis.value = parcelasData.map(parcela => {
          const recebivel = recebivelData?.find(r => r.id === parcela.recebivel_id)
          return {
            id: parcela.id,
            parcela_numero: parcela.numero_parcela,
            recebivel_id: parcela.recebivel_id,
            cliente_nome: recebivel?.clientes?.nome || recebivel?.clientes?.nome_fantasia || 'Cliente não encontrado',
            valor: parcela.valor_parcela,
            data_vencimento: parcela.data_vencimento,
            status: parcela.pago ? 'pago' : 'pendente',
            descricao: recebivel?.descricao || 'Sem descrição'
          }
        })
        
        loading.value = false
        return
      }
      
      recebiveis.value = []
      loading.value = false
      return
          } else if (props.tipoFiltro === 'saidas') {
        query = supabase
          .from('saidas')
          .select(`
            id,
            valor,
            data_saida,
            ativo,
            cliente_id,
            clientes (
              nome,
              nome_fantasia
            )
          `)
          .eq('uuid', user.id)
          .eq('ativo', true)
          .order('data_saida', { ascending: false })
          } else if (props.tipoFiltro === 'outras_despesas') {
        query = supabase
          .from('outras_despesas')
          .select(`
            id,
            valor,
            data_saida,
            ativo,
            cliente_id,
            clientes (
              nome,
              nome_fantasia
            )
          `)
          .eq('uuid', user.id)
          .eq('ativo', true)
          .order('data_saida', { ascending: false })
          } else {
        // Fallback para recebiveis - buscar parcelas
        query = supabase
          .from('recebiveis_parcelas')
          .select(`
            id,
            numero_parcela,
            valor_parcela,
            data_vencimento,
            pago,
            recebivel_id,
            recebiveis!inner (
              id,
              descricao,
              cliente_id,
              ativo,
              clientes (
                nome,
                nome_fantasia
              )
            )
          `)
          .eq('uuid', user.id)
          .eq('recebiveis.ativo', true)
          .order('data_vencimento', { ascending: false })
    }
    
    // Aplicar filtros de data se fornecidos
    if (props.dataInicio) {
      const dataField = props.tipoFiltro === 'recebiveis' ? 'data_vencimento' : 'data_saida'
      query = query.gte(dataField, props.dataInicio)
    }
    if (props.dataFinal) {
      const dataField = props.tipoFiltro === 'recebiveis' ? 'data_vencimento' : 'data_saida'
      query = query.lte(dataField, props.dataFinal)
    }
    
    // Executar query apenas para outros tipos (não recebiveis)
    if (props.tipoFiltro !== 'recebiveis') {
      const { data, error } = await query
      
      if (error) {
        console.error('Erro na query:', error)
        throw error
      }
      
      // Mapear dados para outros tipos
      recebiveis.value = (data || []).map(item => ({
        id: item.id,
        cliente_nome: item.clientes?.nome || item.clientes?.nome_fantasia || 'Cliente não informado',
        valor: item.valor,
        data_vencimento: item.data_saida,
        status: item.status || 'ativo'
      }))
    }
    
  } catch (error) {
    console.error('Erro ao carregar recebíveis:', error)
    recebiveis.value = []
    recebiveisFiltrados.value = []
    loading.value = false
  } finally {
    // Aplicar filtro após carregar os dados
    filtrarRecebiveis()
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
const visualizarRecebivel = (recebivel) => {
  emit('visualizar-recebivel', recebivel)
}

const editarRecebivel = (recebivel) => {
  emit('editar-recebivel', recebivel)
}

const excluirRecebivel = (recebivel) => {
  console.log('🗑️ Iniciando processo de exclusão do recebível:', recebivel.id)
  recebivelParaExcluir.value = recebivel
  showConfirmarExclusao.value = true
}

// Handlers do modal de confirmação
const handleCancelarExclusao = () => {
  console.log('❌ Cancelando exclusão')
  showConfirmarExclusao.value = false
  recebivelParaExcluir.value = null
}

const handleConfirmarExclusao = () => {
  console.log('✅ [ListaRecebiveis] Exclusão confirmada - recarregando lista e notificando pai')
  const itemExcluido = recebivelParaExcluir.value
  
  showConfirmarExclusao.value = false
  recebivelParaExcluir.value = null
  
  // Recarregar lista após exclusão
  console.log('🔄 [ListaRecebiveis] Recarregando lista de recebíveis...')
  carregarRecebiveis()
  
  // Emitir evento para o pai recarregar os cards
  console.log('📢 [ListaRecebiveis] Emitindo evento excluir-recebivel para o pai')
  emit('excluir-recebivel', itemExcluido)
}

// Watchers para recarregar quando filtros mudarem
watch([() => props.tipoFiltro, () => props.dataInicio, () => props.dataFinal], () => {
  carregarRecebiveis()
})

// Watcher para filtrar quando termo de pesquisa mudar
watch(() => props.termoPesquisa, () => {
  filtrarRecebiveis()
})

// Lifecycle
onMounted(() => {
  carregarRecebiveis()
})

// Expor função para recarregar
defineExpose({
  recarregar: carregarRecebiveis
})
</script>

<style scoped>
.lista-recebiveis-container {
  width: 890px;
  background: transparent;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.recebiveis-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.recebivel-item {
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

.recebivel-item:hover {
  background: #F9FAFB;
  border-color: #D0D5DD;
}

.recebivel-cliente {
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

.parcela-info {
  font-size: 0.75rem;
  font-weight: 400;
  color: #667085;
  line-height: 1.25;
  margin: 0;
}

.recebivel-tipo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 140px;
}

.tipo-entrada {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1570EF;
  background: transparent;
  padding: 0;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.recebivel-data {
  font-size: 0.875rem;
  font-weight: 400;
  color: #475467;
  text-align: left;
  min-width: 100px;
}

.recebivel-valor {
  font-size: 0.875rem;
  font-weight: 600;
  color: #101828;
  text-align: right;
  min-width: 120px;
}

.recebivel-acoes {
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
  .lista-recebiveis-container {
    width: 100%;
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .lista-recebiveis-container {
    padding: 16px;
    margin: 0;
    width: 100%;
    max-width: 100%;
  }
  
  .recebiveis-list {
    gap: 12px;
  }
  
  .recebivel-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
  }
  
  .recebivel-cliente {
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
  
  .parcela-info {
    font-size: 0.875rem;
  }
  
  .recebivel-detalhes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
  }
  
  .recebivel-valor {
    font-size: 1.125rem;
    font-weight: 600;
    color: #101828;
    grid-column: 1 / -1;
    text-align: left;
    padding: 12px 0;
  }
  
  .recebivel-data {
    font-size: 0.875rem;
    color: #667085;
    text-align: left;
  }
  
  .recebivel-tipo {
    justify-self: end;
    min-width: auto;
  }
  
  .tipo-entrada {
    font-size: 0.875rem;
  }
  
  .recebivel-acoes {
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
  .lista-recebiveis-container {
    padding: 12px;
  }
  
  .recebiveis-list {
    gap: 8px;
  }
  
  .recebivel-item {
    padding: 12px;
  }
  
  .cliente-nome {
    font-size: 0.875rem;
  }
  
  .recebivel-valor {
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