<template>
  <div class="filtro-lista-container">
    <div class="titulo-section">
      <h2 class="titulo-lancamentos">Últimos lançamentos</h2>
    </div>
    
    <div class="dropdown-section">
      <div class="dropdown-container">
        <div 
          class="dropdown-header" 
          @click="toggleDropdown"
          :class="{ 'dropdown-header--open': dropdownAberto }"
        >
          <div class="dropdown-header-content">
            <img src="/images/funil.svg" alt="Filtro" class="dropdown-icon">
            <span class="dropdown-text">{{ opcaoSelecionada?.label || 'Recebíveis' }}</span>
          </div>
          <svg 
            class="dropdown-arrow" 
            :class="{ 'dropdown-arrow--open': dropdownAberto }"
            width="12" 
            height="8" 
            viewBox="0 0 12 8" 
            fill="none"
          >
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#0468FA" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
          </svg>
        </div>
        
        <div class="dropdown-options" v-if="dropdownAberto">
          <li 
            v-for="opcao in opcoes" 
            :key="opcao.id"
            class="dropdown-item"
            :class="{ 'dropdown-item--active': opcao.id === opcaoSelecionada?.id }"
            @click="selecionarOpcao(opcao)"
          >
            {{ opcao.label }}
          </li>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Emits
const emit = defineEmits(['filtro-alterado'])

// Estados reativos
const dropdownAberto = ref(false)
const opcaoSelecionada = ref(null)

// Opções do dropdown
const opcoes = ref([
  { id: 1, label: 'Recebíveis', value: 'recebiveis' },
  { id: 2, label: 'Saídas', value: 'saidas' },
  { id: 3, label: 'Outras despesas', value: 'outras_despesas' }
])

// Métodos
const toggleDropdown = () => {
  dropdownAberto.value = !dropdownAberto.value
}

const selecionarOpcao = (opcao) => {
  opcaoSelecionada.value = opcao
  dropdownAberto.value = false
  emit('filtro-alterado', opcao)
}

// Fechar dropdown ao clicar fora
const fecharDropdown = (event) => {
  if (!event.target.closest('.dropdown-container')) {
    dropdownAberto.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Definir primeira opção como padrão
  opcaoSelecionada.value = opcoes.value[0]
  
  // Adicionar listener para fechar dropdown
  document.addEventListener('click', fecharDropdown)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', fecharDropdown)
})
</script>

<style scoped>
.filtro-lista-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 24px;
  max-width: 1248px; /* Largura máxima disponível (1280 - 32px padding) */
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding-left: 0; /* Alinhado com as tabs */
  padding-right: 0;
}

.titulo-section {
  display: flex;
  align-items: center;
  gap: 40px;
}

.titulo-previsao,
.titulo-lancamentos {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #101828;
  margin: 0;
  line-height: 1.2;
}

.dropdown-section {
  display: flex;
  align-items: center;
}

.dropdown-container {
  position: relative;
  font-family: 'Inter', sans-serif;
  user-select: none;
  width: 277px;
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
  background-color: white;
  border: 1px solid #D0D5DD;
  color: #101828;
}

.dropdown-header:hover {
  border-color: #0468FA;
}

.dropdown-header:focus-within {
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.dropdown-header--open {
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.dropdown-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.dropdown-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #101828;
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
  z-index: 5000;
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
  color: #101828;
}

.dropdown-item:hover:not(.dropdown-item--active) {
  background-color: #f5f5f5;
}

.dropdown-item--active {
  background-color: #0468FA;
  color: white;
}

@media (max-width: 1200px) {
  .filtro-lista-container {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
    padding-left: 20px;
  }
  
  .titulo-section {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .titulo-previsao,
  .titulo-lancamentos {
    font-size: 20px;
  }
  
  .dropdown-section {
    width: 100%;
  }
  
  .dropdown-container {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .filtro-lista-container {
    padding-left: 16px;
    padding-right: 16px;
    position: relative;
    z-index: 9999;
  }
  
  .titulo-section {
    display: none;
  }
  
  .dropdown-container {
    width: 100%;
    max-width: none;
    position: relative;
    z-index: 10000;
  }
  
  .dropdown-header {
    position: relative;
    z-index: 10001;
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
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    z-index: 10002;
  }
}
</style> 