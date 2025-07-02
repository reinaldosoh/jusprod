<template>
  <div class="lista-clientes">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando clientes...</p>
    </div>

    <!-- Erro -->
    <div v-else-if="error" class="error-container">
      <p>Erro ao carregar clientes: {{ error }}</p>
      <button @click="recarregarClientes" class="retry-btn">Tentar novamente</button>
    </div>

    <!-- Lista de Clientes -->
    <div v-else>
      <!-- Cabeçalho da tabela (visível apenas em desktop) -->
      <div class="lista-header desktop-only">
        <div class="header-item ordenacao" @click="ordenarPorNome">
          <span class="ordenacao-label">
            <span :class="{ 'letra-ativa': ordemAscendente }">A</span>-<span :class="{ 'letra-ativa': !ordemAscendente }">Z</span>
          </span>
          <div class="seta-container">
            <svg v-if="ordemAscendente" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3.33334V12.6667" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.33337 8.00001L8.00004 12.6667L12.6667 8.00001" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12.6667V3.33334" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.33337 8.00001L8.00004 3.33334L12.6667 8.00001" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="header-item cliente">Cliente</div>
        <div class="header-item email">Email</div>
        <div class="header-item documento">Documento</div>
        <div class="header-item processo">Processo</div>
        <div class="header-item status">Status</div>
      </div>
      
      <!-- Botão de ordenação (visível apenas em mobile) -->
      <div class="mobile-sort-button mobile-only" @click="ordenarPorNome">
        <span class="ordenacao-label">
          <span :class="{ 'letra-ativa': ordemAscendente }">A</span>-<span :class="{ 'letra-ativa': !ordemAscendente }">Z</span>
        </span>
        <div class="seta-container">
          <svg v-if="ordemAscendente" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3.33334V12.6667" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.33337 8.00001L8.00004 12.6667L12.6667 8.00001" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12.6667V3.33334" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.33337 8.00001L8.00004 3.33334L12.6667 8.00001" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      
      <!-- Lista de clientes em formato de tabela (desktop) -->
      <div class="clientes-container desktop-only">
        <div 
          v-for="(cliente, index) in clientesFiltrados" 
          :key="cliente.id" 
          class="cliente-item"
          :class="{ 'cliente-item-hover': true, 'dropdown-open': dropdownOpenMap[cliente.id] }"
          @click="navegarParaDetalhesCliente(cliente)"
        >
          <div class="ordenacao-col"></div>
          <div class="cliente-col">
            <div class="cliente-info">
              <div class="cliente-avatar">
                <div class="avatar" :class="getStatusClass(cliente)">
                  {{ getInitials(cliente.nome) }}
                  <button 
                    type="button"
                    class="estrela" 
                    @click.stop="toggleFavoritoCliente(cliente)"
                    :class="{ 'favorito': cliente.favorito }"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.99992 1.33334L10.0599 5.50668L14.6666 6.18001L11.3333 9.42668L12.1199 14.0133L7.99992 11.8467L3.87992 14.0133L4.66659 9.42668L1.33325 6.18001L5.93992 5.50668L7.99992 1.33334Z" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :fill="cliente.favorito ? '#3b82f6' : '#ffffff'"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="cliente-nome">{{ cliente.nome }}</div>
            </div>
          </div>
          <div class="email-col" :title="cliente.email">
            <span class="email-text truncate-text" :title="cliente.email">{{ cliente.email }}</span>
          </div>
          <div class="documento-col">
            <span class="documento-text truncate-text" :title="cliente.documento">{{ cliente.documento }}</span>
          </div>
          <div class="processo-col">
            <div class="processo-dropdown">
              <Dropdown 
                :options="getProcessoOptions(cliente)" 
                placeholderText="Selecione um processo"
                @dropdown-open.stop="handleDropdownOpen(cliente.id)"
                @dropdown-close.stop="handleDropdownClose(cliente.id)"
              />
            </div>
          </div>
          <div class="status-col">
            <div :class="['status-badge', `status-${cliente.status.toLowerCase()}`]">{{ getStatusText(cliente.status) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Layout para mobile (cards) -->
      <div class="mobile-cards mobile-only">
        <div 
          v-for="cliente in clientesFiltrados" 
          :key="cliente.id" 
          class="mobile-card"
        >
          <div class="mobile-card-header">
            <div class="cliente-avatar">
              <div class="avatar" :class="getStatusClass(cliente)">
                {{ getInitials(cliente.nome) }}
                <button 
                  type="button"
                  class="estrela" 
                  @click.stop="toggleFavoritoCliente(cliente)"
                  :class="{ 'favorito': cliente.favorito }"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.99992 1.33334L10.0599 5.50668L14.6666 6.18001L11.3333 9.42668L12.1199 14.0133L7.99992 11.8467L3.87992 14.0133L4.66659 9.42668L1.33325 6.18001L5.93992 5.50668L7.99992 1.33334Z" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :fill="cliente.favorito ? '#3b82f6' : '#ffffff'"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="cliente-nome">{{ cliente.nome }}</div>
            <div :class="['status-badge', `status-${cliente.status.toLowerCase()}`]">{{ getStatusText(cliente.status) }}</div>
          </div>
          <div class="mobile-card-content">
            <div class="mobile-card-row">
              <div class="mobile-card-label">Email:</div>
              <div class="mobile-card-value">{{ cliente.email }}</div>
            </div>
            <div class="mobile-card-row">
              <div class="mobile-card-label">Documento:</div>
              <div class="mobile-card-value">{{ cliente.documento }}</div>
            </div>
            <div class="mobile-card-row" :class="{ 'dropdown-open': dropdownOpenMap[cliente.id] }">
              <div class="mobile-card-label">Processo:</div>
              <div class="mobile-card-value processo-dropdown-mobile">
                <Dropdown 
                  :options="getProcessoOptions(cliente)" 
                  placeholderText="Selecione um processo"
                  @dropdown-open.stop="handleDropdownOpen(cliente.id)"
                  @dropdown-close.stop="handleDropdownClose(cliente.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useClientes } from '../../composables/useClientes.js'
import { useRouter } from 'vue-router'
import Dropdown from '../UI/Dropdown.vue'

const router = useRouter()

// Props
const props = defineProps({
  filtroFavoritos: {
    type: Boolean,
    default: false
  },
  filtroAtivo: {
    type: Object,
    default: () => ({ tipo: 'nome', valor: '' })
  }
})

// Composable
const { 
  clientes,
  loading,
  error,
  carregarClientes,
  toggleFavorito
} = useClientes()

// Carregar clientes ao montar o componente
carregarClientes();

// Observar mudanças no filtro ativo
watch(() => props.filtroAtivo, (novoFiltro) => {
  console.log('Filtro alterado na lista:', novoFiltro);
}, { deep: true });

const searchTerm = ref('');
const ordenacao = ref('asc');
const ordemAscendente = ref(true)
const dropdownOpenMap = reactive({});

// Computed property para filtrar e ordenar os clientes
const clientesSorted = computed(() => {
  if (!clientes.value) return [];
  
  // Primeiro filtramos por favoritos se necessário
  let clientesFiltrados = clientes.value;
  if (props.filtroFavoritos) {
    clientesFiltrados = clientes.value.filter(cliente => cliente.favorito);
  }
  
  // Depois ordenamos
  return [...clientesFiltrados].sort((a, b) => {
    if (ordenacao.value === 'asc') {
      return a.nome.localeCompare(b.nome);
    } else {
      return b.nome.localeCompare(a.nome);
    }
  });
});

// Computed property para filtrar e ordenar os clientes
const clientesFiltrados = computed(() => {
  if (!clientes.value) return []
  
  // Primeiro filtramos por favoritos se necessário
  let resultado = [...clientes.value]
  
  // Aplicar filtro de favoritos se ativo
  if (props.filtroFavoritos) {
    resultado = resultado.filter(cliente => cliente.favorito)
  }
  
  // Aplicar filtro com base no tipo selecionado
  if (props.filtroAtivo && props.filtroAtivo.tipo) {
    switch (props.filtroAtivo.tipo) {
      case 'nome':
        // Filtrar por nome se houver valor de busca
        if (props.filtroAtivo.valor) {
          const valor = props.filtroAtivo.valor.toLowerCase()
          resultado = resultado.filter(cliente => cliente.nome.toLowerCase().includes(valor))
        }
        break
        
      case 'cpf':
      case 'cnpj':
        // Filtrar por documento (CPF ou CNPJ)
        if (props.filtroAtivo.valor) {
          const valor = props.filtroAtivo.valor.replace(/\D/g, '') // Remove formatação
          resultado = resultado.filter(cliente => {
            const documentoLimpo = cliente.documento.replace(/\D/g, '')
            return documentoLimpo.includes(valor)
          })
        }
        break
        
      case 'novos clientes':
        // Filtrar apenas clientes novos
        resultado = resultado.filter(cliente => cliente.cliente_novo === true)
        // Se houver valor de busca, filtrar por nome também
        if (props.filtroAtivo.valor) {
          const valor = props.filtroAtivo.valor.toLowerCase()
          resultado = resultado.filter(cliente => cliente.nome.toLowerCase().includes(valor))
        }
        break
        
      case 'em andamento':
        // Filtrar apenas clientes em andamento
        resultado = resultado.filter(cliente => cliente.cliente_andamento === true)
        // Se houver valor de busca, filtrar por nome também
        if (props.filtroAtivo.valor) {
          const valor = props.filtroAtivo.valor.toLowerCase()
          resultado = resultado.filter(cliente => cliente.nome.toLowerCase().includes(valor))
        }
        break
        
      case 'finalizado':
        // Filtrar apenas clientes finalizados
        resultado = resultado.filter(cliente => cliente.cliente_finalizado === true)
        // Se houver valor de busca, filtrar por nome também
        if (props.filtroAtivo.valor) {
          const valor = props.filtroAtivo.valor.toLowerCase()
          resultado = resultado.filter(cliente => cliente.nome.toLowerCase().includes(valor))
        }
        break
    }
  }
  
  // Depois ordenamos
  if (ordemAscendente.value) {
    return resultado.sort((a, b) => a.nome.localeCompare(b.nome))
  } else {
    return resultado.sort((a, b) => b.nome.localeCompare(a.nome))
  }
})

// Métodos
const getInitials = (name) => {
  if (!name) return '??'
  const names = name.split(' ')
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase()
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

// Função para alternar favorito
const toggleFavoritoCliente = (cliente) => {
  console.log('Alternando favorito para cliente:', cliente.id, 'Estado atual:', cliente.favorito);
  toggleFavorito(cliente.id, cliente.favorito);
  // Forçar atualização local imediata para feedback visual
  cliente.favorito = !cliente.favorito;
}

// Função para obter texto do status
const getStatusText = (status) => {
  if (status === 'novo') return 'Novo cliente'
  if (status === 'andamento') return 'Em andamento'
  if (status === 'finalizado') return 'Finalizado'
  return status
}

// Função para obter a classe de cor baseada no status do cliente
const getStatusClass = (cliente) => {
  if (cliente.cliente_novo) return 'status-novo'
  if (cliente.cliente_andamento) return 'status-andamento'
  if (cliente.cliente_finalizado) return 'status-finalizado'
  return ''
}

// Função para ordenar por nome
const ordenarPorNome = () => {
  ordemAscendente.value = !ordemAscendente.value
}

// Observar mudanças no filtro de favoritos
watch(() => props.filtroFavoritos, (newValue) => {
  console.log('Filtro de favoritos alterado para:', newValue);
}, { immediate: true });

// Função para recarregar clientes
const recarregarClientes = () => {
  console.log('Recarregando lista de clientes...')
  carregarClientes()
}

// Expor o método para o componente pai
defineExpose({
  recarregarClientes
})

// Função para navegar para os detalhes do cliente
const navegarParaDetalhesCliente = (cliente) => {
  if (cliente && cliente.id) {
    console.log('Navegando para detalhes do cliente:', cliente.id)
    router.push(`/clientes/${cliente.id}`)
  }
}

// Função para formatar opções de processos para o dropdown
const getProcessoOptions = (cliente) => {
  if (cliente.processos_vinculados && Array.isArray(cliente.processos_vinculados)) {
    return cliente.processos_vinculados.map((processo, index) => ({
      id: index + 1,
      label: processo,
      active: index === 0
    }))
  } else if (cliente.processos_vinculados && typeof cliente.processos_vinculados === 'string') {
    // Se for uma string, dividimos por vírgula
    const processos = cliente.processos_vinculados.split(',').map((processo, index) => ({
      id: index + 1,
      label: processo.trim(),
      active: index === 0
    }))
    return processos.length > 0 ? processos : [{ id: 0, label: 'Sem processo' }]
  }
  return [{ id: 0, label: 'Sem processo' }]
}

// Funções para manipular os eventos do dropdown
const handleDropdownOpen = (clienteId) => {
  dropdownOpenMap[clienteId] = true;
  event && event.stopPropagation && event.stopPropagation();
}

const handleDropdownClose = (clienteId) => {
  dropdownOpenMap[clienteId] = false;
  event && event.stopPropagation && event.stopPropagation();
}
</script>

<style scoped>
.lista-clientes {
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.lista-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #F9FAFB;
  border-bottom: 1px solid #EAECF0;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: nowrap;
}

@media (max-width: 1024px) {
  .lista-header {
    padding: 0.5rem;
  }
}

.header-item {
  font-size: 0.75rem;
  font-weight: 500;
  color: #667085;
  display: flex;
  align-items: center;
}

.ordenacao {
  width: 40px;
  display: flex;
  align-items: center;
}

.ordenacao-label {
  margin-right: 0.25rem;
  color: #667085;
}

.letra-ativa {
  color: #0468FA;
  font-weight: 600;
}

.cliente {
  flex: 2;
  padding-left: 2.5rem;
}

.email {
  flex: 2;
}

.documento {
  flex: 1.5;
}

.processo {
  flex: 2;
}


.status {
  flex: 0 0 120px;
  min-width: 120px;
  text-align: center;
}

.seta-container {
  display: flex;
  align-items: center;
  margin-left: 0.25rem;
}

/* Estilos para visualização responsiva */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: block !important;
  }
}

@media (min-width: 769px) {
  .desktop-only {
    display: flex !important;
  }
  
  .mobile-only {
    display: none !important;
  }
}

/* Estilos para cards mobile */
.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.mobile-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
  overflow: visible;
}

.mobile-card-header {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  flex-wrap: wrap;
}

.mobile-card .cliente-avatar {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.mobile-card .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-weight: 500;
  margin-right: 8px;
  background-color: #E5E7EB;
  font-size: 14px;
}

.mobile-card .cliente-nome {
  font-weight: 500;
  display: flex;
  align-items: center;
  margin-right: auto;
}

.mobile-card-content {
  padding: 16px;
}

.mobile-card-row {
  display: flex;
  margin-bottom: 12px;
}

.mobile-card-row:last-child {
  margin-bottom: 0;
}

.mobile-card-label {
  font-weight: 500;
  width: 100px;
  color: #667085;
}

.mobile-card-value {
  flex: 1;
}

.mobile-sort-button {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 16px;
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
}

.cliente-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #EAECF0;
  transition: background-color 0.2s;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: nowrap;
  cursor: pointer;
}

.cliente-item.dropdown-open {
  position: relative;
}

/* Estilos para o dropdown na versão desktop */
.desktop-only .processo-dropdown :deep(.dropdown-container) {
  position: relative;
}

.desktop-only .processo-dropdown :deep(.dropdown-options) {
  position: absolute;
}

@media (max-width: 1024px) {
  .cliente-item {
    padding: 1rem 0.5rem;
  }
}

.cliente-avatar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Estilo específico para garantir que o avatar na versão desktop tenha fundo cinza e texto preto */
.desktop-only .avatar {
  background-color: #F3F4F6 !important; /* cinza claro */
  color: #111827 !important; /* texto preto */
}

.avatar {
  width: 36px;
  height: 36px;
  background-color: #F3F4F6; /* cinza claro */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #111827; /* texto preto */
  border: 2px solid #ccc;
  position: relative;
  margin-right: 10px;
}

.status-novo {
  border: 2px solid #10B981; /* verde */
}

.status-andamento {
  border: 2px solid #F59E0B; /* laranja */
}

.status-finalizado {
  border: 2px solid #111827; /* preto */
}

.estrela {
  position: absolute;
  bottom: -3px;
  left: -3px;
  width: 16px;
  height: 16px;
  z-index: 2;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorito {
  width: 16px;
  height: 16px;
}

.cliente-col {
  flex: 2;
  padding-left: 0.75rem;
  padding-right: 10px;
}

.cliente-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cliente-nome {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-col {
  flex: 2;
  font-size: 0.875rem;
  color: #111827;
  padding: 0 10px;
}

.documento-col {
  flex: 1.5;
  font-size: 0.875rem;
  color: #111827;
  padding: 0 10px;
}

/* Mantemos email e documento visíveis em todos os tamanhos de tela */
@media (max-width: 768px) {
  .email-col {
    flex: 1.5;
  }
  
  .documento-col {
    flex: 1;
  }
  
  .header-item.email {
    flex: 1.5;
  }
  
  .header-item.documento {
    flex: 1;
  }
}

.processo-col {
  flex: 2;
  padding: 0 10px;
}

.processo-dropdown {
  width: 100%;
  position: relative;
}

.processo-dropdown :deep(.dropdown-container) {
  width: 100%;
  position: relative;
}

.processo-dropdown :deep(.dropdown-options) {
  /* Sem z-index específico aqui */
}

.processo-dropdown :deep(.dropdown-selected) {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .processo-col {
    flex: 2;
  }
  
  .header-item.processo {
    flex: 2;
  }
  
  .cliente-col {
    flex: 2;
  }
  
  .header-item.cliente {
    flex: 2;
  }
  
  .status-col,
  .header-item.status {
    flex: 1;
  }
  
  .email-col {
    flex: 1.2;
  }
  
  .documento-col {
    flex: 0.8;
  }
  
  .header-item.email {
    flex: 1.2;
  }
  
  .header-item.documento {
    flex: 0.8;
  }
}

.truncate-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ordenacao-col {
  flex: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-col {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}


.cliente-status {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Estilos para as tags de status */
.status-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 16px;
  display: inline-block;
}

.status-novo {
  background-color: #ECFDF3;
  color: #027A48;
}

.status-andamento {
  background-color: #FFF6ED;
  color: #C4320A;
}

.status-finalizado {
  background-color: #F0F9FF;
  color: #026AA2;
}

/* Classes para bordas removidas para garantir que todos os avatares sejam iguais */

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

/* Estilos para loading e erro */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-btn:hover {
  background: #2563eb;
}

.estrela {
  cursor: pointer;
  z-index: 2;
}

.clientes-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 600px; /* Garante uma largura mínima para evitar compressão excessiva */
  position: relative;
}

/* Estilos para o layout mobile */
.mobile-sort-button {
  display: none;
  align-items: center;
  justify-content: flex-end;
  padding: 0.5rem 1rem;
  background-color: #F9FAFB;
  border-bottom: 1px solid #EAECF0;
}

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.mobile-card {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.mobile-card-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #F9FAFB;
  border-bottom: 1px solid #EAECF0;
}

.mobile-card-header .cliente-avatar {
  margin-right: 0.75rem;
}

.mobile-card-header .cliente-nome {
  flex: 1;
  font-weight: 600;
}

.mobile-card-content {
  padding: 1rem;
}

.mobile-card-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.mobile-card-row:last-child {
  margin-bottom: 0;
}

.mobile-card-label {
  width: 100px;
  font-weight: 500;
  color: #667085;
}

.mobile-card-value {
  flex: 1;
  color: #111827;
  position: relative;
}

@media (max-width: 768px) {
  .mobile-sort-button {
    display: flex;
  }
  
  .cliente-nome {
    font-size: 0.9rem;
  }
  
  .status-novo,
  .status-andamento,
  .status-finalizado {
    font-size: 0.7rem;
    padding: 0.15rem 0.35rem;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .processo-dropdown-mobile {
    position: relative;
    z-index: 1;
  }
  
  .processo-dropdown-mobile :deep(.dropdown-container) {
    position: relative;
    width: 100%;
  }
  
  .processo-dropdown-mobile :deep(.dropdown-options) {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 1;
  }
  
  /* Ajusta a altura do card quando o dropdown está aberto */
  .mobile-card-row.dropdown-open {
    margin-bottom: 250px;
  }
}
</style>
