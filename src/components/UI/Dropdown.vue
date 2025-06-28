<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    default: () => [
      { id: 1, label: 'Todos' },
      { id: 2, label: 'Novos clientes' },
      { id: 3, label: 'Em andamento', active: true },
      { id: 4, label: 'Finalizados' },
      { id: 5, label: 'Melhores clientes' }
    ]
  },
  defaultSelected: {
    type: Number,
    default: 0
  },
  placeholderText: {
    type: String,
    default: 'Selecione uma opção'
  },
  showPlaceholderIcon: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['option-selected']);

const isOpen = ref(false);
const selectedOption = ref(
  props.options.find(option => option.active) || 
  props.options[props.defaultSelected] || 
  props.options[0]
);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectOption(option) {
  selectedOption.value = option;
  isOpen.value = false;
  emit('option-selected', option);
}

function closeDropdown(e) {
  if (!e.target.closest('.dropdown-container')) {
    isOpen.value = false;
  }
}

// Adiciona um event listener para fechar o dropdown quando clicar fora dele
onMounted(() => {
  document.addEventListener('click', closeDropdown);
})

function isActive(option) {
  return option.active;
}
</script>

<template>
  <div class="dropdown-container" @click.stop>
    <div 
      class="dropdown-header" 
      @click="toggleDropdown"
      :class="{ 
        'dropdown-header--open': isOpen,
        'dropdown-header--selected': selectedOption && selectedOption.id
      }"
      :style="{
        'background-color': 'white !important',
        'color': ((selectedOption && selectedOption.id) ? '#0468FA' : '#101828') + ' !important',
        'border-color': ((selectedOption && selectedOption.id) ? '#0468FA' : '#D0D5DD') + ' !important'
      }"
    >
      <div class="dropdown-header-content"
           :style="{
             'color': ((selectedOption && selectedOption.id) ? '#0468FA' : '#101828') + ' !important'
           }">
        <!-- Ícone placeholder quando não há seleção (apenas se showPlaceholderIcon for true) -->
        <svg 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon"
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          class="dropdown-icon"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="#667085" stroke-width="2" fill="none"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="#667085" stroke-width="2" fill="none"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="#667085" stroke-width="2" fill="none"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="#667085" stroke-width="2" fill="none"/>
        </svg>
        
        <!-- Ícone quando há algo selecionado -->
        <img 
          v-if="selectedOption && selectedOption.icon" 
          :src="selectedOption.icon"
          :alt="selectedOption.label"
          class="dropdown-icon"
        />
        
        <span 
          :class="{ 'placeholder-text': !selectedOption || !selectedOption.id }"
          :style="{
            'color': ((selectedOption && selectedOption.id) ? '#0468FA' : '#667085') + ' !important'
          }">{{ selectedOption ? selectedOption.label : placeholderText }}</span>
      </div>
      <svg 
        class="dropdown-arrow" 
        :class="{ 'dropdown-arrow--open': isOpen }"
        width="12" 
        height="8" 
        viewBox="0 0 12 8" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1 1.5L6 6.5L11 1.5" stroke="#0468FA" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
      </svg>
    </div>
    
    <div 
      v-if="isOpen" 
      class="dropdown-options"
    >
      <li 
        v-for="option in options" 
        :key="option.id"
        class="dropdown-item"
        :class="{ 
          'dropdown-item--active': option.id === selectedOption?.id,
          'dropdown-item--highlighted': option.active 
        }"
        :style="{
          backgroundColor: option.id === selectedOption?.id ? '#0468FA' : (option.active ? '#0468FA' : ''),
          color: (option.id === selectedOption?.id || option.active) ? 'white' : '#101828'
        }"
        @click="selectOption(option)"
      >
        <img 
          v-if="option.icon" 
          :src="(option.id === selectedOption?.id || option.active) ? (option.iconeBranco || option.icon) : option.icon"
          :alt="option.label"
          class="dropdown-icon"
        />
        <span>{{ option.label }}</span>
      </li>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
.dropdown-container {
  position: relative;
  width: 100%;
  font-family: 'Inter', sans-serif;
  user-select: none;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  /* Fallbacks que serão sobrescritos por inline styles */
  background-color: white;
  border: 1px solid #D0D5DD;
  color: #101828;
}

.dropdown-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Lista funciona apenas com inline styles para evitar conflitos */

.dropdown-header:hover {
  border-color: #0468FA;
}

.dropdown-header:focus-within {
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.dropdown-header--open {
  border-radius: 8px 8px 0 0;
  border-color: #0468FA;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
}

.dropdown-arrow--open {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #0468FA;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1100;
}

.dropdown-item {
  padding: 12px 16px;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Inter', sans-serif;
  list-style: none;
}

.dropdown-item:hover:not(.dropdown-item--active):not(.dropdown-item--highlighted) {
  background-color: #f5f5f5 !important;
  color: #101828 !important;
}

.dropdown-item:hover:not(.dropdown-item--active):not(.dropdown-item--highlighted) span {
  color: #101828 !important;
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

/* Removido - usando apenas inline styles */

.placeholder-text {
  color: #667085;
}

@media (max-width: 768px) {
  .dropdown-container {
    max-width: 100%;
  }
  
  .dropdown-header {
    height: 48px;
    padding: 0 16px;
    font-size: 15px;
  }
  
  .dropdown-item {
    padding: 0 16px;
    height: 48px;
    font-size: 15px;
  }
  
  .dropdown-options {
    max-height: 200px;
  }
}
</style>
