<template>
  <div class="confirmar-cancelamento-overlay" @click="handleOverlayClick">
    <div class="confirmar-cancelamento-modal" @click.stop>
      <!-- Ícone de aviso -->
      <div class="modal-icon">
        <div class="warning-circle">
          <span class="warning-symbol">⚠️</span>
        </div>
      </div>

      <!-- Título -->
      <h2 class="modal-title">{{ titulo }}</h2>

      <!-- Mensagem -->
      <p class="modal-message">{{ mensagem }}</p>

      <!-- Botões -->
      <div class="modal-buttons">
        <button 
          type="button" 
          class="cancel-btn" 
          @click="handleCancelar"
        >
          {{ textoCancelar }}
        </button>
        <button 
          type="button" 
          class="confirm-btn" 
          @click="handleConfirmar"
        >
          {{ textoConfirmar }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  titulo: {
    type: String,
    default: 'Confirmar cancelamento'
  },
  mensagem: {
    type: String,
    default: 'Tem certeza que deseja cancelar?'
  },
  textoCancelar: {
    type: String,
    default: 'Não, continuar'
  },
  textoConfirmar: {
    type: String,
    default: 'Sim, cancelar'
  }
})

const emit = defineEmits(['cancelar', 'confirmar'])

const handleOverlayClick = () => {
  // Não fechar automaticamente ao clicar no overlay
  // O usuário deve escolher uma opção
}

const handleCancelar = () => {
  emit('cancelar')
}

const handleConfirmar = () => {
  emit('confirmar')
}
</script>

<style scoped>
.confirmar-cancelamento-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.confirmar-cancelamento-modal {
  background: white;
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1301;
}

.modal-icon {
  margin-bottom: 16px;
}

.warning-circle {
  width: 64px;
  height: 64px;
  background: #FEF3C7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #F59E0B;
}

.warning-symbol {
  font-size: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #101828;
  margin: 0 0 12px 0;
}

.modal-message {
  font-size: 14px;
  color: #667085;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}

.cancel-btn {
  background: #FFFFFF;
  color: #0468FA;
  border: 1px solid #0468FA;
  border-radius: 8px;
  flex: 1;
  height: 44px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.cancel-btn:hover {
  background: #F0F7FF;
}

.confirm-btn {
  background: #DC2626;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  flex: 1;
  height: 44px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.confirm-btn:hover {
  background: #B91C1C;
}

/* Responsivo */
@media (max-width: 480px) {
  .confirmar-cancelamento-modal {
    width: 90vw;
    max-width: 400px;
    padding: 20px;
  }
  
  .modal-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .cancel-btn,
  .confirm-btn {
    width: 100%;
  }
}
</style> 