<template>
  <div v-if="isVisible" class="inativar-conta-overlay" @click="handleOverlayClick">
    <div class="inativar-conta-modal" @click.stop>
      <!-- Header azul -->
      <div class="modal-header">
        <span class="header-title">Inativar conta</span>
        <button class="close-button" @click="fechar">
          <img src="/images/fechaBranco.svg" alt="Fechar" class="close-icon" />
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <!-- Título -->
        <h2 class="modal-title">Inativação de conta</h2>

        <!-- Texto explicativo -->
        <div class="content-text">
          <p class="first-paragraph">
            Você está prestes a inativar a sua conta.
          </p>
          
          <p class="info-paragraph">
            Nós não cobraremos nenhum valor do seu cartão pelo período de inatividade, você tem 30 (trinta) dias para reativar sua conta, basta entrar com seu e-mail e senha novamente.
          </p>
          
          <p class="important-paragraph">
            <strong>Importante:</strong> Todas as funcionalidades da Plataforma Jusprod ficarão pausadas pelo período de inatividade, sendo assim, você não receberá nenhuma notificação interna sobre compromissos, financeiro ou intimações em seus processos.
          </p>
          
          <p class="warning-paragraph">
            Após 30 dias sua conta e todos os dados serão excluídos.
          </p>
          
          <p class="confirmation-paragraph">
            Tem certeza que deseja inativar sua conta?
          </p>
        </div>

        <!-- Botões -->
        <div class="modal-buttons">
          <button class="btn-cancelar" @click="cancelar">
            Cancelar
          </button>
          <button class="btn-confirmar" @click="confirmarInativacao">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fechar', 'confirmar'])

// Controles do modal
const fechar = () => {
  emit('fechar')
}

const handleOverlayClick = () => {
  // Não fechar automaticamente para evitar ações acidentais
}

const cancelar = () => {
  fechar()
}

const confirmarInativacao = () => {
  emit('confirmar')
}
</script>

<style scoped>
.inativar-conta-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.inativar-conta-modal {
  background: white;
  border-radius: 12px;
  width: 650px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1201;
  position: relative;
}

.modal-header {
  background: #0468FA;
  color: white;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
  text-align: center;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  width: 24px;
  height: 24px;
}

.modal-content {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.modal-title {
  font-size: 32px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
  line-height: 1.2;
}

.content-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.first-paragraph {
  font-size: 16px;
  font-weight: 400;
  color: #4B5563;
  margin: 0;
  line-height: 1.5;
}

.info-paragraph {
  font-size: 16px;
  font-weight: 400;
  color: #4B5563;
  margin: 0;
  line-height: 1.5;
}

.important-paragraph {
  font-size: 16px;
  font-weight: 400;
  color: #4B5563;
  margin: 0;
  line-height: 1.5;
}

.important-paragraph strong {
  font-weight: 600;
}

.warning-paragraph {
  font-size: 16px;
  font-weight: 400;
  color: #EF4444;
  margin: 0;
  line-height: 1.5;
}

.confirmation-paragraph {
  font-size: 16px;
  font-weight: 400;
  color: #4B5563;
  margin: 0;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-cancelar,
.btn-confirmar {
  width: 200px;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancelar {
  background: #FFFFFF;
  color: #0468FA;
  border: 1px solid #0468FA;
}

.btn-cancelar:hover {
  background: #F0F7FF;
}

.btn-confirmar {
  background: #0468FA;
  color: #FFFFFF;
  border: none;
}

.btn-confirmar:hover {
  background: #0356D6;
}

/* Responsivo */
@media (max-width: 768px) {
  .inativar-conta-modal {
    width: 95vw;
    margin: 16px;
  }
  
  .modal-content {
    padding: 24px;
  }
  
  .modal-title {
    font-size: 24px;
  }
  
  .content-text {
    gap: 12px;
  }
  
  .first-paragraph,
  .info-paragraph,
  .important-paragraph,
  .warning-paragraph,
  .confirmation-paragraph {
    font-size: 14px;
  }
  
  .modal-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-cancelar,
  .btn-confirmar {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .inativar-conta-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .modal-content {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .content-text {
    gap: 16px;
  }
}
</style> 