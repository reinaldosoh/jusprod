<template>
  <div>
    <MenuFixo />
    <FiltroPasta 
      @search="handleSearch"
      @nova-pasta="handleNovaPasta"
      @pasta-criada="handlePastaCriada"
    />
    <div class="lista-spacing">
      <ListaPastas 
        :searchTerm="searchTerm" 
        @pasta-selecionada="handlePastaSelecionada"
        @editar-pasta="handleEditarPasta"
        ref="listaPastasRef"
      />
    </div>

    <!-- Modal Editar Pasta -->
    <EditarPasta 
      v-if="mostrarModalEditarPasta && pastaParaEditar"
      :pasta-id="pastaParaEditar.pastaId"
      :nome-atual="pastaParaEditar.titulo"
      @close="fecharModalEditarPasta"
      @pasta-editada-sucesso="handlePastaEditadaSucesso"
    />

    <!-- Alerta de Sucesso para Edição -->
    <AlertaSucesso 
      v-if="mostrarSucessoEdicao"
      mensagem="Pasta editada com sucesso!"
      @fechar="fecharSucessoEdicao"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FiltroPasta from './filtroPasta.vue'
import ListaPastas from './listaPastas.vue'
import EditarPasta from './editarPasta.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import MenuFixo from '../../components/UI/MenuFixo.vue'

const searchTerm = ref('')
const pastaSelecionada = ref(null)
const listaPastasRef = ref(null)
const mostrarModalEditarPasta = ref(false)
const pastaParaEditar = ref(null)
const mostrarSucessoEdicao = ref(false)

const handleSearch = (term) => {
  searchTerm.value = term
  console.log('Pesquisando por:', term)
}

const handleNovaPasta = () => {
  console.log('Abrindo modal para nova pasta')
  // Aqui você pode implementar a lógica para abrir um modal de nova pasta
}

const handlePastaCriada = () => {
  console.log('Pasta criada, recarregando lista...')
  recarregarPastas()
}

const handleEditarPasta = (pastaInfo) => {
  console.log('Abrindo modal para editar pasta:', pastaInfo)
  pastaParaEditar.value = pastaInfo
  mostrarModalEditarPasta.value = true
}

const fecharModalEditarPasta = () => {
  mostrarModalEditarPasta.value = false
  pastaParaEditar.value = null
}

const handlePastaEditadaSucesso = () => {
  mostrarSucessoEdicao.value = true
}

const fecharSucessoEdicao = () => {
  mostrarSucessoEdicao.value = false
  recarregarPastas()
}

const handlePastaSelecionada = (pastaInfo) => {
  pastaSelecionada.value = pastaInfo
  console.log('Pasta selecionada:', pastaInfo)
  
  // Aqui você pode implementar a lógica para carregar documentos da pasta selecionada
  // Por exemplo, carregar documentos do sistema se for "Modelos Jusprod"
  // ou carregar documentos do usuário filtrados por pasta_id
}

// Função para recarregar a lista após criar nova pasta
const recarregarPastas = () => {
  if (listaPastasRef.value) {
    listaPastasRef.value.recarregar()
  }
}

// Expor função para outros componentes
defineExpose({
  recarregarPastas
})
</script>

<style scoped>
.lista-spacing {
  padding-top: 24px;
}
</style> 