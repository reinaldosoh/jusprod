<template>
  <div class="editar-valor-card">
    <!-- Ícone da moeda -->
    <img src="/images/moeda.svg" alt="Moeda" width="20" height="20" class="icone-moeda">
    
    <!-- Texto do valor -->
    <span class="valor-texto">Valor da causa: {{ valorFormatado }}</span>
    
    <!-- Botão de editar -->
    <button class="btn-editar-valor" @click="abrirModalValor" title="Editar valor">
      <img src="/images/editValor.svg" alt="Editar valor" width="20" height="20">
    </button>

    <!-- Modal de atualizar valor -->
    <AtualizarValor
      v-if="showModalValor"
      :processo-id="processoId"
      :valor-atual="valorCausa"
      @close="fecharModalValor"
      @valor-atualizado="handleValorAtualizado"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AtualizarValor from './atualizar_valor.vue'

const props = defineProps({
  processoId: {
    type: Number,
    required: true
  },
  valorCausa: {
    type: [Number, String],
    default: 0
  }
})

const emit = defineEmits(['valor-atualizado'])

// Estado do modal
const showModalValor = ref(false)

// Formatar valor em moeda brasileira
const valorFormatado = computed(() => {
  const valor = Number(props.valorCausa) || 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
})

// Funções do modal
const abrirModalValor = () => {
  showModalValor.value = true
}

const fecharModalValor = () => {
  showModalValor.value = false
}

const handleValorAtualizado = (novoValor) => {
  emit('valor-atualizado', novoValor)
  fecharModalValor()
}
</script>

<style scoped>
.editar-valor-card {
  width: 380px;
  height: 60px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.03);
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.icone-moeda {
  flex-shrink: 0;
}

.valor-texto {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  flex: 1;
}

.btn-editar-valor {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.btn-editar-valor:hover {
  background-color: #f3f4f6;
}
</style> 