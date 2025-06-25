<script setup>
import { computed } from 'vue'

// Props para controlar a visibilidade do dropdown
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  posicao: {
    type: Object,
    default: () => ({ top: 0, left: 0 })
  }
})

// Emits para comunicação com componente pai
const emit = defineEmits(['close', 'vincular-clientes', 'exportar', 'deixar-monitorar'])

// Usar a posição passada como prop com ajuste para respeitar os limites do container
const dropdownPosition = computed(() => {
  if (!props.posicao) return { top: 0, left: 0 }
  
  const { top, left } = props.posicao
  const dropdownWidth = 196
  const dropdownHeight = 167
  
  // Encontrar o container da lista de processos
  const listaContainer = document.querySelector('.lista-processos-container')
  let containerLeft = 10
  let containerRight = window.innerWidth - 10
  
  if (listaContainer) {
    const containerRect = listaContainer.getBoundingClientRect()
    containerLeft = containerRect.left
    containerRight = containerRect.right - 10 // Margem de 10px da borda direita
  }
  
  // Calcular se o dropdown sairia do container à direita
  const wouldOverflowRight = left + dropdownWidth > containerRight
  
  let adjustedLeft = left
  if (wouldOverflowRight) {
    // Posicionar à esquerda do ícone para não sair do container
    adjustedLeft = left - dropdownWidth + 20 // 20px é a largura do ícone
    
    // Se ainda assim sair pela esquerda do container, ajustar
    if (adjustedLeft < containerLeft) {
      adjustedLeft = containerRight - dropdownWidth
    }
  }
  
  // Garantir que não saia dos limites do container
  adjustedLeft = Math.max(adjustedLeft, containerLeft)
  adjustedLeft = Math.min(adjustedLeft, containerRight - dropdownWidth)
  
  // Ajustar altura para não sair da tela
  const adjustedTop = Math.min(top, window.innerHeight - dropdownHeight - 10)
  
  return {
    top: Math.max(adjustedTop, 10),
    left: adjustedLeft
  }
})

const handleClose = () => {
  emit('close')
}

const handleVincularClientes = () => {
  emit('vincular-clientes')
  emit('close')
}

const handleExportar = () => {
  emit('exportar')
  emit('close')
}

const handleDeixarMonitorar = () => {
  emit('deixar-monitorar')
  emit('close')
}
</script>

<template>
  <div v-if="show" class="acoes-overlay" @click="handleClose">
    <div 
      class="acoes-container" 
      :style="{ 
        position: 'fixed',
        top: dropdownPosition.top + 'px', 
        left: dropdownPosition.left + 'px'
      }"
      @click.stop
    >
      <!-- Botão fechar -->
      <button class="btn-fechar" @click="handleClose">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Lista de ações -->
      <div class="acoes-lista">
        <!-- Vincular clientes -->
        <button class="acao-item" @click="handleVincularClientes">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="acao-icon">
            <path d="M13.3333 14V12.6667C13.3333 11.9594 13.0524 11.2811 12.5523 10.781C12.0522 10.2809 11.3739 10 10.6667 10H5.33333C4.62609 10 3.94781 10.2809 3.44772 10.781C2.94762 11.2811 2.66667 11.9594 2.66667 12.6667V14M10.6667 4.66667C10.6667 6.13943 9.47276 7.33333 8 7.33333C6.52724 7.33333 5.33333 6.13943 5.33333 4.66667C5.33333 3.19391 6.52724 2 8 2C9.47276 2 10.6667 3.19391 10.6667 4.66667Z" stroke="#374151" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="acao-texto">Vincular clientes</span>
        </button>

        <!-- Exportar -->
        <button class="acao-item" @click="handleExportar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="acao-icon">
            <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 6.66667L8 3.33333M8 3.33333L4.66667 6.66667M8 3.33333V10" stroke="#374151" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="acao-texto">Exportar</span>
        </button>

        <!-- Deixar de monitorar -->
        <button class="acao-item acao-item-danger" @click="handleDeixarMonitorar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="acao-icon acao-icon-danger">
            <!-- Pasta (mesmo formato do botão monitorar) -->
            <path d="M14.6667 12.6667C14.6667 13.0203 14.5262 13.3594 14.2761 13.6095C14.0261 13.8595 13.687 14 13.3333 14H2.66667C2.31304 14 1.97391 13.8595 1.72386 13.6095C1.47381 13.3594 1.33333 13.0203 1.33333 12.6667V3.33333C1.33333 2.97971 1.47381 2.64057 1.72386 2.39052C1.97391 2.14048 2.31304 2 2.66667 2H5.33333L6.66667 4H13.3333C13.687 4 14.0261 4.14048 14.2761 4.39052C14.5262 4.64057 14.6667 4.97971 14.6667 5.33333V12.6667Z" stroke="#F04438" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Seta para baixo no lugar do + -->
            <path d="M8 7V10M6.66667 8.66667L8 10L9.33333 8.66667" stroke="#F04438" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="acao-texto acao-texto-danger">Deixar de monitorar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.acoes-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 1000;
}

.acoes-container {
  width: 196px;
  height: 167px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #E5E7EB;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.btn-fechar {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.btn-fechar:hover {
  background: #F3F4F6;
}

.acoes-lista {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.acao-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  width: 100%;
}

.acao-item:hover {
  background: #F9FAFB;
}

.acao-item.acao-item-danger:hover {
  background: #FEF2F2;
}

.acao-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.acao-icon-danger {
  stroke: #F04438;
}

.acao-texto {
  color: #374151;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
}

.acao-texto-danger {
  color: #F04438;
}

/* Responsivo */
@media (max-width: 768px) {
  .acoes-container {
    width: 90vw;
    max-width: 196px;
  }
}
</style> 