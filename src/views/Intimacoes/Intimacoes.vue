<template>
  <div>
    <MenuFixo />
    <FiltroIntimacao @search="handleSearch" />
    <ListaIntimacoes :search-term="searchTerm" />
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