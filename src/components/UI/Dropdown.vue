<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

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
    type: [Number, Object],
    default: 0
  },
  placeholderText: {
    type: String,
    default: 'Selecione uma opção'
  },
  showPlaceholderIcon: {
    type: Boolean,
    default: false
  },
  iconType: {
    type: String,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['option-selected', 'dropdown-open', 'dropdown-close']);

const isOpen = ref(false);
const selectedOption = ref(
  props.defaultSelected === null ? null :
  props.options.find(option => option.active) || 
  props.options[props.defaultSelected] || 
  props.options[0]
);

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  
  if (isOpen.value) {
    emit('dropdown-open');
  } else {
    emit('dropdown-close');
  }
}

function selectOption(option) {
  if (props.disabled) return;
  selectedOption.value = option;
  isOpen.value = false;
  emit('option-selected', option);
  emit('dropdown-close');
}

function closeDropdown(e) {
  if (!e.target.closest('.dropdown-container')) {
    if (isOpen.value) {
      isOpen.value = false;
      emit('dropdown-close');
    }
  }
}

// Adiciona um event listener para fechar o dropdown quando clicar fora dele
onMounted(() => {
  document.addEventListener('click', closeDropdown);
})

// Remove o event listener quando o componente for desmontado
onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
})

function isActive(option) {
  return option.active;
}

// Watch para mudanças no defaultSelected
watch(() => props.defaultSelected, (newValue) => {
  if (newValue === null) {
    selectedOption.value = null;
  } else {
    selectedOption.value = props.options.find(option => option.active) || 
                          props.options[props.defaultSelected] || 
                          props.options[0];
  }
});

// Watch para mudanças nas options
watch(() => props.options, () => {
  if (props.defaultSelected === null) {
    selectedOption.value = null;
  }
}, { deep: true });
</script>

<template>
  <div class="dropdown-container" @click.stop :class="{ 'dropdown-open': isOpen }">
    <div 
      class="dropdown-header" 
      @click="toggleDropdown"
      :class="{ 
        'dropdown-header--open': isOpen,
        'dropdown-header--selected': selectedOption && selectedOption.id,
        'dropdown-header--disabled': disabled
      }"
      :style="{
        'background-color': disabled ? '#f9fafb !important' : 'white !important',
        'color': disabled ? '#9ca3af !important' : ((selectedOption && selectedOption.id) ? '#0468FA' : '#101828') + ' !important',
        'border-color': disabled ? '#d1d5db !important' : ((selectedOption && selectedOption.id) ? '#0468FA' : '#D0D5DD') + ' !important',
        'cursor': disabled ? 'not-allowed !important' : 'pointer !important'
      }"
    >
      <div class="dropdown-header-content"
           :style="{
             'color': disabled ? '#9ca3af !important' : ((selectedOption && selectedOption.id) ? '#0468FA' : '#101828') + ' !important'
           }">
        <!-- Ícone de relógio para dropdowns de horário -->
        <svg 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'clock'"
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
        >
          <circle cx="10" cy="10" r="7.5" stroke="#667085" stroke-width="2"/>
          <path d="M10 5V10L13 13" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
        <!-- Ícone de relógio (novo) -->
        <img 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'relogio'"
          src="/images/relogio.svg" 
          alt="Relógio" 
          width="18" 
          height="18"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
        />
        
        <!-- Ícone de calendário -->
        <img 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'calendario'"
          src="/images/calendario.svg" 
          alt="Calendário" 
          width="20" 
          height="20"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
        />
        
        <!-- Ícone de categorias -->
        <img 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'categorias'"
          src="/images/categorias.svg" 
          alt="Categorias" 
          width="18" 
          height="18"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
        />
        
        <!-- Ícone de usuário -->
        <img 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'user'"
          src="/images/user.svg" 
          alt="Usuário" 
          width="20" 
          height="20"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
        />
        
        <!-- Ícone de balança (processo) -->
        <img 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'balanca'"
          src="/images/balanca.svg" 
          alt="Processo" 
          width="20" 
          height="20"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
        />
        
        <!-- Ícone de pastas -->
        <img 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'pastas'"
          src="/images/pastas.svg" 
          alt="Pastas" 
          width="20" 
          height="20"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
        />
        
        <!-- Ícone de pasta individual -->
        <img 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'pasta'"
          src="/images/iconPasta.svg" 
          alt="Pasta" 
          width="18" 
          height="18"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
        />
        
        <!-- Ícone de funil -->
        <svg 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'funil'"
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
        >
          <g clip-path="url(#clip0_1_43538)">
            <path d="M1.66406 3.83333C1.66406 3.36662 1.66406 3.13327 1.75489 2.95501C1.83478 2.79821 1.96227 2.67072 2.11907 2.59083C2.29733 2.5 2.53069 2.5 2.99740 2.5H16.9974C17.4641 2.5 17.6975 2.5 17.8757 2.59083C18.0325 2.67072 18.16 2.79821 18.2399 2.95501C18.3307 3.13327 18.3307 3.36662 18.3307 3.83333V4.39116C18.3307 4.61516 18.3307 4.72716 18.3034 4.83130C18.2791 4.92359 18.2392 5.01103 18.1853 5.08980C18.1245 5.17869 18.0399 5.25204 17.8706 5.39875L12.5408 10.0179C12.3715 10.1646 12.2869 10.238 12.2261 10.3269C12.1723 10.4056 12.1324 10.4931 12.1081 10.5854C12.0807 10.6895 12.0807 10.8015 12.0807 11.0255V15.382C12.0807 15.5449 12.0807 15.6264 12.0544 15.6969C12.0312 15.7591 11.9934 15.8149 11.9443 15.8596C11.8886 15.9102 11.8130 15.9404 11.6617 16.001L8.82832 17.1343C8.52204 17.2568 8.36889 17.3181 8.24596 17.2925C8.13845 17.2702 8.04411 17.2063 7.98344 17.1148C7.91406 17.0101 7.91406 16.8452 7.91406 16.5153V11.0255C7.91406 10.8015 7.91406 10.6895 7.88669 10.5854C7.86243 10.4931 7.82251 10.4056 7.76865 10.3269C7.70788 10.238 7.62324 10.1646 7.45397 10.0179L2.12416 5.39875C1.95488 5.25204 1.87025 5.17869 1.80947 5.08980C1.75562 5.01103 1.71569 4.92359 1.69143 4.83130C1.66406 4.72716 1.66406 4.61516 1.66406 4.39116V3.83333Z" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <defs>
            <clipPath id="clip0_1_43538">
              <rect width="20" height="20" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        
        <!-- Ícone placeholder padrão para outros casos -->
        <svg 
          v-if="(!selectedOption || !selectedOption.id) && showPlaceholderIcon && iconType === 'default'"
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          class="dropdown-icon"
          :style="{ opacity: disabled ? '0.5' : '1' }"
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
          :style="{ opacity: disabled ? '0.5' : '1' }"
        />
        
        <span 
          :class="{ 'placeholder-text': !selectedOption || !selectedOption.id }"
          :style="{
            'color': disabled ? '#9ca3af !important' : ((selectedOption && selectedOption.id) ? '#0468FA' : '#667085') + ' !important'
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
        :style="{ opacity: disabled ? '0.5' : '1' }"
      >
        <path d="M1 1.5L6 6.5L11 1.5" stroke="#0468FA" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
      </svg>
    </div>
    
    <div 
      v-if="isOpen && !disabled" 
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
  /* z-index controlado pelo dropdown-fix.css */
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
  border-color: #0468FA !important;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1) !important;
}

.dropdown-header--disabled {
  background-color: #f9fafb !important;
  color: #9ca3af !important;
  border-color: #d1d5db !important;
  cursor: not-allowed !important;
}

.dropdown-header--disabled:hover {
  border-color: #d1d5db !important;
  box-shadow: none !important;
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
  /* z-index controlado pelo dropdown-fix.css */
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
