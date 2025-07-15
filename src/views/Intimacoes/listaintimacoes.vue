<template>
  <div class="lista-intimacoes-container">
    <!-- Resultado da pesquisa -->
    <div v-if="props.searchTerm && props.searchTerm.trim()" class="search-results-info">
      <p>
        <strong>{{ intimacoes.length }}</strong> resultado{{ intimacoes.length !== 1 ? 's' : '' }} 
        encontrado{{ intimacoes.length !== 1 ? 's' : '' }} para 
        "<strong>{{ props.searchTerm }}</strong>"
      </p>
    </div>

    <!-- Abas de Filtro -->
    <div class="tabs-container">
      <div class="tabs">
        <button 
          class="tab-button"
          :class="{ 'tab-active': activeTab === 'nao-visualizadas' }"
          @click="setActiveTab('nao-visualizadas')"
        >
          Intimações não visualizadas
          <span class="tab-count">{{ intimacoesNaoVisualizadas.length }}</span>
        </button>
        <button 
          class="tab-button"
          :class="{ 'tab-active': activeTab === 'visualizadas' }"
          @click="setActiveTab('visualizadas')"
        >
          Intimações visualizadas
          <span class="tab-count">{{ intimacoesVisualizadas.length }}</span>
        </button>
      </div>
    </div>

    <!-- Lista de Intimações -->
    <div class="intimacoes-list">
      <div 
        v-for="intimacao in intimacoesPaginadas" 
        :key="intimacao.id"
        class="intimacao-card"
        :class="{ 'expanded': intimacoesExpandidas.includes(intimacao.id) }"
        @click="toggleExpandir(intimacao.id)"
      >
        <!-- Ícone da Intimação -->
        <div class="intimacao-icon">
          <img 
            :src="!intimacao.visualizado ? '/images/balancaativacard.svg' : '/images/balancainativacard.svg'"
            alt="Intimação" 
            class="mail-icon"
            width="38"
            height="38"
          />
          <!-- Indicador de novo (se não visualizada) -->
          <div v-if="!intimacao.visualizado" class="notification-dot"></div>
        </div>

        <!-- Informações da Intimação -->
        <div class="intimacao-info">
          <div class="intimacao-header">
            <h3 class="intimacao-processo">{{ intimacao.cnj || 'N/A' }}</h3>
            <span class="intimacao-status" :class="{ 'nova': !intimacao.visualizado }">
              {{ intimacao.visualizado ? 'Visualizada' : 'Nova' }}
            </span>
          </div>
          
          <div class="intimacao-details">
            <p class="intimacao-titulo">
              <span class="label">Tipo:</span> {{ intimacao.tipo || 'N/A' }}
            </p>
            <p class="intimacao-data">
              <span class="label">Data:</span> {{ formatarData(intimacao.data) }}
            </p>
            <p class="intimacao-tribunal">
              <span class="label">Tribunal:</span> {{ intimacao.tribunal || 'N/A' }}
            </p>
            
            <!-- Snippet - mostrado apenas quando não expandido -->
            <div v-if="!intimacoesExpandidas.includes(intimacao.id) && intimacao.snippet" class="intimacao-snippet">
              <span class="label">Resumo:</span> {{ intimacao.snippet }}
            </div>
          </div>

          <!-- Detalhes expandidos -->
          <div v-if="intimacoesExpandidas.includes(intimacao.id)" class="intimacao-detalhes-expandidos">
            <div class="detalhes-linha">
              <span class="label">CNJ:</span> {{ intimacao.cnj || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Autor:</span> {{ intimacao.autor || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Réu:</span> {{ intimacao.reu || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Seção:</span> {{ intimacao.secao || '-' }}
            </div>
            
            <!-- Conteúdo com HTML renderizado -->
            <div v-if="intimacao.conteudo" class="detalhes-conteudo">
              <span class="label">Conteúdo:</span>
              <div class="conteudo-html" v-html="intimacao.conteudo"></div>
            </div>
            
            <div class="detalhes-linha">
              <span class="label">Data criação:</span> {{ formatarData(intimacao.created_at) }}
            </div>
          </div>
        </div>

        <!-- Ícones de Ações -->
        <div class="intimacao-actions">
          <!-- Ícone Expandir/Recolher -->
          <img 
            src="/images/iconvisualizar.svg" 
            alt="Expandir detalhes" 
            class="action-icon action-icon-expandir"
            @click.stop="toggleExpandir(intimacao.id)"
            :title="intimacoesExpandidas.includes(intimacao.id) ? 'Recolher detalhes' : 'Expandir detalhes'"
          />
          
          <!-- Ícone Agenda -->
          <img 
            src="/images/iconcalendar.svg" 
            alt="Agendar compromisso" 
            class="action-icon action-icon-agenda"
            @click.stop="agendarCompromisso(intimacao)"
            title="Agendar compromisso"
          />
          
          <!-- Ícone Editar/Lembrete -->
          <img 
            src="/images/iconEditar.svg" 
            alt="Criar lembrete" 
            class="action-icon action-icon-editar"
            @click.stop="handleCriarLembreteIntimacao(intimacao)"
            title="Criar lembrete"
          />
          
          <!-- Ícone Email -->
          <img 
            src="/images/envelope_azul.svg" 
            alt="Enviar por email" 
            class="action-icon action-icon-email"
            @click.stop="enviarPorEmail(intimacao)"
            title="Enviar por email"
          />
          
          <!-- Ícone WhatsApp -->
          <img 
            src="/images/iconWhats.svg" 
            alt="Enviar por WhatsApp" 
            class="action-icon action-icon-whatsapp"
            @click.stop="enviarPorWhatsapp(intimacao)"
            title="Enviar por WhatsApp"
          />
          
          <!-- Ícone de Mais Opções -->
          <img 
            src="/images/iconMais.svg" 
            alt="Mais opções" 
            class="action-icon action-icon-mais" 
            @click.stop="mostrarAcoesIntimacao(intimacao.id, intimacao, $event)"
            title="Mais opções"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Carregando intimações...</p>
      </div>

      <!-- Estado vazio -->
      <EmptyIntimacoes v-else-if="intimacoesFiltradas.length === 0" />
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
        Mostrando {{ inicioItem }} - {{ fimItem }} de {{ intimacoesFiltradas.length }} intimações
      </div>
    </div>

    <!-- Alerta de Sucesso -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucesso"
      mensagem="Intimação marcada como visualizada com sucesso!"
      @fechar="mostrarAlertaSucesso = false"
    />

    <!-- Alerta de Erro -->
    <AlertaErro 
      v-if="mostrarAlertaErro"
      :titulo="tituloErro"
      :mensagem="mensagemErro"
      @fechar="mostrarAlertaErro = false"
    />

    <!-- Dropdown de Ações -->
    <AcoesIntimacoes
      v-if="showAcoesDropdown"
      :show="showAcoesDropdown"
      :posicao="dropdownPosition"
      :intimacao="intimacaoSelecionada"
      :intimacao-id="intimacaoSelecionada?.id"
      :active-tab="activeTab"
      @close="fecharAcoesDropdown"
      @marcar-visualizado="handleMarcarVisualizado"
      @exportar="handleExportarIntimacao"
      @excluir="handleExcluirIntimacao"
    />

    <!-- Modal de Exclusão -->
    <ConfirmarExclusao
      v-if="showModalExclusao"
      :visible="showModalExclusao"
      :intimacao="intimacaoParaExcluir"
      @cancelar="cancelarExclusao"
      @excluir="confirmarExclusao"
    />

    <!-- Modal Agenda para Intimação -->
    <agendaProcesso
      :show="modalAgendaIntimacao.show"
      :processo-id="modalAgendaIntimacao.processoId"
      :cnj="modalAgendaIntimacao.cnj"
      :intimacao="modalAgendaIntimacao.intimacao"
      @close="fecharModalAgendaIntimacao"
      @agenda-criada="handleAgendaCriadaIntimacao"
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

    <!-- Modal Lembrete para Intimação -->
    <lembreteProcesso
      :show="modalLembreteIntimacao.show"
      :processo-id="modalLembreteIntimacao.processoId"
      :cnj="modalLembreteIntimacao.cnj"
      :intimacao="modalLembreteIntimacao.intimacao"
      @close="fecharModalLembreteIntimacao"
      @lembrete-criado="handleLembreteCriadoIntimacao"
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

    <!-- Modal WhatsApp para Intimação -->
    <whatsappProcesso
      :show="modalWhatsappIntimacao.show"
      :processo-id="modalWhatsappIntimacao.processoId"
      :cnj="modalWhatsappIntimacao.cnj"
      :intimacao="modalWhatsappIntimacao.intimacao"
      @close="fecharModalWhatsappIntimacao"
      @mensagem-enviada="handleWhatsappCriadoIntimacao"
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

    <!-- Modal Email para Intimação -->
    <emailProcesso
      :show="modalEmailIntimacao.show"
      :processo-id="modalEmailIntimacao.processoId"
      :cnj="modalEmailIntimacao.cnj"
      :intimacao="modalEmailIntimacao.intimacao"
      @close="fecharModalEmailIntimacao"
      @mensagem-enviada="handleEmailCriadoIntimacao"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import { useIntimacoes } from '../../composables/useIntimacoes'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'
import AcoesIntimacoes from '../../components/UI/acoesIntimacoes.vue'
import ConfirmarExclusao from '../../components/UI/ConfirmarExclusao.vue'
import agendaProcesso from '../../components/UI/agenda_processo.vue'
import lembreteProcesso from '../../components/UI/Lembrete_processo.vue'
import whatsappProcesso from '../../components/UI/whatsapp_processo.vue'
import emailProcesso from '../../components/UI/Email_processo.vue'
import EmptyIntimacoes from '../../components/UI/empty_intimacoes.vue'

const props = defineProps({
  searchTerm: {
    type: String,
    default: ''
  },
  clienteId: {
    type: [String, Number],
    default: null
  },
  processoId: {
    type: [String, Number],
    default: null
  }
})

const activeTab = ref('nao-visualizadas')
const intimacoes = ref([])
const loading = ref(false)
const paginaAtual = ref(1)
const itensPorPagina = 20
const intimacoesExpandidas = ref([])
const mostrarAlertaSucesso = ref(false)
const mostrarAlertaErro = ref(false)
const mensagemErro = ref('')
const tituloErro = ref('Erro')
const intimacoesProcessando = ref(new Set()) // IDs das intimações sendo processadas
const algmaIntimacaoProcessando = computed(() => intimacoesProcessando.value.size > 0) // Verifica se alguma intimação está sendo processada

// Estados para dropdown de ações
const showAcoesDropdown = ref(false)
const dropdownPosition = ref({ top: 0, left: 0 })
const intimacaoSelecionada = ref(null)

// Estados para modal de exclusão
const showModalExclusao = ref(false)
const intimacaoParaExcluir = ref(null)

// Estados para modal de agenda
const modalAgendaIntimacao = ref({ show: false, processoId: null, cnj: '', intimacao: null })
const mostrarAlertaErroAgenda = ref(false)
const mensagemErroAgenda = ref('')
const mostrarAlertaSucessoAgenda = ref(false)
const tituloErroAgenda = ref('Erro')
const mensagemSucessoAgenda = ref('')

// Estados para modal de lembrete
const modalLembreteIntimacao = ref({ show: false, processoId: null, cnj: '', intimacao: null })
const mostrarAlertaErroLembrete = ref(false)
const mensagemErroLembrete = ref('')
const mostrarAlertaSucessoLembrete = ref(false)
const tituloErroLembrete = ref('Erro')
const mensagemSucessoLembrete = ref('')

// Estados para modal de WhatsApp
const modalWhatsappIntimacao = ref({ show: false, processoId: null, cnj: '', intimacao: null })
const mostrarAlertaErroWhatsapp = ref(false)
const mensagemErroWhatsapp = ref('')
const mostrarAlertaSucessoWhatsapp = ref(false)
const tituloErroWhatsapp = ref('Erro')
const mensagemSucessoWhatsapp = ref('')

// Estados para modal de Email
const modalEmailIntimacao = ref({ show: false, processoId: null, cnj: '', intimacao: null })
const mostrarAlertaErroEmail = ref(false)
const mensagemErroEmail = ref('')
const mostrarAlertaSucessoEmail = ref(false)
const tituloErroEmail = ref('Erro')
const mensagemSucessoEmail = ref('')

// Composable para contagem global de intimações
const { atualizarContador } = useIntimacoes()

let searchTimeout = null

// Computed para filtrar intimações
const intimacoesNaoVisualizadas = computed(() => {
  return intimacoes.value.filter(intimacao => !intimacao.visualizado)
})

const intimacoesVisualizadas = computed(() => {
  return intimacoes.value.filter(intimacao => intimacao.visualizado)
})

const intimacoesFiltradas = computed(() => {
  return activeTab.value === 'nao-visualizadas' ? intimacoesNaoVisualizadas.value : intimacoesVisualizadas.value
})

// Computed para paginação
const totalPaginas = computed(() => {
  return Math.ceil(intimacoesFiltradas.value.length / itensPorPagina)
})

const intimacoesPaginadas = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina
  const fim = inicio + itensPorPagina
  return intimacoesFiltradas.value.slice(inicio, fim)
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
  if (intimacoesFiltradas.value.length === 0) return 0
  return (paginaAtual.value - 1) * itensPorPagina + 1
})

const fimItem = computed(() => {
  const fim = paginaAtual.value * itensPorPagina
  return Math.min(fim, intimacoesFiltradas.value.length)
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

const toggleExpandir = (intimacaoId) => {
  const index = intimacoesExpandidas.value.indexOf(intimacaoId)
  if (index > -1) {
    // Se já está expandido, remove (colapsa)
    intimacoesExpandidas.value.splice(index, 1)
  } else {
    // Se não está expandido, adiciona (expande)
    intimacoesExpandidas.value.push(intimacaoId)
  }
}

const formatarData = (data) => {
  if (!data) return 'N/A'
  return new Date(data).toLocaleDateString('pt-BR')
}

const marcarComoVisualizada = async (intimacao) => {
  // Verificar se alguma intimação já está sendo processada (apenas uma por vez)
  if (algmaIntimacaoProcessando.value) {
    console.log('⚠️ Outra intimação já está sendo processada. Aguarde a conclusão.')
    return
  }

  // Verificar se a intimação específica já está sendo processada
  if (intimacoesProcessando.value.has(intimacao.id)) {
    console.log('⚠️ Intimação já está sendo processada:', intimacao.id)
    return
  }

  try {
    // Adicionar a intimação à lista de processamento
    intimacoesProcessando.value.add(intimacao.id)
    
    console.log('🔄 Marcando intimação como visualizada:', intimacao.id)
    
    // Atualizar no banco de dados
    const { error } = await supabase
      .from('intimacoes')
      .update({ visualizado: true })
      .eq('id', intimacao.id)
    
    if (error) {
      console.error('❌ Erro ao atualizar intimação:', error)
      throw error
    }
    
    console.log('✅ Intimação marcada como visualizada com sucesso')
    
    // Recarregar a lista completa do banco para garantir dados atualizados
    // IMPORTANTE: Preservar o filtro atual
    await carregarIntimacoes(props.searchTerm)
    
    // Atualizar contador global de intimações não visualizadas
    await atualizarContador()
    
    // Mostrar alerta de sucesso
    mostrarAlertaSucesso.value = true
    
  } catch (error) {
    console.error('❌ Erro ao marcar intimação como visualizada:', error)
    
    tituloErro.value = 'Erro ao atualizar'
    mensagemErro.value = error.message || 'Erro ao marcar intimação como visualizada. Tente novamente.'
    
    // Mostrar alerta de erro
    mostrarAlertaErro.value = true
  } finally {
    // Remover a intimação da lista de processamento
    intimacoesProcessando.value.delete(intimacao.id)
    console.log('🏁 Finalizando processamento da intimação:', intimacao.id)
  }
}

const carregarIntimacoes = async (searchTerm = '') => {
  loading.value = true
  
  // IMPORTANTE: Se searchTerm não foi passado, usar o props.searchTerm atual
  // Isso garante que o filtro seja preservado quando recarregamos a lista
  const termoAtual = searchTerm || props.searchTerm || ''
  
  console.log('🔍 Carregando intimações com termo:', termoAtual)
  
  try {
    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Erro ao obter usuário autenticado:', authError)
      throw new Error('Usuário não autenticado')
    }

    console.log('👤 Carregando intimações para usuário:', user.id)

    let query = supabase
      .from('intimacoes')
      .select('*')
      .eq('uuid', user.id) // FILTRO ESSENCIAL: apenas intimações do usuário autenticado
      
    // Aplicar filtro por processo quando processoId estiver disponível
    if (props.processoId) {
      console.log('🔍 Filtrando intimações pelo processo ID:', props.processoId)
      query = query.eq('processo_id', props.processoId)
    }
    
    // Aplicar filtro por cliente quando clienteId estiver disponível
    if (props.clienteId && !props.processoId) {
      console.log('🔍 Filtrando intimações pelo cliente ID:', props.clienteId)
      // Aqui precisamos de uma relação entre intimações e clientes via processos
      query = query.eq('cliente_id', props.clienteId)
    }

    // Se houver termo de busca, aplicar filtros de busca
    if (termoAtual && termoAtual.trim()) {
      const termo = termoAtual.trim()
      console.log('🔍 Aplicando filtro de busca para:', termo)
      
      // Usar sintaxe correta do Supabase para OR
      query = query.or(`cnj.ilike.%${termo}%,autor.ilike.%${termo}%,reu.ilike.%${termo}%,tribunal.ilike.%${termo}%,tipo.ilike.%${termo}%,secao.ilike.%${termo}%,conteudo.ilike.%${termo}%,snippet.ilike.%${termo}%`)
    } else {
      console.log('🔍 Carregando todas as intimações do usuário (sem filtro de texto)')
    }

    const { data, error } = await query
      .order('data', { ascending: false })
      .limit(1000) // Limitar para melhorar performance

    if (error) {
      console.error('❌ Erro na consulta principal:', error)
      throw error
    }

    console.log('✅ Intimações carregadas:', data?.length || 0)
    intimacoes.value = data || []
    
    // DEBUG: Se há termo de busca, mostrar resultados encontrados
    if (termoAtual && termoAtual.trim() && data && data.length > 0) {
      console.log('🔍 DEBUG: Resultados da busca para termo:', termoAtual)
      data.forEach((intimacao, index) => {
        const match = intimacao.cnj?.toLowerCase().includes(termoAtual.toLowerCase())
        console.log(`${index + 1}. CNJ: "${intimacao.cnj}" | Match: ${match}`)
      })
    } else if (termoAtual && termoAtual.trim() && (!data || data.length === 0)) {
      console.log('❌ Nenhum resultado encontrado para o termo:', termoAtual)
    }
  } catch (error) {
    console.error('❌ Erro ao carregar intimações:', error)
    
    // Se há termo de busca e deu erro, não fazer fallback para não confundir o usuário
    if (termoAtual && termoAtual.trim()) {
      console.log('❌ Erro na busca, não executando fallback para não confundir')
      intimacoes.value = []
    } else {
      // Em caso de erro sem termo de busca, tentar uma consulta mais simples
      try {
        console.log('🔄 Tentando consulta de fallback...')
        const { data: { user } } = await supabase.auth.getUser()
        let fallbackQuery = supabase
          .from('intimacoes')
          .select('*')
          .eq('uuid', user.id) // FILTRO ESSENCIAL: apenas intimações do usuário autenticado
        
        // Aplicar o mesmo filtro por processo no fallback
        if (props.processoId) {
          console.log('🔍 Fallback: Filtrando intimações pelo processo ID:', props.processoId)
          fallbackQuery = fallbackQuery.eq('processo_id', props.processoId)
        }
        
        // Aplicar o mesmo filtro por cliente no fallback
        if (props.clienteId && !props.processoId) {
          console.log('🔍 Fallback: Filtrando intimações pelo cliente ID:', props.clienteId)
          fallbackQuery = fallbackQuery.eq('cliente_id', props.clienteId)
        }
        
        const { data } = await fallbackQuery
          .order('data', { ascending: false })
          .limit(1000)
        
        console.log('✅ Fallback executado, intimações:', data?.length || 0)
        intimacoes.value = data || []
      } catch (fallbackError) {
        console.error('❌ Erro na consulta de fallback:', fallbackError)
        intimacoes.value = []
      }
    }
  } finally {
    loading.value = false
  }
}

// Funções para dropdown de ações das intimações
const mostrarAcoesIntimacao = (intimacaoId, intimacao, event) => {
  event.stopPropagation()
  
  // Obter posição do clique de forma mais precisa
  const rect = event.target.getBoundingClientRect()
  dropdownPosition.value = {
    top: rect.bottom,
    left: rect.left
  }
  
  intimacaoSelecionada.value = intimacao
  showAcoesDropdown.value = true
}

const fecharAcoesDropdown = () => {
  showAcoesDropdown.value = false
  intimacaoSelecionada.value = null
}

// Handlers do dropdown de ações
const handleMarcarVisualizado = async (data) => {
  try {
    const { intimacao, acao } = data
    const novoStatus = acao === 'marcar'
    
    console.log('🔄 Alterando status de visualização:', intimacao.id, 'para:', novoStatus)
    
    // Atualizar no banco de dados
    const { error } = await supabase
      .from('intimacoes')
      .update({ visualizado: novoStatus })
      .eq('id', intimacao.id)
    
    if (error) {
      console.error('❌ Erro ao atualizar status:', error)
      throw error
    }
    
    // Recarregar a lista
    await carregarIntimacoes(props.searchTerm)
    
    // Atualizar contador global de intimações não visualizadas
    await atualizarContador()
    
    // Mostrar alerta de sucesso
    mostrarAlertaSucesso.value = true
    
  } catch (error) {
    console.error('❌ Erro ao alterar status:', error)
    tituloErro.value = 'Erro ao atualizar'
    mensagemErro.value = error.message || 'Erro ao alterar status da intimação. Tente novamente.'
    mostrarAlertaErro.value = true
  }
}

const handleExportarIntimacao = (data) => {
  const { intimacao } = data
  console.log('📤 Exportando intimação:', intimacao)
  
  try {
    // Importar o serviço de PDF dinamicamente
    import('../../services/pdfService.js').then(({ pdfService }) => {
      pdfService.gerarPDFIntimacao(intimacao)
    }).catch(error => {
      console.error('❌ Erro ao importar serviço de PDF:', error)
      alert('Erro ao exportar PDF. Tente novamente.')
    })
  } catch (error) {
    console.error('❌ Erro ao exportar intimação:', error)
    alert('Erro ao exportar PDF. Tente novamente.')
  }
}

const handleExcluirIntimacao = (data) => {
  const { intimacao } = data
  console.log('🗑️ Preparando para excluir intimação:', intimacao)
  
  intimacaoParaExcluir.value = intimacao
  showModalExclusao.value = true
}

// Handlers do modal de exclusão
const cancelarExclusao = () => {
  showModalExclusao.value = false
  intimacaoParaExcluir.value = null
}

const confirmarExclusao = async () => {
  showModalExclusao.value = false
  
  // Aguardar um pouco para o modal fechar
  setTimeout(async () => {
    try {
      // Recarregar a lista para remover a intimação excluída
      await carregarIntimacoes(props.searchTerm)
      
      // Mostrar alerta de sucesso
      mostrarAlertaSucesso.value = true
      
    } catch (error) {
      console.error('❌ Erro após exclusão:', error)
    }
    
    intimacaoParaExcluir.value = null
  }, 500)
}

// Novas funções para os ícones de ação
const toggleVisualizarIntimacao = async (intimacao) => {
  // Verificar se alguma intimação já está sendo processada
  if (intimacoesProcessando.value.has(intimacao.id)) {
    console.log('⚠️ Intimação já está sendo processada:', intimacao.id)
    return
  }

  try {
    // Adicionar à lista de processamento
    intimacoesProcessando.value.add(intimacao.id)
    
    const novoStatus = !intimacao.visualizado
    console.log('🔄 Alterando status de visualização:', intimacao.id, 'para:', novoStatus)
    
    // Atualizar no banco de dados
    const { error } = await supabase
      .from('intimacoes')
      .update({ visualizado: novoStatus })
      .eq('id', intimacao.id)
    
    if (error) {
      console.error('❌ Erro ao atualizar status:', error)
      throw error
    }
    
    // Recarregar a lista
    await carregarIntimacoes(props.searchTerm)
    
    // Atualizar contador global de intimações não visualizadas
    await atualizarContador()
    
    // Mostrar alerta de sucesso
    mostrarAlertaSucesso.value = true
    
  } catch (error) {
    console.error('❌ Erro ao alterar status:', error)
    tituloErro.value = 'Erro ao atualizar'
    mensagemErro.value = error.message || 'Erro ao alterar status da intimação. Tente novamente.'
    mostrarAlertaErro.value = true
  } finally {
    // Remover da lista de processamento
    intimacoesProcessando.value.delete(intimacao.id)
  }
}

const agendarCompromisso = async (intimacao) => {
  console.log('🗓️ agendarCompromisso chamado para intimação:', intimacao)
  
  try {
    // Importar o serviço de clientes
    console.log('📦 Importando clienteService...')
    const { clienteService } = await import('../../services/clienteService')
    
    // Buscar o processo relacionado à intimação
    console.log('🔍 Buscando processo relacionado à intimação...')
    const { data: processoData, error: processoError } = await supabase
      .from('processos')
      .select('id, cnpj')
      .eq('cnpj', intimacao.cnj)
      .eq('arquivado', false)
      .single()
    
    if (processoError || !processoData) {
      console.log('❌ Processo não encontrado ou não está sendo monitorado')
      tituloErroAgenda.value = 'Processo não monitorado'
      mensagemErroAgenda.value = 'Este processo não está sendo monitorado. Para agendar compromissos relacionados a uma intimação, o processo deve estar na lista de processos monitorados.'
      mostrarAlertaErroAgenda.value = true
      return
    }
    
    console.log('📄 Processo encontrado:', processoData)
    
    // Verificar se há clientes vinculados ao processo
    console.log('🔍 Verificando clientes vinculados ao processo...')
    const clientesVinculados = await clienteService.listarClientesVinculados(processoData.id)
    console.log('👥 Clientes vinculados encontrados:', clientesVinculados)
    
    if (!clientesVinculados || clientesVinculados.length === 0) {
      // Não há clientes vinculados - mostrar alerta de erro
      console.log('❌ Nenhum cliente vinculado - mostrando alerta')
      tituloErroAgenda.value = 'Nenhum cliente vinculado'
      mensagemErroAgenda.value = 'Não há clientes vinculados a este processo. Vincule ao menos um cliente antes de agendar um compromisso relacionado à intimação.'
      mostrarAlertaErroAgenda.value = true
      return
    }
    
    // Há clientes vinculados - abrir modal Agenda
    console.log('✅ Clientes encontrados - abrindo modal da agenda para intimação')
    
    modalAgendaIntimacao.value = {
      show: true,
      processoId: processoData.id,
      cnj: intimacao.cnj,
      intimacao: intimacao
    }
    console.log('📊 Modal state:', modalAgendaIntimacao.value)
    
  } catch (error) {
    console.error('❌ Erro ao verificar clientes vinculados:', error)
    tituloErroAgenda.value = 'Erro'
    mensagemErroAgenda.value = 'Erro ao verificar clientes vinculados. Tente novamente.'
    mostrarAlertaErroAgenda.value = true
  }
}

const enviarPorEmail = async (intimacao) => {
  console.log('📧 enviarPorEmail chamado para intimação:', intimacao)
  
  try {
    // Importar o serviço de clientes
    console.log('📦 Importando clienteService...')
    const { clienteService } = await import('../../services/clienteService')
    
    // Buscar o processo relacionado à intimação
    console.log('🔍 Buscando processo relacionado à intimação...')
    const { data: processoData, error: processoError } = await supabase
      .from('processos')
      .select('id, cnpj')
      .eq('cnpj', intimacao.cnj)
      .eq('arquivado', false)
      .single()
    
    if (processoError || !processoData) {
      console.log('❌ Processo não encontrado ou não está sendo monitorado')
      tituloErroEmail.value = 'Processo não monitorado'
      mensagemErroEmail.value = 'Este processo não está sendo monitorado. Para enviar email relacionado a uma intimação, o processo deve estar na lista de processos monitorados.'
      mostrarAlertaErroEmail.value = true
      return
    }
    
    console.log('📄 Processo encontrado:', processoData)
    
    // Verificar se há clientes vinculados ao processo
    console.log('🔍 Verificando clientes vinculados ao processo...')
    const clientesVinculados = await clienteService.listarClientesVinculados(processoData.id)
    console.log('👥 Clientes vinculados encontrados:', clientesVinculados)
    
    if (!clientesVinculados || clientesVinculados.length === 0) {
      // Não há clientes vinculados - mostrar alerta de erro
      console.log('❌ Nenhum cliente vinculado - mostrando alerta')
      tituloErroEmail.value = 'Nenhum cliente vinculado'
      mensagemErroEmail.value = 'Não há clientes vinculados a este processo. Vincule ao menos um cliente antes de enviar email relacionado à intimação.'
      mostrarAlertaErroEmail.value = true
      return
    }
    
    // Há clientes vinculados - abrir modal Email
    console.log('✅ Clientes encontrados - abrindo modal de email para intimação')
    
    modalEmailIntimacao.value = {
      show: true,
      processoId: processoData.id,
      cnj: intimacao.cnj,
      intimacao: intimacao
    }
    console.log('📊 Modal state:', modalEmailIntimacao.value)
    
  } catch (error) {
    console.error('❌ Erro ao verificar clientes vinculados:', error)
    tituloErroEmail.value = 'Erro'
    mensagemErroEmail.value = 'Erro ao verificar clientes vinculados. Tente novamente.'
    mostrarAlertaErroEmail.value = true
  }
}

const enviarPorWhatsapp = async (intimacao) => {
  console.log('📱 enviarPorWhatsapp chamado para intimação:', intimacao)
  
  try {
    // Importar o serviço de clientes
    console.log('📦 Importando clienteService...')
    const { clienteService } = await import('../../services/clienteService')
    
    // Buscar o processo relacionado à intimação
    console.log('🔍 Buscando processo relacionado à intimação...')
    const { data: processoData, error: processoError } = await supabase
      .from('processos')
      .select('id, cnpj')
      .eq('cnpj', intimacao.cnj)
      .eq('arquivado', false)
      .single()
    
    if (processoError || !processoData) {
      console.log('❌ Processo não encontrado ou não está sendo monitorado')
      tituloErroWhatsapp.value = 'Processo não monitorado'
      mensagemErroWhatsapp.value = 'Este processo não está sendo monitorado. Para enviar WhatsApp relacionado a uma intimação, o processo deve estar na lista de processos monitorados.'
      mostrarAlertaErroWhatsapp.value = true
      return
    }
    
    console.log('📄 Processo encontrado:', processoData)
    
    // Verificar se há clientes vinculados ao processo
    console.log('🔍 Verificando clientes vinculados ao processo...')
    const clientesVinculados = await clienteService.listarClientesVinculados(processoData.id)
    console.log('👥 Clientes vinculados encontrados:', clientesVinculados)
    
    if (!clientesVinculados || clientesVinculados.length === 0) {
      // Não há clientes vinculados - mostrar alerta de erro
      console.log('❌ Nenhum cliente vinculado - mostrando alerta')
      tituloErroWhatsapp.value = 'Nenhum cliente vinculado'
      mensagemErroWhatsapp.value = 'Não há clientes vinculados a este processo. Vincule ao menos um cliente antes de enviar WhatsApp relacionado à intimação.'
      mostrarAlertaErroWhatsapp.value = true
      return
    }
    
    // Há clientes vinculados - abrir modal WhatsApp
    console.log('✅ Clientes encontrados - abrindo modal de WhatsApp para intimação')
    
    modalWhatsappIntimacao.value = {
      show: true,
      processoId: processoData.id,
      cnj: intimacao.cnj,
      intimacao: intimacao
    }
    console.log('📊 Modal state:', modalWhatsappIntimacao.value)
    
  } catch (error) {
    console.error('❌ Erro ao verificar clientes vinculados:', error)
    tituloErroWhatsapp.value = 'Erro'
    mensagemErroWhatsapp.value = 'Erro ao verificar clientes vinculados. Tente novamente.'
    mostrarAlertaErroWhatsapp.value = true
  }
}

const handleCriarLembreteIntimacao = async (intimacao) => {
  console.log('📝 handleCriarLembreteIntimacao chamado para intimação:', intimacao)
  
  try {
    // Importar o serviço de clientes
    console.log('📦 Importando clienteService...')
    const { clienteService } = await import('../../services/clienteService')
    
    // Buscar o processo relacionado à intimação
    console.log('🔍 Buscando processo relacionado à intimação...')
    const { data: processoData, error: processoError } = await supabase
      .from('processos')
      .select('id, cnpj')
      .eq('cnpj', intimacao.cnj)
      .eq('arquivado', false)
      .single()
    
    if (processoError || !processoData) {
      console.log('❌ Processo não encontrado ou não está sendo monitorado')
      tituloErroLembrete.value = 'Processo não monitorado'
      mensagemErroLembrete.value = 'Este processo não está sendo monitorado. Para criar lembretes relacionados a uma intimação, o processo deve estar na lista de processos monitorados.'
      mostrarAlertaErroLembrete.value = true
      return
    }
    
    console.log('📄 Processo encontrado:', processoData)
    
    // Verificar se há clientes vinculados ao processo
    console.log('🔍 Verificando clientes vinculados ao processo...')
    const clientesVinculados = await clienteService.listarClientesVinculados(processoData.id)
    console.log('👥 Clientes vinculados encontrados:', clientesVinculados)
    
    if (!clientesVinculados || clientesVinculados.length === 0) {
      // Não há clientes vinculados - mostrar alerta de erro
      console.log('❌ Nenhum cliente vinculado - mostrando alerta')
      tituloErroLembrete.value = 'Nenhum cliente vinculado'
      mensagemErroLembrete.value = 'Não há clientes vinculados a este processo. Vincule ao menos um cliente antes de criar um lembrete relacionado à intimação.'
      mostrarAlertaErroLembrete.value = true
      return
    }
    
    // Há clientes vinculados - abrir modal Lembrete
    console.log('✅ Clientes encontrados - abrindo modal de lembrete para intimação')
    
    modalLembreteIntimacao.value = {
      show: true,
      processoId: processoData.id,
      cnj: intimacao.cnj,
      intimacao: intimacao
    }
    console.log('📊 Modal state:', modalLembreteIntimacao.value)
    
  } catch (error) {
    console.error('❌ Erro ao verificar clientes vinculados:', error)
    tituloErroLembrete.value = 'Erro'
    mensagemErroLembrete.value = 'Erro ao verificar clientes vinculados. Tente novamente.'
    mostrarAlertaErroLembrete.value = true
  }
}

// Funções para o modal de agenda das intimações
const fecharModalAgendaIntimacao = () => {
  modalAgendaIntimacao.value = { show: false, processoId: null, cnj: '', intimacao: null }
}

const handleAgendaCriadaIntimacao = (dadosEvento) => {
  console.log('Agenda criada para intimação:', dadosEvento)
  
  // Definir mensagem de sucesso
  const titulo = dadosEvento.titulo || 'compromisso'
  const data = dadosEvento.data || ''
  
  // Formatar a data para exibição (DD/MM/YYYY)
  let dataFormatada = data
  if (data && data.includes('-')) {
    const [ano, mes, dia] = data.split('-')
    dataFormatada = `${dia}/${mes}/${ano}`
  }
  
  mensagemSucessoAgenda.value = `Compromisso "${titulo}" relacionado à intimação marcado na agenda com sucesso para o dia ${dataFormatada}!`
  
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

// Funções para o modal de lembrete das intimações
const fecharModalLembreteIntimacao = () => {
  modalLembreteIntimacao.value = { show: false, processoId: null, cnj: '', intimacao: null }
}

const handleLembreteCriadoIntimacao = (dadosEvento) => {
  console.log('Lembrete criado para intimação:', dadosEvento)
  
  // Definir mensagem de sucesso
  const titulo = dadosEvento.titulo || 'lembrete'
  const totalLembretes = dadosEvento.totalLembretes || 1
  
  if (totalLembretes === 1) {
    mensagemSucessoLembrete.value = `Lembrete "${titulo}" relacionado à intimação criado com sucesso!`
  } else {
    mensagemSucessoLembrete.value = `Lembrete "${titulo}" relacionado à intimação criado com sucesso para ${totalLembretes} clientes!`
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

// Funções para o modal de WhatsApp das intimações
const fecharModalWhatsappIntimacao = () => {
  modalWhatsappIntimacao.value = { show: false, processoId: null, cnj: '', intimacao: null }
}

const handleWhatsappCriadoIntimacao = (dadosEvento) => {
  console.log('WhatsApp enviado para intimação:', dadosEvento)
  
  // Definir mensagem de sucesso
  const titulo = dadosEvento.titulo || 'mensagem'
  const totalEnvios = dadosEvento.totalEnvios || 1
  
  if (totalEnvios === 1) {
    mensagemSucessoWhatsapp.value = `WhatsApp "${titulo}" relacionado à intimação enviado com sucesso!`
  } else {
    mensagemSucessoWhatsapp.value = `WhatsApp "${titulo}" relacionado à intimação enviado com sucesso para ${totalEnvios} contatos!`
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

// Funções para o modal de Email das intimações
const fecharModalEmailIntimacao = () => {
  modalEmailIntimacao.value = { show: false, processoId: null, cnj: '', intimacao: null }
}

const handleEmailCriadoIntimacao = (dadosEvento) => {
  console.log('Email enviado para intimação:', dadosEvento)
  
  // Definir mensagem de sucesso
  const titulo = dadosEvento.titulo || 'mensagem'
  const totalEnvios = dadosEvento.totalEnvios || 1
  
  if (totalEnvios === 1) {
    mensagemSucessoEmail.value = `Email "${titulo}" relacionado à intimação enviado com sucesso!`
  } else {
    mensagemSucessoEmail.value = `Email "${titulo}" relacionado à intimação enviado com sucesso para ${totalEnvios} contatos!`
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

// Watcher para recarregar dados quando pesquisa mudar (com debounce)
watch(() => props.searchTerm, (newSearchTerm, oldSearchTerm) => {
  console.log('🔄 SearchTerm mudou de:', oldSearchTerm, 'para:', newSearchTerm)
  
  // Só recarrega se realmente mudou
  if (newSearchTerm !== oldSearchTerm) {
    paginaAtual.value = 1
    
    // Limpar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Definir novo timeout para debounce
    searchTimeout = setTimeout(() => {
      carregarIntimacoes(newSearchTerm)
    }, 300)
  }
})

// Watcher para recarregar dados quando o processoId mudar
watch(() => props.processoId, async (novoProcessoId, antigoProcessoId) => {
  console.log('🔄 Processo ID alterado:', antigoProcessoId, '->', novoProcessoId)
  if (novoProcessoId !== antigoProcessoId) {
    paginaAtual.value = 1 // Resetar para a primeira página
    await carregarIntimacoes(props.searchTerm)
  }
})

onMounted(async () => {
  // Usar o searchTerm das props se estiver disponível (vindo da URL)
  await carregarIntimacoes(props.searchTerm)
})
</script>

<style scoped>
.lista-intimacoes-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  background: white;
  box-sizing: border-box;
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

/* Lista de Intimações */
.intimacoes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.intimacao-card {
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.intimacao-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.intimacao-card.expanded {
  border-color: #0468FA;
  box-shadow: 0 4px 12px rgba(4, 104, 250, 0.1);
}

/* Ícone */
.intimacao-icon {
  width: 127px;
  height: 127px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.mail-icon {
  width: 38px;
  height: 38px;
  transition: filter 0.2s ease;
}

.notification-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background-color: #EF4444;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
  z-index: 10;
}

/* Informações */
.intimacao-info {
  flex: 1;
  min-width: 0;
  width: 100%;
  overflow-wrap: break-word;
}

.intimacao-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.intimacao-processo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.intimacao-status {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.intimacao-status.nova {
  background: #fee2e2;
  color: #dc2626;
}

.intimacao-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.intimacao-details p {
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
.intimacao-detalhes-conteudo {
  margin-top: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.conteudo-html {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  overflow-x: auto;
}

.intimacao-detalhes-expandidos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  box-sizing: border-box;
}

.detalhes-linha {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
}

.detalhes-linha .label {
  min-width: 70px;
  flex-shrink: 0;
}

/* Ações */
.intimacao-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Ícone de ações */
.action-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.action-icon:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 4px rgba(1, 105, 250, 0.4));
}

.action-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(100%);
}

.action-icon.disabled:hover {
  transform: none;
  filter: grayscale(100%);
}

/* Ícones específicos */
.action-icon-expandir:hover {
  filter: drop-shadow(0 0 4px rgba(1, 105, 250, 0.4));
}

.action-icon-agenda:hover {
  filter: drop-shadow(0 0 4px rgba(1, 105, 250, 0.4));
}

.action-icon-editar:hover {
  filter: drop-shadow(0 0 4px rgba(1, 105, 250, 0.4));
}

.action-icon-email:hover {
  filter: drop-shadow(0 0 4px rgba(1, 105, 250, 0.4));
}

.action-icon-whatsapp:hover {
  filter: drop-shadow(0 0 4px rgba(1, 105, 250, 0.4));
}

.action-icon-mais:hover {
  transform: scale(1.1);
}

/* Estilos para os novos ícones de ação */
.intimacao-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.action-icon:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 4px rgba(1, 105, 250, 0.4));
}

.action-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(100%);
}

.action-icon.disabled:hover {
  transform: none;
  filter: grayscale(100%);
}

.btn-marcar-visualizada:hover:not(:disabled) {
  background: #f0f9ff;
  border-color: #0354cc;
  color: #0354cc;
}

.btn-marcar-visualizada:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-marcar-visualizada.loading {
  background: #f0f9ff;
  border-color: #0468FA;
  color: #0468FA;
}

.btn-marcar-visualizada.disabled {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.btn-marcar-visualizada.disabled:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #9ca3af;
}

.check-icon {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

.loading-spinner-btn {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.status-visualizada {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #059669;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.check-icon-small {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
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
  .lista-intimacoes-container {
    padding: 1rem;
  }

  .intimacao-card {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "icon info"
      "actions actions";
    gap: 1rem;
    padding: 1rem;
  }

  .intimacao-icon {
    grid-area: icon;
    margin-right: 0.5rem;
  }

  .intimacao-info {
    grid-area: info;
    padding-right: 0.5rem;
  }

  .intimacao-actions {
    grid-area: actions;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 0.5rem;
  }

  .status-visualizada {
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

  .intimacao-header {
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

  .btn-marcar-visualizada {
    width: 100%;
    justify-content: center;
  }

  /* Responsivo para detalhes de conteúdo em mobile */
  .detalhes-conteudo {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detalhes-conteudo .label {
    min-width: auto;
  }

  .conteudo-html {
    max-height: 300px;
    padding: 0.75rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .intimacao-icon {
    width: 48px;
    height: 48px;
    border-radius: 4px;
  }

  .mail-icon {
    width: 38px;
    height: 38px;
  }

  .intimacao-processo {
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 600;
  }

  .intimacao-status {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
  }

  .intimacao-details p {
    font-size: 0.75rem;
    line-height: 1.25rem;
  }

  .intimacao-details {
    gap: 0.125rem;
  }

  /* Snippet em mobile */
  .intimacao-snippet {
    font-size: 0.75rem;
    line-height: 1.3;
    margin-top: 0.375rem;
  }

  /* Conteúdo HTML em mobile */
  .conteudo-html {
    max-height: 250px;
    padding: 0.5rem;
    font-size: 0.75rem;
    line-height: 1.5;
  }
}

/* Snippet no card não expandido */
.intimacao-snippet {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.4;
}

.intimacao-snippet .label {
  font-weight: 500;
  color: #6b7280;
  margin-right: 0.5rem;
}

/* Conteúdo HTML expandido */
.detalhes-conteudo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.detalhes-conteudo .label {
  min-width: 120px;
  flex-shrink: 0;
  font-weight: 500;
  color: #6b7280;
}

.conteudo-html {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #374151;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* Estilos para elementos HTML dentro do conteúdo */
.conteudo-html p {
  margin: 0 0 0.75rem 0;
}

.conteudo-html p:last-child {
  margin-bottom: 0;
}

.conteudo-html strong, .conteudo-html b {
  font-weight: 600;
  color: #111827;
}

.conteudo-html em, .conteudo-html i {
  font-style: italic;
}

.conteudo-html u {
  text-decoration: underline;
}

.conteudo-html br {
  line-height: 1.8;
}

.conteudo-html ul, .conteudo-html ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.conteudo-html li {
  margin: 0.25rem 0;
}

.conteudo-html table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
}

.conteudo-html th, .conteudo-html td {
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  text-align: left;
}

.conteudo-html th {
  background: #f3f4f6;
  font-weight: 600;
}
</style> 