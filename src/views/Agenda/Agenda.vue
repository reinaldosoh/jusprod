<template>
  <div>
    <MenuFixo />
    <MenuFixoMobile />
    <div class="main-content">
      <h1 class="titulo-agenda">Nós cuidamos dos seus compromissos</h1>
      
      <FiltroAgenda 
        @search="handleSearch"
        @novo-compromisso="handleNovoCompromisso"
      />
      
      <!-- Layout unificado (desktop e mobile) -->
      <div class="calendarios-row">
        <div class="calendario-wrapper">
          <Calendario 
            ref="calendarioRef"
            :termoBusca="termoBusca"
            @dia-selecionado="handleDiaSelecionado"
            @visualizacao-alterada="handleVisualizacaoAlterada"
          />
        </div>
        <div class="agenda-calendario-wrapper">
          <AgendaCalendario 
            ref="agendaCalendarioRef"
            :tipoVisualizacao="tipoVisualizacao"
            :dataSelecionada="dataSelecionada"
            :isMobile="isMobile"
            :termoBusca="termoBusca"
            @compromisso-selecionado="handleCompromissoSelecionado"
          />
        </div>
      </div>
    </div>
    
    <!-- Modal para marcar nova agenda -->
    <MarcarAgenda
      :show="mostrarModalMarcarAgenda"
      :dataInicial="dataInicialModal"
      :compromissoEdicao="compromissoEdicao"
      @close="fecharModalMarcarAgenda"
      @agenda-criada="handleAgendaCriada"
    />

    <!-- Modal para visualizar agenda -->
    <VisualizarAgenda
      v-if="mostrarModalVisualizarAgenda"
      :compromissoId="compromissoSelecionadoId"
      @close="fecharModalVisualizarAgenda"
      @editar="handleEditarCompromisso"
      @excluido="handleCompromissoExcluido"
      @email-enviado="handleEmailEnviado"
      @erro-email="handleErroEmail"
    />

    <!-- Alertas -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucesso" 
      :mensagem="mensagemSucesso"
      @close="mostrarAlertaSucesso = false"
    />
    
    <AlertaErro 
      v-if="mostrarAlertaErro" 
      :mensagem="mensagemErro"
      @close="mostrarAlertaErro = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import MenuFixo from '../../components/UI/MenuFixo.vue'
import MenuFixoMobile from '../../components/UI/MenuFixoMobile.vue'
import FiltroAgenda from './filtro_agenda.vue'
import Calendario from './calendario.vue'
import AgendaCalendario from './agenda_calendario.vue'
import MarcarAgenda from './marcar_agenda.vue'
import VisualizarAgenda from './visualizar_agenda.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'

// Estado para comunicação entre componentes
const tipoVisualizacao = ref('semana')
const dataSelecionada = ref(new Date())
const termoBusca = ref('')

// Estado para o modal de marcar agenda
const mostrarModalMarcarAgenda = ref(false)
const dataInicialModal = ref('')
const compromissoEdicao = ref(null)

// Estado para o modal de visualizar agenda
const mostrarModalVisualizarAgenda = ref(false)
const compromissoSelecionadoId = ref(null)

// Estado para os alertas
const mostrarAlertaSucesso = ref(false)
const mostrarAlertaErro = ref(false)
const mensagemSucesso = ref('')
const mensagemErro = ref('')

// Refs para os componentes calendário
const calendarioRef = ref(null)
const agendaCalendarioRef = ref(null)

// Estado para mobile
const isMobile = ref(false)

const handleSearch = (searchTerm) => {
  console.log('Pesquisar:', searchTerm)
  termoBusca.value = searchTerm
}

const handleNovoCompromisso = () => {
  console.log('Abrindo modal para novo compromisso')
  
  // Limpar dados de edição
  compromissoEdicao.value = null
  
  // Definir data inicial baseada na data selecionada atual
  if (dataSelecionada.value) {
    const data = new Date(dataSelecionada.value)
    const ano = data.getFullYear()
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const dia = data.getDate().toString().padStart(2, '0')
    dataInicialModal.value = `${ano}-${mes}-${dia}`
  } else {
    // Se não há data selecionada, usar data atual
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0')
    const dia = hoje.getDate().toString().padStart(2, '0')
    dataInicialModal.value = `${ano}-${mes}-${dia}`
  }
  
  mostrarModalMarcarAgenda.value = true
}

const fecharModalMarcarAgenda = () => {
  mostrarModalMarcarAgenda.value = false
  dataInicialModal.value = ''
  compromissoEdicao.value = null
}

const handleAgendaCriada = (novaAgenda) => {
  console.log('Nova agenda criada:', novaAgenda)
  
  // Atualizar os calendários para refletir o novo compromisso
  if (calendarioRef.value && typeof calendarioRef.value.buscarCompromissos === 'function') {
    calendarioRef.value.buscarCompromissos()
  }
  
  if (agendaCalendarioRef.value && typeof agendaCalendarioRef.value.buscarCompromissos === 'function') {
    agendaCalendarioRef.value.buscarCompromissos()
  }
  
  // Fechar o modal
  fecharModalMarcarAgenda()
}

// Handler para quando um compromisso é selecionado no calendário
const handleCompromissoSelecionado = (compromisso) => {
  console.log('Compromisso selecionado para visualização:', compromisso)
  compromissoSelecionadoId.value = compromisso.id
  mostrarModalVisualizarAgenda.value = true
}

const fecharModalVisualizarAgenda = () => {
  mostrarModalVisualizarAgenda.value = false
  compromissoSelecionadoId.value = null
}

// Handler para quando o usuário clica em editar no modal de visualização
const handleEditarCompromisso = (compromisso) => {
  console.log('Editando compromisso:', compromisso)
  
  // Fechar modal de visualização
  fecharModalVisualizarAgenda()
  
  // Configurar dados para edição
  compromissoEdicao.value = compromisso
  
  // Definir data inicial baseada no compromisso
  if (compromisso.inicio) {
    const data = new Date(compromisso.inicio)
    const ano = data.getFullYear()
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const dia = data.getDate().toString().padStart(2, '0')
    dataInicialModal.value = `${ano}-${mes}-${dia}`
  }
  
  // Abrir modal de edição
  mostrarModalMarcarAgenda.value = true
}

// Handler para quando um compromisso é excluído
const handleCompromissoExcluido = () => {
  console.log('Compromisso excluído, atualizando calendários')
  
  // Atualizar os calendários para refletir a exclusão
  if (calendarioRef.value && typeof calendarioRef.value.buscarCompromissos === 'function') {
    calendarioRef.value.buscarCompromissos()
  }
  
  if (agendaCalendarioRef.value && typeof agendaCalendarioRef.value.buscarCompromissos === 'function') {
    agendaCalendarioRef.value.buscarCompromissos()
  }
}

// Handler para quando um email é enviado com sucesso
const handleEmailEnviado = () => {
  console.log('Email enviado com sucesso!')
  mensagemSucesso.value = 'Compromisso enviado por email com sucesso!'
  mostrarAlertaSucesso.value = true
  
  // Fechar alerta automaticamente após 5 segundos
  setTimeout(() => {
    mostrarAlertaSucesso.value = false
  }, 5000)
}

// Handler para quando há erro no envio de email
const handleErroEmail = (erro) => {
  console.log('Erro no envio de email:', erro)
  mensagemErro.value = erro || 'Erro ao enviar email. Tente novamente.'
  mostrarAlertaErro.value = true
  
  // Fechar alerta automaticamente após 5 segundos
  setTimeout(() => {
    mostrarAlertaErro.value = false
  }, 5000)
}

// Handler para quando um dia é selecionado no calendário
const handleDiaSelecionado = (evento) => {
  console.log('Dia selecionado:', evento)
  dataSelecionada.value = evento.data
  tipoVisualizacao.value = evento.visualizacao.toLowerCase()
}

// Handler para quando a visualização é alterada no dropdown
const handleVisualizacaoAlterada = (evento) => {
  console.log('Visualização alterada:', evento)
  tipoVisualizacao.value = evento.tipo
  dataSelecionada.value = evento.data
}

// Detectar se é mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Garantir que inicia na visualização semana
  tipoVisualizacao.value = 'semana'
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Auto-close dos alertas
watch(mostrarAlertaSucesso, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      mostrarAlertaSucesso.value = false
    }, 5000)
  }
})

watch(mostrarAlertaErro, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      mostrarAlertaErro.value = false
    }, 5000)
  }
})
</script>

<style scoped>
.main-content {
  padding: 0px 16px 32px 16px;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  background: white;
  min-height: 100vh;
}

.titulo-agenda {
  padding-top: 2rem;
  margin-bottom: 1.5rem;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  color: #101828;
}

/* Desktop */
@media (min-width: 1025px) {
  .main-content {
    padding: 0px 24px 32px 24px;
  }
  
  .titulo-agenda {
    font-weight: 600;
    font-size: 38px;
    line-height: 45.6px;
    padding-top: 2.5rem;
    margin-bottom: 2rem;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-content {
    padding: 0px 20px 32px 20px;
  }
  
  .titulo-agenda {
    font-weight: 600;
    font-size: 34px;
    line-height: 40.8px;
    padding-top: 2rem;
    margin-bottom: 1.75rem;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .main-content {
    padding: 0px 12px 24px 12px;
  }
  
  .titulo-agenda {
    font-weight: 600;
    font-size: 24px;
    line-height: 28.8px;
    padding-top: 1.5rem;
    margin-bottom: 1.25rem;
    text-align: center;
  }
}

/* Extra small mobile */
@media (max-width: 480px) {
  .main-content {
    padding: 0px 8px 20px 8px;
  }
  
  .titulo-agenda {
    font-size: 22px;
    line-height: 26.4px;
    padding-top: 1.25rem;
    margin-bottom: 1rem;
  }
}

.calendarios-row {
  display: flex;
  gap: 24px;
  margin-top: 24px;
  max-width: 1248px;
  align-items: flex-start;
}

.calendario-wrapper {
  flex-shrink: 0;
  width: 326px;
}

.agenda-calendario-wrapper {
  flex: 1;
  min-width: 0;
}

/* Desktop adjustments */
@media (min-width: 1025px) {
  .calendarios-row {
    gap: 32px;
    margin-top: 32px;
  }
  
  .calendario-wrapper {
    width: 350px;
  }
}

/* Tablet adjustments */
@media (min-width: 769px) and (max-width: 1024px) {
  .calendarios-row {
    gap: 20px;
    margin-top: 20px;
  }
  
  .calendario-wrapper {
    width: 300px;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .calendarios-row {
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
  }
  
  .calendario-wrapper {
    width: 100%;
    order: 1;
  }
  
  .agenda-calendario-wrapper {
    width: 100%;
    order: 2;
  }
}

/* Extra small mobile */
@media (max-width: 480px) {
  .calendarios-row {
    gap: 12px;
    margin-top: 12px;
  }
}

/* Ajustes para alertas em mobile */
@media (max-width: 768px) {
  :deep(.alerta-sucesso),
  :deep(.alerta-erro) {
    margin: 16px;
    border-radius: 8px;
    font-size: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 400px;
  }
}

/* Garantir que o container principal seja scrollável em mobile */
@media (max-width: 768px) {
  .main-content {
    overflow-x: hidden;
    padding-bottom: 100px; /* Espaço extra para o menu mobile fixo */
  }
  
  /* Ajustar z-index para sobreposições corretas */
  :deep(.modal-overlay) {
    z-index: 1050;
  }
  
  :deep(.alerta-sucesso),
  :deep(.alerta-erro) {
    z-index: 1060;
  }
}

/* Ajustes para landscape em mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .titulo-agenda {
    font-size: 20px;
    line-height: 24px;
    padding-top: 1rem;
    margin-bottom: 1rem;
  }
  
  .calendarios-row {
    flex-direction: row;
    gap: 12px;
  }
  
  .calendario-wrapper {
    width: 280px;
    flex-shrink: 0;
  }
  
  .agenda-calendario-wrapper {
    flex: 1;
    min-width: 0;
  }
}
</style>
