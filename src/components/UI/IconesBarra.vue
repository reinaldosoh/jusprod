<template>
  <div class="view-icons-group">
    <!-- Ícone Kanban -->
    <button 
      class="view-btn" 
      :class="{ active: activeView === 'kanban' }" 
      title="Visualização kanban" 
      @click="$emit('view-change', 'kanban')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-grid">
        <rect width="7" height="7" x="3" y="3" rx="1"></rect>
        <rect width="7" height="7" x="14" y="3" rx="1"></rect>
        <rect width="7" height="7" x="14" y="14" rx="1"></rect>
        <rect width="7" height="7" x="3" y="14" rx="1"></rect>
      </svg>
    </button>
    
    <!-- Ícone Lista -->
    <button 
      class="view-btn" 
      :class="{ active: activeView === 'list' }" 
      title="Visualização em lista" 
      @click="$emit('view-change', 'list')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list">
        <path d="M3 12h.01"></path>
        <path d="M3 18h.01"></path>
        <path d="M3 6h.01"></path>
        <path d="M8 12h13"></path>
        <path d="M8 18h13"></path>
        <path d="M8 6h13"></path>
      </svg>
    </button>
    
    <!-- Traço Vertical -->
    <div class="vertical-divider"></div>
    
    <!-- Ícone Balão de Conversa -->
    <button 
      class="action-btn" 
      title="Conversas"
      @click="$emit('action', 'conversation')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
      </svg>
    </button>
    
    <!-- Traço Vertical -->
    <div class="vertical-divider"></div>
    
    <!-- Ícone Estrela -->
    <button 
      class="action-btn" 
      title="Favoritos"
      @click="$emit('action', 'favorites')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineEmits(['view-change', 'action']);

defineProps({
  activeView: {
    type: String,
    default: 'kanban'
  }
});
</script>

<style scoped>
.view-icons-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  background: white;
  height: 44px;
  box-sizing: border-box;
}

.view-btn, 
.action-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #667085;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.view-btn:hover, 
.action-btn:hover {
  background: #F9FAFB;
  color: #344054;
}

.view-btn.active {
  background: #F0F9FF;
  color: #0EA5E9;
}

.view-btn.active svg {
  stroke: #0EA5E9;
}

.vertical-divider {
  width: 1px;
  height: 1.25rem;
  background-color: #D0D5DD;
  margin: 0 0.125rem;
  flex-shrink: 0;
}

svg {
  display: block;
}
</style>
