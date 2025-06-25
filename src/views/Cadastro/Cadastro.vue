<script setup>
import CadastroEsquerdo from './cadastroEsquerdo.vue';
import CadastroDireito from './cadastroDireito.vue';
</script>

<template>
  <div class="cadastro-wrapper">
    <div class="cadastro-container">
      <CadastroEsquerdo />
      <CadastroDireito />
    </div>
  </div>
</template>

<style scoped>
.cadastro-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.cadastro-container {
  display: flex;
  width: 100%;
  max-width: 1280px;
  min-height: 100vh;
  background-color: #ffffff;
}

@media (max-width: 768px) {
  .cadastro-wrapper {
    overflow: visible;
  }
  
  .cadastro-container {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
}
</style>
