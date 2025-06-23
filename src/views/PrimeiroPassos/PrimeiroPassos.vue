<template>
  <div class="primeiros-passos">
    <PassoEsquerdo />
    <PassoDireito />
  </div>
</template>

<script setup>
import PassoEsquerdo from './passoEsquerdo.vue';
import PassoDireito from './passoDireito.vue';
</script>

<style scoped>
.primeiros-passos {
  display: flex;
  width: 100%;
  min-height: 100vh;
  overflow: visible;
}

@media (max-width: 768px) {
  .primeiros-passos {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
}
</style> 