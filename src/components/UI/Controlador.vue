<!-- Componente Controlador para exibir informações de uso e plano -->
<template>
  <div class="flex items-center text-gray-600 gap-4">
    <!-- Ícone à esquerda -->
    <PieChart class="w-5 h-5 text-gray-500" />
    
    <!-- Área central: texto e barra de progresso verticalmente -->
    <div class="flex flex-col gap-1">
      <!-- Texto principal -->
      <span class="text-sm font-medium whitespace-nowrap">
        <template v-if="dadosCarregados">
          Uso {{ statusProcessos.processos_ativos }} de {{ statusProcessos.max_processos }} processos
        </template>
        <template v-else>
          <div class="flex items-center gap-2">
            <div class="animate-spin w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full"></div>
            <span>Carregando dados...</span>
          </div>
        </template>
      </span>
      
      <!-- Barra de progresso -->
      <div style="width: 10rem; height: 0.75rem; background-color: #d1d5db; border-radius: 9999px; overflow: hidden;">
        <div 
          :style="{ 
            width: dadosCarregados ? progressWidth : '0%',
            height: '100%',
            backgroundColor: corBarraProgresso,
            borderRadius: '9999px',
            transition: 'width 0.5s ease-out, background-color 0.3s ease-out'
          }"
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { PieChart } from 'lucide-vue-next';
import { useProcessos } from '../../composables/useProcessos';
import { supabase } from '../../lib/supabase';
import { eventBus, EVENTS } from '../../utils/eventBus';

const router = useRouter();
const { 
  statusProcessos, 
  carregandoStatus, 
  carregarStatus
} = useProcessos();

// Controle de dados carregados
const dadosCarregados = ref(false);
const ultimaAtualizacao = ref(0);

// Cache de 30 segundos para evitar recarregamentos desnecessários
const CACHE_DURATION = 30000;

// Inicializar dados padrão
statusProcessos.value = {
  processos_ativos: 0,
  max_processos: 5,
  processos_disponiveis: 5,
  pode_ativar_processo: true,
  plano_nome: 'free'
};

// Função direta para carregar dados (com cache)
const carregarDadosDireto = async () => {
  try {
    // Verificar cache - só recarregar se passou mais de 30 segundos
    const agora = Date.now();
    if (dadosCarregados.value && (agora - ultimaAtualizacao.value) < CACHE_DURATION) {
      return; // Usar dados em cache
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      dadosCarregados.value = false;
      return;
    }

    const { processoService } = await import('../../services/processoService');
    const novoStatus = await processoService.obterStatusProcessos();
    
    if (novoStatus && typeof novoStatus.processos_ativos === 'number') {
      statusProcessos.value = novoStatus;
      dadosCarregados.value = true;
      ultimaAtualizacao.value = agora;
    } else {
      dadosCarregados.value = false;
    }
  } catch (error) {
    console.error('Erro ao carregar dados do controlador:', error);
    dadosCarregados.value = false;
  }
};

// Handler para atualização automática (força refresh)
const onProcessoMonitorado = async () => {
  // Invalidar cache para forçar atualização
  ultimaAtualizacao.value = 0;
  await carregarDadosDireto();
};

// Carregar dados quando componente montar
onMounted(async () => {
  await carregarDadosDireto();
  
  // Timeout de segurança
  setTimeout(() => {
    if (!dadosCarregados.value) {
      dadosCarregados.value = true;
    }
  }, 3000);
  
  // Registrar listener para processo monitorado
  eventBus.on(EVENTS.PROCESSO_MONITORADO, onProcessoMonitorado);
});

// Limpar listener
onUnmounted(() => {
  eventBus.off(EVENTS.PROCESSO_MONITORADO, onProcessoMonitorado);
});

// Observar mudanças de autenticação (otimizado)
let authListener = null;
onMounted(() => {
  authListener = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session && !dadosCarregados.value) {
      await carregarDadosDireto();
    } else if (event === 'SIGNED_OUT') {
      dadosCarregados.value = false;
    }
  });
});

onUnmounted(() => {
  if (authListener) {
    authListener.data.subscription.unsubscribe();
  }
});

// Calcula a largura da barra de progresso
const progressWidth = computed(() => {
  if (!dadosCarregados.value) return '0%';
  
  const atual = statusProcessos.value.processos_ativos || 0;
  const max = statusProcessos.value.max_processos || 1;
  const percentage = Math.min((atual / max) * 100, 100);
  
  return `${percentage}%`;
});

// Calcula a cor da barra de progresso
const corBarraProgresso = computed(() => {
  if (!dadosCarregados.value) return '#9CA3AF'; // gray-400
  
  const atual = statusProcessos.value.processos_ativos || 0;
  const max = statusProcessos.value.max_processos || 1;
  const restantes = max - atual;
  
  // Vermelho se restam 5 ou menos processos, azul caso contrário
  return restantes <= 5 ? '#EF4444' : '#3B82F6'; // red-500 : blue-500
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

// Expor função para reload manual se necessário
defineExpose({
  recarregar: carregarDadosDireto
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
