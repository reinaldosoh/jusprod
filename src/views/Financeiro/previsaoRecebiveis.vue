<template>
  <div class="previsao-container">
    <!-- Título -->
    <h2 class="titulo">Previsão de recebimentos</h2>
    
    <!-- Dropdown de Anos -->
    <div class="dropdown-container">
      <div 
        class="dropdown-header" 
        @click="toggleDropdown"
        :class="{ 'dropdown-header--open': dropdownAberto }"
      >
        <div class="dropdown-header-content">
          <img src="/images/funil.svg" alt="Filtro" class="dropdown-icon">
          <span class="dropdown-text">{{ anoSelecionado }}</span>
        </div>
        <svg 
          class="dropdown-arrow" 
          :class="{ 'dropdown-arrow--open': dropdownAberto }"
          width="12" 
          height="8" 
          viewBox="0 0 12 8" 
          fill="none"
        >
          <path d="M1 1.5L6 6.5L11 1.5" stroke="#0468FA" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
        </svg>
      </div>
      
      <div class="dropdown-options" v-if="dropdownAberto">
        <li 
          v-for="ano in anosDisponiveis" 
          :key="ano"
          class="dropdown-item"
          :class="{ 'dropdown-item--active': ano === anoSelecionado }"
          @click="selecionarAno(ano)"
        >
          {{ ano }}
        </li>
      </div>
    </div>

    <!-- Lista de Meses com Barras -->
    <div class="meses-container">
      <div 
        v-for="mes in mesesData" 
        :key="mes.nome"
        class="mes-item"
      >
        <div class="mes-label">{{ mes.nome }}</div>
        <div class="barra-container" @mouseenter="showTooltip(mes, $event)" @mousemove="updateTooltip(mes, $event)" @mouseleave="hideTooltip">
          <div class="barra-fundo"></div>
          <div 
            class="barra-progresso"
            :style="{ 
              width: mes.percentualProgresso + '%',
              backgroundColor: '#0468FA'
            }"
          ></div>
        </div>
        <div class="valor">{{ formatarMoeda(mes.valor) }}</div>
      </div>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="tooltip"
      :class="{ 'tooltip-below': tooltip.isBelow }"
      :style="{ 
        top: tooltip.y + 'px', 
        left: tooltip.x + 'px' 
      }"
    >
      <div class="tooltip-content">
        <div class="tooltip-title">{{ tooltip.mes }}</div>
        <div class="tooltip-valor">
          <span class="tooltip-label">Valor já vencido:</span>
          <span class="tooltip-amount">{{ formatarMoeda(tooltip.valorRecebido) }}</span>
        </div>
        <div class="tooltip-total">
          <span class="tooltip-label">Total do mês:</span>
          <span class="tooltip-amount">{{ formatarMoeda(tooltip.valorTotal) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Props para receber filtros de data (opcional)
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

// Estados reativos
const anoSelecionado = ref(2025)
const dropdownAberto = ref(false)
const carregando = ref(false)
const dadosRecebiveis = ref([])
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  mes: '',
  valorRecebido: 0,
  valorTotal: 0,
  isBelow: false
})

// Anos disponíveis (2025 + 10 anos à frente)
const anosDisponiveis = computed(() => {
  const anos = []
  const anoInicio = 2025
  
  for (let i = 0; i <= 10; i++) {
    anos.push(anoInicio + i)
  }
  return anos
})

// Nomes dos meses
const nomesMeses = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

// Dados dos meses calculados com base nos dados reais do banco
const mesesData = computed(() => {
  // Inicializar dados dos meses com valores zero
  const dados = nomesMeses.map(nome => ({
    nome,
    valor: 0,
    valorRecebido: 0,
    percentualProgresso: 0
  }))
  
  // Processar dados de recebíveis se existirem
  if (dadosRecebiveis.value && dadosRecebiveis.value.length > 0) {
    console.log('🔍 Processando parcelas para previsão:', {
      totalParcelas: dadosRecebiveis.value.length,
      anoSelecionado: anoSelecionado.value,
      usandoFiltroProps: !!(props.dataInicio && props.dataFinal),
      filtroProps: { dataInicio: props.dataInicio, dataFinal: props.dataFinal }
    })
    
    const dataHoje = new Date().toISOString().split('T')[0]
    console.log('📝 NOVA LÓGICA: "Valor vencido" = parcelas com data de vencimento até hoje (independente de estar paga)')
    console.log('📅 Data de referência (hoje):', dataHoje)
    
    dadosRecebiveis.value.forEach((parcela, index) => {
      const dataVencimento = new Date(parcela.data_vencimento)
      const ano = dataVencimento.getFullYear()
      const mes = dataVencimento.getMonth() // 0-11
      const valorParcela = parseFloat(parcela.valor_parcela) || 0
      
      console.log(`📅 Parcela ${index + 1}:`, {
        data_vencimento: parcela.data_vencimento,
        ano: ano,
        mes: mes,
        mesNome: nomesMeses[mes],
        valor_parcela: valorParcela,
        pago: parcela.pago
      })
      
      // Se estiver usando filtros de data dos props, processar todas as parcelas
      // Senão, filtrar apenas pelo ano selecionado
      const deveProcessar = (props.dataInicio && props.dataFinal) ? true : (ano === anoSelecionado.value)
      
      if (deveProcessar) {
        console.log(`✅ Processando parcela para ${nomesMeses[mes]}:`, {
          valorAnterior: dados[mes].valor,
          valorAdicionado: valorParcela,
          novoTotal: dados[mes].valor + valorParcela
        })
        
        // Adicionar ao valor total do mês
        dados[mes].valor += valorParcela
        
        // Se a parcela já venceu (data <= hoje), considerar como "recebida"
        const hoje = new Date()
        const dataVencimento = new Date(parcela.data_vencimento)
        
        // Zerar horários para comparar apenas datas
        hoje.setHours(0, 0, 0, 0)
        dataVencimento.setHours(0, 0, 0, 0)
        
        if (dataVencimento <= hoje) {
          dados[mes].valorRecebido += valorParcela
          console.log(`💰 Parcela considerada "recebida" (venceu até hoje):`, {
            data_vencimento: parcela.data_vencimento,
            valor: valorParcela,
            mes: nomesMeses[mes]
          })
        } else {
          console.log(`⏳ Parcela ainda não venceu:`, {
            data_vencimento: parcela.data_vencimento,
            valor: valorParcela,
            mes: nomesMeses[mes],
            diasParaVencer: Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24))
          })
        }
      } else {
        console.log(`❌ Parcela não processada (ano ${ano} != ${anoSelecionado.value})`)
      }
    })
    
    // Log dos totais por mês
    console.log('📊 Totais por mês calculados (nova lógica de vencimento):')
    dados.forEach(mes => {
      if (mes.valor > 0) {
        const percentual = Math.round((mes.valorRecebido / mes.valor) * 100)
        console.log(`${mes.nome}: R$ ${mes.valor.toFixed(2)} total | R$ ${mes.valorRecebido.toFixed(2)} vencido (${percentual}%)`)
      }
    })
    
    // Calcular percentual de progresso
    dados.forEach(mes => {
      if (mes.valor > 0) {
        mes.percentualProgresso = Math.round((mes.valorRecebido / mes.valor) * 100)
      }
    })
  }
  
  return dados
})

// Métodos
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

const toggleDropdown = () => {
  dropdownAberto.value = !dropdownAberto.value
}

const selecionarAno = (ano) => {
  console.log('🗓️ Ano selecionado mudou:', { de: anoSelecionado.value, para: ano })
  anoSelecionado.value = ano
  dropdownAberto.value = false
  carregarPrevisao()
}

// Fechar dropdown ao clicar fora
const fecharDropdown = (event) => {
  if (!event.target.closest('.dropdown-container')) {
    dropdownAberto.value = false
  }
}

const calcularValorRecebido = (nomeDoMes, valorTotal) => {
  // Encontrar o mês correspondente nos dados calculados
  const mesData = mesesData.value.find(mes => mes.nome === nomeDoMes)
  
  if (mesData) {
    return mesData.valorRecebido
  }
  
  return 0
}

const showTooltip = (mes, event) => {
  // Nota: valorRecebido aqui significa "valor já vencido" (não necessariamente pago)
  const valorRecebido = calcularValorRecebido(mes.nome, mes.valor)
  
  // Calcular posição do tooltip considerando o viewport
  const rect = event.currentTarget.getBoundingClientRect()
  const tooltipWidth = 220 // largura estimada do tooltip
  const tooltipHeight = 90 // altura estimada do tooltip
  
  let x = rect.left + (rect.width / 2) - (tooltipWidth / 2)
  let y = rect.top - tooltipHeight - 20
  let isBelow = false
  
  // Ajustar se o tooltip sair da tela horizontalmente
  if (x < 10) x = 10
  if (x + tooltipWidth > window.innerWidth - 10) x = window.innerWidth - tooltipWidth - 10
  
  // Ajustar se o tooltip sair da tela verticalmente
  if (y < 10) {
    y = rect.bottom + 20
    isBelow = true
  }
  
  tooltip.value = {
    visible: true,
    x: x,
    y: y,
    mes: mes.nome,
    valorRecebido: valorRecebido, // Na verdade é "valorVencido" 
    valorTotal: mes.valor,
    isBelow: isBelow
  }
}

const updateTooltip = (mes, event) => {
  if (!tooltip.value.visible) return
  
  // Calcular posição do tooltip considerando o viewport
  const rect = event.currentTarget.getBoundingClientRect()
  const tooltipWidth = 220 // largura estimada do tooltip
  const tooltipHeight = 90 // altura estimada do tooltip
  
  let x = rect.left + (rect.width / 2) - (tooltipWidth / 2)
  let y = rect.top - tooltipHeight - 20
  let isBelow = false
  
  // Ajustar se o tooltip sair da tela horizontalmente
  if (x < 10) x = 10
  if (x + tooltipWidth > window.innerWidth - 10) x = window.innerWidth - tooltipWidth - 10
  
  // Ajustar se o tooltip sair da tela verticalmente
  if (y < 10) {
    y = rect.bottom + 20
    isBelow = true
  }
  
  tooltip.value.x = x
  tooltip.value.y = y
  tooltip.value.isBelow = isBelow
}

const hideTooltip = () => {
  tooltip.value.visible = false
}

const carregarPrevisao = async () => {
  carregando.value = true
  
  try {
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js')
    
    // Verificar autenticação diretamente do Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('Usuário não autenticado:', authError)
      dadosRecebiveis.value = []
      return
    }
    
    console.log('Carregando previsão de recebimentos...', {
      userId: user.id,
      ano: anoSelecionado.value
    })

    // Buscar todas as parcelas do usuário
    let dataInicio, dataFim, aplicarFiltroData = false
    
    if (props.dataInicio && props.dataFinal) {
      // Se props de filtro estão definidos, usar eles
      dataInicio = props.dataInicio
      dataFim = props.dataFinal
      aplicarFiltroData = true
      console.log('🔍 Usando filtros de data dos props:', { dataInicio, dataFim })
    } else {
      // Se não há props de filtro, usar apenas ano selecionado
      dataInicio = `${anoSelecionado.value}-01-01`
      dataFim = `${anoSelecionado.value}-12-31`
      aplicarFiltroData = true
      console.log('🗓️ Usando filtros do ano selecionado:', { ano: anoSelecionado.value, dataInicio, dataFim })
    }
    
    let query = supabase
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
    
    // Aplicar filtros de data apenas se necessário
    if (aplicarFiltroData) {
      query = query
        .gte('data_vencimento', dataInicio)
        .lte('data_vencimento', dataFim)
    }
    
    query = query.order('data_vencimento', { ascending: true })
    
    const { data: parcelas, error: parcelasError } = await query
    
    if (parcelasError) {
      console.error('Erro ao buscar parcelas:', parcelasError)
      throw parcelasError
    }
    
    console.log('Parcelas encontradas:', parcelas?.length || 0)
    console.log('Dados detalhados das parcelas:', parcelas?.map(p => ({
      data_vencimento: p.data_vencimento,
      valor_parcela: p.valor_parcela,
      pago: p.pago,
      numero_parcela: p.numero_parcela,
      cliente: p.recebiveis?.clientes?.nome
    })))
    
    // Armazenar dados das parcelas
    dadosRecebiveis.value = parcelas || []
    
  } catch (error) {
    console.error('Erro ao carregar previsão de recebimentos:', error)
    dadosRecebiveis.value = []
  } finally {
    carregando.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Definir 2025 como padrão
  anoSelecionado.value = 2025
  console.log('🏗️ Componente montado com ano:', anoSelecionado.value)
  
  // Adicionar listener para fechar dropdown
  document.addEventListener('click', fecharDropdown)
  
  // Carregar dados iniciais
  carregarPrevisao()
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', fecharDropdown)
})

// Watchers
watch(() => anoSelecionado.value, () => {
  carregarPrevisao()
})

// Recarregar quando os filtros de data mudarem
watch([() => props.dataInicio, () => props.dataFinal], () => {
  carregarPrevisao()
})

// Função de recarregamento exposta
const recarregar = async () => {
  console.log('🔄 Recarregando previsão de recebimentos externamente')
  await carregarPrevisao()
}

// Expor função para recarregar dados externamente
defineExpose({
  recarregar
})
</script>

<style scoped>
.previsao-container {
  width: 334px; /* Ajustado -4px para alinhamento perfeito: 334+24+890=1248px */
  background: white;
  border-radius: 12px;
  border: 1px solid #EAECF0;
  padding: 24px;
  box-shadow: 0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);
}

.titulo {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #101828;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.dropdown-container {
  position: relative;
  margin-bottom: 24px;
  font-family: 'Inter', sans-serif;
  user-select: none;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: white;
  border: 1px solid #D0D5DD;
  color: #101828;
}

.dropdown-header:hover {
  border-color: #0468FA;
}

.dropdown-header:focus-within {
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.dropdown-header--open {
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.dropdown-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.dropdown-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #101828;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
}

.dropdown-arrow--open {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #0468FA;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dropdown-item {
  padding: 12px 16px;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Inter', sans-serif;
  list-style: none;
  color: #101828;
}

.dropdown-item:hover:not(.dropdown-item--active) {
  background-color: #f5f5f5;
}

.dropdown-item--active {
  background-color: #0468FA;
  color: white;
}

.meses-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mes-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 24px;
}

.mes-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #101828;
  width: 32px;
  flex-shrink: 0;
}

.barra-container {
  position: relative;
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #F2F4F7;
  overflow: hidden;
}

.barra-fundo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #F2F4F7;
}

.barra-progresso {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease, background-color 0.2s ease;
}

.valor {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #475467;
  width: 80px;
  text-align: right;
  flex-shrink: 0;
}

/* Animação para o carregamento */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.carregando {
  animation: pulse 1.5s infinite;
}

/* Tooltip */
.tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  animation: tooltipFadeIn 0.15s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-content {
  background: #0468FA;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(4, 104, 250, 0.25);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.4;
  width: 220px;
  position: relative;
}

.tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #0468FA;
}

.tooltip-below .tooltip-content::after {
  top: -12px;
  border-top-color: transparent;
  border-bottom-color: #0468FA;
}

.tooltip-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #F3F4F6;
}

.tooltip-valor,
.tooltip-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.tooltip-total {
  margin-bottom: 0;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-label {
  color: #D1D5DB;
  font-size: 12px;
}

.tooltip-amount {
  font-weight: 600;
  color: #F3F4F6;
  font-size: 13px;
}

.barra-container {
  cursor: pointer;
}

/* === RESPONSIVIDADE MOBILE === */
@media (max-width: 768px) {
  .previsao-container {
    width: calc(100vw - 32px);
    max-width: 400px;
    margin: 0 auto;
    padding: 16px;
    border-radius: 12px;
  }
  
  .titulo {
    font-size: 16px;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .dropdown-container {
    margin-bottom: 20px;
  }
  
  .dropdown-header {
    height: 48px;
    padding: 0 16px;
    font-size: 16px;
  }
  
  .dropdown-text {
    font-size: 16px;
  }
  
  .dropdown-item {
    height: 48px;
    padding: 12px 16px;
    font-size: 16px;
  }
  
  .meses-container {
    gap: 8px;
  }
  
  .mes-item {
    padding: 12px 0;
  }
  
  .mes-label {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .barra-container {
    height: 8px;
    margin-bottom: 8px;
  }
  
  .valor {
    font-size: 14px;
    text-align: right;
  }
}

@media (max-width: 480px) {
  .previsao-container {
    width: calc(100vw - 24px);
    max-width: 350px;
    padding: 12px;
    border-radius: 8px;
  }
  
  .titulo {
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .dropdown-header {
    height: 44px;
    font-size: 14px;
  }
  
  .dropdown-text {
    font-size: 14px;
  }
  
  .dropdown-item {
    height: 44px;
    font-size: 14px;
  }
  
  .mes-label {
    font-size: 12px;
  }
  
  .valor {
    font-size: 12px;
  }
}

/* === ESTILOS DESKTOP === */
.previsao-recebiveis-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  font-family: 'Inter', sans-serif;
  min-height: 400px;
  max-width: 600px;
  width: 100%;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.header-icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #0468FA;
  margin: 0;
}

.previsao-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.previsao-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #F9FAFB;
  border-radius: 16px;
  border: 1px solid #EAECF0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.previsao-item:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.previsao-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.previsao-titulo {
  font-size: 16px;
  font-weight: 600;
  color: #101828;
  margin: 0;
}

.previsao-cliente {
  font-size: 14px;
  color: #667085;
  margin: 0;
}

.previsao-detalhes {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.previsao-valor {
  font-size: 16px;
  font-weight: 600;
  color: #0468FA;
}

.previsao-data {
  font-size: 14px;
  color: #667085;
}

.previsao-status {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 8px;
  text-align: center;
}

.status-previsto {
  background: #EBF8FF;
  color: #0468FA;
}

.status-proximo {
  background: #FEF3C7;
  color: #D97706;
}

.status-atrasado {
  background: #FEF2F2;
  color: #DC2626;
}

.previsao-parcelas {
  font-size: 12px;
  color: #667085;
  background: #F9FAFB;
  padding: 4px 8px;
  border-radius: 8px;
  margin-left: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #101828;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 16px;
  color: #667085;
  line-height: 1.5;
  max-width: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #667085;
}
</style> 