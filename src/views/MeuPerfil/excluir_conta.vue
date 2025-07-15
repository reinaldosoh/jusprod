<template>
  <div v-if="isVisible" class="excluir-conta-overlay" @click="handleOverlayClick">
    <div class="excluir-conta-modal" @click.stop>
      <!-- Header vermelho -->
      <div class="modal-header">
        <span class="header-title">Atenção</span>
        <button class="close-button" @click="fechar">
          <img src="/images/fechaBranco.svg" alt="Fechar" class="close-icon" />
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <!-- Título -->
        <h2 class="modal-title">Exclusão de conta</h2>

        <!-- Subtítulo -->
        <p class="modal-subtitle">
          Você está prestes a excluir permanentemente esta conta. Todos os dados e histórico serão perdidos. Tem certeza que deseja fazer isso?
        </p>

        <!-- Feedback -->
        <div class="feedback-section">
          <label class="feedback-label">Feedback</label>
          <textarea 
            v-model="feedback"
            placeholder="Por favor faça um relato do que levou a tomar essa ação"
            class="feedback-textarea"
            rows="4"
          ></textarea>
        </div>

        <!-- Botões -->
        <div class="modal-buttons">
          <button class="btn-excluir" @click="excluirConta">
            Excluir conta
          </button>
          <button class="btn-inativar" @click="inativarConta">
            Inativar conta
          </button>
          <button class="btn-cancelar" @click="cancelar">
            Cancelar
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

const emit = defineEmits(['fechar', 'excluir', 'inativar'])

// Estados
const feedback = ref('')

// Controles do modal
const fechar = () => {
  limparFormulario()
  emit('fechar')
}

const handleOverlayClick = () => {
  // Não fechar automaticamente para evitar ações acidentais
}

const cancelar = () => {
  fechar()
}

const excluirConta = () => {
  emit('excluir', {
    feedback: feedback.value
  })
}

const inativarConta = () => {
  // Fechar este modal e abrir o modal de inativar
  emit('inativar', {
    feedback: feedback.value
  })
  fechar()
}

const limparFormulario = () => {
  feedback.value = ''
}
</script>

<style scoped>
.excluir-conta-overlay {
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

.excluir-conta-modal {
  background: white;
  border-radius: 12px;
  width: 605px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1201;
  position: relative;
}

.modal-header {
  background: #EF363F;
  color: white;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.header-title {
  font-size: 16px;
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
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #101828;
  margin: 0;
  line-height: 1.2;
}

.modal-subtitle {
  font-size: 16px;
  font-weight: 400;
  color: #4B5563;
  margin: 0;
  line-height: 1.5;
}

.feedback-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.feedback-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: left;
}

.feedback-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #101828;
  background: white;
  resize: vertical;
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
}

.feedback-textarea:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.feedback-textarea::placeholder {
  color: #9CA3AF;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.btn-excluir,
.btn-inativar,
.btn-cancelar {
  width: 176px;
  height: 44px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-excluir {
  background: #FFFFFF;
  color: #EF353F;
  border: 1px solid #EF353F;
}

.btn-excluir:hover {
  background: #FEF2F2;
}

.btn-inativar {
  background: #FFFFFF;
  color: #0169FA;
  border: 1px solid #0169FA;
}

.btn-inativar:hover {
  background: #F0F7FF;
}

.btn-cancelar {
  background: #0169FA;
  color: #FFFFFF;
  border: none;
}

.btn-cancelar:hover {
  background: #0356D6;
}

/* Responsivo */
@media (max-width: 768px) {
  .excluir-conta-modal {
    width: 95vw;
    margin: 16px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .modal-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-excluir,
  .btn-inativar,
  .btn-cancelar {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .excluir-conta-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .modal-content {
    padding: 16px;
    flex: 1;
    overflow-y: auto;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .modal-subtitle {
    font-size: 14px;
  }
}
</style> 