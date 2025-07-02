<template>
  <div class="empty-state-container">
    <img src="/images/empty_docs.png" alt="Sem documentos" class="empty-state-image">
    <p class="empty-state-text">Nenhum documento encontrado. Adicione novos documentos!</p>
  </div>
</template>

<script setup>
// O componente não necessita de lógica adicional
</script>

<style scoped>
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
}

.empty-state-image {
  width: 312px;
  height: 312px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.empty-state-text {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  max-width: 80%;
  margin: 0 auto;
}
</style>
