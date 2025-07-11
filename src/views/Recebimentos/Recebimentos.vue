<template>
  <div>
    <MenuFixo />
    <div class="main-content">
      <h1 class="titulo-recebimentos">Recebimentos</h1>
      <FiltroLista @pesquisar="handlePesquisa" />
      
      <!-- Lista de Recebíveis -->
      <div class="lista-container">
        <ListaRecebiveis 
          ref="listaRecebiveisRef"
          :tipoFiltro="'recebiveis'"
          :dataInicio="filtros.dataInicio"
          :dataFinal="filtros.dataFinal"
          :termoPesquisa="termoPesquisa"
          @visualizar-recebivel="handleVisualizarRecebivel"
          @editar-recebivel="handleEditarRecebivel"
          @excluir-recebivel="handleExcluirRecebivel"
        />
      </div>
    </div>
    
    <!-- Modal com Form de Recebíveis -->
    <div v-if="formRecebiveisVisivel" class="modal-overlay">
      <FormsRecebiveis 
        :modo="modoFormRecebiveis"
        :dados-recebivel="recebivelSelecionado"
        @fechar="fecharFormRecebiveis"
        @salvar="salvarRecebivel"
        @recarregar="salvarRecebivel"
        @mostrar-alerta-sucesso="handleAlertaSucesso"
        @mostrar-alerta-erro="handleAlertaErro"
      />
    </div>

    <!-- Alerta de Erro -->
    <AlertaErro 
      v-if="alertaErroVisivel"
      titulo="Erro"
      :mensagem="mensagemErro"
      @fechar="fecharAlertaErro"
    />

    <!-- Alerta de Sucesso -->
    <AlertaSucesso 
      v-if="alertaSucessoVisivel"
      :mensagem="mensagemSucesso"
      @fechar="fecharAlertaSucesso"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import MenuFixo from '../../components/UI/MenuFixo.vue';
import FiltroLista from './filtro_lista.vue';
import ListaRecebiveis from '../Financeiro/listaRecebiveis.vue';
import FormsRecebiveis from '../Financeiro/formsRecebiveis.vue';
import AlertaErro from '../../components/UI/AlertaErro.vue';
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue';

const authStore = useAuthStore();
const router = useRouter();
const user = ref(null);
const termoPesquisa = ref('');
const listaRecebiveisRef = ref(null);

// Estados para o modal de recebíveis
const formRecebiveisVisivel = ref(false);
const modoFormRecebiveis = ref('criar'); // 'criar', 'editar' ou 'visualizar'
const recebivelSelecionado = ref(null);

// Estados para alertas
const alertaErroVisivel = ref(false);
const mensagemErro = ref('');
const alertaSucessoVisivel = ref(false);
const mensagemSucesso = ref('');

// Filtros para a lista
const filtros = ref({
  dataInicio: null,
  dataFinal: null
});

// Handler para pesquisa
const handlePesquisa = (termo) => {
  termoPesquisa.value = termo;
  console.log('Pesquisando recebíveis:', termo);
  // O filtro é aplicado automaticamente através da prop termoPesquisa
};

// === HANDLERS RECEBÍVEIS ===
const handleVisualizarRecebivel = (recebivel) => {
  console.log('Visualizando recebível:', recebivel);
  modoFormRecebiveis.value = 'visualizar';
  recebivelSelecionado.value = recebivel;
  formRecebiveisVisivel.value = true;
};

const handleEditarRecebivel = (recebivel) => {
  console.log('Editando recebível:', recebivel);
  modoFormRecebiveis.value = 'editar';
  recebivelSelecionado.value = recebivel;
  formRecebiveisVisivel.value = true;
};

const handleExcluirRecebivel = (recebivel) => {
  console.log('Recebível excluído:', recebivel);
  // A lista já se recarrega automaticamente após exclusão
};

// === HANDLERS DO MODAL ===
const fecharFormRecebiveis = () => {
  formRecebiveisVisivel.value = false;
  modoFormRecebiveis.value = 'criar';
  recebivelSelecionado.value = null;
};

const salvarRecebivel = () => {
  // Recarregar a lista de recebíveis
  if (listaRecebiveisRef.value) {
    listaRecebiveisRef.value.recarregar();
  }
  
  // Fechar o form após salvar
  fecharFormRecebiveis();
};

// === HANDLERS DOS ALERTAS ===
const handleAlertaSucesso = (mensagem) => {
  mensagemSucesso.value = mensagem;
  alertaSucessoVisivel.value = true;
};

const handleAlertaErro = (mensagem) => {
  mensagemErro.value = mensagem;
  alertaErroVisivel.value = true;
};

const fecharAlertaErro = () => {
  alertaErroVisivel.value = false;
  mensagemErro.value = '';
};

const fecharAlertaSucesso = () => {
  alertaSucessoVisivel.value = false;
  mensagemSucesso.value = '';
};

// Função para recarregar a lista (pode ser chamada externamente)
const recarregarLista = () => {
  if (listaRecebiveisRef.value) {
    listaRecebiveisRef.value.recarregar();
  }
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
  } catch (error) {
    console.error('Erro ao carregar recebimentos:', error);
  }
});

// Expor funções para uso externo se necessário
defineExpose({
  recarregarLista
});
</script>

<style scoped>
/* Desktop Layout */
@media (min-width: 769px) {
  .main-content {
    margin-left: auto;
    margin-right: auto;
    padding: 0px 16px 32px 16px; /* Mesmo padding do MenuFixo (px-4 = 16px) */
    background: white;
    min-height: 100vh;
    max-width: 1280px; /* Mesmo max-width do MenuFixo */
  }
}

/* Mobile Layout */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-right: 0;
    padding: 16px 12px;
    background: white;
    min-height: 100vh;
    max-width: 100%;
    padding-top: 0; /* Remove top padding para ficar logo abaixo do HeaderMobile */
  }
}

.titulo-recebimentos {
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: 600;
  color: #101828;
  margin: 0;
  text-align: left;
  line-height: 1.2;
}

/* Responsivo para mobile */
@media (max-width: 768px) {
  .titulo-recebimentos {
    font-size: 32px;
  }
}

@media (max-width: 480px) {
  .titulo-recebimentos {
    font-size: 28px;
  }
}

/* Container da lista - mesma largura que o filtro */
.lista-container {
  width: 100%;
  margin-top: 24px;
}

/* Sobrescrever largura fixa do componente listaRecebiveis para usar toda a largura disponível */
.lista-container :deep(.lista-recebiveis-container) {
  width: 100% !important;
  max-width: none !important;
}

/* Responsivo para a lista */
@media (max-width: 768px) {
  .lista-container {
    margin-top: 16px;
  }
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow: visible !important;
}
</style> 