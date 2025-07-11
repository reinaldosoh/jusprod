<template>
  <div class="lista-outras-despesas-container">
    <!-- Lista de outras despesas -->
    <div class="outras-despesas-list">
      <div 
        v-for="outrasDespesas in filtrarOutrasDespesas()" 
        :key="outrasDespesas.id"
        class="outras-despesas-item"
      >
        <!-- Cliente info with avatar -->
        <div class="outras-despesas-cliente">
          <div class="cliente-avatar">
            <span class="avatar-initials">{{ getInitials(outrasDespesas.cliente_nome) }}</span>
          </div>
          <div class="cliente-info">
            <div class="cliente-nome">{{ outrasDespesas.cliente_nome }}</div>
            <div class="titulo-info">
              {{ outrasDespesas.titulo }}
            </div>
          </div>
        </div>
        
        <!-- Transaction type -->
        <div class="outras-despesas-tipo">
          <span class="tipo-despesa">Despesa</span>
        </div>
        
        <!-- Date -->
        <div class="outras-despesas-data">
          {{ formatarData(outrasDespesas.data_saida) }}
        </div>
        
        <!-- Value -->
        <div class="outras-despesas-valor">
          {{ formatarMoeda(outrasDespesas.valor) }}
        </div>
        
        <!-- Actions -->
        <div class="outras-despesas-acoes">
          <button 
            class="acao-btn"
            @click="visualizarOutrasDespesas(outrasDespesas)"
            title="Visualizar"
          >
            <img src="/images/olhoinativo.svg" alt="Visualizar" class="acao-icon" />
          </button>
          <button 
            class="acao-btn"
            @click="editarOutrasDespesas(outrasDespesas)"
            title="Editar"
          >
            <img src="/images/editar.svg" alt="Editar" class="acao-icon" />
          </button>
          <button 
            class="acao-btn"
            @click="excluirOutrasDespesas(outrasDespesas)"
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
      <p>Carregando outras despesas...</p>
    </div>
    
    <!-- Empty state -->
    <div v-if="!loading && outrasDespesakList.length === 0">
      <EmptyFinanceiro />
    </div>
    
    <!-- Empty state for filtered results -->
    <div v-if="!loading && outrasDespesakList.length > 0 && filtrarOutrasDespesas().length === 0" class="empty-filtered-state">
      <p>Nenhuma despesa encontrada para os critérios de pesquisa.</p>
    </div>
  </div>

  <!-- Modal de confirmação de exclusão -->
  <ConfirmarExclusao
    v-if="showConfirmarExclusao && outrasDespesasParaExcluir"
    :item="outrasDespesasParaExcluir"
    :visible="showConfirmarExclusao"
    tipo="despesa"
    @cancelar="handleCancelarExclusao"
    @excluir="handleConfirmarExclusao"
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import EmptyFinanceiro from '../../components/UI/empty_financeiro.vue'
import ConfirmarExclusao from './confirmarExclusao.vue'

const emit = defineEmits(['visualizar-outras-despesas', 'editar-outras-despesas', 'excluir-outras-despesas'])

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
const outrasDespesakList = ref([])

// Estados do modal de confirmação
const showConfirmarExclusao = ref(false)
const outrasDespesasParaExcluir = ref(null)

// Função para carregar outras despesas
const carregarOutrasDespesas = async () => {
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
    
    // Buscar dados da tabela outras_despesas
    let query = supabase
      .from('outras_despesas')
      .select(`
        id,
        valor,
        titulo,
        data_saida,
        ativo,
        cliente_id,
        observacoes,
        clientes (
          nome,
          nome_fantasia
        )
      `)
      .eq('uuid', user.id)
      .eq('ativo', true)
      .order('data_saida', { ascending: false })
    
    // Aplicar filtros de data se fornecidos
    if (props.dataInicio) {
      query = query.gte('data_saida', props.dataInicio)
    }
    if (props.dataFinal) {
      query = query.lte('data_saida', props.dataFinal)
    }
    
    // Executar query
    const { data, error } = await query
    
    if (error) {
      console.error('Erro na query:', error)
      throw error
    }
    
    // Mapear dados
    outrasDespesakList.value = (data || []).map(item => ({
      id: item.id,
      cliente_nome: item.clientes?.nome || item.clientes?.nome_fantasia || 'Cliente não informado',
      titulo: item.titulo || 'Sem título',
      categoria_nome: 'Outras Despesas', // Categoria fixa já que não está na tabela
      valor: item.valor,
      data_saida: item.data_saida,
      status: item.status || 'ativo'
    }))
    
  } catch (error) {
    console.error('Erro ao carregar outras despesas:', error)
    outrasDespesakList.value = []
  } finally {
    loading.value = false
  }
}

// Função para filtrar outras despesas
const filtrarOutrasDespesas = () => {
  if (!props.termoPesquisa || props.termoPesquisa.trim() === '') {
    return outrasDespesakList.value
  }
  
  const termo = props.termoPesquisa.toLowerCase()
  return outrasDespesakList.value.filter(outrasDespesas => 
    outrasDespesas.cliente_nome.toLowerCase().includes(termo) ||
    outrasDespesas.titulo.toLowerCase().includes(termo)
  )
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
const visualizarOutrasDespesas = (outrasDespesas) => {
  emit('visualizar-outras-despesas', outrasDespesas)
}

const editarOutrasDespesas = (outrasDespesas) => {
  emit('editar-outras-despesas', outrasDespesas)
}

const excluirOutrasDespesas = (outrasDespesas) => {
  console.log('🗑️ Iniciando processo de exclusão de outras despesas:', outrasDespesas.id)
  outrasDespesasParaExcluir.value = outrasDespesas
  showConfirmarExclusao.value = true
}

// Handlers do modal de confirmação
const handleCancelarExclusao = () => {
  console.log('❌ Cancelando exclusão')
  showConfirmarExclusao.value = false
  outrasDespesasParaExcluir.value = null
}

const handleConfirmarExclusao = () => {
  console.log('✅ [ListaOutrasDespesas] Exclusão confirmada - recarregando lista e notificando pai')
  const itemExcluido = outrasDespesasParaExcluir.value
  
  showConfirmarExclusao.value = false
  outrasDespesasParaExcluir.value = null
  
  // Recarregar lista após exclusão
  console.log('🔄 [ListaOutrasDespesas] Recarregando lista de outras despesas...')
  carregarOutrasDespesas()
  
  // Emitir evento para o pai recarregar os cards
  console.log('📢 [ListaOutrasDespesas] Emitindo evento excluir-outras-despesas para o pai')
  emit('excluir-outras-despesas', itemExcluido)
}

// Watchers para recarregar quando filtros mudarem
watch([() => props.dataInicio, () => props.dataFinal], () => {
  carregarOutrasDespesas()
})

// Lifecycle
onMounted(() => {
  carregarOutrasDespesas()
})

// Expor função para recarregar
defineExpose({
  recarregar: carregarOutrasDespesas
})
</script>

<style scoped>
.lista-outras-despesas-container {
  width: 890px;
  background: transparent;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.outras-despesas-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.outras-despesas-item {
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

.outras-despesas-item:hover {
  background: #F9FAFB;
  border-color: #D0D5DD;
}

.outras-despesas-cliente {
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
  border: 1px solid #E5E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initials {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475467;
  line-height: 1;
}

.cliente-info {
  min-width: 0;
  flex: 1;
}

.cliente-nome {
  font-size: 0.875rem;
  font-weight: 500;
  color: #101828;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.titulo-info {
  font-size: 0.75rem;
  font-weight: 400;
  color: #667085;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.outras-despesas-tipo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 140px;
}

.tipo-despesa {
  font-size: 0.875rem;
  font-weight: 500;
  color: #101828;
  background: transparent;
  padding: 0;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.tipo-despesa::before {
  display: none;
}

.outras-despesas-data {
  font-size: 0.875rem;
  font-weight: 400;
  color: #475467;
  text-align: left;
  min-width: 100px;
}

.outras-despesas-valor {
  font-size: 0.875rem;
  font-weight: 600;
  color: #101828;
  text-align: right;
  min-width: 120px;
}

.outras-despesas-acoes {
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
  position: relative;
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
  position: relative;
  z-index: 1;
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

.empty-filtered-state {
  width: 100%;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 1px solid #E4E7EC;
}

.empty-filtered-state p {
  font-size: 1rem;
  color: #667085;
  font-weight: 500;
  margin: 0;
  line-height: 1.6;
}

/* Responsivo */
@media (max-width: 1200px) {
  .lista-outras-despesas-container {
    width: 100%;
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .lista-outras-despesas-container {
    padding: 16px;
    margin: 0;
    width: 100%;
    max-width: 100%;
  }
  
  .outras-despesas-list {
    gap: 12px;
  }
  
  .outras-despesas-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
  }
  
  .outras-despesas-cliente {
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
  
  .titulo-info {
    font-size: 0.875rem;
  }
  
  .outras-despesas-detalhes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
  }
  
  .outras-despesas-valor {
    font-size: 1.125rem;
    font-weight: 600;
    color: #101828;
    grid-column: 1 / -1;
    text-align: left;
    padding: 12px 0;
  }
  
  .outras-despesas-data {
    font-size: 0.875rem;
    color: #667085;
    text-align: left;
  }
  
  .outras-despesas-tipo {
    justify-self: end;
    min-width: auto;
  }
  
  .tipo-despesa {
    font-size: 0.875rem;
  }
  
  .outras-despesas-acoes {
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
  .lista-outras-despesas-container {
    padding: 12px;
  }
  
  .outras-despesas-list {
    gap: 8px;
  }
  
  .outras-despesas-item {
    padding: 12px;
  }
  
  .cliente-nome {
    font-size: 0.875rem;
  }
  
  .outras-despesas-valor {
    font-size: 1rem;
  }
  
  .outras-despesas-data {
    font-size: 0.875rem;
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