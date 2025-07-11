<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import MenuFixo from '../../components/UI/MenuFixo.vue';
import CalendarioAgenda from './calendario_agenda.vue';
import FiltroFinanceiro from './filtro_financeiro.vue';
import CardDashboard from './card_dashboard.vue';
import UltimasIntimacoes from './ultimas_intimacoes.vue';

const authStore = useAuthStore();
const router = useRouter();
const user = ref(null);

// Estado do filtro financeiro
const filtroFinanceiro = ref({
  periodo: 'mes_atual',
  dataInicio: '',
  dataFim: ''
});

// Função para lidar com alterações no filtro financeiro
const handleFiltroFinanceiro = (novoFiltro) => {
  filtroFinanceiro.value = novoFiltro;
  console.log('📊 Filtro financeiro alterado:', novoFiltro);
};

onMounted(async () => {
  try {
    // Aguarda a inicialização da autenticação se necessário
    if (authStore.loading) {
      while (authStore.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (!authStore.isAuthenticated()) {
      router.push({ name: 'login' });
      return;
    }
    
    user.value = authStore.user;
    
    // Limpar qualquer parâmetro de URL (upgrade, plano, periodo)
    if (window.location.search) {
      router.replace({ name: 'dashboard' });
    }
    
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    router.push({ name: 'login' });
  }
});
</script>

<template>
  <div>
    <MenuFixo />
    
    <div class="main-content">
      <!-- ROW PRINCIPAL com duas colunas -->
      <div class="main-row">
        <!-- COLUNA 1: 70% do espaço - lado esquerdo -->
        <div class="col-esquerda">
          <!-- Row 1: Filtro financeiro alinhado à direita -->
          <div class="row-filtro">
            <FiltroFinanceiro @filtro-alterado="handleFiltroFinanceiro" />
          </div>
          
          <!-- Row 2: Cards do dashboard -->
          <div class="row-cards">
            <CardDashboard :filtro-financeiro="filtroFinanceiro" />
          </div>
          
          <!-- Row 3: Últimas intimações - 4 cards horizontais -->
          <div class="row-intimacoes">
            <UltimasIntimacoes />
          </div>
        </div>
        
        <!-- COLUNA 2: 30% do espaço - lado direito -->
        <div class="col-direita">
          <CalendarioAgenda />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

/* Desktop Layout - LAYOUT ESPECÍFICO SOLICITADO */
@media (min-width: 769px) {
  .main-content {
    margin-left: auto;
    margin-right: auto;
    padding: 32px 16px;
    background: white;
    min-height: 100vh;
    max-width: 1280px;
  }
  
  /* ROW PRINCIPAL com duas colunas */
  .main-row {
    display: flex;
    gap: 24px;
    width: 100%;
  }
  
  /* COLUNA 1: 70% do espaço - lado esquerdo */
  .col-esquerda {
    flex: 0 0 70%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  /* COLUNA 2: 30% do espaço - lado direito */
  .col-direita {
    flex: 0 0 calc(30% - 24px);
    display: flex;
    align-items: flex-start;
  }
  
  /* Row do filtro financeiro - alinhado à direita */
  .row-filtro {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }
  
  /* Row dos cards do dashboard */
  .row-cards {
    width: 100%;
  }
  
  /* Row das intimações */
  .row-intimacoes {
    width: 100%;
  }
}

/* Mobile Layout */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-right: 0;
    padding: 16px 12px 32px 12px;
    background: white;
    min-height: 100vh;
  }
  
  .main-row {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .col-esquerda {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .col-direita {
    width: 100%;
    order: -1; /* Calendário vai para cima no mobile */
  }
  
  .row-filtro {
    display: flex;
    justify-content: center;
  }
  
  .row-cards {
    width: 100%;
  }
  
  .row-intimacoes {
    width: 100%;
  }
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-content {
    padding: 20px 16px 32px 16px;
  }
  
  .main-row {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .col-esquerda {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .col-direita {
    width: 100%;
    display: flex;
    justify-content: center;
    order: -1; /* Calendário vai para cima no tablet */
  }
  
  .row-filtro {
    justify-content: center;
  }
}
</style>


