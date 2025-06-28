<template>
  <div class="primeiros-passos-wrapper">
  <div class="primeiros-passos">
    <PassoEsquerdo />
    <PassoDireito />
    </div>
  </div>
</template>

<script setup>
import PassoEsquerdo from './passoEsquerdo.vue';
import PassoDireito from './passoDireito.vue';
</script>

<style scoped>
.primeiros-passos-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #FFFFFF;
}

.primeiros-passos {
  display: flex;
  width: 100%;
  max-width: 1280px;
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