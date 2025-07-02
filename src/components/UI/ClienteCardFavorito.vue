<template>
  <div class="favorito-container">
    <button 
      class="favorito-btn" 
      @click="$emit('toggle-favorito')"
      :title="favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
    >
      <!-- Ícone de estrela -->
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="favorito ? '#fbbf24' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  favorito: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-favorito'])
</script>

<style scoped>
.favorito-container {
  position: absolute;
  top: 12px;
  left: 16px;
  z-index: 1;
}

.favorito-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.favorito-btn:hover {
  background: #fef3c7;
  transform: scale(1.05);
}

.favorito-btn svg {
  width: 20px !important;
  height: 20px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  stroke-width: 2 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  z-index: 1 !important;
  position: relative !important;
  color: #fbbf24;
}
</style>
