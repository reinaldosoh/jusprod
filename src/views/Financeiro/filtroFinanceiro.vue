<template>
  <div class="filtro-financeiro">
    <!-- Título Principal com ícone de seta -->
    <div class="titulo-container">
      <h1 class="titulo">
        <img src="/images/setasalto.svg" alt="Seta" class="titulo-icone">
        Podemos auxiliar no controle financeiro
      </h1>
      <p class="subtitulo">A Jusprod permite a consolidação de informações financeiras de maneira centralizada.</p>
    </div>

    <!-- Linha com Filtros -->
    <div class="filtros-linha">
      <!-- Filtros Container -->
      <div class="filtros-container">
        <!-- Dicas -->
        <div class="dicas-container">
          <img src="/images/dica.svg" alt="Dicas" class="dica-icone">
          <span class="dicas-texto">Dicas</span>
        </div>

        <!-- Dropdown de Período -->
        <div class="filtro-item">
          <Dropdown
            :options="periodoOptions"
            :defaultSelected="0"
            placeholderText="Todos os dados"
            :showPlaceholderIcon="true"
            iconType="calendario"
            @option-selected="handlePeriodoSelecionado"
          />
        </div>

        <!-- Data Início -->
        <div class="filtro-item">
          <div class="input-container">
            <img src="/images/calendario.svg" alt="Calendário" class="input-icone" @click="abrirCalendarioInicio">
            <input 
              ref="dataInicioInput"
              type="date" 
              v-model="dataInicio"
              class="input-data"
              placeholder="Data início"
            >
            <label class="input-label">Data início</label>
          </div>
        </div>

        <!-- Data Final -->
        <div class="filtro-item">
          <div class="input-container">
            <img src="/images/calendario.svg" alt="Calendário" class="input-icone" @click="abrirCalendarioFinal">
            <input 
              ref="dataFinalInput"
              type="date" 
              v-model="dataFinal"
              class="input-data"
              placeholder="Data final"
            >
            <label class="input-label">Data final</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Dropdown from '../../components/UI/Dropdown.vue'

const dataInicio = ref('')
const dataFinal = ref('')
const dataInicioInput = ref(null)
const dataFinalInput = ref(null)

// Opções do dropdown de período
const periodoOptions = ref([
  { id: 0, label: 'Todos os dados', value: null, tipo: 'todos', active: true },
  { id: 1, label: 'Últimos 7 dias', value: 7, tipo: 'passado' },
  { id: 2, label: 'Últimos 15 dias', value: 15, tipo: 'passado' },
  { id: 3, label: 'Últimos 30 dias', value: 30, tipo: 'passado' },
  { id: 4, label: 'Últimos 60 dias', value: 60, tipo: 'passado' },
  { id: 5, label: 'Últimos 90 dias', value: 90, tipo: 'passado' },
  { id: 6, label: 'Últimos 365 dias', value: 365, tipo: 'passado' },
  { id: 7, label: 'Próximos 7 dias', value: 7, tipo: 'futuro' },
  { id: 8, label: 'Próximos 15 dias', value: 15, tipo: 'futuro' },
  { id: 9, label: 'Próximos 30 dias', value: 30, tipo: 'futuro' },
  { id: 10, label: 'Próximos 60 dias', value: 60, tipo: 'futuro' },
  { id: 11, label: 'Próximos 90 dias', value: 90, tipo: 'futuro' },
  { id: 12, label: 'Próximos 365 dias', value: 365, tipo: 'futuro' }
])

const emit = defineEmits(['filtros-alterados'])

// Funções para abrir o calendário
const abrirCalendarioInicio = () => {
  dataInicioInput.value?.showPicker()
}

const abrirCalendarioFinal = () => {
  dataFinalInput.value?.showPicker()
}

// Função para lidar com seleção do período
const handlePeriodoSelecionado = (periodo) => {
  console.log('📅 Período selecionado no filtro:', periodo)
  
  if (periodo.tipo === 'todos') {
    // Limpar filtros para mostrar todos os dados
    dataInicio.value = ''
    dataFinal.value = ''
    console.log('📅 Removendo filtros - mostrando TODOS os dados')
  } else {
    const hoje = new Date()
    let dataInicioCalculada, dataFinalCalculada
    
    if (periodo.tipo === 'passado') {
      // Períodos passados: de X dias atrás até hoje
      dataInicioCalculada = new Date(hoje)
      dataInicioCalculada.setDate(hoje.getDate() - periodo.value)
      dataFinalCalculada = new Date(hoje)
      
      console.log('📅 Calculando período PASSADO:', {
        diasAtras: periodo.value,
        de: dataInicioCalculada.toISOString().split('T')[0],
        ate: dataFinalCalculada.toISOString().split('T')[0]
      })
    } else if (periodo.tipo === 'futuro') {
      // Períodos futuros: de hoje até X dias à frente
      dataInicioCalculada = new Date(hoje)
      dataFinalCalculada = new Date(hoje)
      dataFinalCalculada.setDate(hoje.getDate() + periodo.value)
      
      console.log('📅 Calculando período FUTURO:', {
        diasAFrente: periodo.value,
        de: dataInicioCalculada.toISOString().split('T')[0],
        ate: dataFinalCalculada.toISOString().split('T')[0]
      })
    }
    
    dataInicio.value = dataInicioCalculada.toISOString().split('T')[0]
    dataFinal.value = dataFinalCalculada.toISOString().split('T')[0]
  }
  
  console.log('📅 Datas finais aplicadas:', {
    dataInicio: dataInicio.value || 'VAZIO (todos os dados)',
    dataFinal: dataFinal.value || 'VAZIO (todos os dados)',
    periodo: periodo.label
  })
  
  emitirFiltros()
}

// Função para emitir filtros alterados
const emitirFiltros = () => {
  const filtros = {
    dataInicio: dataInicio.value || null,
    dataFinal: dataFinal.value || null
  }
  console.log('📤 Emitindo filtros alterados:', {
    ...filtros,
    status: filtros.dataInicio && filtros.dataFinal ? 'COM FILTROS' : 'SEM FILTROS (todos os dados)'
  })
  emit('filtros-alterados', filtros)
}

// Observar mudanças nas datas
watch([dataInicio, dataFinal], () => {
  emitirFiltros()
})

// Configurar valores iniciais
onMounted(() => {
  console.log('🔧 FiltroFinanceiro montado - SEM aplicar filtros automáticos')
  // NÃO aplicar filtros automáticos na primeira carga
  // Permitir que os componentes mostrem todos os dados inicialmente
})
</script>

<style scoped>
.filtro-financeiro {
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  margin-bottom: 0;
  max-width: 1248px; /* Largura máxima disponível (1280 - 32px padding) */
  margin: 0 auto;
  width: 100%;
}

.titulo-container {
  margin-bottom: 24px;
  /* Alinhado com início das tabs */
  padding-left: 0;
  margin-left: 0;
}

.titulo {
  font-family: 'Inter', sans-serif;
  font-size: 38px;
  font-weight: 600;
  color: #101828;
  margin: 0 0 8px 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 12px;
}

.titulo-icone {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.subtitulo {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #475467;
  margin: 0;
  line-height: 1.5;
  margin-left: 36px;
}

.filtros-linha {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  flex-wrap: wrap;
}

.dicas-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dica-icone {
  width: 20px;
  height: 20px;
}

.dicas-texto {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #0169FA;
}

.filtros-container {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filtro-item {
  min-width: 200px;
  flex: 0 0 auto;
}

.input-container {
  position: relative;
  width: 100%;
  min-width: 200px;
}

.input-icone {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  z-index: 2;
  cursor: pointer;
}

.input-data {
  width: 100%;
  min-width: 200px;
  height: 44px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  padding: 0 16px 0 44px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  background: white;
  transition: border-color 0.2s ease;
}

/* Ocultar ícone nativo do input date */
.input-data::-webkit-calendar-picker-indicator {
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}

.input-data::-webkit-inner-spin-button {
  display: none;
}

.input-data::-webkit-outer-spin-button {
  display: none;
}

/* Força o calendário a ter a largura do input */
.input-data[type="date"]::-webkit-calendar-picker-indicator {
  width: 100% !important;
  height: 100% !important;
  margin: 0;
  padding: 0;
}

.input-data[type="date"] {
  position: relative;
}

.input-data:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.input-data:hover {
  border-color: #0468FA;
}

.input-label {
  position: absolute;
  top: -8px;
  left: 12px;
  background: white;
  padding: 0 4px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #344054;
  z-index: 1;
}

/* Estilo para o dropdown personalizado */
.filtro-item :deep(.dropdown-container) {
  width: 100%;
}

.filtro-item :deep(.dropdown-header) {
  height: 44px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .filtro-financeiro {
    padding: 16px;
  }
  
  .titulo {
    font-size: 32px;
  }
  
  .subtitulo {
    font-size: 14px;
  }
  
  .filtros-linha {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .filtros-container {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  
  .filtro-item {
    min-width: 100%;
  }
}
</style> 