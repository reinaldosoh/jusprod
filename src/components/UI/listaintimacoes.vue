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
            src="/images/envelope.svg" 
            alt="Intimação" 
            class="mail-icon"
            :style="{ filter: activeTab === 'nao-visualizadas' ? 'hue-rotate(330deg) saturate(2) brightness(0.8)' : 'none' }"
          />
          <!-- Indicador de novo (se não visualizada) -->
          <div v-if="!intimacao.visualizado" class="notification-dot"></div>
        </div>

        <!-- Informações da Intimação -->
        <div class="intimacao-info">
          <div class="intimacao-header">
            <h3 class="intimacao-processo">{{ intimacao.numero_processo || 'N/A' }}</h3>
            <span class="intimacao-status" :class="{ 'nova': !intimacao.visualizado }">
              {{ intimacao.visualizado ? 'Visualizada' : 'Nova' }}
            </span>
          </div>
          
          <div class="intimacao-details">
            <p class="intimacao-titulo">
              <span class="label">Título:</span> {{ intimacao.titulo || 'N/A' }}
            </p>
            <p class="intimacao-data">
              <span class="label">Data:</span> {{ formatarData(intimacao.data_intimacao) }}
            </p>
            <p class="intimacao-tribunal">
              <span class="label">Tribunal:</span> {{ intimacao.tribunal || 'N/A' }}
            </p>
          </div>

          <!-- Detalhes expandidos -->
          <div v-if="intimacoesExpandidas.includes(intimacao.id)" class="intimacao-detalhes-expandidos">
            <div class="detalhes-linha">
              <span class="label">Processo:</span> {{ intimacao.numero_processo || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Tipo:</span> {{ intimacao.tipo || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Órgão:</span> {{ intimacao.orgao || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Conteúdo:</span> {{ intimacao.conteudo || '-' }}
            </div>
            <div class="detalhes-linha">
              <span class="label">Data criação:</span> {{ formatarData(intimacao.created_at) }}
            </div>
          </div>
        </div>

        <!-- Botão Marcar como Visualizada -->
        <div class="intimacao-actions">
          <button 
            v-if="!intimacao.visualizado"
            class="btn-marcar-visualizada"
            :class="{ 
              'loading': intimacoesProcessando.has(intimacao.id),
              'disabled': algmaIntimacaoProcessando && !intimacoesProcessando.has(intimacao.id)
            }"
            :disabled="algmaIntimacaoProcessando"
            @click.stop="marcarComoVisualizada(intimacao)"
          >
            <!-- Loading Spinner -->
            <div v-if="intimacoesProcessando.has(intimacao.id)" class="loading-spinner-btn"></div>
            
            <!-- Ícone normal -->
            <svg 
              v-else
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              class="check-icon"
            >
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            
            {{ 
              intimacoesProcessando.has(intimacao.id) 
                ? 'Processando...' 
                : algmaIntimacaoProcessando && !intimacoesProcessando.has(intimacao.id)
                  ? 'Aguarde...'
                  : 'Marcar como Visualizada' 
            }}
          </button>
          <div v-else class="status-visualizada">
            <!-- Ícone de Check -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="check-icon-small">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <span>Visualizada</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Carregando intimações...</p>
      </div>

      <!-- Estado vazio -->
      <div v-else-if="intimacoesFiltradas.length === 0" class="empty-state">
        <p>Nenhuma intimação {{ activeTab === 'nao-visualizadas' ? 'não visualizada' : 'visualizada' }} encontrada.</p>
      </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import AlertaSucesso from './AlertaSucesso.vue'
import AlertaErro from './AlertaErro.vue'

const props = defineProps({
  searchTerm: {
    type: String,
    default: ''
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
    await carregarIntimacoes(props.searchTerm)
    
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
  console.log('🔍 Carregando intimações com termo:', searchTerm)
  
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

    // Se houver termo de busca, aplicar filtros de busca
    if (searchTerm && searchTerm.trim()) {
      const termo = searchTerm.trim()
      console.log('🔍 Aplicando filtro de busca para:', termo)
      
      // Usar sintaxe correta do Supabase para OR
      query = query.or(`numero_processo.ilike.%${termo}%,titulo.ilike.%${termo}%,tribunal.ilike.%${termo}%,tipo.ilike.%${termo}%,orgao.ilike.%${termo}%,conteudo.ilike.%${termo}%`)
    } else {
      console.log('🔍 Carregando todas as intimações do usuário (sem filtro de texto)')
    }

    const { data, error } = await query
      .order('data_intimacao', { ascending: false })
      .limit(1000) // Limitar para melhorar performance

    if (error) {
      console.error('❌ Erro na consulta principal:', error)
      throw error
    }

    console.log('✅ Intimações carregadas:', data?.length || 0)
    intimacoes.value = data || []
  } catch (error) {
    console.error('❌ Erro ao carregar intimações:', error)
    
    // Se há termo de busca e deu erro, não fazer fallback para não confundir o usuário
    if (searchTerm && searchTerm.trim()) {
      console.log('❌ Erro na busca, não executando fallback para não confundir')
      intimacoes.value = []
    } else {
      // Em caso de erro sem termo de busca, tentar uma consulta mais simples
      try {
        console.log('🔄 Tentando consulta de fallback...')
        const { data: { user } } = await supabase.auth.getUser()
        const { data } = await supabase
          .from('intimacoes')
          .select('*')
          .eq('uuid', user.id) // FILTRO ESSENCIAL: apenas intimações do usuário autenticado
          .order('data_intimacao', { ascending: false })
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

// Watcher para recarregar dados quando pesquisa mudar (com debounce)
watch(() => props.searchTerm, (newSearchTerm) => {
  paginaAtual.value = 1
  
  // Limpar timeout anterior
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  // Definir novo timeout para debounce
  searchTimeout = setTimeout(() => {
    carregarIntimacoes(newSearchTerm)
  }, 300)
})

onMounted(async () => {
  await carregarIntimacoes()
})
</script>

<style scoped>
.lista-intimacoes-container {
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

/* Lista de Intimações */
.intimacoes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.intimacao-card {
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
  width: 42px;
  height: 42px;
  color: #9ca3af;
  stroke-width: 1.5;
}

/* Informações */
.intimacao-info {
  flex: 1;
  min-width: 0;
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
.intimacao-detalhes-expandidos {
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
.intimacao-actions {
  flex-shrink: 0;
}

.btn-marcar-visualizada {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #0468FA;
  border-radius: 6px;
  color: #0468FA;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
}

@media (max-width: 640px) {
  .intimacao-icon {
    width: 48px;
    height: 48px;
    border-radius: 4px;
  }

  .mail-icon {
    width: 24px;
    height: 24px;
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
}
</style> 