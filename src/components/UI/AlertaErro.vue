<script setup>
defineProps({
  titulo: {
    type: String,
    default: 'Atenção'
  },
  mensagem: {
    type: String,
    default: 'Conta exluída com sucesso. Esperamos ver você em breve!'
  }
});

defineEmits(['fechar']);
</script>

<template>
  <div class="overlay">
    <div class="alerta-erro">
      <div class="alerta-conteudo">
        <div class="icone-container">
          <div class="icone">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#E74C3C" stroke-width="2" fill="none"/>
              <path d="M12 7V13" stroke="#E74C3C" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="16" r="1" fill="#E74C3C"/>
            </svg>
          </div>
        </div>
        <div class="mensagem-container">
          <h2>{{ titulo }}</h2>
          <p>{{ mensagem }}</p>
        </div>
      </div>
      <div class="botao-container">
        <button class="botao-entendi" @click="$emit('fechar')">Entendi</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
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

.alerta-erro {
  width: 374px;
  height: 160px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  z-index: 1001;
}

.alerta-conteudo {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.icone-container {
  display: flex;
  align-items: flex-start;
}

.icone {
  width: 48px;
  height: 48px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mensagem-container {
  flex: 1;
}

.mensagem-container h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333333;
}

.mensagem-container p {
  font-size: 14px;
  margin: 0;
  color: #666666;
}

.botao-container {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.botao-entendi {
  width: 176px;
  height: 44px;
  background-color: #E74C3C;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.botao-entendi:hover {
  background-color: #C0392B;
}

@media (max-width: 768px) {
  .alerta-erro {
    width: calc(100vw - 32px);
    max-width: 340px;
    margin: 16px;
  }
  
  .botao-entendi {
    width: 100%;
    height: 48px;
    font-size: 15px;
  }
  
  .mensagem-container h2 {
    font-size: 16px;
  }
  
  .mensagem-container p {
    font-size: 13px;
    line-height: 1.4;
  }
}
</style>
