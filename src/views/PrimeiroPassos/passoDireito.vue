<script setup>
import { ref } from 'vue';

// Lista dos cards com suas respectivas imagens e textos
const cards = ref([
  {
    id: 1,
    imagem: '/images/card01.png',
    titulo: 'Cadastre ou importe automaticamente os seus clientes',
    descricao: 'Ter os seus clientes na Jusprod permitirá que você organize melhor processos e compromissos, além do envio de mensagens em grupo ou particulares.'
  },
  {
    id: 2,
    imagem: '/images/card02.png',
    titulo: 'Monitore até 5 processos no período gratuito', 
    descricao: 'No período de testes, você pode inserir manualmente até 5 processos para monitorar. Ao assinar um plano, a busca será totalmente automática'
  },
  {
    id: 3,
    imagem: '/images/card3.png',
    titulo: 'Escolha os processos que deseja monitorar',
    descricao: 'Ao trazer os seus processos para a Jusprod (manual ou automaticamente) você só precisa escolher quais deseja monitorar e faremos todo o trabalho duro por você!'
  },
  {
    id: 4,
    imagem: '/images/card04.png',
    titulo: 'Vincule seus clientes aos processos monitorados',
    descricao: 'Para que o sistema faça o gerenciamento inteligente, por favor, vincule cada cliente ao(s) seu(s) processo(s).'
  },
  {
    id: 5,
    imagem: '/images/card05.png',
    titulo: 'Recebimento automático de notificações',
    descricao: 'Já no período grátis nós iremos buscar e monitorar todas as movimentações dos seus processos em monitoramento!'
  },
  {
    id: 6,
    imagem: '/images/card06.png',
    titulo: 'Organizando documentos e relatórios',
    descricao: 'Crie pastas para os seus clientes e organize seus documentos e relatórios de maneira fácil e prática! Seja bem-vindo(a) a Jusprod!'
  }
]);
</script>

<template>
  <div class="passo-direito">
    <div class="cards-container">
      <div 
        v-for="card in cards" 
        :key="card.id" 
        class="card"
      >
        <div class="card-imagem">
          <img :src="card.imagem" :alt="card.titulo" />
        </div>
        <div class="card-content">
          <h3 class="card-titulo">{{ card.titulo }}</h3>
          <p class="card-descricao">{{ card.descricao }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.passo-direito {
  width: 50%;
  background-color: #FFFFFF;
  padding: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 100vh;
  height: auto;
  overflow-y: auto;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 20px;
  max-width: 600px;
  width: 100%;
  height: auto;
  padding: 20px 20px 60px 20px;
  margin-top: 20px;
}

.card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
  border: 1px solid #E4E7EC;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  min-height: 220px;
  height: auto;
  max-height: none;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(16, 24, 40, 0.15);
  transform: translateY(-2px);
}

.card-imagem {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-imagem img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0px;
  width: 100%;
}

.card-titulo {
  font-size: 14px;
  font-weight: 600;
  color: #0468FA;
  margin: 0;
  font-family: 'Inter', sans-serif;
  line-height: 1.3;
  margin-bottom: 8px;
}

.card-descricao {
  font-size: 12px;
  font-weight: 400;
  color: #475467;
  line-height: 1.5;
  margin: 0;
  font-family: 'Inter', sans-serif;
  text-align: left;
}

@media (max-width: 768px) {
  .passo-direito {
    width: 100%;
    padding: 16px;
    height: auto;
    min-height: auto;
    align-items: flex-start;
  }
  
  .cards-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, auto);
    gap: 16px;
    max-width: 100%;
    padding: 16px 16px 40px 16px;
    margin-top: 10px;
  }
  
  .card {
    min-height: 180px;
    padding: 16px;
    max-height: none;
  }
  
  .card-imagem {
    width: 60px;
    height: 60px;
    margin-bottom: 12px;
  }
  
  .card-titulo {
    font-size: 13px;
  }
  
  .card-descricao {
    font-size: 11px;
    text-align: left;
  }
}
</style> 