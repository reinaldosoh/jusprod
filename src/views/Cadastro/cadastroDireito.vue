<script setup>
// Sem lógica específica por enquanto
</script>

<template>
  <div class="lado-direito">
    <div class="imagem-placeholder">
      <img src="/images/cadastro.png" alt="Ilustração Jusprod" class="imagem-cadastro" />
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

.imagem-cadastro {
  width: 630px;
  height: 630px;
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
}

@media (max-width: 1200px) {
  .imagem-cadastro {
    width: 500px;
    height: auto;
  }
}

@media (max-width: 768px) {
  .lado-direito {
    display: none;
  }
}
</style>
