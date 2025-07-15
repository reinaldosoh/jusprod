<template>
  <div v-if="isVisible" class="atualizar-senha-overlay" @click="handleOverlayClick">
    <div class="atualizar-senha-modal" @click.stop>
      <!-- Header com ícones -->
      <div class="modal-header">
        <img src="/images/senha_circular.svg" alt="Senha" class="header-icon-left" />
        <button class="close-button" @click="fechar">
          <img src="/images/close_p.svg" alt="Fechar" class="header-icon-right" />
        </button>
      </div>

      <!-- Título -->
      <h2 class="modal-title">Alteração de senha</h2>

      <!-- Conteúdo -->
      <div class="modal-content">
        <form @submit.prevent="salvar">
          <!-- Senha atual -->
          <div class="field-group">
            <div class="input-wrapper">
              <img src="/images/cadeado.svg" alt="Senha" class="input-icon" />
              <input 
                type="password" 
                v-model="formData.senhaAtual"
                placeholder="Senha atual" 
                class="field-input"
                required
              />
            </div>
          </div>

          <!-- Nova senha -->
          <div class="field-group">
            <div class="input-wrapper">
              <img src="/images/cadeado.svg" alt="Senha" class="input-icon" />
              <input 
                type="password" 
                v-model="formData.novaSenha"
                placeholder="Nova senha" 
                class="field-input"
                required
              />
            </div>
          </div>

          <!-- Repetir nova senha -->
          <div class="field-group">
            <div class="input-wrapper">
              <img src="/images/cadeado.svg" alt="Senha" class="input-icon" />
              <input 
                type="password" 
                v-model="formData.repetirNovaSenha"
                placeholder="Repita a nova senha" 
                class="field-input"
                required
              />
            </div>
          </div>

          <!-- Botões -->
          <div class="modal-buttons">
            <button type="button" class="cancel-btn" @click="cancelar">
              Cancelar
            </button>
            <button type="submit" class="save-btn" :disabled="!todosOsCamposPreenchidos">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Alertas -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucesso"
      :mensagem="mensagemAlerta"
      @fechar="fecharAlertaSucesso"
    />

    <AlertaErro 
      v-if="mostrarAlertaErro"
      :titulo="tituloErro"
      :mensagem="mensagemAlerta"
      @fechar="fecharAlertaErro"
    />

    <ConfirmarCancelamento
      v-if="mostrarConfirmacao"
      titulo="Cancelar alteração"
      mensagem="Tem certeza que deseja cancelar? As informações não serão salvas."
      texto-cancelar="Não, continuar"
      texto-confirmar="Sim, cancelar"
      @cancelar="cancelarConfirmacao"
      @confirmar="confirmarCancelamento"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'
import ConfirmarCancelamento from '../../components/UI/ConfirmarCancelamento.vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fechar', 'salvar'])

// Estados
const formData = ref({
  senhaAtual: '',
  novaSenha: '',
  repetirNovaSenha: ''
})

// Estados dos alertas
const mostrarAlertaSucesso = ref(false)
const mostrarAlertaErro = ref(false)
const mensagemAlerta = ref('')
const tituloErro = ref('Erro')

// Estados da confirmação
const mostrarConfirmacao = ref(false)

// Computed para verificar se todos os campos estão preenchidos
const todosOsCamposPreenchidos = computed(() => {
  return formData.value.senhaAtual.trim() && 
         formData.value.novaSenha.trim() && 
         formData.value.repetirNovaSenha.trim()
})

// Controles do modal
const fechar = () => {
  limparFormulario()
  emit('fechar')
}

const handleOverlayClick = () => {
  // Não fechar automaticamente para evitar perda de dados
}

const cancelar = () => {
  if (Object.values(formData.value).some(val => val.trim())) {
    mostrarConfirmacao.value = true
  } else {
    fechar()
  }
}

const confirmarCancelamento = () => {
  mostrarConfirmacao.value = false
  fechar()
}

const cancelarConfirmacao = () => {
  mostrarConfirmacao.value = false
}

const salvar = () => {
  // Validações básicas
  if (!formData.value.senhaAtual || !formData.value.novaSenha || !formData.value.repetirNovaSenha) {
    tituloErro.value = 'Campos obrigatórios'
    mensagemAlerta.value = 'Por favor, preencha todos os campos.'
    mostrarAlertaErro.value = true
    return
  }

  if (formData.value.novaSenha !== formData.value.repetirNovaSenha) {
    tituloErro.value = 'Senhas não coincidem'
    mensagemAlerta.value = 'A nova senha e a confirmação não coincidem.'
    mostrarAlertaErro.value = true
    return
  }

  if (formData.value.novaSenha.length < 6) {
    tituloErro.value = 'Senha muito curta'
    mensagemAlerta.value = 'A nova senha deve ter pelo menos 6 caracteres.'
    mostrarAlertaErro.value = true
    return
  }

  // Emitir evento para o componente pai
  emit('salvar', formData.value)
}

// Funções para controlar alertas
const fecharAlertaSucesso = () => {
  mostrarAlertaSucesso.value = false
}

const fecharAlertaErro = () => {
  mostrarAlertaErro.value = false
}

const limparFormulario = () => {
  formData.value = {
    senhaAtual: '',
    novaSenha: '',
    repetirNovaSenha: ''
  }
}
</script>

<style scoped>
.atualizar-senha-overlay {
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

.atualizar-senha-modal {
  background: white;
  border-radius: 12px;
  width: 339px;
  min-height: 353px;
  height: auto;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1201;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  flex-shrink: 0;
}

.header-icon-left {
  width: 48px;
  height: 48px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon-right {
  width: 24px;
  height: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #101828;
  margin: 0;
  padding: 0 20px;
  flex-shrink: 0;
}

.modal-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.modal-content form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  flex: 1;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  z-index: 1;
}

.field-input {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 48px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 14px;
  color: #101828;
  background: white;
  transition: border-color 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.field-input:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.field-input::placeholder {
  color: #667085;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.cancel-btn {
  background: #FFFFFF;
  color: #0468FA;
  border: 1px solid #0468FA;
  border-radius: 8px;
  width: 150px;
  height: 44px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn:hover {
  background: #F0F7FF;
}

.save-btn {
  background: #0468FA;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  width: 150px;
  height: 44px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn:hover:not(:disabled) {
  background: #0356D6;
}

.save-btn:disabled {
  background: #D0D5DD;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsivo */
@media (max-width: 480px) {
  .atualizar-senha-modal {
    width: 90vw;
    max-width: 339px;
    height: auto;
    min-height: 353px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .modal-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style> 