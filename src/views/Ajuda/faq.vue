<template>
  <div class="faq-container">
    <div class="faq-grid">
      <!-- Primeira linha de cards -->
      <div class="faq-card">
        <div class="card-icon">
          <img src="/images/dasboard.svg" alt="Dashboard" />
        </div>
        <div class="card-title">Dashboard</div>
      </div>
      
      <div class="faq-card">
        <div class="card-icon">
          <img src="/images/intimacoes.svg" alt="Intimações" />
        </div>
        <div class="card-title">Intimações</div>
      </div>
      
      <div class="faq-card">
        <div class="card-icon">
          <img src="/images/clientes.svg" alt="Clientes" />
        </div>
        <div class="card-title">Clientes</div>
      </div>
      
      <div class="faq-card">
        <div class="card-icon">
          <img src="/images/documentos.svg" alt="Documentos" />
        </div>
        <div class="card-title">Documentos</div>
      </div>
      
      <!-- Segunda linha de cards -->
      <div class="faq-card">
        <div class="card-icon">
          <img src="/images/processos.svg" alt="Processos" />
        </div>
        <div class="card-title">Processos</div>
      </div>
      
      <div class="faq-card">
        <div class="card-icon">
          <img src="/images/relatorios.svg" alt="Relatórios" />
        </div>
        <div class="card-title">Relatórios</div>
      </div>
      
      <div class="faq-card">
        <div class="card-icon">
          <img src="/images/minhhaagenda.svg" alt="Minha agenda" />
        </div>
        <div class="card-title">Minha agenda</div>
      </div>
      
      <div class="faq-card">
        <div class="card-icon">
          <img src="/images/financeiros.svg" alt="Planejamento financeiro" />
        </div>
        <div class="card-title">Planejamento financeiro</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente FAQ - Cards de funcionalidades
</script>

<style scoped>
/* Desktop Layout */
@media (min-width: 769px) {
  .faq-container {
    width: 100%;
    max-width: 1248px;
    margin: 0 auto;
    padding: 48px 0;
  }
  
  .faq-grid {
    display: grid;
    grid-template-columns: repeat(4, 277px);
    grid-template-rows: repeat(2, 150px);
    gap: 24px;
    justify-content: center;
    align-content: center;
  }
  
  .faq-card {
    width: 277px;
    height: 150px;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .faq-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #0468FA;
  }
  
  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
  }
  
  .card-icon img {
    width: 32px;
    height: 32px;
  }
  
  .card-title {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #101828;
    text-align: center;
    line-height: 1.2;
  }
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .faq-container {
    padding: 32px 16px;
  }
  
  .faq-grid {
    grid-template-columns: repeat(3, 240px);
    grid-template-rows: repeat(3, 130px);
    gap: 20px;
  }
  
  .faq-card {
    width: 240px;
    height: 130px;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
  }
  
  .card-icon img {
    width: 28px;
    height: 28px;
  }
  
  .card-title {
    font-size: 14px;
  }
}

/* Mobile Layout */
@media (max-width: 768px) {
  .faq-container {
    width: 100%;
    padding: 32px 16px;
  }
  
  .faq-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 120px);
    gap: 16px;
    max-width: 100%;
  }
  
  .faq-card {
    width: 100%;
    height: 120px;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .faq-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #0468FA;
  }
  
  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
  }
  
  .card-icon img {
    width: 24px;
    height: 24px;
  }
  
  .card-title {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #101828;
    text-align: center;
    line-height: 1.2;
    padding: 0 8px;
  }
}

/* Small Mobile Layout */
@media (max-width: 480px) {
  .faq-container {
    padding: 24px 12px;
  }
  
  .faq-grid {
    grid-template-rows: repeat(4, 100px);
    gap: 12px;
  }
  
  .faq-card {
    height: 100px;
    gap: 8px;
  }
  
  .card-icon {
    width: 32px;
    height: 32px;
  }
  
  .card-icon img {
    width: 20px;
    height: 20px;
  }
  
  .card-title {
    font-size: 11px;
  }
}
</style> 