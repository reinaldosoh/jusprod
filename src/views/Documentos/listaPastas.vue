<template>
  <div class="lista-pastas-container">
    <div class="pastas-scroll-container">
      <div class="pastas-grid">
        <!-- Pasta fixa: Modelos Jusprod -->
        <Pastas
          key="modelos-jusprod"
          titulo="Modelos padrão"
          :quantidade-arquivos="quantidadeDocumentosSistema"
          :ativa-inicial="pastaAtivaSelecionada === 'modelos-jusprod'"
          @pasta-clicada="handlePastaClicada"
          :is-pasta-sistema="true"
        />
        
        <!-- Pastas dinâmicas do usuário -->
        <Pastas
          v-for="pasta in pastasUsuarioFiltradas"
          :key="pasta.id"
          :titulo="pasta.titulo"
          :quantidade-arquivos="pasta.quantidade_documentos"
          :ativa-inicial="pastaAtivaSelecionada === pasta.id"
          @pasta-clicada="handlePastaClicada"
          @editar-pasta="handleEditarPasta"
          :pasta-id="pasta.id"
        />
        
        <!-- Empty state inline quando não há pastas do usuário -->
        <div v-if="pastasUsuarioFiltradas.length === 0 && !loading" class="empty-state-inline">
          <img src="/images/empty_pastas.png" alt="Empty" class="empty-image" />
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando pastas...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Pastas from './pastas.vue'
import { getQuantidadeDocumentosSistema, getPastasComContagem } from '../../services/pastaService.js'

const props = defineProps({
  searchTerm: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['pasta-selecionada', 'editar-pasta'])

// Estados
const loading = ref(true)
const quantidadeDocumentosSistema = ref(0)
const pastasUsuario = ref([])
const pastaAtivaSelecionada = ref('modelos-jusprod') // Por padrão, Modelos Jusprod está ativo

// Buscar dados
const carregarDados = async () => {
  try {
    loading.value = true
    
    // Buscar quantidade de documentos do sistema (paralelo)
    const [qtdSistema, pastasData] = await Promise.all([
      getQuantidadeDocumentosSistema(),
      getPastasComContagem()
    ])
    
    quantidadeDocumentosSistema.value = qtdSistema
    pastasUsuario.value = pastasData
    
  } catch (error) {
    console.error('Erro ao carregar dados das pastas:', error)
  } finally {
    loading.value = false
  }
}

// Filtrar pastas baseado no termo de busca
const pastasUsuarioFiltradas = ref([])

const filtrarPastas = () => {
  if (!props.searchTerm.trim()) {
    pastasUsuarioFiltradas.value = pastasUsuario.value
  } else {
    const termo = props.searchTerm.toLowerCase()
    pastasUsuarioFiltradas.value = pastasUsuario.value.filter(pasta =>
      pasta.titulo.toLowerCase().includes(termo)
    )
  }
}

// Observar mudanças no termo de busca
watch(() => props.searchTerm, filtrarPastas, { immediate: true })
watch(pastasUsuario, filtrarPastas)

const handlePastaClicada = (pastaInfo) => {
  console.log('Pasta clicada:', pastaInfo)
  
  // Definir pasta ativa
  if (pastaInfo.isPastaSistema) {
    pastaAtivaSelecionada.value = 'modelos-jusprod'
  } else {
    pastaAtivaSelecionada.value = pastaInfo.pastaId
  }
  
  // Emitir evento para componente pai
  emit('pasta-selecionada', {
    tipo: pastaInfo.isPastaSistema ? 'sistema' : 'usuario',
    id: pastaInfo.isPastaSistema ? 'modelos-jusprod' : pastaInfo.pastaId,
    titulo: pastaInfo.titulo,
    ativa: pastaInfo.ativa
  })
}

// Recarregar dados quando componente é montado
onMounted(() => {
  carregarDados()
})

const handleEditarPasta = (pastaInfo) => {
  console.log('Editar pasta:', pastaInfo)
  emit('editar-pasta', pastaInfo)
}

// Expor função para recarregar (para quando nova pasta for criada)
defineExpose({
  recarregar: carregarDados
})
</script>

<style scoped>
.lista-pastas-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0;
}

.pastas-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 1rem;
}

.pastas-grid {
  display: flex;
  gap: 28px;
  min-width: fit-content;
  padding: 0 2rem;
  align-items: flex-start;
}

/* Cada pasta terá largura fixa de 133px */
.pastas-grid > .pasta-card {
  flex-shrink: 0;
  width: 133px;
}

/* Empty state inline na mesma linha - SÓ A IMAGEM */
.empty-state-inline {
  margin-left: 20px;
  margin-top: 20px;
}

.empty-image {
  height: auto;
  max-width: 550px;
  object-fit: contain;
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

/* Responsivo */
@media (max-width: 768px) {
  .lista-pastas-container {
    padding: 1rem;
  }
  
  .pastas-grid {
    gap: 20px;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .empty-state-inline {
    flex-direction: column;
    text-align: center;
    min-width: auto;
    width: 100%;
    margin-left: 0;
    margin-top: 20px;
  }
  
  .empty-image-small {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .lista-pastas-container {
    padding: 1rem 0.5rem;
  }
  
  .empty-title-inline {
    font-size: 0.9rem;
  }
  
  .empty-description-inline {
    font-size: 0.8rem;
  }
}

/* Scrollbar styling para containers horizontais */
.pastas-scroll-container::-webkit-scrollbar {
  height: 8px;
}

.pastas-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.pastas-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.pastas-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 