<template>
  <div class="clientes-view">
    <!-- Filtro de clientes -->
    <filtro-cliente 
      @view-change="handleViewChange" 
      @filter-change="handleFilterChange"
      @new-client="handleNewClient"
    />
    
    <!-- Componente Kanban ou Lista dependendo da visualização selecionada -->
    <kanbam 
      v-if="currentView === 'kanban'" 
      :filtroFavoritos="filtroFavoritos"
      :filtroAtivo="filtroAtivo"
    />
    <lista-clientes 
      v-else-if="currentView === 'list'" 
      :filtroFavoritos="filtroFavoritos"
      :filtroAtivo="filtroAtivo"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import filtroCliente from './filtro_cliente.vue'
import kanbam from './kanbam.vue'
import listaClientes from '../../components/UI/listaClientes.vue'

// Estado para controlar a visualização atual
const currentView = ref('kanban')
// Estado para controlar os filtros
const filtroFavoritos = ref(false)
const filtroAtivo = ref({
  tipo: 'nome',
  valor: ''
})

// Função para alternar entre visualizações
const handleViewChange = (view) => {
  currentView.value = view
}

// Função para lidar com mudanças de filtro
const handleFilterChange = (filter) => {
  console.log('Filtro alterado:', filter)
  
  // Verificar se é um filtro de favoritos
  if (filter.type === 'favorites') {
    filtroFavoritos.value = filter.value
    console.log('Filtro de favoritos atualizado:', filtroFavoritos.value)
    return
  }
  
  // Verificar se é uma seleção de opção do dropdown
  if (filter.id) {
    // Resetar o valor do filtro quando mudar o tipo
    filtroAtivo.value = {
      tipo: filter.label.toLowerCase(),
      valor: ''
    }
    console.log('Tipo de filtro alterado para:', filtroAtivo.value.tipo)
    return
  }
  
  // Filtro de busca com valor digitado
  if (filter.type && filter.value !== undefined) {
    filtroAtivo.value = {
      tipo: filter.type,
      valor: filter.value
    }
    console.log('Filtro aplicado:', filtroAtivo.value)
  }
}

// Função para lidar com o clique no botão de novo cliente
const handleNewClient = () => {
  console.log('Novo cliente clicado')
  // Implementar abertura do modal/página de novo cliente
}
</script>

<style scoped>
.clientes-view {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}
</style>
