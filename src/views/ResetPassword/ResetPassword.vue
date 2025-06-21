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
  <div class="reset-password-container">
    <LadoEsquerdoResetPassword @voltar="handleVoltar" />
    <LadoDireitoEsquecerSenha />
  </div>
</template>

<style scoped>
.reset-password-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 768px) {
  .reset-password-container {
    flex-direction: column;
  }
}
</style>
