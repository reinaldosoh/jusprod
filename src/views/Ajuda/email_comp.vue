<template>
  <div class="email-comp-container">
    <!-- Título superior -->
    <div class="main-title">
      Não encontrou o que procurava?
    </div>
    
    <!-- Conteúdo principal -->
    <div class="content-wrapper">
      <!-- Imagem à esquerda -->
      <div class="image-section">
        <img src="/images/email_ilustra.svg" alt="Email Ilustração" class="email-image" />
      </div>
      
      <!-- Conteúdo de texto à direita -->
      <div class="text-section">
        <h2 class="contact-title">
          Entre em contato, nós responderemos<br>
          o mais rápido possível.
        </h2>
        
        <div class="subtitle-wrapper">
          <p class="subtitle-line">Nós vamos responder o mais breve possível.</p>
          <p class="subtitle-line">Resposta em até 24h.</p>
        </div>
        
        <button class="email-button" @click="irParaEnviarEmail">
          e-mail
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Função para navegar para a página de envio de email
const irParaEnviarEmail = () => {
  router.push('/ajuda/enviar-email')
}
</script>

<style scoped>
/* Desktop Layout */
@media (min-width: 769px) {
  .email-comp-container {
    width: 100%;
    max-width: 1248px;
    margin: 0 auto;
    padding: 80px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .main-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #101828;
    text-align: center;
    margin-bottom: 48px;
    line-height: 1.2;
  }
  
  .content-wrapper {
    display: flex;
    align-items: center;
    gap: 80px;
    width: 100%;
    max-width: 1000px;
  }
  
  .image-section {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .email-image {
    width: 400px;
    height: auto;
    max-width: 100%;
  }
  
  .text-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .contact-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #101828;
    margin: 0;
    line-height: 1.2;
  }
  
  .subtitle-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .subtitle-line {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: #6B7280;
    margin: 0;
    line-height: 1.4;
  }
  
  .email-button {
    width: 176px;
    height: 44px;
    background: #0169FA;
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
  }
  
  .email-button:hover {
    background: #0056E6;
    transform: translateY(-1px);
  }
  
  .email-button:active {
    transform: translateY(0);
  }
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .email-comp-container {
    padding: 60px 20px;
  }
  
  .content-wrapper {
    flex-direction: column;
    gap: 40px;
    text-align: center;
  }
  
  .email-image {
    width: 320px;
  }
  
  .contact-title {
    font-size: 22px;
  }
  
  .subtitle-line {
    font-size: 15px;
  }
}

/* Mobile Layout */
@media (max-width: 768px) {
  .email-comp-container {
    width: 100%;
    padding: 48px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .main-title {
    font-family: 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #101828;
    text-align: center;
    margin-bottom: 32px;
    line-height: 1.2;
  }
  
  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    width: 100%;
    text-align: center;
  }
  
  .image-section {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .email-image {
    width: 280px;
    height: auto;
    max-width: 100%;
  }
  
  .text-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }
  
  .contact-title {
    font-family: 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #101828;
    margin: 0;
    line-height: 1.2;
  }
  
  .subtitle-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .subtitle-line {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #6B7280;
    margin: 0;
    line-height: 1.4;
  }
  
  .email-button {
    width: 176px;
    height: 44px;
    background: #0169FA;
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
    margin: 0 auto;
  }
  
  .email-button:hover {
    background: #0056E6;
    transform: translateY(-1px);
  }
  
  .email-button:active {
    transform: translateY(0);
  }
}

/* Small Mobile Layout */
@media (max-width: 480px) {
  .email-comp-container {
    padding: 32px 12px;
  }
  
  .main-title {
    font-size: 18px;
    margin-bottom: 24px;
  }
  
  .content-wrapper {
    gap: 24px;
  }
  
  .email-image {
    width: 240px;
  }
  
  .contact-title {
    font-size: 18px;
  }
  
  .subtitle-line {
    font-size: 13px;
  }
  
  .email-button {
    width: 160px;
    height: 40px;
    font-size: 14px;
  }
}
</style> 