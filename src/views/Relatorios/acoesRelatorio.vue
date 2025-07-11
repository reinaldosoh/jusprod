<template>
  <teleport to="body">
    <div v-if="isVisible" class="acoes-overlay" @click="fecharMenu">
      <div 
        class="acoes-menu"
        :style="{ top: posicaoAjustada.y + 'px', left: posicaoAjustada.x + 'px' }"
        @click.stop
      >
        <div class="acoes-item" @click="executarAcao('visualizar')">
          <div class="acoes-icon">
            <img src="/images/eye.svg" alt="Visualizar" />
          </div>
          <span class="acoes-texto">Visualizar</span>
        </div>
        
        <div class="acoes-item" @click="executarAcao('duplicar')">
          <div class="acoes-icon">
            <img src="/images/duplicar.svg" alt="Duplicar" />
          </div>
          <span class="acoes-texto">Duplicar relatório</span>
        </div>
        
        <div class="acoes-item" @click="executarAcao('mover')">
          <div class="acoes-icon">
            <img src="/images/mover.svg" alt="Mover" />
          </div>
          <span class="acoes-texto">Mover para outra pasta</span>
        </div>
        
        <div class="acoes-item" @click="executarAcao('exportar')">
          <div class="acoes-icon">
            <img src="/images/exportar.svg" alt="Exportar" />
          </div>
          <span class="acoes-texto">Exportar</span>
        </div>
        
        <div class="acoes-item acoes-item-excluir" @click="executarAcao('excluir')">
          <div class="acoes-icon">
            <img src="/images/lixeira.svg" alt="Excluir" />
          </div>
          <span class="acoes-texto">Excluir</span>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  relatorio: {
    type: Object,
    default: null
  },
  posicaoX: {
    type: Number,
    default: 0
  },
  posicaoY: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['fechar', 'acao-selecionada'])

// Posição ajustada do menu para responsividade
const posicaoAjustada = computed(() => {
  if (!props.isVisible) return { x: 0, y: 0 }
  
  let x = props.posicaoX
  let y = props.posicaoY
  
  // Ajustar se sair da tela
  const menuWidth = window.innerWidth <= 480 ? 180 : window.innerWidth <= 768 ? 200 : 221
  const menuHeight = window.innerWidth <= 480 ? 185 : window.innerWidth <= 768 ? 205 : 233
  
  if (x + menuWidth > window.innerWidth - 10) {
    x = window.innerWidth - menuWidth - 10
  }
  if (x < 10) x = 10
  
  if (y + menuHeight > window.innerHeight - 10) {
    y = window.innerHeight - menuHeight - 10
  }
  if (y < 10) y = 10
  
  return { x, y }
})

const executarAcao = (acao) => {
  console.log('🎬 executarAcao chamado com ação:', acao)
  console.log('📋 Relatório:', props.relatorio)
  
  const dadosAcao = {
    acao,
    relatorio: props.relatorio
  }
  
  console.log('📤 Emitindo evento acao-selecionada com:', dadosAcao)
  
  emit('acao-selecionada', dadosAcao)
  fecharMenu()
}

const fecharMenu = () => {
  emit('fechar')
}

// Fechar menu com ESC
const handleEscKey = (event) => {
  if (event.key === 'Escape') {
    fecharMenu()
  }
}

// Fechar menu quando a janela for redimensionada
const handleResize = () => {
  fecharMenu()
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.acoes-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 50000;
}

.acoes-menu {
  position: absolute;
  width: 221px;
  height: 233px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2);
  padding: 6px 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  border: 1px solid #e5e7eb;
  z-index: 50001;
  max-width: calc(100vw - 20px);
  box-sizing: border-box;
}

.acoes-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border: none;
  background: none;
  width: 100%;
  box-sizing: border-box;
}

.acoes-item:hover {
  background-color: #f9fafb;
}

.acoes-item:active {
  background-color: #f3f4f6;
}

.acoes-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.acoes-icon img {
  width: 20px;
  height: 20px;
  display: block;
}

.acoes-texto {
  font-size: 14px;
  font-weight: 400;
  color: #374151;
  line-height: 1.4;
  flex: 1;
}

.acoes-item-excluir {
  border-top: 1px solid #f3f4f6;
  margin-top: 6px;
  padding-top: 12px;
}

.acoes-item-excluir:hover {
  background-color: #fef2f2;
}

.acoes-item-excluir .acoes-texto {
  color: #dc2626;
}

.acoes-item-excluir .acoes-icon {
  filter: brightness(0) saturate(100%) invert(19%) sepia(88%) saturate(3967%) hue-rotate(349deg) brightness(87%) contrast(88%);
}

/* Responsivo */
@media (max-width: 768px) {
  .acoes-menu {
    width: 200px;
    height: 205px;
  }
}

@media (max-width: 480px) {
  .acoes-menu {
    width: 180px;
    height: 185px;
  }
  
  .acoes-item {
    padding: 10px 14px;
  }
  
  .acoes-texto {
    font-size: 13px;
  }
  
  .acoes-icon {
    width: 18px;
    height: 18px;
  }
  
  .acoes-icon img {
    width: 18px;
    height: 18px;
  }
}
</style> 