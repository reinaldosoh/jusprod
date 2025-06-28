<template>
  <div class="stats">
    <div class="stat-item">
      <!-- Ícone de processos -->
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon lucide lucide-scale">
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
        <path d="M7 21h10"></path>
        <path d="M12 3v18"></path>
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
      </svg>
      <span class="stat-text">Processos: {{ processos }}</span>
    </div>
    
    <div class="stat-item">
      <!-- Ícone de contratos -->
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon lucide lucide-file-text">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" x2="8" y1="13" y2="13"></line>
        <line x1="16" x2="8" y1="17" y2="17"></line>
        <line x1="10" x2="8" y1="9" y2="9"></line>
      </svg>
      <span class="stat-text">Contratos: {{ contratos }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  processos: {
    type: Number,
    default: 0
  },
  contratos: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  flex-shrink: 0;
  color: #6b7280;
  width: 18px;
  height: 18px;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  fill: none !important;
  stroke-width: 2 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}

.stat-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

@media (max-width: 768px) {
  .stat-text {
    font-size: 13px;
  }
}
</style>
