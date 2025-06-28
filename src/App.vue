<script setup>
// Removendo import do MenuFixo
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
  min-height: 100vh;
  position: relative;
}

@media (max-width: 768px) {
  .app {
    min-height: 100vh;
  }
}
</style>

<!-- Importação da fonte Inter do Google Fonts -->
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
</style>
