<template>
  <div class="clientes-page">
    <MenuFixo />
    <div class="content-wrapper">
      <FiltroCliente 
        @filter-change="handleFilterChange"
        @view-change="handleViewChange"
        @new-client="handleNewClient"
      />
      <Kanbam />
    </div>
  </div>
</template>

<script setup>
import MenuFixo from '../../components/UI/MenuFixo.vue';
import FiltroCliente from './filtro_cliente.vue';
import Kanbam from './kanbam.vue';

// Handlers para os eventos do filtro
const handleFilterChange = (filter) => {
  console.log('Filtro alterado:', filter);
  // Implementar lógica de filtro
};

const handleViewChange = (view) => {
  console.log('Visualização alterada:', view);
  // Implementar mudança de visualização
};

const handleNewClient = () => {
  console.log('Novo cliente clicado');
  // Implementar abertura do modal/página de novo cliente
};
</script>

<style scoped>
.clientes-page {
  background-color: #FFFFFF;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
}
</style> 