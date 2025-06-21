<script setup>
// Não precisamos mais importar os componentes diretamente
// pois o Vue Router cuidará de carregar os componentes com base na rota atual
</script>

<template>
  <div class="app">
    <!-- Renderiza o componente correspondente à rota atual -->
    <router-view />
  </div>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  background-color: #ffffff;
  overflow-x: hidden;
}

.app {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

@media (max-width: 768px) {
  .app {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}
</style>

<!-- Importação da fonte Inter do Google Fonts -->
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
</style>
