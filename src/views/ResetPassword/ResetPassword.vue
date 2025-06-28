<script setup>
import { useRouter } from 'vue-router';
import LadoEsquerdoResetPassword from './LadoEsquerdoResetPassword.vue';
import LadoDireitoEsquecerSenha from './LadoDireitoEsquecerSenha.vue';

const router = useRouter();

// Função para voltar para a página de login
function handleVoltar() {
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="reset-password-wrapper">
  <div class="reset-password-container">
    <LadoEsquerdoResetPassword @voltar="handleVoltar" />
    <LadoDireitoEsquecerSenha />
    </div>
  </div>
</template>

<style scoped>
.reset-password-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #FFFFFF;
}

.reset-password-container {
  display: flex;
  width: 100%;
  max-width: 1280px;
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 768px) {
  .reset-password-container {
    flex-direction: column;
  }
}
</style>
