<template>
  <div>
    <MenuFixo />
    <Filtro 
      @search="handleSearch" 
      @novo-processo="handleNovoProcesso"
    />
    <ListaProcesso :searchTerm="searchTerm" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MenuFixo from '../../components/UI/MenuFixo.vue'
import Filtro from './Filtro.vue'
import ListaProcesso from './listaprocesso.vue'

const searchTerm = ref('')

const handleSearch = (term) => {
  searchTerm.value = term
}

const handleNovoProcesso = (numeroProcesso) => {
  console.log('Novo processo solicitado:', numeroProcesso)
  // Aqui você pode implementar a lógica para buscar/adicionar o novo processo
  // Por exemplo, fazer uma busca específica por esse número
  searchTerm.value = numeroProcesso
}
</script> 