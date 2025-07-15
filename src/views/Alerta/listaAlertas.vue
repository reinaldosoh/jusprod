<template>
  <div class="lista-alertas" style="background-color: #FFFFFF; padding: 1rem;">
    <div v-if="alertas.length === 0">
      <EmptyAlertas />
    </div>
    
    <div v-else class="alertas-container">
      <div 
        v-for="alerta in alertas" 
        :key="alerta.id"
        class="alerta-card"
        :class="{ 
          'alerta-card--nao-lido': !alerta.visualizado,
          'alerta-card--lido': alerta.visualizado
        }"
      >
        <!-- Primeira linha: Perfil, Título e Tempo -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start space-x-3">
            <!-- Coluna 1: Ícone do perfil -->
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <img src="/images/perfil_jus.svg" alt="Perfil" class="w-10 h-10">
            </div>
            
            <!-- Coluna 2: Título e @jusprod -->
            <div class="flex-1">
              <h3 class="font-semibold text-red-500 text-2xl">{{ alerta.titulo }}</h3>
              <div class="flex items-center space-x-1 mt-1">
                <p class="text-sm text-gray-500">@jusprod</p>
              </div>
            </div>
          </div>
          
          <!-- Tempo alinhado à direita -->
          <span class="text-sm text-gray-500">{{ formatarTempoRelativo(alerta.created_at) }}</span>
        </div>

        <!-- Informações do alerta -->
        <div class="alerta-info">
          <!-- Categoria -->
          <div class="flex items-center space-x-2 alerta-row">
            <img src="/images/categorias.svg" alt="Categoria" class="w-4 h-4">
            <span class="text-sm text-red-500 font-medium">{{ alerta.categoria_titulo || 'Sem categoria' }}</span>
          </div>

          <!-- Cliente e Processo na mesma linha -->
          <div class="flex items-center space-x-2 alerta-row">
            <img src="/images/user.svg" alt="Cliente" class="w-4 h-4">
            <span class="text-sm text-gray-600">{{ alerta.cliente_nome || 'Cliente não selecionado' }}</span>
            <img src="/images/balanca.svg" alt="Processo" class="w-4 h-4 ml-4">
            <span class="text-sm text-gray-600">{{ alerta.processo_cnj || 'Processo não selecionado' }}</span>
          </div>

          <!-- Data de notificação, data do evento e botão marcar como visualizado -->
          <div class="flex items-center justify-between alerta-row">
            <div class="flex items-center space-x-6">
              <div class="flex items-center space-x-2">
                <img src="/images/calendarioMarcado.svg" alt="Data notificação" class="w-4 h-4">
                <span class="text-sm text-gray-600">{{ formatarData(alerta.data_notificacao) }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <img src="/images/info.svg" alt="Data do evento" class="w-4 h-4">
                <span class="text-sm text-red-500">{{ formatarDataEvento(alerta.data_evento) }}</span>
              </div>
            </div>
            
            <!-- Botão "Marcar como visualizado" (só aparece se não visualizado) -->
            <div v-if="!alerta.visualizado">
              <button 
                @click="marcarComoVisualizado(alerta)"
                class="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <img src="/images/iconvisualizar.svg" alt="Visualizar" class="w-4 h-4">
                <span class="text-sm">Marcar como visualizado</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '../../lib/supabase';
import { useAlertas } from '../../composables/useAlertas';
import EmptyAlertas from '../../components/UI/empty_alertas.vue';

export default {
  name: 'ListaAlertas',
  components: {
    EmptyAlertas
  },
  props: {
    filtro: {
      type: String,
      default: 'nao-lidas'
    },
    termoPesquisa: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const alertas = ref([]);
    const loading = ref(false);
    const { marcarAlertaComoVisualizado } = useAlertas();

    const buscarAlertas = async () => {
      loading.value = true;
      try {
        let query = supabase
          .from('alerta')
          .select('*')
          .order('data_notificacao', { ascending: false });

        // Filtro por status de visualização
        if (props.filtro === 'nao-lidas') {
          query = query.eq('visualizado', false);
        } else if (props.filtro === 'lidas') {
          query = query.eq('visualizado', true);
        }

        // Filtro por termo de pesquisa
        if (props.termoPesquisa) {
          query = query.or(`titulo.ilike.%${props.termoPesquisa}%,mensagem.ilike.%${props.termoPesquisa}%,cliente_nome.ilike.%${props.termoPesquisa}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar alertas:', error);
          return;
        }

        // Buscar dados relacionados para cada alerta
        const alertasCompletos = await Promise.all(data.map(async alerta => {
          let dataEvento = null;
          
          // Buscar dados da agenda se houver agenda_id
          if (alerta.agenda_id) {
            const { data: agenda } = await supabase
              .from('agenda')
              .select('inicio, fim')
              .eq('id', alerta.agenda_id)
              .single();
            
            if (agenda && agenda.inicio) {
              dataEvento = agenda.inicio;
            }
          }
          
          // Buscar dados do recebível se houver recebiveis_id
          if (alerta.recebiveis_id) {
            const { data: recebiveis } = await supabase
              .from('recebiveis')
              .select('data_lancamento')
              .eq('id', alerta.recebiveis_id)
              .single();
            
            if (recebiveis && recebiveis.data_lancamento) {
              dataEvento = recebiveis.data_lancamento;
            }
          }

          return {
            ...alerta,
            data_evento: dataEvento
          };
        }));

        alertas.value = alertasCompletos;

      } catch (error) {
        console.error('Erro ao buscar alertas:', error);
      } finally {
        loading.value = false;
      }
    };

    const marcarComoVisualizado = async (alerta) => {
      if (!alerta.visualizado) {
        try {
          // Usar o composable para marcar como visualizado
          const sucesso = await marcarAlertaComoVisualizado(alerta.id);
          
          if (sucesso) {
            // Recarregar a lista para atualizar o estado
            await buscarAlertas();
          }
        } catch (error) {
          console.error('Erro ao marcar alerta como visualizado:', error);
        }
      }
    };

    const formatarData = (data) => {
      if (!data) return 'Data não disponível';
      
      try {
        const date = new Date(data);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return 'Data inválida';
      }
    };

    const formatarDataEvento = (data) => {
      if (!data) return 'Data não disponível';
      
      try {
        const date = new Date(data);
        const dataFormatada = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const horaFormatada = date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        return `${dataFormatada} - ${horaFormatada}h`;
      } catch (error) {
        return 'Data inválida';
      }
    };

    const formatarTempoRelativo = (data) => {
      if (!data) return '';
      
      try {
        const agora = new Date();
        const dataAlerta = new Date(data);
        const diferencaMs = agora - dataAlerta;
        
        const minutos = Math.floor(diferencaMs / (1000 * 60));
        const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
        const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
        
        if (minutos < 60) {
          return `${minutos}min atrás`;
        } else if (horas < 24) {
          return `${horas}h atrás`;
        } else {
          return `${dias}d atrás`;
        }
      } catch (error) {
        return '';
      }
    };

    // Recarregar quando filtro ou termo de pesquisa mudar
    watch([() => props.filtro, () => props.termoPesquisa], () => {
      buscarAlertas();
    });

    onMounted(() => {
      buscarAlertas();
    });

    return {
      alertas,
      loading,
      marcarComoVisualizado,
      formatarData,
      formatarDataEvento,
      formatarTempoRelativo
    };
  }
};
</script>

<style scoped>
.lista-alertas {
  width: 100%;
  background-color: #FFFFFF;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}



.alertas-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alerta-card {
  background: #FFFFFF;
  border: 1px solid #D6D6D7;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;
  height: 190px;
}

.alerta-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.alerta-card--nao-lido {
  border-left: 4px solid #EF4444;
  padding-left: 1.75rem;
}

.alerta-card--nao-lido::before {
  content: '';
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  width: 8px;
  height: 8px;
  background: #EF4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
  z-index: 1;
}

.alerta-card--lido {
  border-left: 4px solid #0468FA;
  padding-left: 1.75rem;
}

.alerta-card--lido::before {
  content: '';
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  width: 8px;
  height: 8px;
  background: #0468FA;
  border-radius: 50%;
  z-index: 1;
}

.alerta-info {
  margin-left: 52px;
}

.alerta-card--nao-lido .alerta-info,
.alerta-card--lido .alerta-info {
  margin-left: 44px;
}

.alerta-row {
  margin-bottom: 12px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Ajustes para o conteúdo dos alertas */
.alerta-card .flex {
  display: flex;
}

.alerta-card .items-start {
  align-items: flex-start;
}

.alerta-card .items-center {
  align-items: center;
}

.alerta-card .justify-between {
  justify-content: space-between;
}

.alerta-card .justify-end {
  justify-content: flex-end;
}

.alerta-card .space-x-1 > * + * {
  margin-left: 0.25rem;
}

.alerta-card .space-x-2 > * + * {
  margin-left: 0.5rem;
}

.alerta-card .space-x-3 > * + * {
  margin-left: 0.75rem;
}

.alerta-card .space-x-6 > * + * {
  margin-left: 1.5rem;
}

.alerta-card .flex-1 {
  flex: 1;
}

.alerta-card .flex-shrink-0 {
  flex-shrink: 0;
}

.alerta-card .w-2 {
  width: 0.5rem;
}

.alerta-card .h-2 {
  height: 0.5rem;
}

.alerta-card .w-4 {
  width: 1rem;
}

.alerta-card .h-4 {
  height: 1rem;
}

.alerta-card .w-5 {
  width: 1.25rem;
}

.alerta-card .h-5 {
  height: 1.25rem;
}

.alerta-card .w-10 {
  width: 2.5rem;
}

.alerta-card .h-10 {
  height: 2.5rem;
}

.alerta-card .bg-blue-100 {
  background-color: #DBEAFE;
}

.alerta-card .bg-purple-500 {
  background-color: #8B5CF6;
}

.alerta-card .rounded-full {
  border-radius: 9999px;
}

.alerta-card .font-semibold {
  font-weight: 600;
}

.alerta-card .font-medium {
  font-weight: 500;
}

.alerta-card .text-base {
  font-size: 1rem;
}

.alerta-card .text-sm {
  font-size: 0.875rem;
}

.alerta-card .text-purple-700 {
  color: #7C3AED;
}

.alerta-card .text-gray-500 {
  color: #6B7280;
}

.alerta-card .text-gray-600 {
  color: #4B5563;
}

.alerta-card .text-red-500 {
  color: #EF4444;
}

.alerta-card .text-blue-600 {
  color: #2563EB;
}

.alerta-card .text-blue-800 {
  color: #1E40AF;
}

.alerta-card .hover\:text-blue-800:hover {
  color: #1E40AF;
}

.alerta-card .transition-colors {
  transition: color 0.2s ease;
}

.alerta-card .mb-4 {
  margin-bottom: 1rem;
}

.alerta-card .mt-1 {
  margin-top: 0.25rem;
}

.alerta-card .mt-3 {
  margin-top: 0.75rem;
}

.alerta-card .ml-4 {
  margin-left: 1rem;
}

.alerta-card button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.alerta-card button:hover {
  opacity: 0.8;
}

/* Responsivo */
@media (max-width: 768px) {
  .lista-alertas {
    padding: 0.5rem;
  }
  
  .alertas-container {
    gap: 0.75rem;
  }
  
  .alerta-card {
    padding: 1rem;
    height: auto; /* Remove altura fixa no mobile */
    min-height: 160px; /* Altura mínima menor para mobile */
  }
  
  /* Ajusta o layout das datas para mobile */
  .alerta-card .flex.items-center.justify-between.alerta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .alerta-card .flex.items-center.justify-between.alerta-row > div:first-child {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  /* Ajusta o espaçamento entre datas no mobile */
  .alerta-card .space-x-6 > * + * {
    margin-left: 0;
  }
  
  /* Ajusta o botão para mobile */
  .alerta-card .flex.items-center.justify-between.alerta-row > div:last-child {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  
  /* Reduz espaçamento dos cards no mobile */
  .alerta-info {
    margin-left: 40px;
  }
  
  .alerta-card--nao-lido .alerta-info,
  .alerta-card--lido .alerta-info {
    margin-left: 36px;
  }
}

/* Ajustes para telas muito pequenas (smartphones) */
@media (max-width: 480px) {
  .alerta-card {
    padding: 0.75rem;
    min-height: 140px;
  }
  
  .alerta-card .flex.items-start.justify-between.mb-4 {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .alerta-card .flex.items-start.justify-between.mb-4 > span {
    align-self: flex-start;
    margin-top: 0.25rem;
  }
  
  .alerta-card .text-2xl {
    font-size: 1.25rem; /* Reduz tamanho do título em telas muito pequenas */
  }
  
  .alerta-info {
    margin-left: 32px;
  }
  
  .alerta-card--nao-lido .alerta-info,
  .alerta-card--lido .alerta-info {
    margin-left: 28px;
  }
  
  /* Ajusta o botão para ser mais compacto */
  .alerta-card button span {
    font-size: 0.75rem;
  }
}
</style> 