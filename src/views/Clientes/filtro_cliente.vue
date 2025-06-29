<template>
  <div class="filtro-cliente-container">
    <!-- Barra de Filtros -->
    <div class="filters-bar">
      <!-- Lado Esquerdo: Título, Ícones, Dropdown e Input -->
      <div class="filters-left">
        <!-- Título -->
        <div class="title-container">
          <div class="title-content">
            <div class="title-header">
              <!-- ChevronDown SVG -->
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="dropdown-icon">
                <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h2 class="title">Organize seus clientes</h2>
            </div>
            <p class="subtitle">Você pode escolher como vê-los</p>
          </div>
        </div>

        <!-- Componente de ícones separado para melhor manutenção -->
        <IconesBarra 
          :activeView="activeView" 
          @view-change="handleViewChange" 
          @action="handleIconAction"
        />

        <!-- Dropdown Customizado -->
        <Dropdown 
          :options="dropdownOptions"
          placeholder-text="Filtrar por"
          @option-selected="handleDropdownChange"
          class="custom-dropdown"
        />

        <!-- Campo de Busca -->
        <div class="search-container">
          <!-- Search SVG -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="search-icon">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            type="text" 
            :placeholder="getPlaceholderText"
            class="search-input"
            v-model="formattedSearchQuery"
            @input="handleInputChange"
          />
        </div>
      </div>

      <!-- Lado Direito: Botão Novo Cliente -->
      <div class="filters-right">
        <button class="novo-cliente-btn" @click="handleNewClient">
          <div class="plus-icon-container">
            <!-- Plus SVG -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="plus-icon">
              <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="button-text">Novo cliente</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dropdown from '../../components/UI/Dropdown.vue'
import IconesBarra from '../../components/UI/IconesBarra.vue'

const searchQuery = ref('')
const formattedSearchQuery = ref('')
const selectedFilter = ref({ id: 1, label: 'Nome' })
const activeView = ref('kanban')

// Opções do dropdown
const dropdownOptions = ref([
  { id: 1, label: 'Nome' },
  { id: 2, label: 'CPF' },
  { id: 3, label: 'CNPJ' },
  { id: 4, label: 'Novos clientes' },
  { id: 5, label: 'Em andamento' },
  { id: 6, label: 'Finalizado' }
])

// Emits para comunicação com componente pai
const emit = defineEmits(['filter-change', 'view-change', 'new-client'])

const handleViewChange = (view) => {
  activeView.value = view
  emit('view-change', view)
}

const handleDropdownChange = (option) => {
  selectedFilter.value = option
  searchQuery.value = ''
  formattedSearchQuery.value = ''
  
  // Emite o evento com o tipo de filtro selecionado
  emit('filter-change', option)
  
  // Se for uma opção de status, aplicar o filtro imediatamente sem necessidade de digitar
  if (['Novos clientes', 'Em andamento', 'Finalizado'].includes(option.label)) {
    emit('filter-change', { 
      type: option.label.toLowerCase(),
      value: '' // Valor vazio para filtrar apenas pelo status
    })
  }
}

const handleNewClient = () => {
  emit('new-client')
}

const handleIconAction = (action, value) => {
  console.log('Ação do ícone:', action, value)
  // Implementar ações específicas para os ícones
  if (action === 'favorites') {
    console.log('Filtrando por favoritos:', value)
    emit('filter-change', { type: 'favorites', value: value })
  }
}

// Função para aplicar máscara de CPF: ###.###.###-##
const applyCpfMask = (value) => {
  if (!value) return ''
  
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  const limitedValue = numericValue.slice(0, 11)
  
  // Aplica a máscara
  return limitedValue
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

// Função para aplicar máscara de CNPJ: ##.###.###/####-##
const applyCnpjMask = (value) => {
  if (!value) return ''
  
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, '')
  
  // Limita a 14 dígitos
  const limitedValue = numericValue.slice(0, 14)
  
  // Aplica a máscara
  return limitedValue
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
}

// Função para lidar com a mudança no input
const handleInputChange = (event) => {
  const value = event.target.value
  
  // Aplica a máscara apropriada com base no filtro selecionado
  if (selectedFilter.value.label === 'CPF') {
    formattedSearchQuery.value = applyCpfMask(value)
  } else if (selectedFilter.value.label === 'CNPJ') {
    formattedSearchQuery.value = applyCnpjMask(value)
  } else {
    formattedSearchQuery.value = value
  }
  
  // Atualiza o valor real para pesquisa (sem formatação)
  searchQuery.value = formattedSearchQuery.value.replace(/\D/g, '')
  
  // Emite o evento de mudança de filtro com o valor e tipo
  emit('filter-change', { 
    type: selectedFilter.value.label.toLowerCase(), 
    value: selectedFilter.value.label === 'CPF' || selectedFilter.value.label === 'CNPJ' 
      ? searchQuery.value 
      : formattedSearchQuery.value 
  })
}

// Texto do placeholder baseado no filtro selecionado
const getPlaceholderText = computed(() => {
  switch (selectedFilter.value.label) {
    case 'CPF':
      return 'Digite o CPF (ex: 123.456.789-00)'
    case 'CNPJ':
      return 'Digite o CNPJ (ex: 12.345.678/0001-90)'
    case 'Novos clientes':
      return 'Pesquisar novos clientes'
    case 'Em andamento':
      return 'Pesquisar clientes em andamento'
    case 'Finalizado':
      return 'Pesquisar clientes finalizados'
    default:
      return 'Pesquisar cliente por nome'
  }
})
</script>

<style scoped>
.filtro-cliente-container {
  width: 100%;
  background: white;
  padding: 1.5rem 2rem; /* 1.5rem = 24px para padding superior e inferior */
  border-bottom: 1px solid #e5e7eb;
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Título na barra de filtros */
.title-container {
  display: flex;
  align-items: center;
  margin-right: 2rem;
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-icon {
  flex-shrink: 0;
  color: #3b82f6 !important;
  stroke: #3b82f6 !important;
}

.title {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #3b82f6;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
}

.subtitle {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #667085;
  margin: 0;
  line-height: 1.4;
}

/* Barra de Filtros */
.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
}

.filters-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filters-right {
  display: flex;
  align-items: center;
}

/* Grupo de Ícones - CORRIGIDO PARA GARANTIR QUE APAREÇAM */
.view-icons-group {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem;
  padding: 0.375rem;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  background: white !important;
  height: 44px;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
}

.view-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 30px !important;
  height: 30px !important;
  border: none !important;
  border-radius: 6px;
  background: transparent !important;
  color: #667085 !important;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.view-btn:hover {
  background: #F9FAFB !important;
  color: #344054 !important;
}

.view-btn.active {
  background: #3b82f6 !important;
  color: white !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.action-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 30px !important;
  height: 30px !important;
  border: none !important;
  border-radius: 6px;
  background: transparent !important;
  color: #667085 !important;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.action-btn:hover {
  background: #F9FAFB !important;
  color: #344054 !important;
}

/* Estilos para ícones movidos para o componente IconesBarra */

.view-btn.active svg {
  /* Sem override de stroke, será herdado pela cor do botão */
}

/* Traço Vertical */
.vertical-divider {
  width: 1px !important;
  height: 1.25rem !important;
  background-color: #D0D5DD !important;
  margin: 0 0.125rem;
  flex-shrink: 0;
}

/* Dropdown Customizado */
.custom-dropdown {
  width: 183px;
  min-width: 183px;
  position: relative;
  z-index: 10;
}

.custom-dropdown :deep(.dropdown-header) {
  height: 44px;
}

/* Campo de Busca */
.search-container {
  position: relative;
  width: 292px;
  min-width: 292px;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 0.875rem 0 2.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280 !important;
  stroke: #6b7280 !important;
  pointer-events: none;
}

/* Botão Novo Cliente */
.novo-cliente-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 44px;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  flex-shrink: 0;
}

.novo-cliente-btn:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.novo-cliente-btn:active {
  transform: translateY(0);
}

.plus-icon {
  color: #3b82f6 !important;
  stroke: #3b82f6 !important;
  stroke-width: 2.5;
}

.plus-icon-container {
  width: 20px;
  height: 20px;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.button-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
}

/* Responsividade */
@media (max-width: 768px) {
  .filtro-cliente-container {
    padding: 1.5rem 1rem; /* Mantendo 24px (1.5rem) de padding vertical */
  }

  .filters-bar {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }

  .filters-left {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .filters-right {
    width: 100%;
  }

  .title-container {
    justify-content: center;
    margin-right: 0;
  }

  .title-content {
    text-align: center;
  }

  .view-icons-group {
    justify-content: center;
  }

  .custom-dropdown {
    width: 100%;
    min-width: 100%;
  }

  .search-container {
    width: 100%;
    min-width: 100%;
  }

  .novo-cliente-btn {
    width: 100%;
    justify-content: center;
  }

  .title {
    font-size: 20px;
  }

  .subtitle {
    font-size: 14px;
  }
}

@media (max-width: 640px) {
  .filtro-cliente-container {
    padding: 1.5rem 1rem; /* Mantendo 24px (1.5rem) de padding vertical */
  }

  .filters-bar {
    gap: 0.75rem;
  }

  .filters-left {
    gap: 0.75rem;
  }

  .title {
    font-size: 18px;
  }

  .subtitle {
    font-size: 13px;
  }

  .view-icons-group {
    padding: 0.25rem;
    height: 40px;
  }

  .view-btn,
  .action-btn {
    width: 26px;
    height: 26px;
  }

  .vertical-divider {
    height: 1.125rem;
  }

  .custom-dropdown :deep(.dropdown-header) {
    height: 40px;
  }

  .search-input {
    height: 40px;
  }

  .novo-cliente-btn {
    height: 40px;
  }
}
</style> 