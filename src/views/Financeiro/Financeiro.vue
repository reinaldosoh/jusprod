<template>
  <div>
    <MenuFixo />
    <div class="main-content">
      <h1>Financeiro</h1>
      <p>Em desenvolvimento...</p>
    </div>
  </div>
</template>

<script setup>
import MenuFixo from '../../components/UI/MenuFixo.vue';
</script>

<style scoped>
.main-content {
  margin-left: 250px;
  padding: 20px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 10px;
  }
}
</style> 