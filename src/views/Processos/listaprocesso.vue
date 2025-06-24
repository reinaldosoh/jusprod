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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="balance-icon">
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
            @click.stop="monitorarProcesso(processo)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="monitor-icon">
              <!-- Pasta -->
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <!-- Sinal de + -->
              <line x1="12" y1="10" x2="12" y2="16"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
            </svg>
            Monitorar Processo
          </button>
          <span v-else class="status-monitorado">Monitorado</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Carregando processos...</p>
      </div>

      <!-- Estado vazio -->
      <div v-else-if="processosFiltrados.length === 0" class="empty-state">
        <p>Nenhum processo {{ activeTab === 'monitorados' ? 'monitorado' : 'não monitorado' }} encontrado.</p>
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
        Mostrando {{ inicioItem }} - {{ fimItem }} de {{ processosFiltrados.length }} processos
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase'

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
  try {
    const { error } = await supabase
      .from('processos')
      .update({ arquivado: false })
      .eq('id', processo.id)

    if (error) throw error

    // Atualizar localmente
    const index = processos.value.findIndex(p => p.id === processo.id)
    if (index !== -1) {
      processos.value[index].arquivado = false
    }
  } catch (error) {
    console.error('Erro ao monitorar processo:', error)
  }
}

const carregarProcessos = async (searchTerm = '') => {
  loading.value = true
  console.log('🔍 Carregando processos com termo:', searchTerm)
  
  try {
    let query = supabase
      .from('processos')
      .select('*')

    // Se houver termo de busca, aplicar filtros de busca
    if (searchTerm && searchTerm.trim()) {
      const termo = searchTerm.trim()
      console.log('🔍 Aplicando filtro de busca para:', termo)
      
      // Usar sintaxe correta do Supabase para OR
      query = query.or(`cnpj.ilike.%${termo}%,autor.ilike.%${termo}%,reu.ilike.%${termo}%,tribunal.ilike.%${termo}%,area.ilike.%${termo}%,assunto.ilike.%${termo}%,classe.ilike.%${termo}%,orgao_julgador.ilike.%${termo}%`)
    } else {
      console.log('🔍 Carregando todos os processos (sem filtro)')
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

onMounted(() => {
  carregarProcessos()
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
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.balance-icon {
  width: 24px;
  height: 24px;
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
  border: 1px solid #10b981;
  border-radius: 6px;
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.btn-monitorar:hover {
  background: #f0fdf4;
  border-color: #059669;
  color: #059669;
}

.monitor-icon {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

.status-monitorado {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
}

@media (max-width: 640px) {
  .processo-icon {
    width: 48px;
    height: 48px;
  }

  .balance-icon {
    width: 20px;
    height: 20px;
  }

  .processo-numero {
    font-size: 1rem;
  }
}
</style> 