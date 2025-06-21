<script setup>
import LadoEsquerdo from './ladoEsquerdo.vue';
import LadoDireito from './ladoDireito.vue';
import { ref } from 'vue';

const emit = defineEmits(['esqueci-senha']);

const handleLogin = (loginData) => {
  console.log('Login realizado:', loginData);
  // Aqui você implementaria a lógica de autenticação
};

const handleCadastrar = () => {
  console.log('Redirecionando para cadastro');
  // Aqui você implementaria o redirecionamento para a página de cadastro
};

const handleEsqueciSenha = () => {
  console.log('Redirecionando para recuperação de senha');
  emit('esqueci-senha');
};
</script>

<template>
  <div class="login-container">
    <LadoEsquerdo 
      @login="handleLogin" 
      @cadastrar="handleCadastrar"
      @esqueci-senha="handleEsqueciSenha" 
    />
    <LadoDireito />
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #FFFFFF;
  box-sizing: border-box;
  overflow: hidden;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
}
</style>
