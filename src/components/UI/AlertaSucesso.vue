<script setup>
defineProps({
  mensagem: {
    type: String,
    default: 'A mensagem foi enviada.'
  }
});
</script>

<template>
  <div class="alerta-sucesso">
    <div class="alerta-conteudo">
      <div class="icone-container">
        <div class="icone">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#0468FA" stroke-width="2" fill="none"/>
            <path d="M8 12L10.5 14.5L16 9" stroke="#0468FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div class="mensagem-container">
        <h2>Sucesso!</h2>
        <p>{{ mensagem }}</p>
      </div>
    </div>
    <div class="botao-container">
      <button class="botao-entendi">Entendi</button>
    </div>
  </div>
</template>

<style scoped>
.alerta-sucesso {
  width: 374px;
  height: 160px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
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
  background-color: rgba(4, 104, 250, 0.1);
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
  background-color: #0468FA;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.botao-entendi:hover {
  background-color: #0354cc;
}
</style>
