<template>
  <div>
    <MenuFixo />
    <Filtro 
      @search="handleSearch"
    />
    <ListaProcesso :searchTerm="searchTerm" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Filtro from './Filtro.vue'
import ListaProcesso from './listaprocesso.vue'
import MenuFixo from '../../components/UI/MenuFixo.vue'

const searchTerm = ref('')

const handleSearch = (term) => {
  searchTerm.value = term
}
</script> 