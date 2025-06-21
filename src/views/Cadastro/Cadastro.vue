<script setup>
import CadastroEsquerdo from './cadastroEsquerdo.vue';
import CadastroDireito from './cadastroDireito.vue';
</script>

<template>
  <div class="cadastro-container">
    <CadastroEsquerdo />
    <CadastroDireito />
  </div>
</template>

<style scoped>
.cadastro-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  overflow: hidden;
}

@media (max-width: 768px) {
  .cadastro-container {
    flex-direction: column;
    overflow: visible;
    height: auto;
    min-height: 100vh;
  }
}
</style>
