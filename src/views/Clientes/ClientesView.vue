<template>
  <div class="clientes-view">
    <!-- Filtro de clientes -->
    <filtro-cliente 
      @view-change="handleViewChange" 
      @filter-change="handleFilterChange"
      @new-client="handleNewClient"
      @client-saved="clienteFoiSalvo"
    />
    
    <!-- Componente Kanban ou Lista dependendo da visualização selecionada -->
    <kanbam 
      v-if="currentView === 'kanban'" 
      :filtroFavoritos="filtroFavoritos"
      :filtroAtivo="filtroAtivo"
      ref="kanbamRef"
    />
    <lista-clientes 
      v-else-if="currentView === 'list'" 
      :filtroFavoritos="filtroFavoritos"
      :filtroAtivo="filtroAtivo"
      ref="listaClientesRef"
    />
    
    <!-- Modal de Formulário de Cliente -->
    <formulario-pf
      v-if="mostrarFormulario"
      @close="fecharFormulario"
      @clienteSalvo="clienteFoiSalvo"
    />

    <!-- Alerta de Sucesso -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucesso" 
      :mensagem="mensagemSucesso" 
      @fechar="fecharAlertaSucesso"
    />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import filtroCliente from './filtro_cliente.vue'
import kanbam from './kanbam.vue'
import listaClientes from '../../components/UI/listaClientes.vue'
import formularioPF from './FormularioPF.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'

// Estado para controlar a visualização atual
const currentView = ref('kanban')
// Estado para controlar os filtros
const filtroFavoritos = ref(false)
const filtroAtivo = ref({
  tipo: 'nome',
  valor: ''
})
// Referências para componentes
const kanbamRef = ref(null)
const listaClientesRef = ref(null)
// Estado para controlar a exibição do formulário
const mostrarFormulario = ref(false)
// Estado para controlar o alerta de sucesso
const mostrarAlertaSucesso = ref(false)
const mensagemSucesso = ref('')

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
  mostrarFormulario.value = true
}

// Fechar o formulário
const fecharFormulario = () => {
  mostrarFormulario.value = false
}

// Função chamada quando um cliente é salvo com sucesso
const clienteFoiSalvo = async (dadosCliente) => {
  console.log('Cliente foi salvo com sucesso:', dadosCliente)
  
  // Configurar mensagem de sucesso
  mensagemSucesso.value = dadosCliente.mensagem || 'Cliente cadastrado com sucesso!'
  
  // Esperar o DOM ser atualizado
  await nextTick()
  
  // Atualizar a lista de clientes ou o kanban dependendo da visualização atual
  if (currentView.value === 'kanban' && kanbamRef.value) {
    kanbamRef.value.carregarClientes()
  } else if (currentView.value === 'list' && listaClientesRef.value) {
    listaClientesRef.value.recarregarClientes()
  }
  
  // Mostrar alerta de sucesso após atualizar as listas
  mostrarAlertaSucesso.value = true
}

// Função para fechar o alerta de sucesso
const fecharAlertaSucesso = () => {
  mostrarAlertaSucesso.value = false
  mensagemSucesso.value = ''
}
</script>

<style scoped>
.clientes-view {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}
</style>
