<template>
  <div class="calendario-container">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Carregando...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="buscarCompromissos" class="retry-button">Tentar novamente</button>
    </div>

    <!-- Dropdown no topo -->
    <div class="dropdown-container">
      <Dropdown
        :options="visualizacaoOpcoes"
        :defaultSelected="1"
        placeholderText="Selecione visualização"
        :showPlaceholderIcon="true"
        iconType="funil"
        @option-selected="handleVisualizacaoChange"
      />
    </div>

    <!-- Navegação do mês -->
    <div class="mes-navegacao">
      <button @click="mesAnterior" class="nav-btn">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="#667085" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="mes-ano">{{ mesAnoAtual }}</h2>
      <button @click="proximoMes" class="nav-btn">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="#667085" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Cabeçalho dos dias da semana -->
    <div class="dias-semana">
      <div class="dia-semana" v-for="dia in diasSemana" :key="dia">{{ dia }}</div>
    </div>

    <!-- Grade do calendário -->
    <div class="calendario-grade">
      <div 
        v-for="dia in diasDoMes" 
        :key="dia.data"
        class="dia-celula"
        :class="{
          'dia-outro-mes': dia.outroMes,
          'dia-destacado': dia.destacado,
          'dia-atual': dia.atual,
          'dia-selecionado': dia.selecionado,
          'dia-com-categoria': dia.temCategoria
        }"
        :style="estilosDia(dia)"
        @click="selecionarDia(dia)"
      >
        {{ dia.numero }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits, defineProps, watch } from 'vue'
import Dropdown from '../../components/UI/Dropdown.vue'
import { agendaService } from '../../services/agendaService.js'

const emit = defineEmits(['dia-selecionado', 'visualizacao-alterada'])

const props = defineProps({
  termoBusca: {
    type: String,
    default: ''
  }
})

const visualizacaoSelecionada = ref('Semana')
const mesAtual = ref(new Date().getMonth())
const anoAtual = ref(new Date().getFullYear())
const diaSelecionado = ref(null)
const compromissosAgenda = ref([])
const loading = ref(false)
const error = ref('')

const visualizacaoOpcoes = ref([
  { id: 1, label: 'Dia', active: false },
  { id: 2, label: 'Semana', active: true },
  { id: 3, label: 'Mês', active: false },
  { id: 4, label: 'Ano', active: false }
])

const diasSemana = ['Sa', 'Te', 'Qu', 'Qu', 'Se', 'Sa', 'Do']

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const mesAnoAtual = computed(() => {
  return `${meses[mesAtual.value]} ${anoAtual.value}`
})

// Buscar compromissos da tabela agenda
const buscarCompromissos = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('📅 Buscando compromissos do mês atual:', mesAtual.value + 1, anoAtual.value);
    
    // Buscar compromissos do mês atual
    const dataReferencia = new Date(anoAtual.value, mesAtual.value, 15); // Meio do mês
    const compromissosEncontrados = await agendaService.buscarCompromissosPorPeriodo(
      dataReferencia,
      'mes'
    );
    
    compromissosAgenda.value = compromissosEncontrados;
    console.log('✅ Compromissos do calendário carregados:', compromissosAgenda.value.length);
    
  } catch (err) {
    console.error('❌ Erro ao buscar compromissos do calendário:', err);
    error.value = 'Erro ao carregar compromissos';
    compromissosAgenda.value = [];
  } finally {
    loading.value = false
  }
}

// Determinar cor do dia baseada na prioridade de categorias
const determinarCorDia = (dia) => {
  const dataFormatada = formatarDataParaComparacao(dia)
  let compromissosDoDia = compromissosAgenda.value.filter(compromisso => {
    const dataCompromisso = new Date(compromisso.inicio).toLocaleDateString('pt-BR')
    return dataCompromisso === dataFormatada
  })

  // Aplicar filtro de busca se houver termo
  if (props.termoBusca && props.termoBusca.trim() !== '') {
    const termo = props.termoBusca.toLowerCase().trim()
    compromissosDoDia = compromissosDoDia.filter(compromisso => {
      return (
        compromisso.titulo?.toLowerCase().includes(termo) ||
        compromisso.categoria_nome?.toLowerCase().includes(termo) ||
        compromisso.cliente_nome?.toLowerCase().includes(termo) ||
        compromisso.descricao?.toLowerCase().includes(termo)
      )
    })
  }

  return agendaService.determinarCorPrioridade(compromissosDoDia)
}

// Criar estilos dinâmicos para cada dia
const estilosDia = (dia) => {
  const estilos = {}
  
  if (dia.corDestaque) {
    estilos.backgroundColor = dia.corDestaque
    estilos.color = 'white'
    estilos.fontWeight = '600'
  }
  
  return estilos
}

const formatarDataParaComparacao = (dia) => {
  const ano = dia.outroMes ? 
    (mesAtual.value === 0 ? anoAtual.value - 1 : anoAtual.value + 1) : 
    anoAtual.value
  const mes = dia.outroMes ? 
    (mesAtual.value === 0 ? 12 : mesAtual.value === 11 ? 1 : mesAtual.value + 1) : 
    mesAtual.value + 1
  
  return new Date(ano, mes - 1, dia.numero).toLocaleDateString('pt-BR')
}

const diasDoMes = computed(() => {
  const dias = []
  const primeiroDia = new Date(anoAtual.value, mesAtual.value, 1)
  const ultimoDia = new Date(anoAtual.value, mesAtual.value + 1, 0)
  const primeiroDiaSemana = primeiroDia.getDay()
  const diasNoMes = ultimoDia.getDate()
  
  // Adicionar dias do mês anterior
  const mesAnterior = mesAtual.value === 0 ? 11 : mesAtual.value - 1
  const anoAnterior = mesAtual.value === 0 ? anoAtual.value - 1 : anoAtual.value
  const ultimoDiaMesAnterior = new Date(anoAnterior, mesAnterior + 1, 0).getDate()
  
  for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
    const diaObj = {
      numero: ultimoDiaMesAnterior - i,
      data: `${anoAnterior}-${mesAnterior + 1}-${ultimoDiaMesAnterior - i}`,
      outroMes: true,
      destacado: false,
      atual: false,
      selecionado: false
    }
    diaObj.corDestaque = determinarCorDia(diaObj)
    diaObj.temCategoria = !!diaObj.corDestaque
    dias.push(diaObj)
  }
  
  // Adicionar dias do mês atual
  const hoje = new Date()
  
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const isHoje = hoje.getDate() === dia && 
                   hoje.getMonth() === mesAtual.value && 
                   hoje.getFullYear() === anoAtual.value
    
    const isSelecionado = diaSelecionado.value && 
                         diaSelecionado.value.numero === dia &&
                         !diaSelecionado.value.outroMes
    
    const diaObj = {
      numero: dia,
      data: `${anoAtual.value}-${mesAtual.value + 1}-${dia}`,
      outroMes: false,
      destacado: false,
      atual: isHoje,
      selecionado: isSelecionado
    }
    diaObj.corDestaque = determinarCorDia(diaObj)
    diaObj.temCategoria = !!diaObj.corDestaque
    dias.push(diaObj)
  }
  
  // Adicionar dias do próximo mês para completar a grade
  const diasRestantes = 42 - dias.length
  const proximoMesNum = mesAtual.value === 11 ? 0 : mesAtual.value + 1
  const proximoAno = mesAtual.value === 11 ? anoAtual.value + 1 : anoAtual.value
  
  for (let dia = 1; dia <= diasRestantes; dia++) {
    const diaObj = {
      numero: dia,
      data: `${proximoAno}-${proximoMesNum + 1}-${dia}`,
      outroMes: true,
      destacado: false,
      atual: false,
      selecionado: false
    }
    diaObj.corDestaque = determinarCorDia(diaObj)
    diaObj.temCategoria = !!diaObj.corDestaque
    dias.push(diaObj)
  }
  
  return dias
})

const mesAnterior = () => {
  if (mesAtual.value === 0) {
    mesAtual.value = 11
    anoAtual.value--
  } else {
    mesAtual.value--
  }
  buscarCompromissos()
}

const proximoMes = () => {
  if (mesAtual.value === 11) {
    mesAtual.value = 0
    anoAtual.value++
  } else {
    mesAtual.value++
  }
  buscarCompromissos()
}

const selecionarDia = (dia) => {
  diaSelecionado.value = dia
  
  // Emitir evento para o componente pai com a data selecionada
  const dataCompleta = new Date(
    dia.outroMes ? 
      (mesAtual.value === 0 ? anoAtual.value - 1 : 
       mesAtual.value === 11 ? anoAtual.value + 1 : anoAtual.value) : 
      anoAtual.value,
    dia.outroMes ? 
      (mesAtual.value === 0 ? 11 : 
       mesAtual.value === 11 ? 0 : 
       mesAtual.value === 0 ? mesAtual.value + 1 : mesAtual.value - 1) : 
      mesAtual.value,
    dia.numero
  )
  
  emit('dia-selecionado', {
    data: dataCompleta,
    visualizacao: visualizacaoSelecionada.value
  })
}

const handleVisualizacaoChange = (opcao) => {
  visualizacaoSelecionada.value = opcao.label
  
  // Atualizar as opções para marcar apenas a selecionada
  visualizacaoOpcoes.value.forEach(opt => {
    opt.active = opt.id === opcao.id
  })
  
  emit('visualizacao-alterada', {
    tipo: opcao.label.toLowerCase(),
    data: diaSelecionado.value ? new Date(diaSelecionado.value.data) : new Date()
  })
}

// Carregar dados ao montar o componente
onMounted(() => {
  buscarCompromissos()
})

// Watcher para recarregar compromissos quando mês ou ano mudar
watch([mesAtual, anoAtual], () => {
  buscarCompromissos()
})

// Expor métodos para componente pai
defineExpose({
  buscarCompromissos,
  atualizarMes: (novoMes, novoAno) => {
    mesAtual.value = novoMes
    anoAtual.value = novoAno
    buscarCompromissos()
  }
})
</script>

<style scoped>
.calendario-container {
  max-width: 326px;
  width: 100%;
  margin: 0;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
  position: relative;
}

.dropdown-container {
  margin-bottom: 16px;
}

.mes-navegacao {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.nav-btn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background: #F2F4F7;
}

.mes-ano {
  font-size: 16px;
  font-weight: 600;
  color: #101828;
  margin: 0;
}

.dias-semana {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 8px;
}

.dia-semana {
  text-align: center;
  padding: 8px 4px;
  font-size: 12px;
  font-weight: 500;
  color: #667085;
}

.calendario-grade {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 0;
}

.dia-celula {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 400;
  color: #101828;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;
}

.dia-celula:hover {
  background: #F2F4F7 !important;
  transform: scale(1.05);
}

.dia-outro-mes {
  color: #98A2B3;
}

.dia-destacado {
  color: white;
  font-weight: 600;
}

.dia-atual {
  background: #0468FA !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #0468FA;
}

.dia-selecionado {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #101828;
  transform: scale(1.1);
}

/* Cores de prioridade para os dias com compromissos */
.dia-celula[style*="#6606A5"] {
  background-color: #6606A5 !important;
  color: white !important;
  font-weight: 600 !important;
}

.dia-celula[style*="#F04438"] {
  background-color: #F04438 !important;
  color: white !important;
  font-weight: 600 !important;
}

.dia-celula[style*="#0468FA"]:not(.dia-atual) {
  background-color: #0468FA !important;
  color: white !important;
  font-weight: 600 !important;
}

/* Garantir que dias com cor de categoria sempre tenham texto branco */
.dia-celula.dia-com-categoria {
  color: white !important;
  font-weight: 600 !important;
}

/* Especificidade extra para garantir texto branco em dias com categoria */
.calendario-grade .dia-celula.dia-com-categoria,
.calendario-grade .dia-celula[style*="background-color"] {
  color: white !important;
  font-weight: 600 !important;
}

/* Override para dias do outro mês com categoria */
.dia-celula.dia-outro-mes.dia-com-categoria {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* === LOADING OVERLAY === */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0468FA;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.loading-text {
  font-size: 14px;
  color: #667085;
  font-weight: 500;
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.error-message p {
  font-size: 14px;
  color: #e74c3c;
  margin-bottom: 12px;
  font-weight: 500;
}

.retry-button {
  background-color: #0468FA;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: #0451d3;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* === RESPONSIVIDADE MOBILE === */
@media (max-width: 768px) {
  .calendario-container {
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .dropdown-container {
    margin-bottom: 12px;
  }
  
  .mes-navegacao {
    margin-bottom: 12px;
  }
  
  .mes-ano {
    font-size: 14px;
    font-weight: 600;
  }
  
  .nav-btn {
    padding: 6px;
  }
  
  .dias-semana {
    margin-bottom: 6px;
  }
  
  .dia-semana {
    padding: 6px 2px;
    font-size: 11px;
    font-weight: 500;
  }
  
  .calendario-grade {
    gap: 1px;
  }
  
  .dia-celula {
    font-size: 12px;
    min-height: 32px;
    aspect-ratio: 1;
  }
  
  .dia-celula:hover {
    transform: scale(1.02);
  }
  
  .dia-atual {
    box-shadow: 0 0 0 1px white, 0 0 0 3px #0468FA;
  }
  
  .dia-selecionado {
    box-shadow: 0 0 0 1px white, 0 0 0 3px #101828;
    transform: scale(1.05);
  }
}

/* Mobile pequeno */
@media (max-width: 480px) {
  .calendario-container {
    padding: 8px;
    border-radius: 8px;
  }
  
  .mes-ano {
    font-size: 13px;
  }
  
  .dia-semana {
    font-size: 10px;
    padding: 4px 1px;
  }
  
  .dia-celula {
    font-size: 11px;
    min-height: 28px;
  }
  
  .nav-btn {
    padding: 4px;
  }
  
  .nav-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>