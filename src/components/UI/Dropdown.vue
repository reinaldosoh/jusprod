<script setup>
import { ref } from 'vue';

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
if (typeof window !== 'undefined') {
  window.addEventListener('click', closeDropdown);
}
</script>

<template>
  <div class="dropdown-container" @click.stop>
    <div 
      class="dropdown-header" 
      @click="toggleDropdown"
      :class="{ 'dropdown-header--open': isOpen }"
    >
      <span>{{ selectedOption.label }}</span>
      <svg 
        class="dropdown-arrow" 
        :class="{ 'dropdown-arrow--open': isOpen }"
        width="12" 
        height="8" 
        viewBox="0 0 12 8" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    
    <div 
      v-if="isOpen" 
      class="dropdown-options"
    >
      <div 
        v-for="option in options" 
        :key="option.id"
        class="dropdown-option"
        :class="{ 'dropdown-option--active': option.id === selectedOption.id }"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  width: 100%;
  max-width: 220px;
  font-family: Arial, sans-serif;
  user-select: none;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
}

.dropdown-header:hover {
  border-color: #ccc;
}

.dropdown-header--open {
  border-radius: 4px 4px 0 0;
  border-color: #ccc;
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
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dropdown-option {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-option:hover {
  background-color: #f5f5f5;
}

.dropdown-option--active {
  background-color: #0468FA;
  color: white;
}

@media (max-width: 768px) {
  .dropdown-container {
    max-width: 100%;
  }
  
  .dropdown-header {
    height: 48px;
    padding: 14px 16px;
    font-size: 15px;
  }
  
  .dropdown-option {
    padding: 14px 16px;
    font-size: 15px;
  }
  
  .dropdown-options {
    max-height: 200px;
  }
}
</style>
