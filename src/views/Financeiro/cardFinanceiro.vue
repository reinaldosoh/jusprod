<template>
  <div class="cards-container">
    <!-- Card 1 - Recebíveis -->
    <div class="card" @click="irParaRecebimentos">
      <div class="card-header">
        <img src="/images/card1.svg" alt="Recebíveis" class="card-icon-left">
        <img src="/images/plus.svg" alt="Adicionar" class="card-icon-right" @click.stop="adicionarRecebiveis">
      </div>
      <div class="card-content">
        <h3 class="card-title">Recebíveis</h3>
        <p class="card-value recebiveis" v-if="!carregando">{{ formatarMoeda(totalRecebiveis) }}</p>
        <div class="loading" v-else>Carregando...</div>
      </div>
    </div>

    <!-- Card 2 - Saídas -->
    <div class="card" @click="irParaSaidas">
      <div class="card-header">
        <img src="/images/card2.svg" alt="Saídas" class="card-icon-left">
        <img src="/images/plus.svg" alt="Adicionar" class="card-icon-right" @click.stop="adicionarSaidas">
      </div>
      <div class="card-content">
        <h3 class="card-title">Saídas</h3>
        <p class="card-value saidas" v-if="!carregando">{{ formatarMoeda(totalSaidas) }}</p>
        <div class="loading" v-else>Carregando...</div>
      </div>
    </div>

    <!-- Card 3 - Comparação -->
    <div class="card">
      <div class="card-header">
        <img src="/images/card3.svg" alt="Comparação" class="card-icon-left">
      </div>
      <div class="card-content" v-if="!carregando">
        <div class="comparacao-valores">
          <span class="valor-entrada">{{ formatarMoeda(totalRecebiveis) }}</span>
          <span class="separador"> - </span>
          <span class="valor-saida">{{ formatarMoeda(totalSaidas) }}</span>
        </div>
        <p class="card-value diferenca">{{ formatarMoeda(diferenca) }}</p>
        
        <!-- Barra de progresso -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: percentualEntrada + '%' }"></div>
          </div>
          <div class="progress-labels">
            <div class="label-entrada">
              <div class="label-indicator entrada"></div>
              <span class="label-text">Entrada</span>
            </div>
            <div class="label-saida">
              <div class="label-indicator saida"></div>
              <span class="label-text">Saída</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-content" v-else>
        <div class="loading">Carregando...</div>
      </div>
    </div>

    <!-- Card 4 - Outras despesas -->
    <div class="card" @click="irParaOutrasDespesas">
      <div class="card-header">
        <img src="/images/card4.svg" alt="Outras despesas" class="card-icon-left">
        <img src="/images/plus.svg" alt="Adicionar" class="card-icon-right" @click.stop="adicionarOutrasDespesas">
      </div>
      <div class="card-content">
        <h3 class="card-title">Outras despesas</h3>
        <p class="card-value outras-despesas" v-if="!carregando">{{ formatarMoeda(totalOutrasDespesas) }}</p>
        <div class="loading" v-else>Carregando...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

// Props para receber filtros de data
const props = defineProps({
  dataInicio: {
    type: String,
    default: null
  },
  dataFinal: {
    type: String,
    default: null
  }
})

// Dados reativos
const totalRecebiveis = ref(0)
const totalSaidas = ref(0)
const totalOutrasDespesas = ref(0)
const carregando = ref(false)

// Computed
const diferenca = computed(() => totalRecebiveis.value - totalSaidas.value)

const percentualEntrada = computed(() => {
  const total = totalRecebiveis.value + totalSaidas.value
  return total > 0 ? (totalRecebiveis.value / total) * 100 : 50
})

// Router
const router = useRouter()

// Emit para comunicar com o componente pai
const emit = defineEmits(['adicionar-recebiveis', 'adicionar-saidas', 'adicionar-outras-despesas'])

// Métodos
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

const adicionarRecebiveis = () => {
  emit('adicionar-recebiveis')
}

const adicionarSaidas = () => {
  emit('adicionar-saidas')
}

const adicionarOutrasDespesas = () => {
  emit('adicionar-outras-despesas')
}

const irParaRecebimentos = () => {
  router.push({ name: 'recebimentos' })
}

const irParaSaidas = () => {
  router.push({ name: 'saidas' })
}

const irParaOutrasDespesas = () => {
  router.push({ name: 'outrasDespesas' })
}

// Buscar dados das tabelas
const carregarDados = async () => {
  carregando.value = true
  
  console.log('💳 [CardFinanceiro] Iniciando carregamento de dados...')
  console.log('💳 [CardFinanceiro] Filtros atuais:', {
    dataInicio: props.dataInicio,
    dataFinal: props.dataFinal
  })
  
  try {
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js')
    
    // Verificar autenticação diretamente do Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('Usuário não autenticado')
      return
    }

    console.log('💳 Carregando dados financeiros para usuário:', user.id)
    console.log('💳 Filtros recebidos:', { 
      dataInicio: props.dataInicio, 
      dataFinal: props.dataFinal,
      temFiltros: !!(props.dataInicio && props.dataFinal)
    })

    // Buscar total de recebíveis das parcelas
    let queryRecebiveis = supabase
      .from('recebiveis_parcelas')
      .select('valor_parcela')
      .eq('uuid', user.id)
    
    // Aplicar filtros de data se fornecidos
    if (props.dataInicio && props.dataFinal) {
      console.log('🔍 Aplicando filtros de data para recebíveis:', { 
        dataInicio: props.dataInicio, 
        dataFinal: props.dataFinal,
        campo: 'data_vencimento'
      })
      queryRecebiveis = queryRecebiveis
        .gte('data_vencimento', props.dataInicio)
        .lte('data_vencimento', props.dataFinal)
    } else {
      console.log('📊 Buscando TODOS os recebíveis (sem filtros de data)')
    }

    const { data: dataRecebiveis, error: errorRecebiveis } = await queryRecebiveis

    if (errorRecebiveis) {
      console.error('Erro ao buscar recebíveis:', errorRecebiveis)
    } else {
      const totalRec = dataRecebiveis?.reduce((sum, item) => sum + (item.valor_parcela || 0), 0) || 0
      totalRecebiveis.value = totalRec
      console.log('Total recebíveis calculado:', totalRec, 'de', dataRecebiveis?.length || 0, 'registros')
    }

    // Buscar total de saídas
    let querySaidas = supabase
      .from('saidas')
      .select('valor')
      .eq('uuid', user.id)
      .eq('ativo', true)
    
    // Aplicar filtros de data APENAS se ambos estiverem definidos
    if (props.dataInicio && props.dataFinal) {
      console.log('🔍 Aplicando filtros de data para saídas:', { dataInicio: props.dataInicio, dataFinal: props.dataFinal })
      querySaidas = querySaidas
        .gte('data_saida', props.dataInicio)
        .lte('data_saida', props.dataFinal)
    } else {
      console.log('📊 Buscando TODAS as saídas (sem filtros de data)')
    }

    const { data: dataSaidas, error: errorSaidas } = await querySaidas

    if (errorSaidas) {
      console.error('Erro ao buscar saídas:', errorSaidas)
    } else {
      const totalSai = dataSaidas?.reduce((sum, item) => sum + (item.valor || 0), 0) || 0
      totalSaidas.value = totalSai
      console.log('Total saídas calculado:', totalSai, 'de', dataSaidas?.length || 0, 'registros')
    }

    // Buscar total de outras despesas
    let queryOutras = supabase
      .from('outras_despesas')
      .select('valor')
      .eq('uuid', user.id)
      .eq('ativo', true)
    
    // Aplicar filtros de data APENAS se ambos estiverem definidos
    if (props.dataInicio && props.dataFinal) {
      console.log('🔍 Aplicando filtros de data para outras despesas:', { dataInicio: props.dataInicio, dataFinal: props.dataFinal })
      queryOutras = queryOutras
        .gte('data_saida', props.dataInicio)
        .lte('data_saida', props.dataFinal)
    } else {
      console.log('📊 Buscando TODAS as outras despesas (sem filtros de data)')
    }

    const { data: dataOutras, error: errorOutras } = await queryOutras

    if (errorOutras) {
      console.error('Erro ao buscar outras despesas:', errorOutras)
    } else {
      const totalOut = dataOutras?.reduce((sum, item) => sum + (item.valor || 0), 0) || 0
      totalOutrasDespesas.value = totalOut
      console.log('Total outras despesas calculado:', totalOut, 'de', dataOutras?.length || 0, 'registros')
    }

    console.log('=== 💳 RESUMO FINAL DOS CARDS FINANCEIROS ===')
    console.log('💰 Total Recebíveis:', totalRecebiveis.value)
    console.log('💸 Total Saídas:', totalSaidas.value)
    console.log('💵 Total Outras Despesas:', totalOutrasDespesas.value)
    console.log('🎯 Diferença (Recebíveis - Saídas):', diferenca.value)
    console.log('📅 Período aplicado:', { 
      dataInicio: props.dataInicio || 'SEM FILTRO', 
      dataFinal: props.dataFinal || 'SEM FILTRO'
    })
    console.log('=== FIM RESUMO CARDS ===')

  } catch (error) {
    console.error('💳 [CardFinanceiro] Erro ao carregar dados financeiros:', error)
  } finally {
    carregando.value = false
    console.log('💳 [CardFinanceiro] Carregamento concluído!')
  }
}

// Observar mudanças nas datas para recarregar os dados
watch([() => props.dataInicio, () => props.dataFinal], () => {
  carregarDados()
})

// Lifecycle
onMounted(() => {
  carregarDados()
})

// Expor função para recarregar dados externamente
defineExpose({
  recarregar: carregarDados
})
</script>

<style scoped>
.cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Usar fração para preencher toda largura */
  gap: 24px;
  margin-top: 32px;
  justify-content: flex-start;
  max-width: 1248px; /* Largura máxima disponível (1280 - 32px padding) */
  margin: 32px auto 0 auto;
  width: 100%;
  padding-left: 0; /* Alinhado com as tabs */
  padding-right: 0;
}

.card {
  width: 100%; /* Ocupar toda largura disponível do grid */
  height: 208px;
  background: white;
  border-radius: 12px;
  border: 1px solid #EAECF0;
  padding: 24px;
  box-shadow: 0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: box-shadow 0.2s ease, transform 0.1s ease;
}

.card:first-child,
.card:nth-child(2),
.card:nth-child(4) {
  cursor: pointer;
}

.card:first-child:hover,
.card:nth-child(2):hover,
.card:nth-child(4):hover {
  box-shadow: 0px 4px 6px rgba(16, 24, 40, 0.12), 0px 2px 4px rgba(16, 24, 40, 0.08);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-icon-left {
  /* Dimensões padrão - serão sobrescritas pelas regras específicas */
}

/* Dimensões específicas para cada ícone */
.card-icon-left[src="/images/card1.svg"] {
  width: 63px;
  height: 37.8px;
}

.card-icon-left[src="/images/card2.svg"] {
  width: 63px;
  height: 37.8px;
}

.card-icon-left[src="/images/card3.svg"] {
  width: 63px;
  height: 37.8px;
}

.card-icon-left[src="/images/card4.svg"] {
  width: 37.8px;
  height: 37.8px;
}

.card-icon-right {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.card-icon-right:hover {
  opacity: 0.7;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.card-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #101828;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.card-value {
  font-family: 'Inter', sans-serif;
  font-size: 30px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.card-value.recebiveis {
  color: #0468FA;
}

.card-value.saidas {
  color: #F04438;
}

.card-value.outras-despesas {
  color: #000000;
}

.card-value.diferenca {
  color: #101828;
}

/* Card 3 - Comparação específico */
.comparacao-valores {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
}

.valor-entrada {
  color: #0468FA;
}

.separador {
  color: #101828;
  margin: 0 8px;
}

.valor-saida {
  color: #F04438;
}

.progress-container {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #F04438;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: #0468FA;
  transition: width 0.3s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-entrada,
.label-saida {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.label-indicator.entrada {
  background: #0468FA;
}

.label-indicator.saida {
  background: #F04438;
}

.label-text {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #475467;
}

.loading {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #475467;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr); /* 2 cards por linha preenchendo largura */
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 16px;
  }
  
  .card {
    width: 100%;
    max-width: 400px;
    justify-self: center;
  }
}
</style> 