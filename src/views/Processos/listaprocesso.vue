<template>
  <div class="lista-processos-container">
    <!-- Resultado da pesquisa -->
    <div v-if="props.searchTerm && props.searchTerm.trim()" class="search-results-info">
      <p>
        <strong>{{ processos.length }}</strong> resultado{{ processos.length !== 1 ? 's' : '' }} 
        encontrado{{ processos.length !== 1 ? 's' : '' }} para 
        "<strong>{{ props.searchTerm }}</strong>"
      </p>
    </div>

    <!-- Abas de Filtro -->
    <div class="tabs-container">
      <div class="tabs">
        <button 
          class="tab-button"
          :class="{ 'tab-active': activeTab === 'monitorados' }"
          @click="setActiveTab('monitorados')"
        >
          Processos monitorados
          <span class="tab-count">{{ processosMonitorados.length }}</span>
        </button>
        <button 
          class="tab-button"
          :class="{ 'tab-active': activeTab === 'nao-monitorados' }"
          @click="setActiveTab('nao-monitorados')"
        >
          Processos não monitorados
          <span class="tab-count">{{ processosNaoMonitorados.length }}</span>
        </button>
      </div>
    </div>

    <!-- Lista de Processos -->
    <div class="processos-list">
      <div 
        v-for="processo in processosPaginados" 
        :key="processo.id"
        class="processo-card"
        :class="{ 'expanded': processosExpandidos.includes(processo.id) }"
        @click="toggleExpandir(processo.id)"
      >
        <!-- Ícone da Balança -->
        <div class="processo-icon">
          <svg viewBox="0 0 24 24" fill="none" :stroke="activeTab === 'monitorados' ? '#EF4444' : 'currentColor'" class="balance-icon">
            <!-- Haste vertical central -->
            <line x1="12" y1="3" x2="12" y2="21"/>
            <!-- Base -->
            <line x1="8" y1="21" x2="16" y2="21"/>
            <!-- Braço horizontal -->
            <line x1="6" y1="8" x2="18" y2="8"/>
            <!-- Prato esquerdo -->
            <circle cx="6" cy="12" r="3"/>
            <line x1="3" y1="12" x2="9" y2="12"/>
            <!-- Prato direito -->
            <circle cx="18" cy="12" r="3"/>
            <line x1="15" y1="12" x2="21" y2="12"/>
            <!-- Correntes -->
            <line x1="6" y1="8" x2="6" y2="9"/>
            <line x1="18" y1="8" x2="18" y2="9"/>
          </svg>
        </div>

        <!-- Informações do Processo -->
        <div class="processo-info">
          <div class="processo-header">
            <h3 class="processo-numero">{{ processo.cnpj }}</h3>
            <span class="processo-tribunal">{{ processo.tribunal }}</span>
          </div>
          
          <div class="processo-details">
            <p class="processo-autor">
              <span class="label">Autor(a):</span> {{ processo.autor }}
            </p>
            <p class="processo-reu">
              <span class="label">Réu:</span> {{ processo.reu }}
            </p>
            <p class="processo-data">
              <span class="label">Data início:</span> {{ formatarData(processo.ultima_movimentacao) }}
            </p>
          </div>

          <!-- Detalhes expandidos -->
          <div v-if="processosExpandidos.includes(processo.id)" class="processo-detalhes-expandidos">
            <div class="detalhes-linha">
              <span class="label">Processo:</span> {{ processo.cnpj || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Área:</span> {{ processo.area || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Assunto:</span> {{ processo.assunto || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Classe:</span> {{ processo.classe || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Órgão julgador:</span> {{ processo.orgao_julgador || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Valor da causa:</span> {{ processo.valor_causa || '-' }}
            </div>
          </div>
        </div>

        <!-- Botão Monitorar -->
        <div class="processo-actions">
          <button 
            v-if="activeTab === 'nao-monitorados'"
            class="btn-monitorar"
            :class="{ 
              'loading': processosMonitorando.has(processo.id),
              'disabled': algumProcessoMonitorando && !processosMonitorando.has(processo.id),
              'limite-atingido': atingiuLimite
            }"
            :disabled="algumProcessoMonitorando"
            @click.stop="monitorarProcesso(processo)"
          >
            <!-- Loading Spinner -->
            <div v-if="processosMonitorando.has(processo.id)" class="loading-spinner-btn"></div>
            
            <!-- Ícone normal -->
            <svg 
              v-else
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              class="monitor-icon"
            >
              <!-- Pasta -->
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <!-- Sinal de + -->
              <line x1="12" y1="10" x2="12" y2="16"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
            </svg>
            
            {{ 
              processosMonitorando.has(processo.id) 
                ? 'Monitorando...' 
                : algumProcessoMonitorando && !processosMonitorando.has(processo.id)
                  ? 'Aguarde outro processo...'
                  : atingiuLimite
                    ? 'Fazer Upgrade'
                    : 'Monitorar Processo' 
            }}
          </button>
          <div v-else class="status-monitorado">
            <!-- Ícone de Calendário -->
            <img 
              src="/images/iconcalendar.svg" 
              alt="Calendário" 
              class="status-icon status-icon-calendar" 
              @click="handleMarcarAgenda(processo.id, $event)"
            />
            
            <!-- Ícone de Editar -->
            <img 
              src="/images/iconEditar.svg" 
              alt="Editar" 
              class="status-icon status-icon-editar" 
              @click="handleCriarLembrete(processo.id, $event)"
            />
            
            <!-- Ícone de WhatsApp -->
            <img 
              src="/images/iconWhats.svg" 
              alt="WhatsApp" 
              class="status-icon status-icon-whatsapp" 
              @click="handleEnviarWhatsapp(processo.id, $event)"
            />
            
            <!-- Ícone de Email -->
            <img 
              src="/images/iconEmail.svg" 
              alt="Email" 
              class="status-icon status-icon-email" 
              @click="handleEnviarEmail(processo.id, $event)"
            />
            
            <!-- Ícone de Mais -->
            <img 
              src="/images/iconMais.svg" 
              alt="Mais opções" 
              class="status-icon status-icon-mais" 
              @click="mostrarAcoes(processo.id, $event)"
            />
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Carregando processos...</p>
      </div>

      <!-- Estado vazio -->
      <EmptyProcesso v-else-if="processosFiltrados.length === 0" />
    </div>

    <!-- Paginação -->
    <div v-if="totalPaginas > 1" class="pagination-container">
      <div class="pagination">
        <button 
          class="pagination-btn"
          :disabled="paginaAtual === 1"
          @click="irParaPagina(paginaAtual - 1)"
        >
          ‹ Anterior
        </button>
        
        <div class="pagination-numbers">
          <button
            v-for="pagina in paginasVisiveis"
            :key="pagina"
            class="pagination-number"
            :class="{ 'active': pagina === paginaAtual }"
            @click="irParaPagina(pagina)"
          >
            {{ pagina }}
          </button>
        </div>
        
        <button 
          class="pagination-btn"
          :disabled="paginaAtual === totalPaginas"
          @click="irParaPagina(paginaAtual + 1)"
        >
          Próximo ›
        </button>
      </div>
      
      <div class="pagination-info">
        Mostrando {{ inicioItem }} - {{ fimItem }} de {{ processosFiltrados.length }} processos
      </div>
    </div>

    <!-- Alerta de Sucesso -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucesso"
      mensagem="Processo monitorado com sucesso! As intimações serão exibidas na seção de Intimações."
      @fechar="mostrarAlertaSucesso = false"
    />

    <!-- Alerta de Erro -->
    <AlertaErro 
      v-if="mostrarAlertaErro"
      :titulo="tituloErro"
      :mensagem="mensagemErro"
      @fechar="mostrarAlertaErro = false"
    />

    <!-- Modal Upgrade -->
    <Upgrade 
      :show="mostrarUpgrade"
      @close="mostrarUpgrade = false"
      @upgrade="handleUpgrade"
      @not-now="mostrarUpgrade = false"
    />

    <!-- Dropdown de Ações -->
    <acoesProcessos
      :show="acoesDropdown.show"
      :posicao="acoesDropdown.posicao"
      :processo-id="acoesDropdown.processoId"
      @close="fecharAcoes"
      @vincular-clientes="handleVincularClientes"
      @exportar="handleExportar"
      @deixar-monitorar="handleDeixarMonitorar"
    />

    <!-- Modal Vincular Cliente -->
    <vincularCliente
      :show="modalVincularCliente.show"
      :processo-id="modalVincularCliente.processoId"
      :cnj="modalVincularCliente.cnj"
      @close="fecharModalVincularCliente"
      @cliente-vinculado="handleClienteVinculado"
    />

    <!-- Alerta de Sucesso Vinculação -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucessoVinculacao"
      :mensagem="mensagemSucessoVinculacao"
      @fechar="fecharAlertaSucessoVinculacao"
    />

    <!-- Modal WhatsApp -->
    <whatsappProcesso
      :show="modalWhatsappProcesso.show"
      :processo-id="modalWhatsappProcesso.processoId"
      :cnj="modalWhatsappProcesso.cnj"
      @close="fecharModalWhatsapp"
      @mensagem-enviada="handleWhatsappEnviado"
    />

    <!-- Alerta de Erro WhatsApp -->
    <AlertaErro 
      v-if="mostrarAlertaErroWhatsapp"
      :titulo="tituloErroWhatsapp"
      :mensagem="mensagemErroWhatsapp"
      @fechar="fecharAlertaErroWhatsapp"
    />

    <!-- Alerta de Sucesso WhatsApp -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucessoWhatsapp"
      :mensagem="mensagemSucessoWhatsapp"
      @fechar="fecharAlertaSucessoWhatsapp"
    />

    <!-- Modal Email -->
    <emailProcesso
      :show="modalEmailProcesso.show"
      :processo-id="modalEmailProcesso.processoId"
      :cnj="modalEmailProcesso.cnj"
      @close="fecharModalEmail"
      @mensagem-enviada="handleEmailEnviado"
    />

    <!-- Alerta de Erro Email -->
    <AlertaErro 
      v-if="mostrarAlertaErroEmail"
      :titulo="tituloErroEmail"
      :mensagem="mensagemErroEmail"
      @fechar="fecharAlertaErroEmail"
    />

    <!-- Alerta de Sucesso Email -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucessoEmail"
      :mensagem="mensagemSucessoEmail"
      @fechar="fecharAlertaSucessoEmail"
    />

    <!-- Modal Agenda -->
    <agendaProcesso
      :show="modalAgendaProcesso.show"
      :processo-id="modalAgendaProcesso.processoId"
      :cnj="modalAgendaProcesso.cnj"
      @close="fecharModalAgenda"
      @agenda-criada="handleAgendaCriada"
    />

    <!-- Alerta de Erro Agenda -->
    <AlertaErro 
      v-if="mostrarAlertaErroAgenda"
      :titulo="tituloErroAgenda"
      :mensagem="mensagemErroAgenda"
      @fechar="fecharAlertaErroAgenda"
    />

    <!-- Alerta de Sucesso Agenda -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucessoAgenda"
      :mensagem="mensagemSucessoAgenda"
      @fechar="fecharAlertaSucessoAgenda"
    />

    <!-- Modal Lembrete -->
    <lembreteProcesso
      :show="modalLembreteProcesso.show"
      :processo-id="modalLembreteProcesso.processoId"
      :cnj="modalLembreteProcesso.cnj"
      @close="fecharModalLembrete"
      @lembrete-criado="handleLembreteCriado"
    />

    <!-- Alerta de Erro Lembrete -->
    <AlertaErro 
      v-if="mostrarAlertaErroLembrete"
      :titulo="tituloErroLembrete"
      :mensagem="mensagemErroLembrete"
      @fechar="fecharAlertaErroLembrete"
    />

    <!-- Alerta de Sucesso Lembrete -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucessoLembrete"
      :mensagem="mensagemSucessoLembrete"
      @fechar="fecharAlertaSucessoLembrete"
    />

    <!-- Modal Deixar de Monitorar -->
    <DeixarMonitorarProcesso
      v-if="modalDeixarMonitorar.show"
      :processo="modalDeixarMonitorar.processo"
      @cancelar="fecharModalDeixarMonitorar"
      @arquivar="handleProcessoArquivado"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'
import Upgrade from '../../components/UI/Upgrade.vue'
import acoesProcessos from '../../components/UI/acoesProcessos.vue'
import vincularCliente from '../../components/UI/vincularCliente.vue'
import whatsappProcesso from '../../components/UI/whatsapp_processo.vue'
import emailProcesso from '../../components/UI/Email_processo.vue'
import agendaProcesso from '../../components/UI/agenda_processo.vue'
import lembreteProcesso from '../../components/UI/Lembrete_processo.vue'
import DeixarMonitorarProcesso from '../../components/UI/Deixar_monitorar_processo.vue'
import EmptyProcesso from '../../components/UI/empty_processo.vue'
import { eventBus, EVENTS } from '../../utils/eventBus'

const props = defineProps({
  searchTerm: {
    type: String,
    default: ''
  }
})

const activeTab = ref('nao-monitorados')
const processos = ref([])
const loading = ref(false)
const paginaAtual = ref(1)
const itensPorPagina = 20
const processosExpandidos = ref([])
const mostrarAlertaSucesso = ref(false)
const mostrarAlertaErro = ref(false)
const mensagemErro = ref('')
const tituloErro = ref('Erro')
const processosMonitorando = ref(new Set()) // IDs dos processos sendo monitorados
const algumProcessoMonitorando = computed(() => processosMonitorando.value.size > 0) // Verifica se algum processo está sendo monitorado
const mostrarUpgrade = ref(false)
const limitePlan = ref({ atual: 0, maximo: 0, plano: '' })
const acoesDropdown = ref({ show: false, processoId: null, posicao: null }) // Estado do dropdown de ações
const modalVincularCliente = ref({ show: false, processoId: null, cnj: '' }) // Estado do modal de vincular cliente
const modalWhatsappProcesso = ref({ show: false, processoId: null, cnj: '' }) // Estado do modal de WhatsApp
const mostrarAlertaSucessoVinculacao = ref(false) // Estado do alerta de sucesso da vinculação
const mensagemSucessoVinculacao = ref('') // Mensagem do alerta de sucesso da vinculação
const mostrarAlertaErroWhatsapp = ref(false) // Estado do alerta de erro do WhatsApp
const mensagemErroWhatsapp = ref('') // Mensagem do alerta de erro do WhatsApp
const tituloErroWhatsapp = ref('Erro') // Título do alerta de erro do WhatsApp
const mostrarAlertaSucessoWhatsapp = ref(false) // Estado do alerta de sucesso do WhatsApp
const mensagemSucessoWhatsapp = ref('') // Mensagem do alerta de sucesso do WhatsApp
const mostrarAlertaErroEmail = ref(false) // Estado do alerta de erro do Email
const mensagemErroEmail = ref('') // Mensagem do alerta de erro do Email
const mostrarAlertaSucessoEmail = ref(false) // Estado do alerta de sucesso do Email
const modalEmailProcesso = ref({ show: false, processoId: null, cnj: '' }) // Estado do modal de Email
const tituloErroEmail = ref('Erro') // Título do alerta de erro do Email
const mensagemSucessoEmail = ref('') // Mensagem do alerta de sucesso do Email
const mostrarAlertaErroAgenda = ref(false) // Estado do alerta de erro da Agenda
const mensagemErroAgenda = ref('') // Mensagem do alerta de erro da Agenda
const mostrarAlertaSucessoAgenda = ref(false) // Estado do alerta de sucesso da Agenda
const modalAgendaProcesso = ref({ show: false, processoId: null, cnj: '' }) // Estado do modal de Agenda
const tituloErroAgenda = ref('Erro') // Título do alerta de erro da Agenda
const mensagemSucessoAgenda = ref('') // Mensagem do alerta de sucesso da Agenda
const mostrarAlertaErroLembrete = ref(false) // Estado do alerta de erro do Lembrete
const mensagemErroLembrete = ref('') // Mensagem do alerta de erro do Lembrete
const mostrarAlertaSucessoLembrete = ref(false) // Estado do alerta de sucesso do Lembrete
const modalLembreteProcesso = ref({ show: false, processoId: null, cnj: '' }) // Estado do modal de Lembrete
const tituloErroLembrete = ref('Erro') // Título do alerta de erro do Lembrete
const mensagemSucessoLembrete = ref('') // Mensagem do alerta de sucesso do Lembrete
const modalDeixarMonitorar = ref({ show: false, processo: null }) // Estado do modal de deixar de monitorar
let searchTimeout = null

// Computed para filtrar processos
const processosMonitorados = computed(() => {
  return processos.value.filter(processo => !processo.arquivado)
})

const processosNaoMonitorados = computed(() => {
  return processos.value.filter(processo => processo.arquivado)
})

const processosFiltrados = computed(() => {
  return activeTab.value === 'monitorados' ? processosMonitorados.value : processosNaoMonitorados.value
})

// Computed para paginação
const totalPaginas = computed(() => {
  return Math.ceil(processosFiltrados.value.length / itensPorPagina)
})

const processosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina
  const fim = inicio + itensPorPagina
  return processosFiltrados.value.slice(inicio, fim)
})

const paginasVisiveis = computed(() => {
  const total = totalPaginas.value
  const atual = paginaAtual.value
  const paginas = []
  
  if (total <= 7) {
    // Se tiver 7 ou menos páginas, mostra todas
    for (let i = 1; i <= total; i++) {
      paginas.push(i)
    }
  } else {
    // Lógica para mostrar páginas com reticências
    if (atual <= 4) {
      for (let i = 1; i <= 5; i++) {
        paginas.push(i)
      }
      paginas.push('...')
      paginas.push(total)
    } else if (atual >= total - 3) {
      paginas.push(1)
      paginas.push('...')
      for (let i = total - 4; i <= total; i++) {
        paginas.push(i)
      }
    } else {
      paginas.push(1)
      paginas.push('...')
      for (let i = atual - 1; i <= atual + 1; i++) {
        paginas.push(i)
      }
      paginas.push('...')
      paginas.push(total)
    }
  }
  
  return paginas
})

const inicioItem = computed(() => {
  if (processosFiltrados.value.length === 0) return 0
  return (paginaAtual.value - 1) * itensPorPagina + 1
})

const fimItem = computed(() => {
  const fim = paginaAtual.value * itensPorPagina
  return Math.min(fim, processosFiltrados.value.length)
})

// Computed para verificar se atingiu o limite
const atingiuLimite = computed(() => {
  return limitePlan.value.atual >= limitePlan.value.maximo
})

// Funções
const setActiveTab = (tab) => {
  activeTab.value = tab
  paginaAtual.value = 1 // Reset para primeira página ao trocar de aba
}

const irParaPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value && pagina !== '...') {
    paginaAtual.value = pagina
  }
}

const toggleExpandir = (processoId) => {
  const index = processosExpandidos.value.indexOf(processoId)
  if (index > -1) {
    // Se já está expandido, remove (colapsa)
    processosExpandidos.value.splice(index, 1)
  } else {
    // Se não está expandido, adiciona (expande)
    processosExpandidos.value.push(processoId)
  }
}

const formatarData = (data) => {
  if (!data) return 'N/A'
  return new Date(data).toLocaleDateString('pt-BR')
}

const monitorarProcesso = async (processo) => {
  // Verificar se atingiu o limite do plano
  if (atingiuLimite.value) {
    console.log('⚠️ Limite do plano atingido. Mostrando modal de upgrade.')
    mostrarUpgrade.value = true
    return
  }

  // Verificar se algum processo já está sendo monitorado (apenas um por vez)
  if (algumProcessoMonitorando.value) {
    console.log('⚠️ Outro processo já está sendo monitorado. Aguarde a conclusão.')
    return
  }

  // Verificar se o processo específico já está sendo monitorado
  if (processosMonitorando.value.has(processo.id)) {
    console.log('⚠️ Processo já está sendo monitorado:', processo.id)
    return
  }

  try {
    // Adicionar o processo à lista de monitoramento
    processosMonitorando.value.add(processo.id)
    
    console.log('🔄 Iniciando monitoramento do processo:', processo.id)
    
    // Importar o serviço dinamicamente
    const { processoService } = await import('../../services/processoService')
    
    // Chamar a função de monitoramento
    const resultado = await processoService.monitorarProcesso(processo.id)
    
    console.log('✅ Processo monitorado com sucesso:', resultado)
    
    // Recarregar a lista completa do banco para garantir dados atualizados
    await carregarProcessos(props.searchTerm)
    
    // Recarregar o limite do plano para atualizar contador
    await carregarLimitePlano()
    
    // Emitir evento para atualizar outros componentes (como o Controlador)
    eventBus.emit(EVENTS.PROCESSO_MONITORADO, {
      processoId: processo.id,
      resultado: resultado
    })
    
    console.log('📢 Evento PROCESSO_MONITORADO emitido para atualizar Controlador')
    
    // Mostrar alerta de sucesso
    mostrarAlertaSucesso.value = true
    
  } catch (error) {
    console.error('❌ Erro ao monitorar processo:', error)
    
    // Configurar título e mensagem baseado no tipo de erro
    if (error.message.includes('não foi encontrado na base de dados do Escavador')) {
      tituloErro.value = 'CNJ não encontrado'
      mensagemErro.value = error.message
    } else if (error.message.includes('limite') || error.message.includes('Limite')) {
      tituloErro.value = 'Limite atingido'
      mensagemErro.value = error.message
    } else if (error.message.includes('Dados do processo inválidos')) {
      tituloErro.value = 'Dados inválidos'
      mensagemErro.value = error.message
    } else if (error.message.includes('concorrência')) {
      tituloErro.value = 'Processo em andamento'
      mensagemErro.value = 'O processo está sendo monitorado por outra operação. Aguarde alguns segundos e tente novamente.'
    } else {
      tituloErro.value = 'Erro ao monitorar'
      mensagemErro.value = error.message || 'Erro ao monitorar processo. Tente novamente.'
    }
    
    // Mostrar alerta de erro
    mostrarAlertaErro.value = true
  } finally {
    // Remover o processo da lista de monitoramento
    processosMonitorando.value.delete(processo.id)
    console.log('🏁 Finalizando monitoramento do processo:', processo.id)
  }
}

const carregarLimitePlano = async () => {
  try {
    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Erro ao obter usuário autenticado:', authError)
      return
    }

    // Buscar informações do plano do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('role_atual')
      .eq('uuid', user.id)
      .single()

    if (userError) {
      console.error('❌ Erro ao buscar plano do usuário:', userError)
      return
    }

    // Contar processos ativos (monitorados)
    const { count: processosAtivos, error: countError } = await supabase
      .from('processos')
      .select('*', { count: 'exact', head: true })
      .eq('uuid', user.id)
      .eq('arquivado', false)

    if (countError) {
      console.error('❌ Erro ao contar processos ativos:', countError)
      return
    }

    // Definir limites por plano
    const limitesPorPlano = {
      free: 5,
      silver: 45,
      gold: 150,
      platinum: 350
    }

    const plano = userData.role_atual || 'free'
    const maximo = limitesPorPlano[plano] || 5

    limitePlan.value = {
      atual: processosAtivos || 0,
      maximo: maximo,
      plano: plano
    }

    console.log('📊 Limite do plano carregado:', limitePlan.value)
  } catch (error) {
    console.error('❌ Erro ao carregar limite do plano:', error)
  }
}

const carregarProcessos = async (searchTerm = '') => {
  loading.value = true
  console.log('🔍 Carregando processos com termo:', searchTerm)
  
  try {
    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Erro ao obter usuário autenticado:', authError)
      throw new Error('Usuário não autenticado')
    }

    console.log('👤 Carregando processos para usuário:', user.id)

    let query = supabase
      .from('processos')
      .select('*')
      .eq('uuid', user.id) // FILTRO ESSENCIAL: apenas processos do usuário autenticado

    // Se houver termo de busca, aplicar filtros de busca
    if (searchTerm && searchTerm.trim()) {
      const termo = searchTerm.trim()
      console.log('🔍 Aplicando filtro de busca para:', termo)
      
      // Usar sintaxe correta do Supabase para OR
      query = query.or(`cnpj.ilike.%${termo}%,autor.ilike.%${termo}%,reu.ilike.%${termo}%,tribunal.ilike.%${termo}%,area.ilike.%${termo}%,assunto.ilike.%${termo}%,classe.ilike.%${termo}%,orgao_julgador.ilike.%${termo}%`)
    } else {
      console.log('🔍 Carregando todos os processos do usuário (sem filtro de texto)')
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1000) // Limitar para melhorar performance

    if (error) {
      console.error('❌ Erro na consulta principal:', error)
      throw error
    }

    console.log('✅ Processos carregados:', data?.length || 0)
    processos.value = data || []
  } catch (error) {
    console.error('❌ Erro ao carregar processos:', error)
    
    // Se há termo de busca e deu erro, não fazer fallback para não confundir o usuário
    if (searchTerm && searchTerm.trim()) {
      console.log('❌ Erro na busca, não executando fallback para não confundir')
      processos.value = []
    } else {
      // Em caso de erro sem termo de busca, tentar uma consulta mais simples
      try {
        console.log('🔄 Tentando consulta de fallback...')
        const { data } = await supabase
          .from('processos')
          .select('*')
          .eq('uuid', user.id) // FILTRO ESSENCIAL: apenas processos do usuário autenticado
          .order('created_at', { ascending: false })
          .limit(1000)
        
        console.log('✅ Fallback executado, processos:', data?.length || 0)
        processos.value = data || []
      } catch (fallbackError) {
        console.error('❌ Erro na consulta de fallback:', fallbackError)
        processos.value = []
      }
    }
  } finally {
    loading.value = false
  }
}

const handleUpgrade = () => {
  // Redirecionar para a página de planos
  // Usar router se disponível ou window.location
  if (window?.location) {
    window.location.href = '/planos'
  }
  mostrarUpgrade.value = false
}

// Funções para controlar o dropdown de ações
const mostrarAcoes = (processoId, event) => {
  event.stopPropagation()
  
  // Calcular posição do dropdown baseado na posição do ícone clicado
  const rect = event.target.getBoundingClientRect()
  const posicao = {
    top: rect.bottom + 6, // 6px abaixo do ícone
    left: rect.left
  }
  
  acoesDropdown.value = { 
    show: true, 
    processoId,
    posicao
  }
}

const fecharAcoes = () => {
  acoesDropdown.value = { show: false, processoId: null, posicao: null }
}

const handleVincularClientes = (processoId) => {
  const processo = processos.value.find(p => p.id === processoId)
  if (processo) {
    modalVincularCliente.value = {
      show: true,
      processoId: processoId,
      cnj: processo.cnpj || ''
    }
  }
}

const handleEnviarWhatsapp = async (processoId, event) => {
  event.stopPropagation() // Evitar que o clique expanda o card
  
  try {
    // Importar o serviço de clientes
    const { clienteService } = await import('../../services/clienteService')
    
    // Verificar se há clientes vinculados ao processo
    const clientesVinculados = await clienteService.listarClientesVinculados(processoId)
    
    if (!clientesVinculados || clientesVinculados.length === 0) {
      // Não há clientes vinculados - mostrar alerta de erro
      tituloErroWhatsapp.value = 'Nenhum cliente vinculado'
      mensagemErroWhatsapp.value = 'Não há clientes vinculados a este processo. Vincule ao menos um cliente antes de enviar o WhatsApp.'
      mostrarAlertaErroWhatsapp.value = true
      return
    }
    
    // Há clientes vinculados - abrir modal WhatsApp
    const processo = processos.value.find(p => p.id === processoId)
    if (processo) {
      modalWhatsappProcesso.value = {
        show: true,
        processoId: processoId,
        cnj: processo.cnpj || ''
      }
    }
    
  } catch (error) {
    console.error('Erro ao verificar clientes vinculados:', error)
    tituloErroWhatsapp.value = 'Erro'
    mensagemErroWhatsapp.value = 'Erro ao verificar clientes vinculados. Tente novamente.'
    mostrarAlertaErroWhatsapp.value = true
  }
}

const handleExportar = async () => {
  try {
    const processoId = acoesDropdown.value.processoId
    console.log('Exportar processo:', processoId)
    
    // Encontrar o processo na lista atual
    const processo = processos.value.find(p => p.id === processoId)
    
    if (!processo) {
      console.error('Processo não encontrado para exportar')
      tituloErro.value = 'Erro na exportação'
      mensagemErro.value = 'Processo não encontrado'
      mostrarAlertaErro.value = true
      fecharAcoes()
      return
    }
    
    // Importar o serviço de PDF
    const { pdfService } = await import('../../services/pdfService')
    
    // Gerar PDF
    await pdfService.gerarPDFProcesso(processo)
    
    console.log('PDF gerado com sucesso para o processo:', processo.cnpj)
    
    // Mostrar alerta de sucesso (opcional)
    // mostrarAlertaSucesso.value = true
    
  } catch (error) {
    console.error('Erro ao exportar processo:', error)
    tituloErro.value = 'Erro na exportação'
    mensagemErro.value = 'Erro ao gerar PDF do processo. Tente novamente.'
    mostrarAlertaErro.value = true
  } finally {
    fecharAcoes()
  }
}

const handleDeixarMonitorar = (processoId) => {
  console.log('Deixar de monitorar processo:', processoId)
  
  // Encontrar o processo na lista atual
  const processo = processos.value.find(p => p.id === processoId)
  
  if (processo) {
    console.log('Processo encontrado:', processo)
    modalDeixarMonitorar.value = {
      show: true,
      processo: processo
    }
  } else {
    console.error('Processo não encontrado com ID:', processoId)
  }
  
  fecharAcoes()
}

// Funções para o modal de vincular cliente
const fecharModalVincularCliente = () => {
  modalVincularCliente.value = { show: false, processoId: null, cnj: '' }
}

const handleClienteVinculado = (dadosEvento) => {
  console.log('Cliente vinculado/desvinculado:', dadosEvento)
  
  // Definir mensagem baseada no tipo de ação
  if (dadosEvento.tipo === 'vinculacao') {
    mensagemSucessoVinculacao.value = `Cliente "${dadosEvento.cliente.nome}" foi vinculado ao processo com sucesso!`
  } else if (dadosEvento.tipo === 'desvinculacao') {
    mensagemSucessoVinculacao.value = `Cliente "${dadosEvento.cliente.nome}" foi desvinculado do processo com sucesso!`
  }
  
  // Mostrar alerta de sucesso
  mostrarAlertaSucessoVinculacao.value = true
  
  // Opcional: recarregar dados dos processos para atualizar informações
  // carregarProcessos(props.searchTerm)
}

const fecharAlertaSucessoVinculacao = () => {
  mostrarAlertaSucessoVinculacao.value = false
  mensagemSucessoVinculacao.value = ''
}

// Funções para o modal de WhatsApp
const fecharModalWhatsapp = () => {
  modalWhatsappProcesso.value = { show: false, processoId: null, cnj: '' }
}

const handleWhatsappEnviado = (dadosEvento) => {
  console.log('WhatsApp enviado:', dadosEvento)
  
  // Definir mensagem de sucesso
  const totalEnvios = dadosEvento.totalEnvios || 1
  const titulo = dadosEvento.titulo || 'mensagem'
  
  if (totalEnvios === 1) {
    mensagemSucessoWhatsapp.value = `WhatsApp "${titulo}" enviado com sucesso!`
  } else {
    mensagemSucessoWhatsapp.value = `WhatsApp "${titulo}" enviado com sucesso para ${totalEnvios} contatos!`
  }
  
  // Mostrar alerta de sucesso
  mostrarAlertaSucessoWhatsapp.value = true
}

const fecharAlertaErroWhatsapp = () => {
  mostrarAlertaErroWhatsapp.value = false
  mensagemErroWhatsapp.value = ''
}

const fecharAlertaSucessoWhatsapp = () => {
  mostrarAlertaSucessoWhatsapp.value = false
  mensagemSucessoWhatsapp.value = ''
}

// Funções para o modal de Email
const fecharModalEmail = () => {
  modalEmailProcesso.value = { show: false, processoId: null, cnj: '' }
}

const handleEmailEnviado = (dadosEvento) => {
  console.log('Email enviado:', dadosEvento)
  
  // Definir mensagem de sucesso
  const totalEnvios = dadosEvento.totalEnvios || 1
  const titulo = dadosEvento.titulo || 'mensagem'
  
  if (totalEnvios === 1) {
    mensagemSucessoEmail.value = `Email "${titulo}" enviado com sucesso!`
  } else {
    mensagemSucessoEmail.value = `Email "${titulo}" enviado com sucesso para ${totalEnvios} contatos!`
  }
  
  // Mostrar alerta de sucesso
  mostrarAlertaSucessoEmail.value = true
}

const fecharAlertaErroEmail = () => {
  mostrarAlertaErroEmail.value = false
  mensagemErroEmail.value = ''
}

const fecharAlertaSucessoEmail = () => {
  mostrarAlertaSucessoEmail.value = false
  mensagemSucessoEmail.value = ''
}

// Funções para o handleEnviarEmail
const handleEnviarEmail = async (processoId, event) => {
  event.stopPropagation() // Evitar que o clique expanda o card
  
  try {
    // Importar o serviço de clientes
    const { clienteService } = await import('../../services/clienteService')
    
    // Verificar se há clientes vinculados ao processo
    const clientesVinculados = await clienteService.listarClientesVinculados(processoId)
    
    if (!clientesVinculados || clientesVinculados.length === 0) {
      // Não há clientes vinculados - mostrar alerta de erro
      tituloErroEmail.value = 'Nenhum cliente vinculado'
      mensagemErroEmail.value = 'Não há clientes vinculados a este processo. Vincule ao menos um cliente antes de enviar o email.'
      mostrarAlertaErroEmail.value = true
      return
    }
    
    // Há clientes vinculados - abrir modal Email
    const processo = processos.value.find(p => p.id === processoId)
    if (processo) {
      modalEmailProcesso.value = {
        show: true,
        processoId: processoId,
        cnj: processo.cnpj || ''
      }
    }
    
  } catch (error) {
    console.error('Erro ao verificar clientes vinculados:', error)
    tituloErroEmail.value = 'Erro'
    mensagemErroEmail.value = 'Erro ao verificar clientes vinculados. Tente novamente.'
    mostrarAlertaErroEmail.value = true
  }
}

// Funções para o modal de Agenda
const fecharModalAgenda = () => {
  modalAgendaProcesso.value = { show: false, processoId: null, cnj: '' }
}

const handleAgendaCriada = (dadosEvento) => {
  console.log('Agenda criada:', dadosEvento)
  
  // Definir mensagem de sucesso
  const titulo = dadosEvento.titulo || 'compromisso'
  const data = dadosEvento.data || ''
  
  // Formatar a data para exibição (DD/MM/YYYY)
  let dataFormatada = data
  if (data && data.includes('-')) {
    const [ano, mes, dia] = data.split('-')
    dataFormatada = `${dia}/${mes}/${ano}`
  }
  
  mensagemSucessoAgenda.value = `Compromisso "${titulo}" marcado na agenda com sucesso para o dia ${dataFormatada}!`
  
  // Mostrar alerta de sucesso
  mostrarAlertaSucessoAgenda.value = true
}

const fecharAlertaErroAgenda = () => {
  mostrarAlertaErroAgenda.value = false
  mensagemErroAgenda.value = ''
}

const fecharAlertaSucessoAgenda = () => {
  mostrarAlertaSucessoAgenda.value = false
  mensagemSucessoAgenda.value = ''
}

// Funções para o modal de Lembrete
const fecharModalLembrete = () => {
  modalLembreteProcesso.value = { show: false, processoId: null, cnj: '' }
}

const handleLembreteCriado = (dadosEvento) => {
  console.log('Lembrete criado:', dadosEvento)
  
  // Definir mensagem de sucesso
  const titulo = dadosEvento.titulo || 'lembrete'
  const totalLembretes = dadosEvento.totalLembretes || 1
  
  if (totalLembretes === 1) {
    mensagemSucessoLembrete.value = `Lembrete "${titulo}" criado com sucesso!`
  } else {
    mensagemSucessoLembrete.value = `Lembrete "${titulo}" criado com sucesso para ${totalLembretes} clientes!`
  }
  
  // Mostrar alerta de sucesso
  mostrarAlertaSucessoLembrete.value = true
}

const fecharAlertaErroLembrete = () => {
  mostrarAlertaErroLembrete.value = false
  mensagemErroLembrete.value = ''
}

const fecharAlertaSucessoLembrete = () => {
  mostrarAlertaSucessoLembrete.value = false
  mensagemSucessoLembrete.value = ''
}

// Funções para o modal de deixar de monitorar
const fecharModalDeixarMonitorar = () => {
  modalDeixarMonitorar.value = { show: false, processo: null }
}

const handleProcessoArquivado = async () => {
  console.log('Processo arquivado com sucesso!')
  
  // Recarregar a lista de processos para refletir as mudanças
  await carregarProcessos(props.searchTerm)
  
  // Recarregar o limite do plano para atualizar contador
  await carregarLimitePlano()
  
  // Emitir evento para atualizar outros componentes (como o Controlador)
  eventBus.emit(EVENTS.PROCESSO_ARQUIVADO, {
    processoId: modalDeixarMonitorar.value.processo?.id
  })
  
  // Fechar o modal
  fecharModalDeixarMonitorar()
}

// Funções para o handleCriarLembrete
const handleCriarLembrete = async (processoId, event) => {
  console.log('📝 handleCriarLembrete chamado para processo:', processoId)
  event.stopPropagation() // Evitar que o clique expanda o card
  
  try {
    // Importar o serviço de clientes
    console.log('📦 Importando clienteService...')
    const { clienteService } = await import('../../services/clienteService')
    
    // Verificar se há clientes vinculados ao processo
    console.log('🔍 Verificando clientes vinculados...')
    const clientesVinculados = await clienteService.listarClientesVinculados(processoId)
    console.log('👥 Clientes vinculados encontrados:', clientesVinculados)
    
    if (!clientesVinculados || clientesVinculados.length === 0) {
      // Não há clientes vinculados - mostrar alerta de erro
      console.log('❌ Nenhum cliente vinculado - mostrando alerta')
      tituloErroLembrete.value = 'Nenhum cliente vinculado'
      mensagemErroLembrete.value = 'Não há clientes vinculados a este processo. Vincule ao menos um cliente antes de criar um lembrete.'
      mostrarAlertaErroLembrete.value = true
      return
    }
    
    // Há clientes vinculados - abrir modal Lembrete
    console.log('✅ Clientes encontrados - abrindo modal de lembrete')
    const processo = processos.value.find(p => p.id === processoId)
    console.log('📄 Processo encontrado:', processo)
    
    if (processo) {
      console.log('🎯 Definindo modalLembreteProcesso.value...')
      modalLembreteProcesso.value = {
        show: true,
        processoId: processoId,
        cnj: processo.cnpj || ''
      }
      console.log('📊 Modal state:', modalLembreteProcesso.value)
    } else {
      console.error('❌ Processo não encontrado na lista')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar clientes vinculados:', error)
    tituloErroLembrete.value = 'Erro'
    mensagemErroLembrete.value = 'Erro ao verificar clientes vinculados. Tente novamente.'
    mostrarAlertaErroLembrete.value = true
  }
}

// Funções para o handleMarcarAgenda
const handleMarcarAgenda = async (processoId, event) => {
  console.log('🗓️ handleMarcarAgenda chamado para processo:', processoId)
  event.stopPropagation() // Evitar que o clique expanda o card
  
  try {
    // Importar o serviço de clientes
    console.log('📦 Importando clienteService...')
    const { clienteService } = await import('../../services/clienteService')
    
    // Verificar se há clientes vinculados ao processo
    console.log('🔍 Verificando clientes vinculados...')
    const clientesVinculados = await clienteService.listarClientesVinculados(processoId)
    console.log('👥 Clientes vinculados encontrados:', clientesVinculados)
    
    if (!clientesVinculados || clientesVinculados.length === 0) {
      // Não há clientes vinculados - mostrar alerta de erro
      console.log('❌ Nenhum cliente vinculado - mostrando alerta')
      tituloErroAgenda.value = 'Nenhum cliente vinculado'
      mensagemErroAgenda.value = 'Não há clientes vinculados a este processo. Vincule ao menos um cliente antes de marcar na agenda.'
      mostrarAlertaErroAgenda.value = true
      return
    }
    
    // Há clientes vinculados - abrir modal Agenda
    console.log('✅ Clientes encontrados - abrindo modal da agenda')
    const processo = processos.value.find(p => p.id === processoId)
    console.log('📄 Processo encontrado:', processo)
    
    if (processo) {
      console.log('🎯 Definindo modalAgendaProcesso.value...')
      modalAgendaProcesso.value = {
        show: true,
        processoId: processoId,
        cnj: processo.cnpj || ''
      }
      console.log('📊 Modal state:', modalAgendaProcesso.value)
    } else {
      console.error('❌ Processo não encontrado na lista')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar clientes vinculados:', error)
    tituloErroAgenda.value = 'Erro'
    mensagemErroAgenda.value = 'Erro ao verificar clientes vinculados. Tente novamente.'
    mostrarAlertaErroAgenda.value = true
  }
}

// Watcher para recarregar dados quando pesquisa mudar (com debounce)
watch(() => props.searchTerm, (newSearchTerm) => {
  paginaAtual.value = 1
  
  // Limpar timeout anterior
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  // Definir novo timeout para debounce
  searchTimeout = setTimeout(() => {
    carregarProcessos(newSearchTerm)
  }, 300)
})

onMounted(async () => {
  await carregarLimitePlano()
  await carregarProcessos()
})
</script>

<style scoped>
.lista-processos-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
}

/* Resultado da pesquisa */
.search-results-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.search-results-info p {
  margin: 0;
  color: #475569;
  font-size: 0.875rem;
}

.search-results-info strong {
  color: #0f172a;
}

/* Abas */
.tabs-container {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 0;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  position: relative;
}

.tab-button:hover {
  color: #374151;
}

.tab-active {
  color: #0468FA !important;
  font-weight: 600;
}

.tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #0468FA;
  border-radius: 2px 2px 0 0;
}

.tab-count {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 20px;
  text-align: center;
}

.tab-active .tab-count {
  background: #e0f2fe;
  color: #0468FA;
}

/* Lista de Processos */
.processos-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.processo-card {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.processo-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.processo-card.expanded {
  border-color: #0468FA;
  box-shadow: 0 4px 12px rgba(4, 104, 250, 0.1);
}

/* Ícone */
.processo-icon {
  width: 127px;
  height: 127px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.balance-icon {
  width: 42px;
  height: 42px;
  color: #9ca3af;
  stroke-width: 1.5;
}

/* Informações */
.processo-info {
  flex: 1;
  min-width: 0;
}

.processo-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.processo-numero {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.processo-tribunal {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.processo-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.processo-details p {
  margin: 0;
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.label {
  font-weight: 500;
  color: #6b7280;
}

/* Detalhes expandidos */
.processo-detalhes-expandidos {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detalhes-linha {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.detalhes-linha .label {
  min-width: 120px;
  flex-shrink: 0;
}

/* Ações */
.processo-actions {
  flex-shrink: 0;
}

.btn-monitorar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #00945E;
  border-radius: 6px;
  color: #00945E;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.btn-monitorar:hover:not(:disabled) {
  background: #f0fdf4;
  border-color: #007a4e;
  color: #007a4e;
}

.btn-monitorar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-monitorar.loading {
  background: #f0fdf4;
  border-color: #00945E;
  color: #00945E;
}

.btn-monitorar.limite-atingido {
  background: white;
  border-color: #0468FA;
  color: #0468FA;
}

.btn-monitorar.limite-atingido:hover:not(:disabled) {
  background: #f0f9ff;
  border-color: #0354cc;
  color: #0354cc;
}

.btn-monitorar.disabled {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.btn-monitorar.disabled:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #9ca3af;
}

.monitor-icon {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

.loading-spinner-btn {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #00945E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.status-monitorado {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #0468FA;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.status-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.status-icon-mais {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.status-icon-mais:hover {
  transform: scale(1.1);
}

.status-icon-whatsapp {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.status-icon-whatsapp:hover {
  transform: scale(1.1);
}

.status-icon-email {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.status-icon-email:hover {
  transform: scale(1.1);
}

.status-icon-calendar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.status-icon-calendar:hover {
  transform: scale(1.1);
}

.status-icon-editar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.status-icon-editar:hover {
  transform: scale(1.1);
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estado vazio */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* Paginação */
.pagination-container {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 0.5rem;
}

.pagination-number {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.pagination-number:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-number.active {
  background: #0468FA;
  border-color: #0468FA;
  color: white;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* Responsivo */
@media (max-width: 768px) {
  .lista-processos-container {
    padding: 1rem;
  }

  .processo-card {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "icon info"
      "actions actions";
    gap: 1rem;
    padding: 1rem;
  }

  .processo-icon {
    grid-area: icon;
    margin-right: 0.5rem;
  }

  .processo-info {
    grid-area: info;
    padding-right: 0.5rem;
  }

  .processo-actions {
    grid-area: actions;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 0.5rem;
  }

  .status-monitorado {
    width: 100%;
    justify-content: flex-end;
  }

  .detalhes-linha {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detalhes-linha .label {
    min-width: auto;
  }

  .processo-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-button {
    justify-content: space-between;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-numbers {
    margin: 0;
  }

  .btn-monitorar {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .processo-icon {
    width: 48px;
    height: 48px;
    border-radius: 4px;
  }

  .balance-icon {
    width: 24px;
    height: 24px;
  }

  .processo-numero {
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 600;
  }

  .processo-tribunal {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
  }

  .processo-details p {
    font-size: 0.75rem;
    line-height: 1.25rem;
  }

  .processo-details {
    gap: 0.125rem;
  }
}
</style> 