<template>
  <div class="faq-info-container">
    <!-- Ícone à esquerda -->
    <div class="faq-icon">
      <img src="/images/faq.svg" alt="FAQ" class="icon-image" />
    </div>
    
    <!-- Conteúdo de texto à direita -->
    <div class="faq-content">
      <h2 class="faq-title">Informação é uma de nossas prioridades</h2>
      <p class="faq-subtitle">
        Por isso nós criamos um canal exclusivo no Youtube para manter você informado(a). 
        Separamos toda documentação por tela, assim você poderá extrair o máximo 
        da Jusprod quando quiser e onde estiver!
      </p>
    </div>
  </div>
</template>

<script setup>
// Componente FAQ Info - sem lógica necessária por enquanto
</script>

<style scoped>
/* Desktop Layout */
@media (min-width: 769px) {
  .faq-info-container {
    display: flex;
    align-items: center;
    gap: 48px;
    max-width: 1248px; /* Largura máxima disponível (1280 - 32px padding) */
    margin: 0 auto;
    width: 100%;
    padding: 48px 24px;
    background: white;
  }
  
  .faq-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .icon-image {
    width: 280px;
    height: auto;
    max-width: 100%;
  }
  
  .faq-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .faq-title {
    font-family: 'Inter', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #101828;
    margin: 0;
    line-height: 1.2;
  }
  
  .faq-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 400;
    color: #4B5563;
    margin: 0;
    line-height: 1.6;
  }
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .faq-info-container {
    flex-direction: column;
    text-align: center;
    gap: 32px;
    padding: 40px 20px;
  }
  
  .icon-image {
    width: 240px;
  }
  
  .faq-title {
    font-size: 28px;
  }
  
  .faq-subtitle {
    font-size: 16px;
  }
}

/* Mobile Layout */
@media (max-width: 768px) {
  .faq-info-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
    width: 100%;
    padding: 32px 16px;
    background: white;
    margin: 0 auto;
  }
  
  .faq-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .icon-image {
    width: 200px;
    height: auto;
    max-width: 100%;
  }
  
  .faq-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
  
  .faq-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #101828;
    margin: 0;
    line-height: 1.2;
  }
  
  .faq-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: #4B5563;
    margin: 0;
    line-height: 1.6;
  }
}

/* Small Mobile Layout */
@media (max-width: 480px) {
  .faq-info-container {
    padding: 24px 12px;
    gap: 20px;
  }
  
  .icon-image {
    width: 160px;
  }
  
  .faq-title {
    font-size: 20px;
  }
  
  .faq-subtitle {
    font-size: 14px;
    line-height: 1.5;
  }
}

/* Sem transições e hover effects */
</style> 