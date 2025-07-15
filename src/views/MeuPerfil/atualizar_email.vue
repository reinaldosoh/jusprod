<template>
  <div v-if="isVisible" class="atualizar-email-overlay" @click="handleOverlayClick">
    <div class="atualizar-email-modal" @click.stop>
      <!-- Header com ícones -->
      <div class="modal-header">
        <img src="/images/env_circular.svg" alt="Envelope" class="header-icon-left" />
        <button class="close-button" @click="fechar">
          <img src="/images/close_p.svg" alt="Fechar" class="header-icon-right" />
        </button>
      </div>

      <!-- Título -->
      <h2 class="modal-title">Alteração de e-mail</h2>

      <!-- Conteúdo -->
      <div class="modal-content">
        <form @submit.prevent="salvar">
          <!-- Aviso de rate limiting -->
          <div v-if="!disponibilidadeStatus.disponivel" class="rate-limit-warning">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
              <p>Aguarde {{ disponibilidadeStatus.tempoRestante }} segundos antes de tentar novamente.</p>
              <p class="warning-subtext">Esta é uma medida de segurança do sistema.</p>
            </div>
          </div>

          <!-- Novo e-mail -->
          <div class="field-group">
            <div class="input-wrapper">
              <img src="/images/envelope.svg" alt="E-mail" class="input-icon" />
              <input 
                type="email" 
                v-model="formData.novoEmail"
                placeholder="Novo e-mail" 
                class="field-input"
                :disabled="isLoading || !disponibilidadeStatus.disponivel"
                required
              />
            </div>
          </div>

          <!-- Confirmar novo e-mail -->
          <div class="field-group">
            <div class="input-wrapper">
              <img src="/images/envelope.svg" alt="E-mail" class="input-icon" />
              <input 
                type="email" 
                v-model="formData.confirmarEmail"
                placeholder="Confirme o novo e-mail" 
                class="field-input"
                :disabled="isLoading || !disponibilidadeStatus.disponivel"
                required
              />
            </div>
          </div>

          <!-- Senha -->
          <div class="field-group">
            <div class="input-wrapper">
              <img src="/images/cadeado.svg" alt="Senha" class="input-icon" />
              <input 
                type="password" 
                v-model="formData.senhaAtual"
                placeholder="Digite sua senha" 
                class="field-input"
                :disabled="isLoading || !disponibilidadeStatus.disponivel"
                required
              />
            </div>
          </div>

          <!-- Botões -->
          <div class="modal-buttons">
            <button type="button" class="cancel-btn" @click="cancelar" :disabled="isLoading">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="save-btn" 
              :disabled="!todosCamposHabilitados || isLoading || !disponibilidadeStatus.disponivel"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              <span v-if="!isLoading">Salvar</span>
              <span v-else>Salvando...</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  novoEmail: '',
  confirmarEmail: '',
  senhaAtual: ''
})

const isLoading = ref(false)
const disponibilidadeStatus = ref({
  disponivel: true,
  tempoRestante: 0
})

// Estados dos alertas
const mostrarAlertaSucesso = ref(false)
const mostrarAlertaErro = ref(false)
const mensagemAlerta = ref('')
const tituloErro = ref('Erro')

// Estados da confirmação
const mostrarConfirmacao = ref(false)

// Intervalo para atualizar disponibilidade
let intervalId = null

// Computed para verificar se todos os campos estão preenchidos e habilitados
const todosCamposHabilitados = computed(() => {
  return formData.value.novoEmail.trim() && 
         formData.value.confirmarEmail.trim() && 
         formData.value.senhaAtual.trim() &&
         disponibilidadeStatus.value.disponivel &&
         !isLoading.value
})

// Função para verificar disponibilidade
const verificarDisponibilidade = async () => {
  try {
    const { emailUpdateService } = await import('../../services/emailUpdateService')
    disponibilidadeStatus.value = emailUpdateService.verificarDisponibilidade()
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
  }
}

// Controles do modal
const fechar = () => {
  limparFormulario()
  pararVerificacaoDisponibilidade()
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

const salvar = async () => {
  if (isLoading.value || !disponibilidadeStatus.value.disponivel) {
    return
  }

  // Validações básicas
  if (!formData.value.novoEmail || !formData.value.confirmarEmail || !formData.value.senhaAtual) {
    tituloErro.value = 'Campos obrigatórios'
    mensagemAlerta.value = 'Por favor, preencha todos os campos.'
    mostrarAlertaErro.value = true
    return
  }

  if (formData.value.novoEmail !== formData.value.confirmarEmail) {
    tituloErro.value = 'E-mails não coincidem'
    mensagemAlerta.value = 'Os e-mails não coincidem.'
    mostrarAlertaErro.value = true
    return
  }

  // Validar formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.novoEmail)) {
    tituloErro.value = 'Formato inválido'
    mensagemAlerta.value = 'Por favor, insira um formato de e-mail válido.'
    mostrarAlertaErro.value = true
    return
  }

  if (!emailRegex.test(formData.value.confirmarEmail)) {
    tituloErro.value = 'Formato inválido'
    mensagemAlerta.value = 'Por favor, insira um formato de e-mail válido na confirmação.'
    mostrarAlertaErro.value = true
    return
  }

  // Iniciar loading
  isLoading.value = true

  try {
    // Emitir evento para o componente pai
    emit('salvar', formData.value)
  } catch (error) {
    console.error('Erro ao salvar:', error)
    tituloErro.value = 'Erro interno'
    mensagemAlerta.value = 'Erro interno: ' + error.message
    mostrarAlertaErro.value = true
  } finally {
    // Parar loading
    isLoading.value = false
  }
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
    novoEmail: '',
    confirmarEmail: '',
    senhaAtual: ''
  }
  isLoading.value = false
}

// Função para iniciar verificação de disponibilidade
const iniciarVerificacaoDisponibilidade = () => {
  // Verificar imediatamente
  verificarDisponibilidade()
  
  // Verificar a cada segundo
  intervalId = setInterval(verificarDisponibilidade, 1000)
}

// Função para parar verificação de disponibilidade
const pararVerificacaoDisponibilidade = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Lifecycle hooks
onMounted(() => {
  iniciarVerificacaoDisponibilidade()
})

onUnmounted(() => {
  pararVerificacaoDisponibilidade()
})
</script>

<style scoped>
.atualizar-email-overlay {
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

.atualizar-email-modal {
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

.rate-limit-warning {
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.warning-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.warning-text {
  flex: 1;
}

.warning-text p {
  margin: 0;
  font-size: 14px;
  color: #92400E;
  font-weight: 500;
}

.warning-subtext {
  font-size: 12px !important;
  color: #B45309 !important;
  font-weight: 400 !important;
  margin-top: 4px !important;
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

.field-input:disabled {
  background: #F9FAFB;
  color: #6B7280;
  cursor: not-allowed;
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

.cancel-btn:hover:not(:disabled) {
  background: #F0F7FF;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  gap: 8px;
}

.save-btn:hover:not(:disabled) {
  background: #0356D6;
}

.save-btn:disabled {
  background: #D0D5DD;
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsivo */
@media (max-width: 480px) {
  .atualizar-email-modal {
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