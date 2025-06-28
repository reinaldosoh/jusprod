<script setup>
import { ref, computed } from 'vue';
import Input from './Input.vue';
import Button from './Button.vue';
import { emailService } from '../../services/emailService.js';

const props = defineProps({
  processoId: {
    type: [Number, String],
    required: true
  },
  cnj: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  },
  intimacao: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'mensagem-enviada']);

// Estados do componente
const titulo = ref('');
const textoMensagem = ref('');
const enviarParaOutros = ref(false);
const emailsAdicionais = ref([
  { email: '' }
]);
const loading = ref(false);
const error = ref('');

// Adicionar novo campo de email
function adicionarNovoEmail() {
  emailsAdicionais.value.push({ email: '' });
}

// Remover campo de email
function removerEmail(index) {
  if (emailsAdicionais.value.length > 1) {
    emailsAdicionais.value.splice(index, 1);
  }
}

// Validar formato de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar formulário
const formularioValido = computed(() => {
  if (!titulo.value.trim() || !textoMensagem.value.trim()) {
    return false;
  }
  
  if (enviarParaOutros.value) {
    return emailsAdicionais.value.some(email => 
      email.email.trim() && isValidEmail(email.email.trim())
    );
  }
  
  return true;
});

// Função para resetar todos os campos
function resetarCampos() {
  titulo.value = '';
  textoMensagem.value = '';
  enviarParaOutros.value = false;
  emailsAdicionais.value = [{ email: '' }];
  error.value = '';
}

async function enviarMensagem() {
  if (!formularioValido.value) {
    error.value = 'Preencha todos os campos obrigatórios';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const dadosEnvio = {
      processoId: props.processoId,
      titulo: titulo.value.trim(),
      mensagem: textoMensagem.value.trim(),
      emailsAdicionais: enviarParaOutros.value 
        ? emailsAdicionais.value.filter(email => email.email.trim() && isValidEmail(email.email.trim()))
        : [],
      intimacao: props.intimacao || null
    };

    // Chamar serviço de Email apropriado
    const resultado = props.intimacao 
      ? await emailService.enviarMensagemIntimacao(dadosEnvio)
      : await emailService.enviarMensagem(dadosEnvio);
    
    // Resetar campos após envio bem-sucedido
    resetarCampos();
    
    // Emitir evento de sucesso e fechar modal
    emit('mensagem-enviada', {
      titulo: titulo.value,
      totalEnvios: resultado.totalEnvios || 1,
      mensagem: resultado.mensagem || 'Email enviado com sucesso!'
    });
    emit('close');
    
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    error.value = err.message || 'Erro ao enviar email. Tente novamente.';
  } finally {
    loading.value = false;
  }
}

function fecharModal() {
  // Limpar formulário
  resetarCampos();
  emit('close');
}

// Fechar modal ao clicar fora
function handleClickOutside(event) {
  if (event.target.classList.contains('modal-overlay')) {
    fecharModal();
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="handleClickOutside">
    <div class="modal-container">
      <!-- Tarja azul -->
      <div class="header-bar">
        <h2 class="modal-title">Enviar email sobre esta movimentação para o cliente</h2>
        <button class="close-button" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo do modal -->
      <div class="modal-content">
        <!-- Título do conteúdo -->
        <h2 class="content-title">{{ intimacao ? 'Compartilhe a notificação sobre esta intimação' : 'Compartilhe a notificação sobre este processo' }}</h2>

        <!-- Informações da Intimação (se presente) -->
        <div v-if="intimacao" class="intimacao-info-section">
          <h3 class="section-title">Informações da Intimação</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Tipo:</span>
              <span class="info-value">{{ intimacao.tipo || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Seção:</span>
              <span class="info-value">{{ intimacao.secao || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Data:</span>
              <span class="info-value">{{ intimacao.data ? new Date(intimacao.data).toLocaleDateString('pt-BR') : 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tribunal:</span>
              <span class="info-value">{{ intimacao.tribunal || 'N/A' }}</span>
            </div>
            <div v-if="intimacao.snippet" class="info-item full-width">
              <span class="info-label">Resumo:</span>
              <span class="info-value">{{ intimacao.snippet }}</span>
            </div>
          </div>
        </div>

        <!-- Linha com Título e CNJ -->
        <div class="fields-row">
          <!-- Campo Título -->
          <div class="field-wrapper">
            <div class="input-with-icon">
              <div class="input-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3Z" stroke="#6B7280" stroke-width="1.33"/>
                  <path d="M15 4L8 9L1 4" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <Input
                v-model="titulo"
                placeholder="Insira o título da mensagem"
                class="input-with-padding"
              />
            </div>
          </div>

          <!-- Campo CNJ -->
          <div class="field-wrapper">
            <div class="input-with-icon">
              <div class="input-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line x1="8" y1="2" x2="8" y2="14" stroke="#6B7280" stroke-width="1"/>
                  <line x1="3" y1="6" x2="13" y2="6" stroke="#6B7280" stroke-width="1"/>
                  <path d="M1 8 L5 8 L4 10 L2 10 Z" fill="#6B7280"/>
                  <line x1="3" y1="6" x2="3" y2="8" stroke="#6B7280" stroke-width="1"/>
                  <path d="M11 8 L15 8 L14 10 L12 10 Z" fill="#6B7280"/>
                  <line x1="13" y1="6" x2="13" y2="8" stroke="#6B7280" stroke-width="1"/>
                  <line x1="6" y1="14" x2="10" y2="14" stroke="#6B7280" stroke-width="1.5"/>
                </svg>
              </div>
              <Input
                :model-value="cnj"
                :disabled="true"
                placeholder="CNJ"
                class="input-with-padding"
              />
            </div>
          </div>
        </div>

        <!-- Campo de Texto Longo -->
        <div class="field-wrapper">
          <textarea
            v-model="textoMensagem"
            placeholder="Escreva seu texto aqui"
            class="textarea-field"
            rows="4"
          ></textarea>
        </div>

        <!-- Switch para outros Emails -->
        <div class="switch-section">
          <div class="switch-container">
            <span class="switch-label">Enviar para outros emails além do cliente?</span>
            <div class="switch-wrapper">
              <input
                id="switch-outros-email"
                v-model="enviarParaOutros"
                type="checkbox"
                class="switch-input"
              />
              <label for="switch-outros-email" class="switch-slider"></label>
            </div>
          </div>
        </div>

        <!-- Campos de email (quando switch ativo) -->
        <div v-if="enviarParaOutros" class="emails-section">
          <h4 class="emails-title">Endereços de Email</h4>
          
          <div 
            v-for="(email, index) in emailsAdicionais" 
            :key="index"
            class="email-row"
          >
            <div class="email-field">
              <input
                v-model="email.email"
                placeholder="exemplo@email.com"
                class="email-input"
                type="email"
              />
            </div>
            
            <button
              v-if="emailsAdicionais.length > 1"
              @click="removerEmail(index)"
              class="remover-email"
              type="button"
            >
              ×
            </button>
          </div>

          <!-- Botão Novo Email -->
          <button
            @click="adicionarNovoEmail"
            class="novo-email-btn"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Novo email
          </button>
        </div>

        <!-- Mensagem de erro -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Botões de ação -->
        <div class="actions-section">
          <Button
            label="Cancelar"
            type="secondary"
            @click="fecharModal"
            :disabled="loading"
          />
          <Button
            :label="loading ? 'Enviando...' : 'Enviar'"
            type="primary"
            :disabled="loading || !formularioValido"
            @click="enviarMensagem"
            class="send-button"
            :class="{ 'loading': loading }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  width: 547px;
  background: white;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
}

.header-bar {
  height: 35px;
  background-color: #0468FA;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
}

.modal-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  margin: 0;

}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 20px;
}

.content-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  font-family: 'Inter', sans-serif;
}

.intimacao-info-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  min-width: 60px;
  font-family: 'Inter', sans-serif;
}

.info-value {
  font-size: 12px;
  color: #374151;
  font-family: 'Inter', sans-serif;
  word-break: break-word;
}

.field-wrapper {
  margin-bottom: 16px;
}

.fields-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.fields-row .field-wrapper {
  flex: 1;
  margin-bottom: 0;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  width: 16px;
  height: 44px;
}

.input-with-icon :deep(.icon-container) {
  display: none;
}

.input-with-icon :deep(.input-field) {
  padding-left: 40px;
  padding-right: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  height: 44px;
  line-height: 1;
}

.input-with-icon :deep(.input-wrapper) {
  border-radius: 8px;
  height: 44px;
  align-items: center;
}

.input-with-icon :deep(.input-container) {
  width: 100%;
  margin-bottom: 0;
}

.textarea-field {
  width: 100%;
  min-height: 100px;
  padding: 12px 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.textarea-field:focus {
  border-color: #0468FA;
}

.textarea-field::placeholder {
  color: #667085;
}

.switch-section {
  margin: 20px 0;
}

.switch-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-label {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
}

.switch-wrapper {
  position: relative;
}

.switch-input {
  display: none;
}

.switch-slider {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background-color: #D1D5DB;
  border-radius: 24px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.switch-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.switch-input:checked + .switch-slider {
  background-color: #0468FA;
}

.switch-input:checked + .switch-slider::before {
  transform: translateX(20px);
}

.emails-section {
  margin: 20px 0;
}

.emails-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.email-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.email-field {
  flex: 1;
}

.email-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  outline: none;
  transition: border-color 0.2s;
}

.email-input:focus {
  border-color: #0468FA;
}

.email-input::placeholder {
  color: #667085;
}

.remover-email {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: #EF4444;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remover-email:hover {
  background-color: #FEF2F2;
}

.novo-email-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #0468FA;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  font-family: 'Inter', sans-serif;
}

.novo-email-btn:hover {
  background-color: #F0F9FF;
}

.error-message {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
}

.actions-section {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.actions-section :deep(.button) {
  width: 176px;
  height: 44px;
}

/* Estilos para estado de loading */
.send-button.loading {
  position: relative;
  pointer-events: none;
}

.send-button.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

@media (max-width: 600px) {
  .modal-container {
    width: 90%;
    margin: 20px;
    max-height: 95vh;
  }
  
  .header-bar {
    height: auto;
    min-height: 45px;
    padding: 8px 15px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .modal-title {
    font-size: 13px;
    width: auto;
    white-space: normal;
    line-height: 1.2;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .fields-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .email-row {
    flex-wrap: wrap;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .actions-section :deep(.button) {
    width: 100%;
  }
  
  .input-with-icon :deep(.input-container),
  .input-with-icon :deep(.input-wrapper),
  .input-with-icon :deep(.input-field),
  .email-input,
  .textarea-field {
    width: 100%;
  }
}
</style> 