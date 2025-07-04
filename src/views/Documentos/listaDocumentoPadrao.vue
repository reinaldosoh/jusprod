<template>
  <div class="lista-documento-padrao-container">
    <!-- Header da tabela -->
    <div class="table-header">
      <div class="header-nome">Nome do arquivo</div>
      <div class="header-acoes">Ações</div>
    </div>
    
    <!-- Lista de documentos -->
    <div class="documentos-list">
      <div 
        v-for="documento in documentos" 
        :key="documento.id"
        class="documento-item"
      >
        <div class="documento-info">
          <div class="documento-icon">
            <img src="/images/iconeDoc.svg" alt="Documento" class="doc-icon" />
          </div>
          <div class="documento-details">
            <div class="documento-nome">{{ documento.nome }}</div>
            <div class="documento-tipo">{{ documento.tipo }}</div>
          </div>
        </div>
        
        <div class="documento-acoes">
          <button 
            class="visualizar-btn"
            @click="visualizarDocumento(documento)"
            title="Visualizar documento"
          >
            <img src="/images/iconvisualizar.svg" alt="Visualizar" class="visualizar-icon" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando documentos...</p>
    </div>
    
    <!-- Empty state -->
    <div v-if="!loading && documentos.length === 0" class="empty-state">
      <img src="/images/empty_docs.png" alt="Nenhum documento" class="empty-image" />
      <h3 class="empty-title">Nenhum documento encontrado</h3>
      <p class="empty-description">Não há documentos padrão disponíveis no momento.</p>
    </div>

    <!-- Modal LeitorHtml -->
    <LeitorHtml
      :is-visible="mostrarLeitor"
      :titulo="documentoSelecionado?.nome || 'Modelo de documento'"
      :conteudo="documentoSelecionado?.html || ''"
      @fechar="fecharLeitor"
      @documento-criado="documentoCriado"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LeitorHtml from './LeitorHtml.vue'

const emit = defineEmits(['visualizar-documento', 'documento-criado'])

// Estados
const loading = ref(true)
const documentos = ref([])
const mostrarLeitor = ref(false)
const documentoSelecionado = ref(null)

// Função para carregar documentos do sistema
const carregarDocumentosSistema = async () => {
  try {
    loading.value = true
    
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js')
    
    // Buscar documentos do sistema
    const { data, error } = await supabase
      .from('documento_sistema')
      .select('id, nome, tipo, html')
      .order('id', { ascending: true })
    
    if (error) {
      throw error
    }
    
    // Formatar dados para exibição
    documentos.value = data.map(doc => ({
      id: doc.id,
      nome: doc.nome,
      tipo: `${doc.tipo.toUpperCase()}`,
      html: doc.html || ''
    }))
    
  } catch (error) {
    console.error('Erro ao carregar documentos do sistema:', error)
    documentos.value = []
  } finally {
    loading.value = false
  }
}

const visualizarDocumento = (documento) => {
  console.log('Visualizar documento:', documento)
  documentoSelecionado.value = documento
  mostrarLeitor.value = true
  emit('visualizar-documento', documento)
}

const fecharLeitor = () => {
  mostrarLeitor.value = false
  documentoSelecionado.value = null
}

const documentoCriado = (documento) => {
  console.log('Documento criado:', documento)
  emit('documento-criado', documento)
  fecharLeitor()
}



// Carregar dados quando componente é montado
onMounted(() => {
  carregarDocumentosSistema()
})

// Expor função para recarregar
defineExpose({
  recarregar: carregarDocumentosSistema
})
</script>

<style scoped>
.lista-documento-padrao-container {
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

.documentos-list {
  background: white;
  padding: 0 2rem;
}

.documento-item {
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

.documento-item:hover {
  background-color: #f9fafb;
}

.documento-item:last-child {
  border-bottom: none;
}

.documento-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.documento-icon {
  flex-shrink: 0;
}

.doc-icon {
  width: 40px;
  height: 40px;
}

.documento-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.documento-nome {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.25;
}

.documento-tipo {
  font-size: 0.75rem;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.25;
}

.documento-acoes {
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
  
  .documentos-list {
    padding: 0 1rem;
  }
  
  .documento-item {
    padding: 0.75rem 0;
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .documento-nome {
    font-size: 0.8rem;
  }
  
  .documento-tipo {
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
  
  .documentos-list {
    padding: 0 1rem;
  }
  
  .documento-item {
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .documento-info {
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