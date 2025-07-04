<template>
  <div class="lista-pastas-container">
    <div class="pastas-scroll-container">
      <div class="pastas-grid">
        <!-- Pasta fixa: Modelos de Relatórios -->
        <Pastas
          key="modelos-relatorios"
          titulo="Modelos padrão"
          :quantidade-arquivos="quantidadeRelatoriosSistema"
          :ativa-inicial="pastaAtivaSelecionada === 'modelos-relatorios'"
          @pasta-clicada="handlePastaClicada"
          :is-pasta-sistema="true"
        />
        
        <!-- Pastas dinâmicas do usuário -->
        <Pastas
          v-for="pasta in pastasUsuarioFiltradas"
          :key="pasta.id"
          :titulo="pasta.titulo"
          :quantidade-arquivos="pasta.quantidade_relatorios"
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
import Pastas from '../Documentos/pastas.vue'

const props = defineProps({
  searchTerm: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['pasta-selecionada', 'editar-pasta'])

// Estados
const loading = ref(true)
const quantidadeRelatoriosSistema = ref(0)
const pastasUsuario = ref([])
const pastaAtivaSelecionada = ref('modelos-relatorios') // Por padrão, Modelos padrão está ativo

// Funções para buscar dados
const getQuantidadeRelatoriosSistema = async () => {
  try {
    const { supabase } = await import('../../lib/supabase.js')
    const { count, error } = await supabase
      .from('relatorio_sistema')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('Erro ao contar relatórios do sistema:', error)
      return 0
    }
    
    return count || 0
  } catch (error) {
    console.error('Erro ao buscar quantidade de relatórios do sistema:', error)
    return 0
  }
}

const getPastasRelatoriosComContagem = async () => {
  try {
    const { supabase } = await import('../../lib/supabase.js')
    const { data, error } = await supabase
      .from('view_pastas_relatorios_com_contagem')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar pastas de relatórios:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Erro ao buscar pastas de relatórios:', error)
    return []
  }
}

// Buscar dados
const carregarDados = async () => {
  try {
    loading.value = true
    
    // Buscar quantidade de relatórios do sistema e pastas (paralelo)
    const [qtdSistema, pastasData] = await Promise.all([
      getQuantidadeRelatoriosSistema(),
      getPastasRelatoriosComContagem()
    ])
    
    quantidadeRelatoriosSistema.value = qtdSistema
    pastasUsuario.value = pastasData
    
    console.log('📊 Dados carregados - Relatórios sistema:', qtdSistema)
    console.log('📁 Pastas de relatórios:', pastasData)
    
  } catch (error) {
    console.error('Erro ao carregar dados das pastas de relatórios:', error)
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
  console.log('Pasta de relatório clicada:', pastaInfo)
  
  // Definir pasta ativa
  if (pastaInfo.isPastaSistema) {
    pastaAtivaSelecionada.value = 'modelos-relatorios'
  } else {
    pastaAtivaSelecionada.value = pastaInfo.pastaId
  }
  
  // Emitir evento para componente pai
  emit('pasta-selecionada', {
    tipo: pastaInfo.isPastaSistema ? 'sistema' : 'usuario',
    id: pastaInfo.isPastaSistema ? 'modelos-relatorios' : pastaInfo.pastaId,
    titulo: pastaInfo.titulo,
    ativa: pastaInfo.ativa
  })
}

// Recarregar dados quando componente é montado
onMounted(() => {
  carregarDados()
})

const handleEditarPasta = (pastaInfo) => {
  console.log('Editar pasta de relatório:', pastaInfo)
  emit('editar-pasta', pastaInfo)
}

// Expor função para recarregar (para quando nova pasta for criada)
defineExpose({
  recarregar: carregarDados,
  selecionarPasta: (pastaId, isPastaSistema = false) => {
    if (isPastaSistema) {
      pastaAtivaSelecionada.value = 'modelos-relatorios'
      // Emitir evento para pasta sistema
      emit('pasta-selecionada', {
        tipo: 'sistema',
        id: 'modelos-relatorios',
        titulo: 'Modelos padrão',
        ativa: true
      })
    } else {
      pastaAtivaSelecionada.value = pastaId
      // Buscar dados da pasta para emitir evento correto
      const pasta = pastasUsuario.value.find(p => p.id === pastaId)
      if (pasta) {
        emit('pasta-selecionada', {
          tipo: 'usuario',
          id: pasta.id,
          titulo: pasta.titulo,
          ativa: true
        })
      }
    }
  }
})
</script>

<style scoped>
.lista-pastas-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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

/* Garante que cada pasta não seja cortada */
.pastas-grid > * {
  flex-shrink: 0;
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
    padding: 0;
    width: 100%;
    overflow-x: auto;
  }
  
  .pastas-scroll-container {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
  }
  
  .pastas-scroll-container::-webkit-scrollbar {
    display: none; /* WebKit */
  }
  
  .pastas-grid {
    gap: 2px;
    padding: 0 1rem;
    min-width: max-content;
  }
  
  .pastas-grid > * {
    flex-shrink: 0;
  }
  
  .empty-state-inline {
    margin-left: 20px;
    margin-top: 20px;
    flex-shrink: 0;
  }
  
  .empty-image {
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .pastas-grid {
    gap: 1px;
    padding: 0 0.5rem;
    min-width: max-content;
  }
  
  .pastas-grid > * {
    flex-shrink: 0;
  }
  
  .empty-image {
    max-width: 250px;
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