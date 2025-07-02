<template>
  <button @click="voltar" class="botao-voltar">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5"></path>
      <path d="M12 19l-7-7 7-7"></path>
    </svg>
    <span>Voltar</span>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const voltar = () => {
  router.back()
}
</script>

<style scoped>
.botao-voltar {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: #111827;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.botao-voltar:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.botao-voltar svg {
  stroke: #2563eb;
}

.botao-voltar span {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
