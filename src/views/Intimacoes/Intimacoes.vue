<template>
  <div>
    <MenuFixo />
    <div class="intimacoes-container">
      <FiltroIntimacao @search="handleSearch" />
      <ListaIntimacoes :search-term="searchTerm" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MenuFixo from '../../components/UI/MenuFixo.vue'
import FiltroIntimacao from '../../components/UI/FiltroIntimacao.vue'
import ListaIntimacoes from './listaintimacoes.vue'

const searchTerm = ref('')

const handleSearch = (termo) => {
  searchTerm.value = termo
}
</script>

<style scoped>
.intimacoes-container {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>