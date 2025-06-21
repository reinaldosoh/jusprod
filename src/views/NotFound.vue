<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goToHome() {
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="not-found-container">
    <h1>404</h1>
    <h2>Página não encontrada</h2>
    <p>A página que você está procurando não existe ou foi removida.</p>
    <button @click="goToHome" class="back-button">Voltar para a página inicial</button>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 0 16px;
}

h1 {
  font-size: 72px;
  font-weight: 700;
  color: #0468FA;
  margin: 0;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  color: #101828;
  margin: 16px 0;
}

p {
  font-size: 16px;
  color: #475467;
  margin-bottom: 32px;
  max-width: 400px;
}

.back-button {
  background-color: #0468FA;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #0354cc;
}
</style>
