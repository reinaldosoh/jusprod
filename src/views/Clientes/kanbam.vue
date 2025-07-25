<template>
  <div class="kanban-wrapper">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando clientes...</p>
    </div>

    <!-- Erro -->
    <div v-else-if="error" class="error-container">
      <p>Erro ao carregar clientes: {{ error }}</p>
      <button @click="carregarClientes" class="retry-btn">Tentar novamente</button>
    </div>

    <!-- Kanban Board -->
    <div v-else class="kanban-board">
      <!-- Coluna: Novos clientes -->
      <div class="kanban-column column-novo">
        <div class="kanban-header header-novo">
          <div class="header-title">
            <span class="circle circle-novo"></span>
            <span class="title">Novos clientes</span>
          </div>
          <span class="counter">{{ clientesNovo.length }} clientes</span>
        </div>
        <div 
          class="kanban-cards"
          @drop="handleDrop($event, 'cliente_novo')"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <TransitionGroup name="fade" tag="div" class="transition-container">
            <ClienteCard
              v-for="cliente in clientesNovo"
              :key="`novo-${cliente.id}-${cliente.favorito}`"
              :cliente="cliente"
              :draggable="true"
              @dragstart="handleDragStart($event, cliente)"
              @editar="handleEditarCliente"
              @excluir="handleExcluirCliente"
              @toggle-favorito="handleToggleFavorito"
              @click="navegarParaDetalhesCliente(cliente)"
            />
          </TransitionGroup>
        </div>
      </div>

      <!-- Coluna: Em andamento -->
      <div class="kanban-column column-andamento">
        <div class="kanban-header header-andamento">
          <div class="header-title">
            <span class="circle circle-andamento"></span>
            <span class="title">Em andamento</span>
          </div>
          <span class="counter">{{ clientesAndamento.length }} clientes</span>
        </div>
        <div 
          class="kanban-cards"
          @drop="handleDrop($event, 'cliente_andamento')"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <TransitionGroup name="fade" tag="div" class="transition-container">
            <ClienteCard
              v-for="cliente in clientesAndamento"
              :key="`andamento-${cliente.id}-${cliente.favorito}`"
              :cliente="cliente"
              :draggable="true"
              @dragstart="handleDragStart($event, cliente)"
              @editar="handleEditarCliente"
              @excluir="handleExcluirCliente"
              @toggle-favorito="handleToggleFavorito"
              @click="navegarParaDetalhesCliente(cliente)"
            />
          </TransitionGroup>
        </div>
      </div>

      <!-- Coluna: Finalizados -->
      <div class="kanban-column column-finalizado">
        <div class="kanban-header header-finalizado">
          <div class="header-title">
            <span class="circle circle-finalizado"></span>
            <span class="title">Finalizados</span>
          </div>
          <span class="counter">{{ clientesFinalizado.length }} clientes</span>
        </div>
        <div 
          class="kanban-cards"
          @drop="handleDrop($event, 'cliente_finalizado')"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <TransitionGroup name="fade" tag="div" class="transition-container">
            <ClienteCard
              v-for="cliente in clientesFinalizado"
              :key="`finalizado-${cliente.id}-${cliente.favorito}`"
              :cliente="cliente"
              :draggable="true"
              @dragstart="handleDragStart($event, cliente)"
              @editar="handleEditarCliente"
              @excluir="handleExcluirCliente"
              @toggle-favorito="handleToggleFavorito"
              @click="navegarParaDetalhesCliente(cliente)"
            />
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClientes } from '../../composables/useClientes.js'
import ClienteCard from '../../components/UI/ClienteCard.vue'

// Props para receber o filtro de favoritos do componente pai
const props = defineProps({
  filtroFavoritos: {
    type: Boolean,
    default: false
  },
  filtroAtivo: {
    type: Object,
    default: () => ({ tipo: 'nome', valor: '' })
  }
});

const router = useRouter()

const {
  clientes,
  clientesNovo: clientesNovoOriginal,
  clientesAndamento: clientesAndamentoOriginal,
  clientesFinalizado: clientesFinalizadoOriginal,
  carregarClientes,
  atualizarStatusCliente,
  toggleFavorito,
  excluirCliente,
  loading,
  error
} = useClientes()

// Define o que será exposto para o componente pai
defineExpose({
  // Expor a função já existente para permitir que seja chamada de fora
  carregarClientes
})

// Função para navegar para a página de detalhes do cliente
const navegarParaDetalhesCliente = (cliente) => {
  if (cliente && cliente.id) {
    console.log('Navegando para detalhes do cliente:', cliente.id)
    router.push(`/clientes/${cliente.id}`)
  }
}

// Estado para drag and drop
let draggedCliente = null

// Função para filtrar clientes com base no filtro ativo
const filtrarClientes = (clientes) => {
  // Se não houver filtro ativo ou for apenas filtro de favoritos
  if (!props.filtroAtivo || !props.filtroAtivo.tipo) {
    return props.filtroFavoritos ? clientes.filter(cliente => cliente.favorito) : clientes;
  }
  
  // Primeiro filtra por favoritos se necessário
  let resultado = props.filtroFavoritos ? clientes.filter(cliente => cliente.favorito) : clientes;
  
  // Depois aplica o filtro específico
  switch (props.filtroAtivo.tipo) {
    case 'nome':
      // Filtrar por nome se houver valor de busca
      if (props.filtroAtivo.valor) {
        const valor = props.filtroAtivo.valor.toLowerCase();
        return resultado.filter(cliente => cliente.nome.toLowerCase().includes(valor));
      }
      return resultado;
      
    case 'cpf':
    case 'cnpj':
      // Filtrar por documento (CPF ou CNPJ)
      if (props.filtroAtivo.valor) {
        const valor = props.filtroAtivo.valor.replace(/\D/g, ''); // Remove formatação
        return resultado.filter(cliente => {
          const documentoLimpo = cliente.documento.replace(/\D/g, '');
          return documentoLimpo.includes(valor);
        });
      }
      return resultado;
      
    case 'novos clientes':
      // Filtrar apenas clientes novos
      resultado = resultado.filter(cliente => cliente.cliente_novo === true);
      // Se houver valor de busca, filtrar por nome também
      if (props.filtroAtivo.valor) {
        const valor = props.filtroAtivo.valor.toLowerCase();
        return resultado.filter(cliente => cliente.nome.toLowerCase().includes(valor));
      }
      return resultado;
      
    case 'em andamento':
      // Filtrar apenas clientes em andamento
      resultado = resultado.filter(cliente => cliente.cliente_andamento === true);
      // Se houver valor de busca, filtrar por nome também
      if (props.filtroAtivo.valor) {
        const valor = props.filtroAtivo.valor.toLowerCase();
        return resultado.filter(cliente => cliente.nome.toLowerCase().includes(valor));
      }
      return resultado;
      
    case 'finalizado':
      // Filtrar apenas clientes finalizados
      resultado = resultado.filter(cliente => cliente.cliente_finalizado === true);
      // Se houver valor de busca, filtrar por nome também
      if (props.filtroAtivo.valor) {
        const valor = props.filtroAtivo.valor.toLowerCase();
        return resultado.filter(cliente => cliente.nome.toLowerCase().includes(valor));
      }
      return resultado;
      
    default:
      return resultado;
  }
};

// Computed properties para filtrar os clientes por status
const clientesNovo = computed(() => {
  return filtrarClientes(clientesNovoOriginal.value);
});

const clientesAndamento = computed(() => {
  return filtrarClientes(clientesAndamentoOriginal.value);
});

const clientesFinalizado = computed(() => {
  return filtrarClientes(clientesFinalizadoOriginal.value);
});

// Observar mudanças no filtro ativo para recarregar os clientes se necessário
watch(() => props.filtroAtivo, (novoFiltro) => {
  console.log('Filtro alterado no kanban:', novoFiltro);
}, { deep: true });

// Carregar clientes ao montar o componente
onMounted(() => {
  carregarClientes()
})

// Funções de Drag and Drop
const handleDragStart = (event, cliente) => {
  draggedCliente = cliente
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target.outerHTML)
  
  // Adicionar classe visual de drag
  setTimeout(() => {
    event.target.style.opacity = '0.5'
  }, 0)
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

const handleDragEnter = (event) => {
  event.preventDefault()
  event.target.closest('.kanban-cards').classList.add('drag-over')
}

const handleDragLeave = (event) => {
  const rect = event.target.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  // Só remove a classe se realmente saiu da área
  if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
    event.target.closest('.kanban-cards').classList.remove('drag-over')
  }
}

const handleDrop = async (event, novoStatus) => {
  event.preventDefault()
  event.target.closest('.kanban-cards').classList.remove('drag-over')
  
  if (!draggedCliente) return
  
  // Verificar se o cliente já está na coluna correta
  const statusAtual = draggedCliente.cliente_novo ? 'cliente_novo' : 
                     draggedCliente.cliente_andamento ? 'cliente_andamento' : 
                     'cliente_finalizado'
  
  if (statusAtual === novoStatus) {
    resetDragState()
    return
  }
  
  // Aplicar a mudança localmente primeiro para uma transição suave
  // Criamos uma cópia do cliente para modificar
  const clienteModificado = { ...draggedCliente }
  clienteModificado.cliente_novo = false
  clienteModificado.cliente_andamento = false
  clienteModificado.cliente_finalizado = false
  clienteModificado[novoStatus] = true
  
  // Atualizar status no banco
  const result = await atualizarStatusCliente(draggedCliente.id, novoStatus)
  
  if (result.success) {
    console.log(`Cliente movido para ${novoStatus}`)
  } else {
    console.error('Erro ao mover cliente:', result.error)
    alert('Erro ao mover cliente. Tente novamente.')
  }
  
  resetDragState()
}

const resetDragState = () => {
  draggedCliente = null
  // Remover estilos de drag de todos os elementos
  document.querySelectorAll('[draggable="true"]').forEach(el => {
    el.style.opacity = '1'
  })
  document.querySelectorAll('.kanban-cards').forEach(el => {
    el.classList.remove('drag-over')
  })
}

// Handlers
const handleEditarCliente = (cliente) => {
  console.log('Editar cliente:', cliente)
  // TODO: Implementar modal de edição ou navegar para página de edição
}

const handleExcluirCliente = async (cliente) => {
  if (confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`)) {
    const result = await excluirCliente(cliente.id)
    if (result.success) {
      console.log('Cliente excluído com sucesso')
    } else {
      alert('Erro ao excluir cliente: ' + result.error)
    }
  }
}

const handleToggleFavorito = async (cliente) => {
  try {
    const result = await toggleFavorito(cliente.id, cliente.favorito)
    if (result.success) {
      console.log(`Cliente ${cliente.favorito ? 'removido dos' : 'adicionado aos'} favoritos`)
    } else {
      console.error('Erro ao alterar favorito:', result.error)
    }
  } catch (error) {
    console.error('Erro ao alterar favorito:', error)
  }
}
</script>

<style scoped>
.kanban-wrapper {
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
  padding: 24px;
  overflow-x: auto;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p,
.error-container p {
  margin: 0;
  color: #475467;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}

.retry-btn {
  padding: 8px 16px;
  background: #0468FA;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.retry-btn:hover {
  background: #0254E1;
}

.kanban-board {
  display: flex;
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;
  justify-content: center;
  height: calc(100vh - 80px);
}

.kanban-column {
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(16, 30, 54, 0.08);
  padding: 16px 12px 16px 12px;
  width: 380px;
  min-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: calc(100vh - 100px);
  max-height: calc(100vh - 100px);
}

.kanban-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2.5px solid;
  display: inline-block;
}

.circle-novo { border-color: #22c55e; }
.circle-andamento { border-color: #f59e42; }
.circle-finalizado { border-color: #374151; }

.title { 
  font-size: 20px; 
  font-weight: 600; 
}

.counter {
  background: #f3f4f6;
  color: #6b7280;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  padding: 4px 16px;
  min-width: 80px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(16, 30, 54, 0.06);
}

.kanban-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding-bottom: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 150px);
  transition: background-color 0.2s ease;
  border-radius: 8px;
  min-height: 200px;
}

/* Adicionar transições para os componentes filhos */
.kanban-cards > * {
  transition: all 0.3s ease;
}

/* Transições para o Vue.js */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Evitar que os itens pulem durante a transição */
.fade-leave-active {
  position: absolute;
}

/* Estilo para o container de transição */
.transition-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

/* Estilos para drag and drop */
.kanban-cards.drag-over {
  background-color: rgba(59, 130, 246, 0.1);
  border: 2px dashed #3b82f6;
}

.cliente-card[draggable="true"] {
  cursor: move;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.cliente-card[draggable="true"]:hover {
  transform: translateY(-2px);
}

.cliente-card.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

/* Responsividade */

/* Tablets grandes e desktop pequeno */
@media (max-width: 1200px) {
  .kanban-board {
    gap: 20px;
    max-width: 100%;
    padding: 0 16px;
  }
  
  .kanban-column {
    width: 350px;
    min-width: 320px;
  }
}

/* Tablets */
@media (max-width: 900px) {
  .kanban-wrapper {
    padding: 16px;
  }
  
  .kanban-board {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 16px;
    padding: 0 16px 16px 16px;
    justify-content: flex-start;
    height: calc(100vh - 60px);
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }
  
  .kanban-column {
    width: 320px;
    min-width: 300px;
    flex-shrink: 0;
    height: calc(100vh - 80px);
    scroll-snap-align: start;
  }
  
  .header-title .title {
    font-size: 18px;
  }
  
  .counter {
    font-size: 14px;
    padding: 4px 12px;
  }
}

/* Mobile grande */
@media (max-width: 768px) {
  .kanban-wrapper {
    padding: 12px;
  }
  
  .kanban-board {
    padding: 0 12px 12px 12px;
    gap: 12px;
    height: calc(100vh - 50px);
  }
  
  .kanban-column {
    width: 280px;
    min-width: 260px;
    padding: 12px 8px 12px 8px;
    border-radius: 10px;
    height: calc(100vh - 70px);
  }
  
  .kanban-header {
    margin-bottom: 12px;
    padding: 0 2px;
  }
  
  .header-title .title {
    font-size: 16px;
  }
  
  .counter {
    font-size: 13px;
    padding: 3px 10px;
    min-width: 70px;
  }
  
  .kanban-cards {
    gap: 12px;
    max-height: calc(100vh - 120px);
  }
  
  .circle {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }
}

/* Mobile pequeno */
@media (max-width: 480px) {
  .kanban-wrapper {
    padding: 8px;
  }
  
  .kanban-board {
    padding: 0 8px 8px 8px;
    gap: 8px;
    height: calc(100vh - 40px);
  }
  
  .kanban-column {
    width: 260px;
    min-width: 240px;
    padding: 10px 6px 10px 6px;
    border-radius: 8px;
    height: calc(100vh - 100px);
    box-shadow: 0 1px 4px rgba(16, 30, 54, 0.08);
  }
  
  .kanban-header {
    margin-bottom: 10px;
    padding: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .header-title {
    gap: 6px;
  }
  
  .header-title .title {
    font-size: 15px;
    font-weight: 600;
  }
  
  .counter {
    font-size: 12px;
    padding: 2px 8px;
    min-width: 60px;
    align-self: flex-end;
  }
  
  .kanban-cards {
    gap: 10px;
    max-height: calc(100vh - 140px);
    padding-bottom: 6px;
  }
  
  .circle {
    width: 14px;
    height: 14px;
    border-width: 2px;
  }
  
  /* Desabilitar drag em mobile muito pequeno */
  .cliente-card[draggable="true"] {
    cursor: default;
  }
  
  .cliente-card[draggable="true"]:hover {
    transform: none;
  }
}

/* Mobile muito pequeno */
@media (max-width: 360px) {
  .kanban-board {
    padding: 0 4px 4px 4px;
  }
  
  .kanban-column {
    width: 240px;
    min-width: 220px;
    padding: 8px 4px 8px 4px;
  }
  
  .header-title .title {
    font-size: 14px;
  }
  
  .counter {
    font-size: 11px;
    padding: 2px 6px;
    min-width: 50px;
  }
  
  .kanban-cards {
    gap: 8px;
  }
}

/* Estilo para indicar scroll horizontal em mobile */
@media (max-width: 900px) {
  .kanban-board::after {
    content: '';
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: rgba(4, 104, 250, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    pointer-events: none;
  }
  
  .kanban-board::before {
    content: '⟶';
    position: fixed;
    bottom: 30px;
    right: 30px;
    color: #0468FA;
    font-size: 20px;
    font-weight: bold;
    z-index: 101;
    pointer-events: none;
  }
}

/* Melhorar scrollbar em webkit */
@media (max-width: 900px) {
  .kanban-board::-webkit-scrollbar {
    height: 4px;
  }
  
  .kanban-board::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }
  
  .kanban-board::-webkit-scrollbar-thumb {
    background: rgba(4, 104, 250, 0.5);
    border-radius: 2px;
  }
  
  .kanban-board::-webkit-scrollbar-thumb:hover {
    background: rgba(4, 104, 250, 0.7);
  }
}
</style> 