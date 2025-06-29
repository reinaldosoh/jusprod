<template>
  <div>
    <MenuFixo />
    <div class="main-content">
      <BotaoVoltar class="botao-voltar-posicao" />
      
      <div v-if="loading" class="loading-container">
        <p>Carregando dados do cliente...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="cliente" class="cliente-container">
        <div class="cliente-info">
          <CardDetalhe 
            :cliente="cliente" 
            @toggle-favorito="handleToggleFavorito"
            @editar="handleEditar"
            @conversar="handleConversar"
            @expandir="handleExpandir"
          />
        </div>
        
        <div class="cliente-tabs">
          <Tabs />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useClientes } from '../../../composables/useClientes'

import MenuFixo from '../../../components/UI/MenuFixo.vue'
import BotaoVoltar from './botaoVoltar.vue'
import CardDetalhe from './card_detalhe.vue'
import Tabs from './tabs.vue'

const route = useRoute()
const { buscarClientePorId, toggleFavorito, loading, error } = useClientes()

const cliente = ref(null)
const expandido = ref(false)

onMounted(async () => {
  const clienteId = route.params.id
  if (clienteId) {
    const resultado = await buscarClientePorId(clienteId)
    if (resultado.success) {
      cliente.value = resultado.data
    }
  }
})

const handleToggleFavorito = async () => {
  if (!cliente.value) return
  
  try {
    const result = await toggleFavorito(cliente.value.id, cliente.value.favorito)
    if (result.success) {
      cliente.value.favorito = !cliente.value.favorito
    }
  } catch (err) {
    console.error('Erro ao alterar favorito:', err)
  }
}

const handleEditar = () => {
  console.log('Editar cliente:', cliente.value.id)
  // Implementar lógica para editar cliente
}

const handleConversar = () => {
  console.log('Abrir conversa com cliente:', cliente.value.id)
  // Implementar lógica para abrir conversa
}

const handleExpandir = () => {
  expandido.value = !expandido.value
  console.log('Expandir detalhes:', expandido.value)
  // Implementar lógica para expandir detalhes
}</script>

<style scoped>
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  margin-left: 240px; /* Espaço para o menu fixo */
}

.botao-voltar-posicao {
  margin-bottom: 1.5rem;
}

.cliente-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.cliente-info {
  flex: 0 0 380px;
}

.cliente-tabs {
  flex: 1;
  min-width: 300px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 16px;
}

.error-container {
  padding: 1rem;
  background-color: #fee2e2;
  border-radius: 8px;
  color: #b91c1c;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-top: 60px; /* Espaço para o menu mobile */
  }
  
  .cliente-container {
    flex-direction: column;
  }
  
  .cliente-info {
    width: 100%;
    max-width: 100%;
  }
}
</style>
