<template>
  <div class="lista-relatorio-padrao-container">
    <!-- Header da tabela -->
    <div class="table-header">
      <div class="header-nome">Nome do arquivo</div>
      <div class="header-acoes">Ações</div>
    </div>
    
    <!-- Lista de relatórios -->
    <div class="relatorios-list">
      <div 
        v-for="relatorio in relatorios" 
        :key="relatorio.id"
        class="relatorio-item"
      >
        <div class="relatorio-info">
          <div class="relatorio-icon">
            <img src="/images/iconeDoc.svg" alt="Relatório" class="doc-icon" />
          </div>
          <div class="relatorio-details">
            <div class="relatorio-nome">{{ relatorio.nome }}</div>
            <div class="relatorio-tipo">{{ relatorio.tipo }}</div>
          </div>
        </div>
        
        <div class="relatorio-acoes">
          <button 
            class="visualizar-btn"
            @click="visualizarRelatorio(relatorio)"
            title="Baixar relatório"
          >
            <img src="/images/download.svg" alt="Baixar" class="visualizar-icon" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando relatórios...</p>
    </div>
    
    <!-- Empty state -->
    <div v-if="!loading && relatorios.length === 0" class="empty-state">
      <img src="/images/empty_docs.png" alt="Nenhum relatório" class="empty-image" />
      <h3 class="empty-title">Nenhum relatório encontrado</h3>
      <p class="empty-description">Não há relatórios padrão disponíveis no momento.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['visualizar-relatorio', 'relatorio-criado'])

// Estados
const loading = ref(true)
const relatorios = ref([])

// Função para carregar relatórios do sistema
const carregarRelatoriosSistema = async () => {
  try {
    loading.value = true
    
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js')
    
    // Buscar relatórios do sistema
    const { data, error } = await supabase
      .from('relatorio_sistema')
      .select('id, nome, tipo, url')
      .order('id', { ascending: true })
    
    if (error) {
      throw error
    }
    
    // Formatar dados para exibição
    relatorios.value = data.map(rel => ({
      id: rel.id,
      nome: rel.nome,
      tipo: `${rel.tipo.toUpperCase()}`,
      url: rel.url || ''
    }))
    
    console.log('📊 Relatórios do sistema carregados:', relatorios.value.length)
    
  } catch (error) {
    console.error('Erro ao carregar relatórios do sistema:', error)
    relatorios.value = []
  } finally {
    loading.value = false
  }
}

const visualizarRelatorio = (relatorio) => {
  console.log('Visualizar relatório:', relatorio)
  
  // Se tem URL, abrir em nova aba
  if (relatorio.url) {
    window.open(relatorio.url, '_blank')
  } else {
    console.warn('Relatório sem URL disponível')
  }
  
  emit('visualizar-relatorio', relatorio)
}

// Carregar dados quando componente é montado
onMounted(() => {
  carregarRelatoriosSistema()
})

// Expor função para recarregar
defineExpose({
  recarregar: carregarRelatoriosSistema
})
</script>

<style scoped>
.lista-relatorio-padrao-container {
  width: 100%;
  background: white;
  max-width: 1280px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  margin-bottom: 0;
}

.header-nome {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-acoes {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.relatorios-list {
  background: white;
  padding: 0 2rem;
}

.relatorio-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
  margin: 0 -2rem;
  padding-left: 2rem;
  padding-right: 2rem;
}

.relatorio-item:hover {
  background-color: #f9fafb;
}

.relatorio-item:last-child {
  border-bottom: none;
}

.relatorio-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.relatorio-icon {
  flex-shrink: 0;
}

.doc-icon {
  width: 40px;
  height: 40px;
}

.relatorio-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.relatorio-nome {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.25;
}

.relatorio-tipo {
  font-size: 0.75rem;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.25;
}

.relatorio-acoes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.visualizar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.visualizar-btn:hover {
  background-color: #f3f4f6;
}

.visualizar-icon {
  width: 20px;
  height: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-image {
  width: 120px;
  height: auto;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Responsivo */
@media (max-width: 768px) {
  .table-header {
    padding: 0.75rem 1rem;
  }
  
  .relatorios-list {
    padding: 0 1rem;
  }
  
  .relatorio-item {
    padding: 0.75rem 0;
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .relatorio-nome {
    font-size: 0.8rem;
  }
  
  .relatorio-tipo {
    font-size: 0.7rem;
  }
  
  .header-nome,
  .header-acoes {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .table-header {
    padding: 0.75rem 1rem;
  }
  
  .relatorios-list {
    padding: 0 1rem;
  }
  
  .relatorio-item {
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .relatorio-info {
    gap: 0.5rem;
  }
  
  .doc-icon {
    width: 32px;
    height: 32px;
  }
  
  .visualizar-btn {
    width: 28px;
    height: 28px;
  }
  
  .visualizar-icon {
    width: 16px;
    height: 16px;
  }
}
</style> 