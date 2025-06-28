<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LadoEsquerdoEsquecerSenha from './LadoEsquerdoEsquecerSenha.vue';
import LadoDireitoEsquecerSenha from './LadoDireitoEsquecerSenha.vue';

const router = useRouter();

// Função para lidar com o evento de voltar para o login
function handleVoltar() {
  // Usar o Vue Router para navegar de volta para a página de login
  router.push({ name: 'login' });
}

// Função para lidar com o evento de email enviado
function handleEmailEnviado(data) {
  console.log('Email de recuperação enviado para:', data.email);
  // Aqui você pode implementar qualquer lógica adicional após o envio do email
}
</script>

<template>
  <div class="esquecer-senha-wrapper">
  <div class="esquecer-senha-container">
    <LadoEsquerdoEsquecerSenha 
      @voltar="handleVoltar"
      @enviado="handleEmailEnviado"
    />
    <LadoDireitoEsquecerSenha />
    </div>
  </div>
</template>

<style scoped>
.esquecer-senha-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #FFFFFF;
}

.esquecer-senha-container {
  display: flex;
  width: 100%;
  max-width: 1280px;
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 768px) {
  .esquecer-senha-container {
    flex-direction: column;
  }
}
</style>
