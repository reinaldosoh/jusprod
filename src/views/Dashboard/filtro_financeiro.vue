<template>
  <div class="filtro-financeiro-dashboard">
    <Dropdown
      :options="opcoesFiltro"
      :defaultSelected="0"
      placeholderText="Todos os dados"
      :showPlaceholderIcon="true"
      iconType="funil"
      @option-selected="aplicarFiltro"
    />
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import Dropdown from '../../components/UI/Dropdown.vue'

// Emits
const emit = defineEmits(['filtro-alterado'])

// Estados
const filtroSelecionado = ref('todos')

// Opções do filtro - mesmas do filtroFinanceiro.vue
const opcoesFiltro = ref([
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

// Função para aplicar filtro - mesmo comportamento do filtroFinanceiro.vue
const aplicarFiltro = (periodo) => {
  console.log('📅 Período selecionado no filtro Dashboard:', periodo)
  
  let dataInicio, dataFim
  
  if (periodo.tipo === 'todos') {
    // Para mostrar todos os dados, definir um período amplo
    const hoje = new Date()
    const dataInicioCalculada = new Date(hoje)
    dataInicioCalculada.setFullYear(hoje.getFullYear() - 10) // 10 anos atrás
    const dataFinalCalculada = new Date(hoje)
    dataFinalCalculada.setFullYear(hoje.getFullYear() + 10) // 10 anos à frente
    
    dataInicio = dataInicioCalculada.toISOString().split('T')[0]
    dataFim = dataFinalCalculada.toISOString().split('T')[0]
    
    console.log('📅 Mostrando TODOS os dados - período amplo:', {
      de: dataInicio,
      ate: dataFim
    })
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
    
    dataInicio = dataInicioCalculada.toISOString().split('T')[0]
    dataFim = dataFinalCalculada.toISOString().split('T')[0]
  }

  emit('filtro-alterado', {
    periodo: periodo.tipo,
    dataInicio: dataInicio,
    dataFim: dataFim
  })
}

// Aplicar filtro inicial
aplicarFiltro(opcoesFiltro.value[0])
</script>

<style scoped>
.filtro-financeiro-dashboard {
  width: 200px;
  position: relative;
  z-index: 100;
}

/* Garantir que o dropdown tenha z-index alto para não ficar por trás de outros componentes */
:deep(.dropdown-container) {
  position: relative;
  z-index: 100;
}

:deep(.dropdown-menu) {
  z-index: 101;
}
</style> 