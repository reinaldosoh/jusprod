<script setup>
import verificarEsquerdo from './verificarEsquerdo.vue'
import verificarDireito from './verificarDireito.vue'
</script>

<template>
  <div class="verificar-email-container">
    <verificarEsquerdo />
    <verificarDireito />
  </div>
</template>

<style scoped>
.verificar-email-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #FFFFFF;
  box-sizing: border-box;
  overflow: hidden;
}

@media (max-width: 768px) {
  .verificar-email-container {
    flex-direction: column;
  }
}
</style> 