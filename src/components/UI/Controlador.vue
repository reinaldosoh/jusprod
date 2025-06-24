<!-- Componente Controlador para exibir informações de uso e plano -->
<template>
  <div class="flex items-center text-gray-600 gap-4">
    <!-- Ícone à esquerda -->
    <PieChart class="w-5 h-5 text-gray-500" />
    
    <!-- Área central: texto e barra de progresso verticalmente -->
    <div class="flex flex-col gap-1">
      <!-- Texto principal -->
      <span class="text-sm font-medium whitespace-nowrap">
        Uso {{ statusProcessos.processos_ativos }} de {{ statusProcessos.max_processos }} processos
      </span>
      
      <!-- Barra de progresso embaixo -->
      <div class="w-32 h-2 bg-gray-200 rounded-full">
        <div 
          class="h-full rounded-full transition-colors duration-300" 
          :class="corBarraProgresso"
          :style="{ width: progressWidth }"
        ></div>
      </div>
    </div>
    
    <!-- Informações do plano à direita verticalmente -->
    <div class="flex flex-col gap-0 text-xs">
      <span class="text-gray-500 font-medium whitespace-nowrap">
        Plano atual: {{ formatarNomePlano(statusProcessos.plano_nome) }}
      </span>
      <span 
        class="text-blue-500 font-medium cursor-pointer hover:text-blue-700 transition-colors whitespace-nowrap"
        @click="onUpgradeClick"
      >
        Fazer upgrade
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { PieChart } from 'lucide-vue-next';
import { useProcessos } from '../../composables/useProcessos';

const router = useRouter();
const { 
  statusProcessos, 
  carregandoStatus, 
  carregarStatus, 
  autoInicializar 
} = useProcessos();

// Auto inicializar carregamento do status
autoInicializar({ carregarStatus: true, carregarProcessos: false });

// Calcula a largura da barra de progresso
const progressWidth = computed(() => {
  const atual = statusProcessos.value.processos_ativos;
  const max = statusProcessos.value.max_processos;
  const percentage = max > 0 ? (atual / max) * 100 : 0;
  return `${Math.min(percentage, 100)}%`;
});

// Calcula a cor da barra de progresso
const corBarraProgresso = computed(() => {
  const disponiveis = statusProcessos.value.processos_disponiveis;
  
  // Se restam 5 ou menos processos, fica vermelho
  if (disponiveis <= 5) {
    return 'bg-red-500';
  }
  
  // Caso contrário, fica azul
  return 'bg-blue-500';
});

// Formatar nome do plano para primeira letra maiúscula
const formatarNomePlano = (nome) => {
  if (!nome) return 'Free';
  return nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
};

// Função para lidar com o clique no botão de upgrade
const onUpgradeClick = () => {
  router.push({ name: 'planos' });
};

// Expor função para recarregar status (caso o componente pai precise)
const recarregarStatus = async () => {
  await carregarStatus();
};

// Expor para o template se necessário
defineExpose({
  recarregarStatus
});
</script>

<style scoped>
/* Estilos específicos para garantir o layout correto */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.gap-0 {
  gap: 0;
}

.gap-1 {
  gap: 0.25rem;
}

.gap-4 {
  gap: 1rem;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.transition-colors {
  transition: color 0.15s ease-in-out;
}
</style>
