<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
    <div class="flex items-center justify-between">
      <!-- Informações do processo -->
      <div class="flex-1">
        <h3 class="font-medium text-gray-900">{{ processo.nome || 'Processo sem nome' }}</h3>
        <p class="text-sm text-gray-600 mt-1">
          <span class="font-medium">Número:</span> {{ processo.id }}
        </p>
        <p class="text-sm text-gray-600">
          <span class="font-medium">Autor:</span> {{ processo.autor || 'Não informado' }}
        </p>
        <p class="text-sm text-gray-600">
          <span class="font-medium">Réu:</span> {{ processo.reu || 'Não informado' }}
        </p>
      </div>

      <!-- Status e ações -->
      <div class="flex items-center gap-3">
        <!-- Badge de status -->
        <span 
          class="px-2 py-1 text-xs font-medium rounded-full"
          :class="processo.arquivado ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'"
        >
          {{ processo.arquivado ? 'Arquivado' : 'Ativo' }}
        </span>

        <!-- Botões de ação -->
        <div class="flex gap-2">
          <button
            v-if="processo.arquivado"
            @click="ativar"
            :disabled="operandoProcesso || (!podeAtivar && noLimite)"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            :class="podeAtivar || !noLimite 
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            :title="!podeAtivar && noLimite ? 'Limite de processos atingido. Faça upgrade do plano.' : ''"
          >
            <span v-if="operandoProcesso">...</span>
            <span v-else>Ativar</span>
          </button>

          <button
            v-else
            @click="arquivar"
            :disabled="operandoProcesso"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <span v-if="operandoProcesso">...</span>
            <span v-else>Arquivar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Alerta quando não pode ativar -->
    <div 
      v-if="processo.arquivado && !podeAtivar && noLimite"
      class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md"
    >
      <div class="flex items-center">
        <AlertTriangle class="h-4 w-4 text-red-500 mr-2" />
        <p class="text-sm text-red-700">
          Limite de processos ativos atingido ({{ statusProcessos.processos_ativos }}/{{ statusProcessos.max_processos }}).
          <router-link 
            to="/planos" 
            class="font-medium underline hover:no-underline"
          >
            Faça upgrade do seu plano
          </router-link> 
          para ativar mais processos.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { AlertTriangle } from 'lucide-vue-next';
import { useProcessos } from '../composables/useProcessos';

// Props
const props = defineProps({
  processo: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['atualizado']);

// Composable
const { 
  statusProcessos, 
  operandoProcesso, 
  ativarProcesso, 
  arquivarProcesso,
  noLimite 
} = useProcessos();

// Computed
const podeAtivar = computed(() => 
  statusProcessos.value.pode_ativar_processo
);

// Funções
const ativar = async () => {
  try {
    await ativarProcesso(props.processo.id);
    emit('atualizado');
  } catch (error) {
    console.error('Erro ao ativar processo:', error);
    // Aqui você pode mostrar uma notificação de erro
    alert(error.message);
  }
};

const arquivar = async () => {
  try {
    await arquivarProcesso(props.processo.id);
    emit('atualizado');
  } catch (error) {
    console.error('Erro ao arquivar processo:', error);
    // Aqui você pode mostrar uma notificação de erro
    alert(error.message);
  }
};
</script> 