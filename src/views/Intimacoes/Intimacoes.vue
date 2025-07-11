<template>
  <div>
    <MenuFixo />
    <div class="intimacoes-container">
      <FiltroIntimacao 
        @search="handleSearch" 
        @reset="handleReset"
        :initial-search-term="searchTerm"
      />
      <ListaIntimacoes :search-term="searchTerm" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MenuFixo from '../../components/UI/MenuFixo.vue'
import FiltroIntimacao from '../../components/UI/FiltroIntimacao.vue'
import ListaIntimacoes from './listaintimacoes.vue'

const route = useRoute()
const router = useRouter()
const searchTerm = ref('')

const handleSearch = (termo) => {
  searchTerm.value = termo
}

const handleReset = () => {
  console.log('🔄 Reset acionado - limpando filtros')
  searchTerm.value = ''
  
  // Limpar query CNJ da URL se existir
  if (route.query.cnj) {
    router.replace({
      name: 'intimacoes',
      query: {}
    })
  }
}

// Verificar se há CNJ na query string ao montar o componente
onMounted(() => {
  console.log('🔍 Intimacoes.vue montado. Query CNJ:', route.query.cnj)
  if (route.query.cnj) {
    searchTerm.value = route.query.cnj
    console.log('✅ SearchTerm definido para:', searchTerm.value)
  }
})

// Observar mudanças na rota para atualizar filtro
watch(() => route.query.cnj, (newCnj) => {
  console.log('🔄 Query CNJ alterada para:', newCnj)
  if (newCnj) {
    searchTerm.value = newCnj
  } else if (!newCnj && searchTerm.value) {
    // Se o CNJ foi removido da query, limpar apenas se o atual for igual ao anterior
    searchTerm.value = ''
  }
})
</script>

<style scoped>
.intimacoes-container {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>