<template>
  <div class="enviar-email-container">
    <!-- Botão Voltar -->
    <div class="voltar-section">
      <button class="btn-voltar" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#0169FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Voltar
      </button>
    </div>

    <!-- Conteúdo principal -->
    <div class="main-content">
      <!-- Seção esquerda - Formulário -->
      <div class="form-section">
        <div class="header-text">
          <h1 class="main-title">Precisa de ajuda?</h1>
          <p class="subtitle">Envie um e-mail que nós retornaremos o mais rápido possível.</p>
        </div>

        <form class="email-form" @submit.prevent="enviarEmail">
          <!-- Campo Nome -->
          <div class="form-group">
            <label class="form-label">Seu nome</label>
            <input 
              type="text" 
              class="form-input" 
              v-model="formData.nome"
              placeholder="Helena Silva Santos"
              required
            />
          </div>

          <!-- Campo Email -->
          <div class="form-group">
            <label class="form-label">e-mail</label>
            <input 
              type="email" 
              class="form-input" 
              v-model="formData.email"
              placeholder="helena.santos@jusprod.com.br"
              required
            />
          </div>

          <!-- Campo Telefone -->
          <div class="form-group">
            <label class="form-label">Número de telefone</label>
            <input 
              type="tel" 
              class="form-input" 
              v-model="formData.telefone"
              placeholder="(13) 98112-9974"
              required
            />
          </div>

          <!-- Campo Mensagem -->
          <div class="form-group">
            <label class="form-label">Mensagem</label>
            <textarea 
              class="form-textarea" 
              v-model="formData.mensagem"
              placeholder="Escreva sua mensagem"
              rows="4"
              required
            ></textarea>
          </div>

          <!-- Botão Enviar -->
          <button type="submit" class="btn-enviar" :disabled="!isFormValid">
            Enviar
          </button>
        </form>
      </div>

      <!-- Seção direita - Imagem -->
      <div class="image-section">
        <img src="/images/enviar_email.svg" alt="Enviar Email" class="email-illustration" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Dados do formulário
const formData = ref({
  nome: '',
  email: '',
  telefone: '',
  mensagem: ''
})

// Computed para validar se o formulário está válido
const isFormValid = computed(() => {
  return formData.value.nome.trim() !== '' &&
         formData.value.email.trim() !== '' &&
         formData.value.telefone.trim() !== '' &&
         formData.value.mensagem.trim() !== ''
})

// Função para voltar
const goBack = () => {
  router.go(-1)
}

// Função para enviar email
const enviarEmail = () => {
  if (!isFormValid.value) return
  
  // Aqui você pode implementar a lógica de envio do email
  console.log('Enviando email:', formData.value)
  
  // Exemplo de implementação:
  // await emailService.enviarEmail(formData.value)
  
  // Limpar formulário após envio
  formData.value = {
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  }
  
  // Mostrar mensagem de sucesso ou redirecionar
  alert('E-mail enviado com sucesso!')
}
</script>

<style scoped>
/* Base styles - Mobile First */
.enviar-email-container {
  min-height: 100vh;
  background: #FFFFFF;
  padding: 20px 16px;
}

.voltar-section {
  margin-bottom: 32px;
}

.btn-voltar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #0169FA;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
  transition: all 0.2s ease;
}

.btn-voltar:hover {
  opacity: 0.8;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.form-section {
  flex: 1;
}

.header-text {
  margin-bottom: 32px;
}

.main-title {
  font-family: 'Inter', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #101828;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #6B7280;
  margin: 0;
  line-height: 1.5;
}

.email-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #111827;
  background: #FFFFFF;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0169FA;
  box-shadow: 0 0 0 3px rgba(1, 105, 250, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9CA3AF;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.btn-enviar {
  width: 176px;
  height: 44px;
  background: #0468FA;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.btn-enviar:hover:not(:disabled) {
  background: #0356D6;
  transform: translateY(-1px);
}

.btn-enviar:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  transform: none;
}

.image-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.email-illustration {
  width: 100%;
  max-width: 400px;
  height: auto;
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .enviar-email-container {
    padding: 32px 24px;
  }
  
  .main-content {
    gap: 60px;
  }
  
  .main-title {
    font-size: 36px;
  }
  
  .subtitle {
    font-size: 18px;
  }
  
  .email-illustration {
    max-width: 350px;
  }
}

/* Desktop Layout */
@media (min-width: 1025px) {
  .enviar-email-container {
    padding: 40px 32px;
  }
  
  .main-content {
    flex-direction: row;
    gap: 80px;
    align-items: flex-start;
  }
  
  .form-section {
    flex: 1;
    max-width: 600px;
  }
  
  .image-section {
    flex: 1;
    max-width: 500px;
  }
  
  .main-title {
    font-size: 40px;
  }
  
  .subtitle {
    font-size: 18px;
  }
  
  .email-illustration {
    max-width: 500px;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .enviar-email-container {
    padding: 48px 40px;
  }
  
  .main-content {
    gap: 100px;
  }
  
  .main-title {
    font-size: 42px;
  }
  
  .email-illustration {
    max-width: 600px;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .enviar-email-container {
    padding: 16px 12px;
  }
  
  .main-title {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .form-input,
  .form-textarea {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .btn-enviar {
    width: 176px;
    height: 44px;
    font-size: 14px;
  }
  
  .email-illustration {
    max-width: 280px;
  }
}
</style> 