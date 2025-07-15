<template>
  <div class="page-container">
    <!-- Menu Fixo (já inclui HeaderMobile para mobile) -->
    <MenuFixo />
    
    <div class="main-content">
      <!-- Filtro de alertas -->
      <Filtro 
        @filtro-alterado="handleFiltroAlterado"
        @pesquisa-alterada="handlePesquisaAlterada"
      />
      
      <!-- Lista de alertas -->
      <div class="mt-6">
        <ListaAlertas 
          :filtro="filtroAtivo"
          :termo-pesquisa="termoPesquisa"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MenuFixo from '../../components/UI/MenuFixo.vue';
import Filtro from './filtro.vue';
import ListaAlertas from './listaAlertas.vue';

// Estados reativos
const filtroAtivo = ref('nao-lidas');
const termoPesquisa = ref('');

// Funções para lidar com eventos do filtro
const handleFiltroAlterado = (novoFiltro) => {
  filtroAtivo.value = novoFiltro;
  console.log('Filtro alterado para:', novoFiltro);
  // Aqui você pode adicionar lógica para filtrar os alertas
};

const handlePesquisaAlterada = (novaPesquisa) => {
  termoPesquisa.value = novaPesquisa;
  console.log('Pesquisa alterada para:', novaPesquisa);
  // Aqui você pode adicionar lógica para pesquisar os alertas
};
</script>

<style scoped>
/* Base styles - Mobile First */
.page-container {
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
}

.main-content {
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
  padding: 16px 12px 32px 12px;
  margin: 0;
}

/* Mobile Layout */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-right: 0;
    padding: 16px 12px;
    background: white;
    min-height: 100vh;
    max-width: 100%;
    padding-top: 0; /* Remove top padding para ficar logo abaixo do HeaderMobile */
  }
}

/* Desktop Layout */
@media (min-width: 769px) {
  .main-content {
    margin-left: auto;
    margin-right: auto;
    padding: 0px 16px 32px 16px; /* Mesmo padding do MenuFixo (px-4 = 16px) */
    background: white;
    min-height: 100vh;
    max-width: 1280px; /* Mesmo max-width do MenuFixo */
  }
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-content {
    padding: 0px 16px 32px 16px;
  }
}

/* Smooth transitions for all screen sizes */
.main-content {
  transition: all 0.3s ease;
}

/* Ensure proper overflow handling */
.page-container {
  overflow-x: hidden;
}

.main-content {
  overflow-x: hidden;
}

/* Better accessibility for touch devices */
@media (hover: none) and (pointer: coarse) {
  .main-content {
    -webkit-tap-highlight-color: transparent;
  }
}
</style> 