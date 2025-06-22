<script setup>
// Sem lógica específica por enquanto
</script>

<template>
  <div class="lado-direito">
    <div class="imagem-placeholder">
      <img src="/images/verificaremail.png" alt="Ilustração Verificar Email" class="imagem-login" />
      <p class="texto-descritivo">
        Organize seus processos, administre seu tempo, receba e envie notificações de maneira fácil para os seus clientes! Tudo isso é possivel com a <strong class="jusprod-highlight">Jusprod</strong>!
      </p>
    </div>
  </div>
</template>

<style scoped>
.lado-direito {
  width: 50%;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 100vh;
}

.imagem-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.imagem-login {
  width: 624px;
  height: 481px;
  object-fit: contain;
  margin-bottom: 20px;
}

.texto-descritivo {
  max-width: 624px;
  text-align: center;
  color: #475467;
  font-size: 16px;
  line-height: 1.5;
  font-family: 'Inter', sans-serif;
}

.jusprod-highlight {
  color: #0468FA;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .imagem-login {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
  }
  
  .texto-descritivo {
    max-width: 90%;
    font-size: 14px;
  }
}



@media (max-width: 768px) {
  .lado-direito {
    display: none;
  }
}
</style> 