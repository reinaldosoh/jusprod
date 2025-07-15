<template>
  <div class="agenda-container">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Carregando compromissos...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="buscarCompromissos" class="retry-button">Tentar novamente</button>
    </div>

    <!-- Visualização Dia -->
    <div v-if="tipoVisualizacao === 'dia'" class="agenda-dia">
      <div class="agenda-header-dia">
        <div class="agenda-time-column"></div>
        <div class="agenda-dia-header-single">
          <div class="agenda-dia-data-large">{{ diaSelecionado.dataExibicao }}</div>
          <div class="agenda-dia-nome-large">{{ diaSelecionado.nome }}</div>
        </div>
      </div>
      <div class="agenda-body-dia">
        <div class="agenda-horas">
          <div class="agenda-hora" v-for="hora in horasDia" :key="hora">{{ hora }}</div>
        </div>
        <div class="agenda-coluna-unica">
          <div class="agenda-slot-hora" v-for="hora in horasDia" :key="hora"></div>
          <!-- Compromissos do dia -->
          <div 
            v-for="compromisso in compromissosDoDia(diaSelecionado.data)" 
            :key="compromisso.id"
            :style="estiloCompromisso(compromisso)"
            class="agenda-compromisso"
            @click="selecionarCompromisso(compromisso)"
            @mouseenter="showTooltip(compromisso, $event)"
            @mousemove="updateTooltip(compromisso, $event)"
            @mouseleave="hideTooltip"
          >
            <div class="compromisso-titulo">{{ compromisso.titulo }}</div>
            <div class="compromisso-hora">{{ formatarHora(compromisso.inicio) }} - {{ formatarHora(compromisso.fim) }}</div>
            <div class="compromisso-categoria">{{ compromisso.categoria_nome }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualização Semana Mobile (vertical) -->
    <div v-if="tipoVisualizacao === 'semana' && isMobile" class="agenda-semanal-mobile">
      <div v-for="(dia, idx) in diasSemana" :key="idx" class="dia-mobile-container">
        <div class="dia-mobile-header">
          <div class="dia-mobile-data">{{ dia.dataExibicao }}</div>
          <div class="dia-mobile-nome">{{ dia.nome }}</div>
        </div>
        
        <div class="dia-mobile-content">
          <div class="compromissos-mobile">
            <div 
              v-for="compromisso in compromissosDoDia(dia.data)" 
              :key="compromisso.id"
              class="compromisso-mobile"
              :style="{ backgroundColor: compromisso.categoria_cor }"
              @click="selecionarCompromisso(compromisso)"
            >
              <div class="compromisso-mobile-info">
                <div class="compromisso-mobile-titulo">{{ compromisso.titulo }}</div>
                <div class="compromisso-mobile-hora">{{ formatarHora(compromisso.inicio) }} - {{ formatarHora(compromisso.fim) }}</div>
                <div class="compromisso-mobile-categoria">{{ compromisso.categoria_nome }}</div>
              </div>
            </div>
            
            <!-- Mensagem quando não há compromissos -->
            <div v-if="compromissosDoDia(dia.data).length === 0" class="sem-compromissos-mobile">
              Nenhum compromisso
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualização Semana (padrão desktop) -->
    <div v-if="tipoVisualizacao === 'semana' && !isMobile" class="agenda-semanal">
      <div class="agenda-header">
        <div class="agenda-time-column"></div>
        <div class="agenda-dia-header" v-for="(dia, idx) in diasSemana" :key="idx">
          <div class="agenda-dia-data">{{ dia.dataExibicao }}</div>
          <div class="agenda-dia-nome">{{ dia.nome }}</div>
        </div>
      </div>
      <div class="agenda-body">
        <div class="agenda-horas">
          <div class="agenda-hora" v-for="hora in horasDia" :key="hora">{{ hora }}</div>
        </div>
        <div class="agenda-dias">
          <div class="agenda-coluna-dia" v-for="(dia, idx) in diasSemana" :key="idx">
            <div class="agenda-slot-hora" v-for="hora in horasDia" :key="hora"></div>
            <!-- Compromissos do dia -->
            <div 
              v-for="compromisso in compromissosDoDia(dia.data)" 
              :key="compromisso.id"
              :style="estiloCompromisso(compromisso)"
              class="agenda-compromisso"
              @click="selecionarCompromisso(compromisso)"
              @mouseenter="showTooltip(compromisso, $event)"
              @mousemove="updateTooltip(compromisso, $event)"
              @mouseleave="hideTooltip"
            >
              <div class="compromisso-titulo">{{ compromisso.titulo }}</div>
              <div class="compromisso-hora">{{ formatarHora(compromisso.inicio) }} - {{ formatarHora(compromisso.fim) }}</div>
              <div class="compromisso-categoria">{{ compromisso.categoria_nome }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualização Mês -->
    <div v-if="tipoVisualizacao === 'mês'" class="agenda-mensal">
      <div class="agenda-mes-header">
        <div class="dia-semana-header" v-for="dia in diasSemanaMes" :key="dia">{{ dia }}</div>
      </div>
      <div class="agenda-mes-grade">
        <div 
          v-for="dia in diasDoMesAtual" 
          :key="dia.data"
          class="agenda-dia-mes"
          :class="{ 'dia-outro-mes': dia.outroMes }"
        >
          <div class="numero-dia">{{ dia.numero }}</div>
          <div class="compromissos-mini">
            <div 
              v-for="compromisso in compromissosDoDia(dia.data).slice(0, 3)" 
              :key="compromisso.id"
              class="compromisso-mini"
              :style="{ backgroundColor: compromisso.categoria_cor }"
              @click.stop="selecionarCompromisso(compromisso)"
            >
              {{ compromisso.titulo }}
            </div>
            <div 
              v-if="compromissosDoDia(dia.data).length > 3" 
              class="mais-compromissos"
              @click.stop="mostrarTodosCompromissos(dia.data)"
            >
              +{{ compromissosDoDia(dia.data).length - 3 }} mais
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualização Ano -->
    <div v-if="tipoVisualizacao === 'ano'" class="agenda-anual">
      <div class="meses-grid">
        <div v-for="(mes, index) in mesesDoAno" :key="index" class="mes-mini">
          <div class="mes-titulo">{{ mes.nome }}</div>
          <div class="dias-semana-mini">
            <div v-for="dia in diasSemanaCurtos" :key="dia" class="dia-semana-mini">{{ dia }}</div>
          </div>
          <div class="dias-mes-mini">
            <div 
              v-for="dia in mes.dias" 
              :key="dia.data"
              class="dia-mini"
              :class="{ 
                'dia-outro-mes': dia.outroMes,
                'tem-compromisso': compromissosDoDia(dia.data).length > 0
              }"
              :style="{ backgroundColor: getCorDiaMini(dia) }"
            >
              {{ dia.numero }}
            </div>
          </div>
        </div>
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
      <div 
        class="tooltip-content" 
        :style="{ 
          backgroundColor: tooltip.cor,
          boxShadow: `0 10px 25px ${tooltip.cor}40` // Adiciona transparência à sombra
        }"
      >
        <div class="tooltip-title">{{ tooltip.titulo }}</div>
        <div class="tooltip-info">
          <span class="tooltip-label">Horário:</span>
          <span class="tooltip-value">{{ tooltip.horario }}</span>
        </div>
        <div class="tooltip-info">
          <span class="tooltip-label">Categoria:</span>
          <span class="tooltip-value">{{ tooltip.categoria }}</span>
        </div>
        <div v-if="tooltip.cliente" class="tooltip-info">
          <span class="tooltip-label">Cliente:</span>
          <span class="tooltip-value">{{ tooltip.cliente }}</span>
        </div>
        <!-- Seta do tooltip com cor dinâmica -->
        <div 
          class="tooltip-arrow"
          :class="{ 'tooltip-arrow-below': tooltip.isBelow }"
          :style="{ 
            borderTopColor: tooltip.isBelow ? 'transparent' : tooltip.cor,
            borderBottomColor: tooltip.isBelow ? tooltip.cor : 'transparent'
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { format, addDays, startOfWeek, parseISO, getDaysInMonth, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { agendaService } from '../../services/agendaService.js'

const props = defineProps({
  tipoVisualizacao: {
    type: String,
    default: 'semana'
  },
  dataSelecionada: {
    type: Date,
    default: () => new Date()
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  termoBusca: {
    type: String,
    default: ''
  }
})

// Estado reativo
const compromissos = ref([])
const loading = ref(false)
const error = ref('')
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  titulo: '',
  horario: '',
  categoria: '',
  cliente: '',
  cor: '#0468FA', // Adicionar cor da categoria
  isBelow: false
})

// Configurações de horário
const horaInicio = 6 // 6:00
const horaFim = 21 // 21:00
const alturaHora = 60 // pixels por hora

// Horas do dia (06:00 até 21:00)
const horasDia = computed(() => {
  const horas = []
  for (let h = horaInicio; h <= horaFim; h++) {
    horas.push(`${h.toString().padStart(2, '0')}:00`)
  }
  return horas
})

// Dia selecionado para visualização individual
const diaSelecionado = computed(() => {
  const data = props.dataSelecionada
  return {
    data: format(data, 'yyyy-MM-dd'),
    nome: format(data, 'EEEE', { locale: ptBR }),
    dataExibicao: format(data, 'dd/MM/yyyy', { locale: ptBR })
  }
})

// Dias da semana atual
const diasSemana = computed(() => {
  const inicioSemana = startOfWeek(props.dataSelecionada, { weekStartsOn: 1 })
  const dias = []
  
  for (let i = 0; i < 7; i++) {
    const dia = addDays(inicioSemana, i)
    dias.push({
      data: format(dia, 'yyyy-MM-dd'),
      nome: format(dia, 'EEEE', { locale: ptBR }),
      dataExibicao: format(dia, 'dd/MM', { locale: ptBR })
    })
  }
  
  return dias
})

// Para visualização mensal
const diasSemanaMes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const diasSemanaCurtos = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const diasDoMesAtual = computed(() => {
  const data = props.dataSelecionada
  const primeiroDia = startOfMonth(data)
  const ultimoDia = endOfMonth(data)
  const diasNoMes = getDaysInMonth(data)
  const primeiroDiaSemana = primeiroDia.getDay()
  
  const dias = []
  
  // Dias do mês anterior
  for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
    const dia = addDays(primeiroDia, -i - 1)
    dias.push({
      numero: dia.getDate(),
      data: format(dia, 'yyyy-MM-dd'),
      outroMes: true
    })
  }
  
  // Dias do mês atual
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataCompleta = new Date(data.getFullYear(), data.getMonth(), dia)
    dias.push({
      numero: dia,
      data: format(dataCompleta, 'yyyy-MM-dd'),
      outroMes: false
    })
  }
  
  // Completar com dias do próximo mês
  const diasRestantes = 42 - dias.length
  for (let i = 1; i <= diasRestantes; i++) {
    const dia = addDays(ultimoDia, i)
    dias.push({
      numero: dia.getDate(),
      data: format(dia, 'yyyy-MM-dd'),
      outroMes: true
    })
  }
  
  return dias
})

// Para visualização anual
const mesesDoAno = computed(() => {
  const ano = props.dataSelecionada.getFullYear()
  const meses = []
  
  for (let mes = 0; mes < 12; mes++) {
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const diasNoMes = ultimoDia.getDate()
    const primeiroDiaSemana = primeiroDia.getDay()
    
    const dias = []
    
    // Dias do mês anterior
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const dia = new Date(ano, mes, -i)
      dias.push({
        numero: dia.getDate(),
        data: format(dia, 'yyyy-MM-dd'),
        outroMes: true
      })
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push({
        numero: dia,
        data: format(new Date(ano, mes, dia), 'yyyy-MM-dd'),
        outroMes: false
      })
    }
    
    // Completar até 42 dias
    const diasRestantes = 42 - dias.length
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = new Date(ano, mes + 1, i)
      dias.push({
        numero: dia.getDate(),
        data: format(dia, 'yyyy-MM-dd'),
        outroMes: true
      })
    }
    
    meses.push({
      nome: format(primeiroDia, 'MMMM', { locale: ptBR }),
      dias: dias
    })
  }
  
  return meses
})

// Buscar compromissos da tabela agenda
const buscarCompromissos = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('📅 Buscando compromissos para visualização:', props.tipoVisualizacao, props.dataSelecionada);
    
    // Usar o serviço para buscar compromissos do período atual
    const compromissosEncontrados = await agendaService.buscarCompromissosPorPeriodo(
      props.dataSelecionada,
      props.tipoVisualizacao
    );
    
    compromissos.value = compromissosEncontrados;
    console.log('✅ Compromissos carregados:', compromissos.value.length);
    
  } catch (err) {
    console.error('❌ Erro ao buscar compromissos:', err);
    error.value = 'Erro ao carregar compromissos da agenda';
    compromissos.value = [];
  } finally {
    loading.value = false
  }
}

// Filtrar compromissos de um dia específico
const compromissosDoDia = (data) => {
  let compromissosFiltrados = compromissos.value.filter(compromisso => {
    const dataCompromisso = format(parseISO(compromisso.inicio), 'yyyy-MM-dd')
    return dataCompromisso === data
  })
  
  // Aplicar filtro de busca se houver termo
  if (props.termoBusca && props.termoBusca.trim() !== '') {
    const termo = props.termoBusca.toLowerCase().trim()
    compromissosFiltrados = compromissosFiltrados.filter(compromisso => {
      return (
        compromisso.titulo?.toLowerCase().includes(termo) ||
        compromisso.categoria_nome?.toLowerCase().includes(termo) ||
        compromisso.cliente_nome?.toLowerCase().includes(termo) ||
        compromisso.descricao?.toLowerCase().includes(termo)
      )
    })
  }
  
  // Processar sobreposições
  return processarSobreposicoes(compromissosFiltrados)
}

// Detectar e processar compromissos sobrepostos
const processarSobreposicoes = (compromissos) => {
  if (compromissos.length <= 1) return compromissos
  
  // Ordenar por hora de início
  const ordenados = compromissos.sort((a, b) => 
    parseISO(a.inicio).getTime() - parseISO(b.inicio).getTime()
  )
  
  const grupos = []
  
  ordenados.forEach(compromisso => {
    const inicio1 = parseISO(compromisso.inicio)
    const fim1 = parseISO(compromisso.fim)
    
    // Encontrar grupo com sobreposição
    let grupoEncontrado = grupos.find(grupo => 
      grupo.some(c => {
        const inicio2 = parseISO(c.inicio)
        const fim2 = parseISO(c.fim)
        return (inicio1 < fim2 && fim1 > inicio2)
      })
    )
    
    if (grupoEncontrado) {
      grupoEncontrado.push(compromisso)
    } else {
      grupos.push([compromisso])
    }
  })
  
  // Adicionar informações de layout para cada compromisso
  return grupos.flatMap(grupo => 
    grupo.map((compromisso, index) => ({
      ...compromisso,
      _layoutInfo: {
        totalNoGrupo: grupo.length,
        indexNoGrupo: index
      }
    }))
  )
}

// Obter cor do dia para visualização mini (ano)
const getCorDiaMini = (dia) => {
  const compromissosDia = compromissosDoDia(dia.data)
  return agendaService.determinarCorPrioridade(compromissosDia) || 'transparent'
}

// Calcular estilo do compromisso (posição e altura)
const estiloCompromisso = (compromisso) => {
  const inicio = parseISO(compromisso.inicio)
  const fim = parseISO(compromisso.fim)
  
  // Se atravessa dias, limita ao final do dia
  const inicioHora = inicio.getHours()
  const inicioMinuto = inicio.getMinutes()
  let fimHora = fim.getHours()
  let fimMinuto = fim.getMinutes()
  
  // Se o compromisso termina no outro dia, limita até 21:00 do dia atual
  const dataInicioStr = format(inicio, 'yyyy-MM-dd')
  const dataFimStr = format(fim, 'yyyy-MM-dd')
  
  if (dataInicioStr !== dataFimStr) {
    fimHora = horaFim
    fimMinuto = 0
  }
  
  // Calcula posição vertical (top)
  const minutosDoInicio = (inicioHora - horaInicio) * 60 + inicioMinuto
  const top = (minutosDoInicio / 60) * alturaHora
  
  // Calcula altura
  const duracaoMinutos = (fimHora - inicioHora) * 60 + (fimMinuto - inicioMinuto)
  const altura = Math.max((duracaoMinutos / 60) * alturaHora, 30) // mínimo 30px
  
  // Calcular posição horizontal para compromissos sobrepostos
  const layoutInfo = compromisso._layoutInfo || { totalNoGrupo: 1, indexNoGrupo: 0 }
  const margemLateral = 4
  const larguraDisponivel = `calc(100% - ${margemLateral * 2}px)`
  
  let left, width
  if (layoutInfo.totalNoGrupo > 1) {
    // Compromissos sobrepostos - dividir espaço horizontalmente
    const larguraPorCompromisso = `calc((100% - ${margemLateral * 2}px) / ${layoutInfo.totalNoGrupo})`
    const posicaoEsquerda = `calc(${margemLateral}px + ((100% - ${margemLateral * 2}px) / ${layoutInfo.totalNoGrupo}) * ${layoutInfo.indexNoGrupo})`
    
    left = posicaoEsquerda
    width = larguraPorCompromisso
  } else {
    // Compromisso único - usar largura total
    left = `${margemLateral}px`
    width = larguraDisponivel
  }
  
  return {
    position: 'absolute',
    top: `${top}px`,
    height: `${altura}px`,
    left: left,
    width: width,
    backgroundColor: compromisso.categoria_cor,
    color: 'white',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: layoutInfo.totalNoGrupo > 1 ? '11px' : '12px', // fonte menor se múltiplos
    lineHeight: '1.2',
    overflow: 'hidden',
    zIndex: 10 + layoutInfo.indexNoGrupo, // z-index diferente para cada compromisso
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    cursor: 'pointer'
  }
}

// Formatar hora para exibição
const formatarHora = (dataHora) => {
  return format(parseISO(dataHora), 'HH:mm')
}

// Definir emits
const emit = defineEmits(['compromisso-selecionado'])

// Selecionar compromisso individual
const selecionarCompromisso = (compromisso) => {
  console.log('🎯 Compromisso selecionado:', compromisso.titulo, compromisso.id)
  emit('compromisso-selecionado', compromisso)
}

// Mostrar todos os compromissos de um dia quando há mais de 3
const mostrarTodosCompromissos = (data) => {
  const compromissosDia = compromissosDoDia(data)
  if (compromissosDia.length > 0) {
    // Emitir o primeiro compromisso do dia como exemplo
    // Ou criar uma lógica específica para mostrar uma lista
    console.log('📅 Mostrar todos os compromissos do dia:', data, compromissosDia)
    emit('compromisso-selecionado', compromissosDia[0])
  }
}

// Funções do tooltip
const showTooltip = (compromisso, event) => {
  // Calcular posição do tooltip considerando o viewport
  const rect = event.currentTarget.getBoundingClientRect()
  const tooltipWidth = 250 // largura estimada do tooltip
  const tooltipHeight = 120 // altura estimada do tooltip
  
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
    titulo: compromisso.titulo,
    horario: `${formatarHora(compromisso.inicio)} às ${formatarHora(compromisso.fim)}`,
    categoria: compromisso.categoria_nome || 'Sem categoria',
    cliente: compromisso.cliente_nome || '',
    cor: compromisso.categoria_cor || '#0468FA', // Usar cor da categoria do compromisso
    isBelow: isBelow
  }
}

const updateTooltip = (compromisso, event) => {
  if (!tooltip.value.visible) return
  
  // Calcular posição do tooltip considerando o viewport
  const rect = event.currentTarget.getBoundingClientRect()
  const tooltipWidth = 250 // largura estimada do tooltip
  const tooltipHeight = 120 // altura estimada do tooltip
  
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

// Watch para mudanças na visualização ou data
watch([() => props.tipoVisualizacao, () => props.dataSelecionada], () => {
  buscarCompromissos()
}, { immediate: true })

// Carregar dados ao montar o componente
onMounted(() => {
  buscarCompromissos()
})

// Expor métodos para componente pai
defineExpose({
  buscarCompromissos
})
</script>

<style scoped>
.agenda-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  position: relative;
}

/* === VISUALIZAÇÃO DIA === */
.agenda-dia {
  min-height: 600px;
}

.agenda-header-dia {
  display: grid;
  grid-template-columns: 60px 1fr;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.agenda-dia-header-single {
  padding: 16px;
  text-align: center;
  border-right: 1px solid #e5e7eb;
}

.agenda-dia-data-large {
  font-weight: 700;
  font-size: 18px;
  color: #111827;
  margin-bottom: 4px;
}

.agenda-dia-nome-large {
  font-size: 14px;
  color: #6b7280;
  text-transform: capitalize;
}

.agenda-body-dia {
  display: grid;
  grid-template-columns: 60px 1fr;
  min-height: 900px;
}

.agenda-coluna-unica {
  position: relative;
}

/* === VISUALIZAÇÃO SEMANA === */
.agenda-semanal {
  min-height: 600px;
}

.agenda-header {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.agenda-time-column {
  border-right: 1px solid #e5e7eb;
}

.agenda-dia-header {
  padding: 12px 8px;
  text-align: center;
  border-right: 1px solid #e5e7eb;
}

.agenda-dia-header:last-child {
  border-right: none;
}

.agenda-dia-data {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  margin-bottom: 2px;
}

.agenda-dia-nome {
  font-size: 12px;
  color: #6b7280;
  text-transform: capitalize;
}

.agenda-body {
  display: grid;
  grid-template-columns: 60px 1fr;
  min-height: 900px;
}

.agenda-horas {
  border-right: 1px solid #e5e7eb;
  background: #f9fafb;
}

.agenda-hora {
  height: 60px;
  padding: 8px;
  font-size: 12px;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-start;
}

.agenda-dias {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.agenda-coluna-dia {
  border-right: 1px solid #e5e7eb;
  position: relative;
}

.agenda-coluna-dia:last-child {
  border-right: none;
}

.agenda-slot-hora {
  height: 60px;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

/* === VISUALIZAÇÃO MÊS === */
.agenda-mensal {
  min-height: 600px;
}

.agenda-mes-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dia-semana-header {
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: #6b7280;
  border-right: 1px solid #e5e7eb;
}

.dia-semana-header:last-child {
  border-right: none;
}

.agenda-mes-grade {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, minmax(100px, 1fr));
}

.agenda-dia-mes {
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px;
  position: relative;
  overflow: hidden;
}

.agenda-dia-mes:last-child {
  border-right: none;
}

.agenda-dia-mes:nth-last-child(-n+7) {
  border-bottom: none;
}

.numero-dia {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  margin-bottom: 4px;
}

.dia-outro-mes .numero-dia {
  color: #9ca3af;
}

.compromissos-mini {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.compromisso-mini {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mais-compromissos {
  font-size: 10px;
  color: #6b7280;
  font-style: italic;
}

/* === VISUALIZAÇÃO ANO === */
.agenda-anual {
  padding: 16px;
}

.meses-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.mes-mini {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
}

.mes-titulo {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  margin-bottom: 8px;
  text-align: center;
}

.dias-semana-mini {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 4px;
}

.dia-semana-mini {
  font-size: 10px;
  text-align: center;
  color: #6b7280;
  font-weight: 500;
}

.dias-mes-mini {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.dia-mini {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border-radius: 2px;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s;
}

.dia-mini.dia-outro-mes {
  color: #9ca3af;
}

.dia-mini.tem-compromisso {
  color: white;
  font-weight: 600;
}

.dia-mini:hover {
  transform: scale(1.1);
}

/* === COMPROMISSOS === */
.agenda-compromisso {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.agenda-compromisso:hover {
  transform: scale(1.05);
  z-index: 30 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.8);
}

.agenda-compromisso:active {
  transform: scale(0.98);
}

.compromisso-titulo {
  font-weight: 600;
  font-size: inherit;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compromisso-hora {
  font-size: 10px;
  opacity: 0.9;
  margin-bottom: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compromisso-categoria {
  font-size: 9px;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Compromissos sobrepostos - destaque visual */
.agenda-compromisso:hover + .agenda-compromisso,
.agenda-compromisso:hover ~ .agenda-compromisso {
  opacity: 0.7;
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
  /* Background e box-shadow agora são aplicados via :style no template */
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.4;
  width: 250px;
  position: relative;
}

/* Remover setas CSS antigas - agora usamos a div .tooltip-arrow */
.tooltip-content::after {
  display: none;
}

.tooltip-below .tooltip-content::after {
  display: none;
}

/* Nova seta dinâmica */
.tooltip-arrow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

/* Seta normal (tooltip acima do elemento) */
.tooltip-arrow:not(.tooltip-arrow-below) {
  top: 100%;
  border-bottom: none;
}

/* Seta quando tooltip está abaixo do elemento */
.tooltip-arrow-below {
  top: -12px;
  border-top: none;
}

.tooltip-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #F3F4F6;
}

.tooltip-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.tooltip-info:last-child {
  margin-bottom: 0;
}

.tooltip-label {
  color: #D1D5DB;
  font-size: 12px;
}

.tooltip-value {
  font-weight: 600;
  color: #F3F4F6;
  font-size: 13px;
}

/* === LOADING OVERLAY === */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
}

.error-message p {
  font-size: 16px;
  color: #e74c3c;
  margin-bottom: 15px;
  font-weight: 500;
}

.retry-button {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: #2980b9;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .agenda-header {
    grid-template-columns: 50px repeat(7, 1fr);
  }
  
  .agenda-body,
  .agenda-body-dia {
    grid-template-columns: 50px 1fr;
    min-height: 700px;
  }
  
  .agenda-hora {
    height: 50px;
    padding: 4px;
    font-size: 10px;
  }
  
  .agenda-slot-hora {
    height: 50px;
  }
  
  .meses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .agenda-mes-grade {
    grid-template-rows: repeat(6, minmax(80px, 1fr));
  }
}

/* === VISUALIZAÇÃO SEMANA MOBILE (VERTICAL) === */
.agenda-semanal-mobile {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  background: transparent;
  border-radius: 0;
}

.dia-mobile-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
  margin-bottom: 8px;
}

.dia-mobile-header {
  background: #f8f9fa;
  color: #374151;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.dia-mobile-data {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.dia-mobile-nome {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
}

.dia-mobile-content {
  padding: 0;
  min-height: 60px;
}

.compromissos-mobile {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.compromisso-mobile {
  border-radius: 0;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.compromisso-mobile:hover {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.compromisso-mobile:last-child {
  border-bottom: none;
}

.compromisso-mobile-info {
  color: white;
}

.compromisso-mobile-titulo {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.3;
}

.compromisso-mobile-hora {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 2px;
}

.compromisso-mobile-categoria {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sem-compromissos-mobile {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 24px 16px;
  font-style: italic;
}

/* Responsividade para mobile */
@media (max-width: 768px) {
  .agenda-semanal-mobile {
    gap: 8px;
  }
  
  .dia-mobile-container {
    border-radius: 6px;
    margin-bottom: 6px;
  }
  
  .dia-mobile-header {
    padding: 10px 14px;
  }
  
  .dia-mobile-data {
    font-size: 13px;
  }
  
  .dia-mobile-nome {
    font-size: 11px;
  }
  
  .compromisso-mobile {
    padding: 10px 14px;
  }
  
  .compromisso-mobile-titulo {
    font-size: 13px;
  }
  
  .compromisso-mobile-hora {
    font-size: 11px;
  }
  
  .compromisso-mobile-categoria {
    font-size: 10px;
  }
  
  .sem-compromissos-mobile {
    padding: 20px 14px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .agenda-semanal-mobile {
    gap: 6px;
  }
  
  .dia-mobile-header {
    padding: 8px 12px;
  }
  
  .dia-mobile-data {
    font-size: 12px;
  }
  
  .dia-mobile-nome {
    font-size: 10px;
  }
  
  .compromisso-mobile {
    padding: 8px 12px;
  }
  
  .compromisso-mobile-titulo {
    font-size: 12px;
  }
  
  .compromisso-mobile-hora {
    font-size: 10px;
  }
  
  .compromisso-mobile-categoria {
    font-size: 9px;
  }
  
  .sem-compromissos-mobile {
    padding: 16px 12px;
    font-size: 11px;
  }
}
</style>