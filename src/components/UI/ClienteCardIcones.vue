<template>
  <div class="card-actions">
    <button 
      class="action-btn edit-btn" 
      @click="$emit('editar')"
      title="Editar cliente"
    >
      <div class="icon-wrapper edit">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
        </svg>
      </div>
    </button>
    <button 
      class="action-btn delete-btn" 
      @click="$emit('excluir')"
      title="Excluir cliente"
    >
      <div class="icon-wrapper delete">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" x2="10" y1="11" y2="17"></line>
          <line x1="14" x2="14" y1="11" y2="17"></line>
        </svg>
      </div>
    </button>
  </div>
</template>

<script setup>
defineEmits(['editar', 'excluir'])
</script>

<style scoped>
.card-actions {
  display: flex;
  gap: 8px;
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 100;
}

.action-btn {
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
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 100;
}

.icon-wrapper.edit {
  color: #2563eb;
}

.icon-wrapper.delete {
  color: #dc2626;
}

.action-btn svg {
  width: 18px !important;
  height: 18px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  fill: none !important;
  stroke-width: 2 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  z-index: 100 !important;
  position: relative !important;
}

.edit-btn {
  color: #2563eb;
}

.edit-btn:hover {
  background: #eff6ff;
  transform: scale(1.05);
}

.delete-btn {
  color: #dc2626;
}

.delete-btn:hover {
  background: #fef2f2;
  transform: scale(1.05);
}
</style>
