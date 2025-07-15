<template>
  <div class="page-container">
    <!-- Menu Fixo (já inclui HeaderMobile para mobile) -->
    <MenuFixo />
    
    <div class="main-content">
      <!-- Header com ícone e textos - IDÊNTICO ao filtroFinanceiro.vue -->
      <div class="titulo-container">
        <h1 class="titulo">
          <img src="/images/setasalto.svg" alt="Seta" class="titulo-icone">
          Nós estamos aqui para te ajudar
        </h1>
        <p class="subtitulo">Você receberá alertas sobre processos, agendamentos, compromissos e também de comunicados da Plataforma Jusprod.</p>
      </div>
      
      <!-- FAQ Info Component -->
      <div class="content-section">
        <FaqInfo />
      </div>
      
      <!-- FAQ Cards Component -->
      <div class="content-section">
        <Faq />
      </div>
      
      <!-- Email Component -->
      <div class="content-section">
        <EmailComp />
      </div>
    </div>
  </div>
</template>

<script setup>
import MenuFixo from '../../components/UI/MenuFixo.vue';
import FaqInfo from './faq_info.vue';
import Faq from './faq.vue';
import EmailComp from './email_comp.vue';
</script>

<style scoped>
/* Base styles - Mobile First */
.page-container {
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
}

.main-content {
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
  padding: 16px 12px 32px 12px;
  margin: 0;
}

.titulo-container {
  margin-bottom: 24px;
  width: 100%;
  padding: 0;
}

.titulo {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #101828;
  margin: 0 0 8px 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 10px;
}

.titulo-icone {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.subtitulo {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #475467;
  margin: 0;
  line-height: 1.5;
  margin-left: 28px;
}

.content-section {
  width: 100%;
  margin-bottom: 0;
}

/* Small Mobile (até 480px) */
@media (max-width: 480px) {
  .main-content {
    padding: 12px 8px 24px 8px;
  }
  
  .titulo {
    font-size: 18px;
    gap: 8px;
  }
  
  .titulo-icone {
    width: 16px;
    height: 16px;
  }
  
  .subtitulo {
    font-size: 12px;
    margin-left: 24px;
  }
}

/* Medium Mobile (481px - 768px) */
@media (min-width: 481px) and (max-width: 768px) {
  .main-content {
    padding: 16px 16px 32px 16px;
  }
  
  .titulo {
    font-size: 22px;
    gap: 12px;
  }
  
  .titulo-icone {
    width: 20px;
    height: 20px;
  }
  
  .subtitulo {
    font-size: 14px;
    margin-left: 32px;
  }
}

/* Tablet (769px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-content {
    padding: 20px 24px 40px 24px;
    max-width: 1024px;
    margin: 0 auto;
  }
  
  .titulo-container {
    margin-bottom: 32px;
    text-align: center;
  }
  
  .titulo {
    font-size: 28px;
    gap: 14px;
    justify-content: center;
  }
  
  .titulo-icone {
    width: 22px;
    height: 22px;
  }
  
  .subtitulo {
    font-size: 15px;
    margin-left: 0;
    text-align: center;
    max-width: 80%;
    margin: 0 auto;
  }
  
  .content-section {
    max-width: 100%;
    margin: 0 auto;
  }
}

/* Desktop Small (1025px - 1279px) */
@media (min-width: 1025px) and (max-width: 1279px) {
  .main-content {
    padding: 24px 32px 48px 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .titulo-container {
    margin-bottom: 32px;
    max-width: 1136px;
    margin: 0 auto 32px auto;
  }
  
  .titulo {
    font-size: 32px;
    gap: 14px;
  }
  
  .titulo-icone {
    width: 24px;
    height: 24px;
  }
  
  .subtitulo {
    font-size: 16px;
    margin-left: 38px;
  }
  
  .content-section {
    max-width: 1136px;
    margin: 0 auto;
  }
}

/* Desktop Large (1280px+) */
@media (min-width: 1280px) {
  .main-content {
    padding: 32px 16px 64px 16px;
    max-width: 1280px;
    margin: 0 auto;
  }
  
  .titulo-container {
    margin-bottom: 40px;
    max-width: 1248px;
    margin: 0 auto 40px auto;
  }
  
  .titulo {
    font-size: 38px;
    gap: 16px;
  }
  
  .titulo-icone {
    width: 24px;
    height: 24px;
  }
  
  .subtitulo {
    font-size: 16px;
    margin-left: 40px;
  }
  
  .content-section {
    max-width: 1248px;
    margin: 0 auto;
  }
}

/* Ultra Wide (1440px+) */
@media (min-width: 1440px) {
  .main-content {
    padding: 40px 32px 80px 32px;
    max-width: 1400px;
  }
  
  .titulo-container {
    margin-bottom: 48px;
    max-width: 1336px;
  }
  
  .titulo {
    font-size: 40px;
  }
  
  .subtitulo {
    font-size: 18px;
    margin-left: 44px;
  }
  
  .content-section {
    max-width: 1336px;
  }
}

/* Smooth transitions for all screen sizes */
.main-content,
.titulo-container,
.titulo,
.subtitulo,
.content-section {
  transition: all 0.3s ease;
}

/* Ensure proper overflow handling */
.page-container {
  overflow-x: hidden;
}

.main-content {
  overflow-x: hidden;
}

/* Better accessibility for touch devices */
@media (hover: none) and (pointer: coarse) {
  .titulo,
  .subtitulo {
    -webkit-tap-highlight-color: transparent;
  }
}
</style> 