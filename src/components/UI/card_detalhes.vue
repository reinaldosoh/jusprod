<template>
  <div class="card-detalhes">
    <!-- Meu perfil ou Atualizar Perfil -->
    <div 
      v-if="temEscritorio" 
      class="item-menu"
      @click="navegarPara('/meu-perfil')"
    >
      Meu perfil
    </div>
    
    <div 
      v-else 
      class="item-menu"
      @click="abrirCadastroEscritorio"
    >
      Completar Perfil
    </div>

    <!-- Plano atual com upgrade -->
    <div class="item-plano" @click="navegarPara('/planos')">
      <div class="plano-info">
        <span class="plano-nome">Plano {{ planoAtual }}</span>
        <span class="upgrade-link">Upgrade</span>
      </div>
    </div>

    <!-- Ajuda -->
    <div class="item-menu item-ajuda" @click="navegarPara('/ajuda')">
      Ajuda
    </div>

    <!-- Termos de uso -->
    <div class="item-menu" @click="abrirLink('#')">
      Termos de uso
    </div>

    <!-- Política de privacidade -->
    <div class="item-menu" @click="abrirLink('#')">
      Política de privacidade
    </div>

    <!-- Sistema atualizado -->
    <div class="sistema-atualizado">
      <img src="/images/atualizar_sistema.svg" alt="Sistema atualizado" class="icone-sistema">
      <span class="texto-sistema">Sistema atualizado</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { escritorioService } from '../../services/escritorioService.js';

const router = useRouter();

// Emits
const emit = defineEmits(['abrir-cadastro-escritorio']);

// Estados reativos
const temEscritorio = ref(false);
const planoAtual = ref('OURO');
const loading = ref(true);

// Função para navegar para uma rota
const navegarPara = (rota) => {
  router.push(rota);
};

// Função para abrir links externos
const abrirLink = (url) => {
  if (url !== '#') {
    window.open(url, '_blank');
  }
};

// Função para abrir o modal de cadastro de escritório
const abrirCadastroEscritorio = () => {
  emit('abrir-cadastro-escritorio');
};

// Carregar dados ao montar o componente
onMounted(async () => {
  try {
    loading.value = true;
    
    // Verificar se tem escritório e buscar plano em paralelo
    const [temEscritorioResult, planoResult] = await Promise.all([
      escritorioService.verificarEscritorioExiste(),
      escritorioService.buscarPlanoAtual()
    ]);
    
    temEscritorio.value = temEscritorioResult;
    planoAtual.value = planoResult;
    
    console.log('Card detalhes carregado:', { 
      temEscritorio: temEscritorio.value, 
      plano: planoAtual.value 
    });
    
  } catch (error) {
    console.error('Erro ao carregar dados do card:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.card-detalhes {
  width: 210px;
  height: 294px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

.item-menu {
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.item-menu:hover {
  background-color: #0468FA;
  color: #ffffff;
  border-bottom: 1px solid #0468FA;
}

.item-ajuda {
  background-color: #ffffff;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.item-ajuda:hover {
  background-color: #0468FA;
  color: #ffffff;
  border-bottom: 1px solid #0468FA;
}

.item-plano {
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.item-plano:hover {
  background-color: #0468FA;
  color: #ffffff;
  border-bottom: 1px solid #0468FA;
}

.item-plano:hover .plano-nome {
  color: #ffffff;
}

.item-plano:hover .upgrade-link {
  color: #ffffff;
}

.plano-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.plano-nome {
  font-size: 16px;
  font-weight: 700;
  color: #374151;
}

.upgrade-link {
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
}

.sistema-atualizado {
  margin-top: auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icone-sistema {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
}

.texto-sistema {
  font-size: 14px;
  font-weight: 500;
  color: #00945e;
}

/* Remover a última borda para o item do sistema */
.card-detalhes .item-menu:last-of-type {
  border-bottom: none;
}
</style> 