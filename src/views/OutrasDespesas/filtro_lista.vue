<template>
  <div class="filtro-lista-container">
    <!-- Botão Voltar - Lado Esquerdo -->
    <div class="voltar-section" @click="voltarPagina">
      <img src="/images/voltar.svg" alt="Voltar" class="voltar-icon">
      <span class="voltar-text">Voltar</span>
    </div>

    <!-- Input de Pesquisa - Lado Direito -->
    <div class="pesquisa-section">
      <div class="input-pesquisa-container">
        <img src="/images/search.svg" alt="Pesquisar" class="search-icon">
        <input 
          type="text" 
          placeholder="Pesquisar outras despesas..."
          class="input-pesquisa"
          v-model="termoPesquisa"
          @input="handlePesquisa"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const termoPesquisa = ref('')

// Emit para comunicar mudanças de pesquisa
const emit = defineEmits(['pesquisar'])

const voltarPagina = () => {
  router.back()
}

const handlePesquisa = () => {
  emit('pesquisar', termoPesquisa.value)
}
</script>

<style scoped>
.filtro-lista-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 24px;
}

/* Seção Voltar - Lado Esquerdo */
.voltar-section {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.voltar-section:hover {
  opacity: 0.8;
}

.voltar-icon {
  width: 24px;
  height: 24px;
}

.voltar-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  line-height: 1.2;
}

/* Seção Pesquisa - Lado Direito */
.pesquisa-section {
  display: flex;
  align-items: center;
}

.input-pesquisa-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  z-index: 1;
  pointer-events: none;
}

.input-pesquisa {
  width: 320px;
  height: 44px;
  padding: 12px 16px 12px 44px; /* Espaço para o ícone à esquerda */
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #101828;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-pesquisa::placeholder {
  color: #667085;
}

.input-pesquisa:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0px 0px 0px 4px rgba(4, 104, 250, 0.12);
}

/* Responsivo */
@media (max-width: 768px) {
  .filtro-lista-container {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .voltar-section {
    align-self: flex-start;
  }
  
  .pesquisa-section {
    width: 100%;
  }
  
  .input-pesquisa {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .input-pesquisa {
    font-size: 14px;
    height: 40px;
    padding: 10px 14px 10px 40px;
  }
  
  .search-icon {
    left: 10px;
    width: 18px;
    height: 18px;
  }
}
</style> 