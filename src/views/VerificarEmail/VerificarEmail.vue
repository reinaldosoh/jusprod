<script setup>
import verificarEsquerdo from './verificarEsquerdo.vue'
import verificarDireito from './verificarDireito.vue'
</script>

<template>
  <div class="verificar-email-wrapper">
    <div class="verificar-email-container">
      <verificarEsquerdo />
      <verificarDireito />
    </div>
  </div>
</template>

<style scoped>
.verificar-email-wrapper {
  width: 100%;
  height: 100vh;
  background-color: #FFFFFF;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.verificar-email-container {
  display: flex;
  height: 100vh;
  width: 100%;
  max-width: 1280px;
  background-color: #FFFFFF;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .verificar-email-wrapper {
    overflow: visible;
  }
  
  .verificar-email-container {
    flex-direction: column;
  }
}
</style> 