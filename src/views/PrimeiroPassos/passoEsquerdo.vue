<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from '../../components/UI/Button.vue';

const router = useRouter();

// Função para buscar todos os processos automaticamente
function buscarProcessosAutomaticamente() {
  console.log('Redirecionando para página de planos...');
  router.push('/planos');
}

// Função para começar teste grátis com busca manual
function comecarTesteManual() {
  console.log('Começando teste grátis com busca manual...');
  // Implementar lógica de teste manual
}

// Função para assistir vídeo
function assistirVideo() {
  console.log('Abrindo vídeo tutorial...');
  // Abrir modal ou redirecionar para vídeo
}
</script>

<template>
  <div class="passo-esquerdo">
    <div class="logo-container">
      <img src="/images/logotipo.png" alt="Jusprod" class="logo" />
    </div>

    <div class="content-container">
      <div class="header-section">
        <h1 class="titulo">Primeiros passos</h1>
      </div>

      <div class="content-section">
        <p class="paragrafo">
          Vá até a aba de "processos" e insira o número dos processos que deseja monitorar no 
          período de testes gratuito.
        </p>

        <p class="paragrafo">
          Lembre-se que a procura manual acontecerá somente durante esses 14 dias de testes 
          grátis.
        </p>

        <p class="paragrafo">
          A qualquer momento você pode escolher um plano. Ao realizar o upgrade, nós iremos 
          procurar e capturar todos os seus processos automaticamente.
        </p>

        <p class="paragrafo">
          Aproveite este teste grátis para entender e perceber como a Jusprod será a melhor amiga 
          do(a) advogado(a) no dia-a-dia da advocacia.
        </p>

        <p class="paragrafo">
          Veja ao lado como extrair o máxima da Jusprod fazendo esses primeiros passos. Desta 
          forma todo o sistema estará pronto para você!
        </p>

        <p class="paragrafo video-text">
          Para assistir um vídeo <span class="link-destaque">curto e objetivo</span> e ver isso 
          acontecendo na prática, <button type="button" class="link-video" @click="assistirVideo">clique aqui</button>.
        </p>

        <div class="botoes">
          <Button 
            type="primary" 
            label="Buscar todos os processos automaticamente" 
            @click="buscarProcessosAutomaticamente"
            class="btn-buscar-automatico"
          />
          <Button 
            type="outline" 
            label="Começar teste grátis buscando manualmente" 
            @click="comecarTesteManual"
            class="btn-teste-manual"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.passo-esquerdo {
  width: 50%;
  background-color: #FFFFFF;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  overflow-y: visible;
  font-family: 'Inter', sans-serif;
  padding-top: 60px;
}

.logo-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
  width: 100%;
  max-width: 500px;
}

.logo {
  width: 214px;
  height: 64.28px;
  object-fit: contain;
}

.content-container {
  display: flex;
  flex-direction: column;
  max-width: 500px;
  width: 100%;
}

.header-section {
  margin-bottom: 24px;
}

.titulo {
  font-size: 28px;
  font-weight: 700;
  color: #333333;
  margin: 0;
  font-family: 'Inter', sans-serif;
  text-align: left;
  line-height: 1.2;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.paragrafo {
  font-size: 14px;
  font-weight: 400;
  color: #344054;
  line-height: 1.6;
  margin: 0;
  text-align: left;
  font-family: 'Inter', sans-serif;
}

.video-text {
  margin-top: 8px;
}

.link-destaque {
  font-weight: 600;
  color: #344054;
}

.link-video {
  background: none;
  border: none;
  color: #0468FA;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-family: 'Inter', sans-serif;
}

.link-video:hover {
  color: #0354cc;
}

.botoes {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
  width: 360px;
  max-width: 360px;
}

.btn-buscar-automatico,
.btn-teste-manual {
  width: 360px;
  height: 44px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .passo-esquerdo {
    width: 100%;
    padding: 16px;
    min-height: 100vh;
    height: auto;
    box-sizing: border-box;
  }
  
  .logo-container {
    margin-bottom: 20px;
    margin-top: 8px;
  }
  
  .logo {
    width: 160px;
    height: auto;
    max-height: 48px;
  }
  
  .content-container {
    max-width: 100%;
    width: 100%;
  }
  
  .titulo {
    font-size: 24px;
  }
  
  .paragrafo {
    font-size: 13px;
  }
  
  .link-video {
    font-size: 13px;
  }
  
  .botoes {
    margin-top: 24px;
    width: 100%;
    max-width: 100%;
  }
  
  .btn-buscar-automatico,
  .btn-teste-manual {
    width: 100%;
    height: 48px;
    font-size: 14px;
  }
}
</style> 