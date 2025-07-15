<template>
  <div class="page-container">
    <!-- Menu é exibido apenas em desktop -->
    <MenuFixo class="desktop-only" />
    
    <!-- Header Mobile -->
    <div class="mobile-header">
      <button class="back-button" @click="goBack">
        <img src="/images/voltar.svg" alt="Voltar" />
      </button>
      <h1 class="mobile-title">Meu perfil</h1>
      <div class="header-spacer"></div>
    </div>
    
    <div class="main-content">
      <!-- Título Desktop -->
      <h1 class="desktop-title">Meu perfil</h1>
      
      <!-- Layout Responsivo -->
      <div class="profile-layout">
        <!-- Dados do Usuário/Escritório -->
        <div class="profile-section">
          <DadosUserEscritorio 
            @abrir-cadastro-escritorio="abrirCadastroEscritorio"
            @editar-usuario="editarUsuario"
            @visualizar-logotipo="visualizarLogotipo"
            @copiar-dados="copiarDados"
            @excluir-conta="excluirConta"
            @inativar-conta="inativarConta"
          />
        </div>
        
        <!-- Imagem Ilustrativa (apenas desktop e tablet) -->
        <div class="illustration-section">
          <div class="profile-image">
            <img src="/images/omeuperfil.svg" alt="Meu Perfil" />
          </div>
        </div>
      </div>

      <!-- Modal de Cadastro de Escritório -->
      <CadastroEscritorio 
        :isVisible="showCadastroEscritorio"
        @fechar="fecharCadastroEscritorio"
        @escritorio-salvo="handleEscritorioSalvo"
        @erro="handleErro"
      />

      <!-- Modal de Exclusão de Conta -->
      <ExcluirConta
        :isVisible="showExcluirConta"
        @fechar="fecharExcluirConta"
        @excluir="confirmarExclusaoConta"
        @inativar="abrirInativacaoDoExcluir"
      />

      <!-- Modal de Inativação de Conta -->
      <InativarConta
        :isVisible="showInativarConta"
        @fechar="fecharInativarConta"
        @confirmar="confirmarInativacaoConta"
      />

      <!-- Alertas -->
      <AlertaSucesso 
        v-if="mostrarAlertaSucesso"
        :mensagem="mensagemSucesso"
        @fechar="fecharAlertaSucesso"
      />

      <AlertaErro 
        v-if="mostrarAlertaErro"
        :mensagem="mensagemErro"
        @fechar="fecharAlertaErro"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MenuFixo from '../../components/UI/MenuFixo.vue';
import DadosUserEscritorio from './dados_user_escritorio.vue';
import CadastroEscritorio from './cadastro_escritorio.vue';
import ExcluirConta from './excluir_conta.vue';
import InativarConta from './inativar_conta.vue';
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue';
import AlertaErro from '../../components/UI/AlertaErro.vue';

const router = useRouter();

// Estados
const showCadastroEscritorio = ref(false);
const showExcluirConta = ref(false);
const showInativarConta = ref(false);
const mostrarAlertaSucesso = ref(false);
const mensagemSucesso = ref('');
const mostrarAlertaErro = ref(false);
const mensagemErro = ref('');

// Funções
const abrirCadastroEscritorio = () => {
  showCadastroEscritorio.value = true;
};

const fecharCadastroEscritorio = () => {
  showCadastroEscritorio.value = false;
};

const handleEscritorioSalvo = (dados) => {
  console.log('Escritório salvo:', dados);
  // Aqui você pode adicionar lógica adicional, como mostrar uma mensagem de sucesso
  // ou atualizar outros componentes
};

const handleErro = (mensagem) => {
  console.error('Erro:', mensagem);
  mensagemErro.value = mensagem;
  mostrarAlertaErro.value = true;
};

// Funções para interações com dados do usuário
const editarUsuario = (tipo) => {
  console.log('Editando:', tipo);
  // Implementar lógica de edição (nome, email, senha, etc.)
};

const visualizarLogotipo = (url) => {
  console.log('Visualizando logotipo:', url);
  // Implementar modal de visualização do logotipo
};

const copiarDados = (dados) => {
  console.log('Copiando dados:', dados);
  // Implementar cópia dos dados para clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(dados);
    mensagemSucesso.value = 'Dados copiados para a área de transferência!';
    mostrarAlertaSucesso.value = true;
  }
};

const excluirConta = () => {
  console.log('Abrindo modal de exclusão de conta');
  showExcluirConta.value = true;
};

const fecharExcluirConta = () => {
  showExcluirConta.value = false;
};

const fecharInativarConta = () => {
  showInativarConta.value = false;
};

const confirmarExclusaoConta = (dados) => {
  console.log('Excluindo conta com feedback:', dados);
  // Implementar lógica de exclusão de conta
  showExcluirConta.value = false;
  mensagemSucesso.value = 'Conta excluída com sucesso. Esperamos ver você em breve!';
  mostrarAlertaSucesso.value = true;
  
  // Aqui você pode adicionar a lógica real de exclusão
  // Por exemplo, chamar uma API ou serviço
};

const abrirInativacaoDoExcluir = (dados) => {
  console.log('Abrindo inativação a partir do modal de exclusão, feedback:', dados);
  // Fechar modal de exclusão
  showExcluirConta.value = false;
  // Abrir modal de inativação
  showInativarConta.value = true;
};

const confirmarInativacaoConta = () => {
  console.log('Confirmando inativação de conta');
  // Implementar lógica de inativação de conta
  showInativarConta.value = false;
  mensagemSucesso.value = 'Conta inativada com sucesso. Você pode reativá-la a qualquer momento.';
  mostrarAlertaSucesso.value = true;
  
  // Aqui você pode adicionar a lógica real de inativação
  // Por exemplo, chamar uma API ou serviço
};

const inativarConta = () => {
  console.log('Abrindo modal de inativação de conta diretamente');
  showInativarConta.value = true;
};

const fecharAlertaSucesso = () => {
  mostrarAlertaSucesso.value = false;
};

const fecharAlertaErro = () => {
  mostrarAlertaErro.value = false;
};

// Função para voltar (mobile)
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
/* ===== MOBILE FIRST APPROACH ===== */
/* Base styles (mobile) */
.page-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #F9FAFB;
  min-height: 100vh;
}

/* Desktop menu - oculto no mobile */
.desktop-only {
  display: none;
}

/* Header Mobile */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 60px;
  box-sizing: border-box;
}

.back-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background: #F3F4F6;
}

.back-button img {
  width: 24px;
  height: 24px;
}

.mobile-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #101828;
  margin: 0;
  flex: 1;
  text-align: center;
}

.header-spacer {
  width: 40px; /* Mesmo tamanho do botão para centralizar o título */
}

/* Main Content Mobile */
.main-content {
  padding: 16px 16px 32px 16px;
  background: #F9FAFB;
  min-height: calc(100vh - 60px);
}

/* Título Desktop - oculto no mobile */
.desktop-title {
  display: none;
}

/* Layout Mobile */
.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;
}

.profile-section {
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Ilustração oculta no mobile */
.illustration-section {
  display: none;
}

.profile-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-image img {
  max-width: 100%;
  height: auto;
}

/* ===== TABLET STYLES ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .page-container {
    background: white;
  }
  
  .mobile-header {
    display: none;
  }
  
  .desktop-only {
    display: block;
  }
  
  .main-content {
    padding: 20px 24px 40px 24px;
    margin-left: auto;
    margin-right: auto;
    max-width: 1280px;
    background: white;
    min-height: 100vh;
  }
  
  .desktop-title {
    display: block;
    font-size: 1.875rem;
    font-weight: 600;
    color: #101828;
    margin-bottom: 2rem;
    margin-top: 2rem;
  }
  
  .profile-layout {
    flex-direction: column;
    gap: 24px;
    margin-top: 24px;
  }
  
  .profile-section {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .illustration-section {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .profile-image img {
    max-width: 400px;
    max-height: 300px;
  }
}

/* ===== DESKTOP STYLES ===== */
@media (min-width: 1025px) {
  .page-container {
    background: white;
  }
  
  .mobile-header {
    display: none;
  }
  
  .desktop-only {
    display: block;
  }
  
  .main-content {
    margin-left: auto;
    margin-right: auto;
    padding: 0px 16px 32px 16px;
    background: white;
    min-height: 100vh;
    max-width: 1280px;
  }
  
  .desktop-title {
    display: block;
    font-size: 2rem;
    font-weight: 600;
    color: #101828;
    margin-bottom: 2rem;
    margin-top: 2rem;
  }
  
  .profile-layout {
    display: flex;
    flex-direction: row;
    gap: 24px;
    margin-top: 24px;
    justify-content: flex-start;
    max-width: 1248px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  }
  
  .profile-section {
    flex: 0 0 38%;
    min-width: 400px;
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    height: fit-content;
  }
  
  .illustration-section {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .profile-image img {
    max-width: 100%;
    max-height: 100%;
    height: auto;
    width: auto;
  }
}

/* ===== LARGE DESKTOP STYLES ===== */
@media (min-width: 1440px) {
  .profile-section {
    flex: 0 0 35%;
    min-width: 450px;
  }
}

/* ===== UTILITIES ===== */
/* Smooth transitions */
* {
  transition: all 0.2s ease;
}

/* Better touch targets for mobile */
@media (max-width: 767px) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}

/* Removed dark mode - keeping interface light */
</style> 