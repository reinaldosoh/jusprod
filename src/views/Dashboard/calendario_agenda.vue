<template>
  <div class="calendario-agenda-container">
    <!-- Header com apenas o título -->
    <div class="header-section">
      <h2 class="titulo-secao">Agenda da semana</h2>
    </div>

    <!-- Calendário da semana -->
    <div class="calendario-semana">
      <div 
        v-for="(dia, index) in diasSemana" 
        :key="index"
        class="dia-calendario"
        :class="{ 
          'dia-atual': isDiaAtual(dia.data),
          'dia-selecionado': isDiaSelecionado(dia.data)
        }"
        @click="selecionarDia(dia)"
      >
        <div class="dia-numero">{{ dia.numero }}</div>
        <div class="dia-nome">{{ dia.nome }}</div>
      </div>
    </div>

    <!-- Lista de agendas -->
    <div class="agendas-container">
      <div v-if="carregandoAgendas" class="loading-message">
        Carregando agendas...
      </div>
      
      <div v-else-if="agendasFiltradas.length === 0" class="empty-state">
        <img src="/images/empty_agenda.png" alt="Nenhuma agenda" class="empty-image" />
        <p class="empty-text">
          {{ diaSelecionado ? 'Nenhum compromisso para este dia' : 'Nenhum compromisso agendado para esta semana' }}
        </p>
      </div>
      
      <div v-else class="lista-agendas">
        <div 
          v-for="agenda in agendasFiltradas" 
          :key="agenda.id"
          class="agenda-item"
          @click="visualizarAgenda(agenda)"
        >
          <div class="agenda-info">
            <div class="agenda-titulo-linha">
              <span class="agenda-titulo">{{ agenda.titulo.length > 15 ? agenda.titulo.substring(0, 15) + '...' : agenda.titulo }}</span>
            </div>
            <div class="agenda-detalhes">
              <span class="agenda-horario">
                {{ formatarHorario(agenda.inicio) }} - {{ formatarHorario(agenda.fim) }}
              </span>
              <span class="agenda-data">{{ formatarDataCurta(agenda.inicio) }}</span>
            </div>
          </div>
          <div class="agenda-icone">
            <img :src="getIconeCategoria(agenda.categoria_id)" :alt="agenda.titulo" />
          </div>
        </div>
      </div>
    </div>

    <!-- Botão Novo Compromisso - Movido para o final -->
    <div class="botao-container">
      <button class="btn-novo-compromisso" @click="abrirNovoEvento">
        Novo compromisso
      </button>
    </div>

    <!-- Modal para novo evento -->
    <MarcarAgenda 
      v-if="mostrarModalNovoEvento"
      :show="mostrarModalNovoEvento"
      @close="fecharModalNovoEvento"
      @agenda-criada="onAgendaCriada"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../lib/supabase.js'
import MarcarAgenda from '../Agenda/marcar_agenda.vue'

// Estados do componente
const agendasSemana = ref([])
const carregandoAgendas = ref(false)
const mostrarModalNovoEvento = ref(false)

// Mapeamento de ícones por categoria
const iconesCategoria = {
  1: '/images/categoria_fatal.svg',
  2: '/images/categoria_audiencia.svg', 
  3: '/images/categoria_reuniao.svg',
  4: '/images/categoria_tarefa.svg',
  5: '/images/categoria_vencimento.svg',
  6: '/images/categoria_privado.svg',
  7: '/images/categoria_ferias.svg',
  8: '/images/categoria_outros.svg'
}

// Computed para dias da semana atual
const diasSemana = computed(() => {
  const hoje = new Date()
  const primeiroDiaSemana = new Date(hoje)
  
  // Encontrar o domingo da semana atual
  const diaSemana = hoje.getDay()
  primeiroDiaSemana.setDate(hoje.getDate() - diaSemana)
  
  const dias = []
  const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  for (let i = 0; i < 7; i++) {
    const dia = new Date(primeiroDiaSemana)
    dia.setDate(primeiroDiaSemana.getDate() + i)
    
    dias.push({
      data: dia,
      numero: dia.getDate(),
      nome: nomesDias[i]
    })
  }
  
  return dias
})

// Função para verificar se é o dia atual
const isDiaAtual = (data) => {
  const hoje = new Date()
  return data.toDateString() === hoje.toDateString()
}

// Função para verificar se o dia está selecionado
const isDiaSelecionado = (data) => {
  return diaSelecionado.value && data.toDateString() === diaSelecionado.value.toDateString()
}

// Função para obter ícone da categoria
const getIconeCategoria = (categoriaId) => {
  return iconesCategoria[categoriaId] || '/images/categoria_outros.svg'
}

// Função para formatar horário
const formatarHorario = (dataHora) => {
  if (!dataHora) return ''
  const data = new Date(dataHora)
  return data.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  })
}

// Função para formatar data curta
const formatarDataCurta = (dataHora) => {
  if (!dataHora) return ''
  const data = new Date(dataHora)
  return data.toLocaleDateString('pt-BR', { 
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo'
  })
}

// Função para carregar agendas da semana
const carregarAgendasSemana = async () => {
  try {
    carregandoAgendas.value = true
    
    // Obter usuário atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.error('Usuário não autenticado')
      return
    }

    // Calcular início e fim da semana
    const hoje = new Date()
    const primeiroDiaSemana = new Date(hoje)
    const ultimoDiaSemana = new Date(hoje)
    
    // Domingo da semana atual
    primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay())
    primeiroDiaSemana.setHours(0, 0, 0, 0)
    
    // Sábado da semana atual
    ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6)
    ultimoDiaSemana.setHours(23, 59, 59, 999)

    console.log('🔍 Buscando agendas da semana:', {
      inicio: primeiroDiaSemana.toISOString(),
      fim: ultimoDiaSemana.toISOString()
    })

    // Buscar agendas da semana
    const { data: agendas, error } = await supabase
      .from('agenda')
      .select('*')
      .eq('uuid', session.user.id)
      .gte('inicio', primeiroDiaSemana.toISOString())
      .lte('inicio', ultimoDiaSemana.toISOString())
      .order('inicio', { ascending: true })

    if (error) {
      console.error('❌ Erro ao carregar agendas:', error)
      return
    }

    console.log('✅ Agendas carregadas:', agendas)
    agendasSemana.value = agendas || []

  } catch (error) {
    console.error('❌ Erro ao carregar agendas da semana:', error)
  } finally {
    carregandoAgendas.value = false
  }
}

// Função para abrir modal de novo evento
const abrirNovoEvento = () => {
  mostrarModalNovoEvento.value = true
}

// Função para fechar modal de novo evento
const fecharModalNovoEvento = () => {
  mostrarModalNovoEvento.value = false
}

// Função chamada quando uma agenda é criada
const onAgendaCriada = (evento) => {
  console.log('📅 Nova agenda criada:', evento)
  // Recarregar agendas da semana
  carregarAgendasSemana()
  // Fechar modal
  fecharModalNovoEvento()
}

// Função para visualizar agenda (pode ser implementada depois)
const visualizarAgenda = (agenda) => {
  console.log('👁️ Visualizar agenda:', agenda)
  // Implementar visualização detalhada da agenda
}

// Função para selecionar um dia no calendário
const diaSelecionado = ref(null)
const selecionarDia = (dia) => {
  // Se clicar no mesmo dia, desselecioná-lo e mostrar a semana inteira
  if (diaSelecionado.value && dia.data.toDateString() === diaSelecionado.value.toDateString()) {
    diaSelecionado.value = null
    carregarAgendasSemana() // Voltar para visualização da semana
  } else {
    diaSelecionado.value = dia.data
    carregarAgendasDia(dia.data) // Carregar agendas do dia específico
  }
}

// Função para carregar agendas apenas para um dia específico
const carregarAgendasDia = async (data) => {
  try {
    carregandoAgendas.value = true
    
    // Obter usuário atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.error('Usuário não autenticado')
      return
    }

    // Calcular início e fim do dia selecionado
    const inicioDia = new Date(data)
    inicioDia.setHours(0, 0, 0, 0)
    
    const fimDia = new Date(data)
    fimDia.setHours(23, 59, 59, 999)

    console.log('🔍 Buscando agendas do dia:', {
      dia: data.toISOString(),
      inicio: inicioDia.toISOString(),
      fim: fimDia.toISOString()
    })

    // Buscar agendas do dia selecionado
    const { data: agendas, error } = await supabase
      .from('agenda')
      .select('*')
      .eq('uuid', session.user.id)
      .gte('inicio', inicioDia.toISOString())
      .lte('inicio', fimDia.toISOString())
      .order('inicio', { ascending: true })

    if (error) {
      console.error('❌ Erro ao carregar agendas do dia:', error)
      return
    }

    console.log('✅ Agendas carregadas para o dia:', agendas)
    agendasSemana.value = agendas || []

  } catch (error) {
    console.error('❌ Erro ao carregar agendas do dia:', error)
  } finally {
    carregandoAgendas.value = false
  }
}

// Computed para agendas filtradas (pode ser usado para a lista de agendas)
const agendasFiltradas = computed(() => {
  if (!diaSelecionado.value) {
    return agendasSemana.value
  }
  return agendasSemana.value.filter(agenda => {
    const agendaData = new Date(agenda.inicio)
    return agendaData.toDateString() === diaSelecionado.value.toDateString()
  })
})

// Lifecycle
onMounted(() => {
  // Carregar agendas da semana
  carregarAgendasSemana()
  
  // Selecionar automaticamente o dia atual
  const hoje = new Date()
  const diaAtual = diasSemana.value.find(dia => isDiaAtual(dia.data))
  
  if (diaAtual) {
    // Aguardar o carregamento das agendas da semana e então selecionar o dia atual
    setTimeout(() => {
      selecionarDia(diaAtual)
    }, 100)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.calendario-agenda-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  width: 266px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure container takes full height */
}

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.titulo-secao {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-novo-evento {
  background: #0468FA;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  height: 32px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-novo-evento:hover {
  background: #0356E3;
}

/* Calendário da semana */
.calendario-semana {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  margin-bottom: 20px;
  padding: 8px;
  background: #F8FAFC;
  border-radius: 8px;
}

.dia-calendario {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 2px;
  border-radius: 6px;
  transition: all 0.2s;
  cursor: pointer;
  min-height: 40px;
  min-width: 28px;
  text-align: center;
}

.dia-calendario:hover {
  background: #E2E8F0;
}

.dia-calendario.dia-atual {
  background: #0468FA;
  color: white;
}

.dia-calendario.dia-selecionado {
  background: #0468FA;
  color: white;
  box-shadow: 0 0 0 2px rgba(4, 104, 250, 0.3);
}

.dia-numero {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 1px;
  line-height: 1;
}

.dia-nome {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.8;
  line-height: 1;
  white-space: nowrap;
}

/* Container de agendas */
.agendas-container {
  min-height: 200px;
  flex-grow: 1; /* Allow container to grow and take available space */
}

.loading-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #6B7280;
  font-size: 14px;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-image {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-text {
  color: #6B7280;
  font-size: 12px;
  margin: 0;
}

/* Lista de agendas */
.lista-agendas {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agenda-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  min-height: 56px;
}

.agenda-item:hover {
  border-color: #0468FA;
  box-shadow: 0 2px 8px rgba(4, 104, 250, 0.1);
}

.agenda-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.agenda-titulo-linha {
  display: flex;
  align-items: center;
}

.agenda-titulo {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agenda-detalhes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.agenda-horario {
  font-size: 12px;
  color: #6B7280;
  font-weight: 400;
}

.agenda-data {
  font-size: 12px;
  color: #6B7280;
  font-weight: 400;
}

.agenda-icone {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-left: 8px;
}

.agenda-icone img {
  width: 24px;
  height: 24px;
}

/* Botão Novo Compromisso */
.botao-container {
  margin-top: 20px;
  text-align: center;
}

.btn-novo-compromisso {
  background: #0468FA;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  height: 44px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.btn-novo-compromisso:hover {
  background: #0356E3;
}

/* Responsividade */
@media (max-width: 768px) {
  .calendario-agenda-container {
    width: 100%;
    padding: 16px;
  }
  
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .titulo-secao {
    text-align: center;
  }
  
  .btn-novo-evento {
    width: 100%;
    justify-content: center;
    height: 44px;
    font-size: 14px;
  }
  
  .calendario-semana {
    gap: 6px;
    padding: 12px;
  }
  
  .dia-calendario {
    padding: 10px 6px;
    min-height: 50px;
  }
  
  .dia-numero {
    font-size: 16px;
  }
  
  .dia-nome {
    font-size: 11px;
  }
  
  .agenda-item {
    padding: 16px;
    min-height: 64px;
  }
  
  .agenda-titulo {
    font-size: 15px;
  }
  
  .agenda-horario,
  .agenda-data {
    font-size: 13px;
  }
  
  .agenda-icone {
    width: 36px;
    height: 36px;
  }
  
  .agenda-icone img {
    width: 28px;
    height: 28px;
  }
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .calendario-agenda-container {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .calendario-semana {
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    padding: 8px;
  }
  
  .dia-calendario {
    padding: 6px 2px;
    min-height: 40px;
  }
  
  .dia-numero {
    font-size: 12px;
  }
  
  .dia-nome {
    font-size: 9px;
  }
  
  .agenda-detalhes {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}
</style> 