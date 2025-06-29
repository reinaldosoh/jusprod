<template>
  <div class="clientes-page">
    <MenuFixo />
    <div class="content-wrapper">
      <ClientesView />
    </div>
  </div>
</template>

<script setup>
import MenuFixo from '../../components/UI/MenuFixo.vue';
import ClientesView from './ClientesView.vue';
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