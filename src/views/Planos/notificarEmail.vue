<script setup>
import { ref } from 'vue';
import Button from '../../components/UI/Button.vue';

const email = ref('');
const isLoading = ref(false);
const showSuccess = ref(false);

function enviarEmail() {
  if (!email.value) return;
  
  isLoading.value = true;
  
  // Simular envio de email
  setTimeout(() => {
    isLoading.value = false;
    showSuccess.value = true;
    
    // Resetar após 3 segundos
    setTimeout(() => {
      showSuccess.value = false;
      email.value = '';
    }, 3000);
  }, 1500);
}
</script>

<template>
  <div class="notificar-email">
    <div class="email-container">
      <div class="email-imagem">
        <img src="/images/emailplanos.png" alt="Planos personalizados" />
      </div>
      
      <div class="email-content">
        <h3 class="email-titulo">Não encontrou o plano ideal para você?</h3>
        <p class="email-descricao">
          Precisa de mais ou algo personalizado para o seu escritório? Entre em contato conosco!
        </p>
        
        <div class="email-form" v-if="!showSuccess">
          <div class="input-group">
            <input 
              v-model="email"
              type="email" 
              placeholder="Digite seu e-mail"
              class="email-input"
              :disabled="isLoading"
              @keyup.enter="enviarEmail"
            />
            <Button 
              type="primary"
              :label="isLoading ? 'Enviando...' : 'Enviar e-mail'"
              @click="enviarEmail"
              :disabled="!email || isLoading"
              class="btn-enviar"
            />
          </div>
        </div>
        
        <div v-if="showSuccess" class="success-message">
          <div class="success-icon">✓</div>
          <p class="success-text">E-mail enviado com sucesso! Entraremos em contato em breve.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notificar-email {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 40px;
  margin: 40px 0;
  font-family: 'Inter', sans-serif;
}

.email-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.email-imagem {
  margin-bottom: 32px;
}

.email-imagem img {
  width: 240px;
  height: auto;
  object-fit: contain;
}

.email-content {
  width: 100%;
}

.email-titulo {
  font-size: 28px;
  font-weight: 700;
  color: #101828;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.email-descricao {
  font-size: 16px;
  color: #475467;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.email-form {
  max-width: 400px;
  margin: 0 auto;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
}

.email-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  background-color: #FFFFFF;
  color: #101828;
}

.email-input:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 3px rgba(4, 104, 250, 0.1);
}

.email-input:disabled {
  background-color: #F9FAFB;
  color: #6B7280;
  cursor: not-allowed;
}

.email-input::placeholder {
  color: #9CA3AF;
}

.btn-enviar {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.success-icon {
  width: 24px;
  height: 24px;
  background-color: #10B981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.success-text {
  font-size: 14px;
  color: #065F46;
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .notificar-email {
    padding: 32px 20px;
    margin: 32px 0;
  }
  
  .email-imagem img {
    width: 200px;
  }
  
  .email-titulo {
    font-size: 24px;
  }
  
  .email-descricao {
    font-size: 14px;
    margin-bottom: 24px;
  }
  
  .input-group {
    gap: 12px;
  }
  
  .email-input {
    padding: 12px 14px;
    font-size: 15px;
  }
  
  .btn-enviar {
    height: 44px;
    font-size: 15px;
  }
  
  .success-message {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .notificar-email {
    padding: 24px 16px;
  }
  
  .email-imagem {
    margin-bottom: 24px;
  }
  
  .email-imagem img {
    width: 160px;
  }
  
  .email-titulo {
    font-size: 20px;
  }
}
</style> 