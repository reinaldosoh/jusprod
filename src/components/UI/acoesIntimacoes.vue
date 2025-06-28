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
  },
  intimacaoId: {
    type: [Number, String],
    required: false
  },
  intimacao: {
    type: Object,
    required: false
  },
  activeTab: {
    type: String,
    default: 'nao-visualizadas'
  }
})

// Emits para comunicação com componente pai
const emit = defineEmits(['close', 'marcar-visualizado', 'exportar', 'excluir'])

// Usar a posição passada como prop com ajuste para respeitar os limites do container
const dropdownPosition = computed(() => {
  if (!props.posicao) return { top: 0, left: 0 }
  
  const { top, left } = props.posicao
  const dropdownWidth = 220
  const dropdownHeight = 167
  
  // Encontrar o container da lista de intimações
  const listaContainer = document.querySelector('.lista-intimacoes-container')
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
  
  // Ajustar altura para não sair da tela - CORRIGIDO
  let adjustedTop = top + 5 // Pequeno offset do clique
  
  // Se sairia da tela por baixo, posicionar acima do elemento
  if (adjustedTop + dropdownHeight > window.innerHeight - 20) {
    adjustedTop = top - dropdownHeight - 5
  }
  
  // Garantir que não saia da tela por cima
  adjustedTop = Math.max(adjustedTop, 10)
  
  return {
    top: adjustedTop,
    left: adjustedLeft
  }
})

// Computed para determinar texto e ação do botão visualizar
const visualizarAction = computed(() => {
  const isVisualizada = props.intimacao?.visualizado
  return {
    texto: isVisualizada ? 'Marcar como não visualizada' : 'Marcar como visualizada',
    acao: isVisualizada ? 'desmarcar' : 'marcar'
  }
})

const handleClose = () => {
  emit('close')
}

const handleMarcarVisualizado = () => {
  emit('marcar-visualizado', {
    intimacaoId: props.intimacaoId,
    intimacao: props.intimacao,
    acao: visualizarAction.value.acao
  })
  emit('close')
}

const handleExportar = () => {
  emit('exportar', {
    intimacaoId: props.intimacaoId,
    intimacao: props.intimacao
  })
  emit('close')
}

const handleExcluir = () => {
  emit('excluir', {
    intimacaoId: props.intimacaoId,
    intimacao: props.intimacao
  })
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
        <!-- Marcar como visualizado/não visualizado -->
        <button class="acao-item" @click="handleMarcarVisualizado">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="acao-icon">
            <path v-if="visualizarAction.acao === 'marcar'" d="M2 8L6 12L14 4" stroke="#374151" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
            <path v-else d="M8 1.5C4.5 1.5 1.5 4.5 1.5 8S4.5 14.5 8 14.5 14.5 11.5 14.5 8 11.5 1.5 8 1.5ZM6 10L4 8L5.4 6.6L6 7.2L10.6 2.6L12 4L6 10Z" stroke="#374151" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="acao-texto">{{ visualizarAction.texto }}</span>
        </button>

        <!-- Exportar -->
        <button class="acao-item" @click="handleExportar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="acao-icon">
            <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 6.66667L8 3.33333M8 3.33333L4.66667 6.66667M8 3.33333V10" stroke="#374151" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="acao-texto">Exportar</span>
        </button>

        <!-- Excluir -->
        <button class="acao-item acao-item-danger" @click="handleExcluir">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="acao-icon acao-icon-danger">
            <path d="M2 4H14M12.6667 4V12.6667C12.6667 13.0203 12.5262 13.3594 12.2761 13.6095C12.0261 13.8595 11.687 14 11.3333 14H4.66667C4.31304 14 3.97391 13.8595 3.72386 13.6095C3.47381 13.3594 3.33333 13.0203 3.33333 12.6667V4M5.33333 4V2.66667C5.33333 2.31304 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31304 1.33333 6.66667 1.33333H9.33333C9.687 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31304 10.6667 2.66667V4" stroke="#F04438" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333" stroke="#F04438" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="acao-texto acao-texto-danger">Excluir</span>
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
  width: 220px;
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
    max-width: 220px;
  }
}
</style> 