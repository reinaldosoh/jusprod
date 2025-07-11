<template>
  <div class="cards-dashboard-container">
    <!-- Card 1: Processos -->
    <div class="dashboard-card">
      <div class="card-header">
        <img src="/images/grupoProcesso.svg" alt="Processos" class="card-icon" />
        <h3 class="card-title">Processos</h3>
      </div>
      <div class="card-content">
        <div class="stats-labels">
          <span class="stat-label">Ativos</span>
          <span class="stat-label archived-label">Arquivados</span>
        </div>
        <div class="stats-display">
          <span class="stat-value active">{{ processosAtivos }}</span>
          <span class="stat-divider">/</span>
          <span class="stat-value archived">{{ processosArquivados }}</span>
        </div>
      </div>
    </div>

    <!-- Card 2: Meus Clientes -->
    <div class="dashboard-card">
      <div class="card-header">
        <img src="/images/meusclientes.svg" alt="Clientes" class="card-icon" />
        <h3 class="card-title">Meus clientes</h3>
      </div>
      <div class="card-content">
        <div class="stats-labels">
          <span class="stat-label">Ativos</span>
          <span class="stat-label archived-label">Total</span>
        </div>
        <div class="stats-display">
          <span class="stat-value active">{{ clientesAtivos }}</span>
          <span class="stat-divider">/</span>
          <span class="stat-value archived">{{ clientesTotal }}</span>
        </div>
      </div>
    </div>

    <!-- Card 3: Financeiro -->
    <div class="dashboard-card financial-card">
      <div class="card-header">
        <img src="/images/financiamento.svg" alt="Financeiro" class="card-icon" />
        <h3 class="card-title">Financeiro</h3>
        <button @click="toggleVisibilidade" class="visibility-toggle">
          <img 
            :src="valoresVisiveis ? '/images/view.svg' : '/images/view.svg'" 
            :alt="valoresVisiveis ? 'Ocultar valores' : 'Mostrar valores'"
            :class="{ 'active': valoresVisiveis, 'inactive': !valoresVisiveis }"
          />
        </button>
      </div>
      <div class="card-content">
        <div class="financial-stats">
          <div class="financial-item recebiveis">
            <img src="/images/seta_azul.svg" alt="Recebíveis" class="financial-icon-small" />
            <span class="financial-label-inline">Recebíveis</span>
            <span class="financial-value-inline recebiveis-value">
              {{ valoresVisiveis ? formatarMoeda(totalRecebiveis) : 'R$ ******' }}
            </span>
          </div>
          <div class="financial-item despesas">
            <img src="/images/seta_vermelho.svg" alt="Despesas" class="financial-icon-small" />
            <span class="financial-label-inline">Despesas</span>
            <span class="financial-value-inline despesas-value">
              {{ valoresVisiveis ? formatarMoeda(totalDespesas) : 'R$ ******' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../../lib/supabase'

// Props
const props = defineProps({
  filtroFinanceiro: {
    type: Object,
    default: () => ({
      periodo: 'mes_atual',
      dataInicio: '',
      dataFim: ''
    })
  }
})

// Estados
const processosAtivos = ref(0)
const processosArquivados = ref(0)
const clientesAtivos = ref(0)
const clientesTotal = ref(0)
const totalRecebiveis = ref(0)
const totalDespesas = ref(0)
const valoresVisiveis = ref(true)
const carregando = ref(true)

// Computed
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0)
}

// Funções
const toggleVisibilidade = () => {
  valoresVisiveis.value = !valoresVisiveis.value
}

const carregarProcessos = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    // Processos ativos
    const { data: ativos } = await supabase
      .from('processos')
      .select('id')
      .eq('uuid', session.user.id)
      .eq('arquivado', false)

    // Processos arquivados
    const { data: arquivados } = await supabase
      .from('processos')
      .select('id')
      .eq('uuid', session.user.id)
      .eq('arquivado', true)

    processosAtivos.value = ativos?.length || 0
    processosArquivados.value = arquivados?.length || 0
  } catch (error) {
    console.error('Erro ao carregar processos:', error)
  }
}

const carregarClientes = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    // Clientes ativos
    const { data: ativos } = await supabase
      .from('clientes')
      .select('id')
      .eq('uuid', session.user.id)
      .eq('ativo', true)

    // Total de clientes
    const { data: total } = await supabase
      .from('clientes')
      .select('id')
      .eq('uuid', session.user.id)

    clientesAtivos.value = ativos?.length || 0
    clientesTotal.value = total?.length || 0
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

const carregarDadosFinanceiros = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const { dataInicio, dataFim } = props.filtroFinanceiro

    // Carregar recebíveis
    let queryRecebiveis = supabase
      .from('recebiveis')
      .select('valor_total')
      .eq('uuid', session.user.id)
      .eq('ativo', true)

    // Aplicar filtros de data apenas se estiverem definidos
    if (dataInicio && dataFim) {
      queryRecebiveis = queryRecebiveis
        .gte('data_lancamento', dataInicio)
        .lte('data_lancamento', dataFim)
    }

    const { data: recebiveis } = await queryRecebiveis

    // Carregar saídas (despesas)
    let querySaidas = supabase
      .from('saidas')
      .select('valor')
      .eq('uuid', session.user.id)
      .eq('ativo', true)

    if (dataInicio && dataFim) {
      querySaidas = querySaidas
        .gte('data_saida', dataInicio)
        .lte('data_saida', dataFim)
    }

    const { data: saidas } = await querySaidas

    // Carregar outras despesas
    let queryOutrasDespesas = supabase
      .from('outras_despesas')
      .select('valor')
      .eq('uuid', session.user.id)
      .eq('ativo', true)

    if (dataInicio && dataFim) {
      queryOutrasDespesas = queryOutrasDespesas
        .gte('data_saida', dataInicio)
        .lte('data_saida', dataFim)
    }

    const { data: outrasDespesas } = await queryOutrasDespesas

    // Calcular totais
    totalRecebiveis.value = recebiveis?.reduce((acc, item) => acc + parseFloat(item.valor_total || 0), 0) || 0
    
    const totalSaidas = saidas?.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0) || 0
    const totalOutrasDespesas = outrasDespesas?.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0) || 0
    totalDespesas.value = totalSaidas + totalOutrasDespesas

  } catch (error) {
    console.error('Erro ao carregar dados financeiros:', error)
  }
}

const carregarTodosDados = async () => {
  carregando.value = true
  await Promise.all([
    carregarProcessos(),
    carregarClientes(),
    carregarDadosFinanceiros()
  ])
  carregando.value = false
}

// Watchers
watch(() => props.filtroFinanceiro, () => {
  carregarDadosFinanceiros()
}, { deep: true })

// Lifecycle
onMounted(() => {
  carregarTodosDados()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.cards-dashboard-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 0;
  width: 100%;
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  transition: box-shadow 0.2s;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 146px;
}

.dashboard-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.card-icon {
  width: 44.7px;
  height: 44.7px;
  flex-shrink: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  font-family: 'Inter', sans-serif;
}

.visibility-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.visibility-toggle:hover {
  background-color: #F3F4F6;
}

.visibility-toggle img {
  width: 20px;
  height: 20px;
  transition: filter 0.2s;
}

.visibility-toggle img.active {
  filter: brightness(0) saturate(100%) invert(26%) sepia(89%) saturate(1583%) hue-rotate(212deg) brightness(97%) contrast(101%); /* Azul #0468FA */
}

.visibility-toggle img.inactive {
  filter: brightness(0) saturate(100%) invert(60%) sepia(8%) saturate(635%) hue-rotate(186deg) brightness(90%) contrast(88%); /* Cinza */
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 8px;
}

/* Labels agora ficam acima dos valores */
.stats-labels {
  display: flex;
  gap: 40px;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 12px;
  color: #6B7280;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
}

.stat-label.archived-label {
  color: #B3B8C3;
  margin-left: -30px;
}

/* Layout dos stats - formato horizontal como "38/459" */
.stats-display {
  display: flex;
  align-items: baseline;
  margin-top: -8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}

.stat-value.active {
  color: #585858;
}

.stat-value.archived {
  color: #B3B8C3;
}

.stat-divider {
  font-size: 32px;
  color: #E5E7EB;
  font-weight: 300;
  margin: 0 4px;
  font-family: 'Inter', sans-serif;
}

/* Financial Card Styles - Novo layout horizontal */
.financial-card {
  /* Mesmo estilo base do dashboard-card */
}

.financial-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.financial-item {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
  width: 100%;
}

.financial-icon-small {
  width: 12px;
  height: 16px;
  flex-shrink: 0;
}

.financial-label-inline {
  font-size: 10px;
  color: #6B7280;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  flex-shrink: 0;
}

.financial-value-inline {
  font-size: 20px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  margin-left: 8px;
}

.financial-value-inline.recebiveis-value {
  color: #0468FA;
}

.financial-value-inline.despesas-value {
  color: #F04438;
  margin-left: 12px;
}

.financial-item.despesas {
  margin-top: -8px;
}

/* Mobile Layout */
@media (max-width: 768px) {
  .cards-dashboard-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .dashboard-card {
    padding: 16px;
    width: 100%;
    height: auto;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .financial-value {
    font-size: 16px;
  }
  
  .stats-labels {
    gap: 30px;
  }
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .cards-dashboard-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .dashboard-card {
    width: 100%;
    max-width: 297px;
  }
}
</style> 