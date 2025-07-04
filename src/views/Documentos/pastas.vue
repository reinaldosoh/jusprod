<template>
  <div class="pasta-card" @click="toggleAtiva">
    <div class="pasta-background">
      <!-- Fundo da pasta -->
      <img 
        v-if="ativa" 
        src="/images/pastaAtiva.svg?v=4" 
        alt="Pasta ativa"
        class="pasta-background-img"
      />
      <img 
        v-else 
        src="/images/pastaInativa.svg?v=3" 
        alt="Pasta inativa"
        class="pasta-background-img"
      />
      
      <!-- Botão de editar (lápis) - apenas quando ativa e não é pasta do sistema -->
      <div 
        v-if="ativa && !isPastaSistema" 
        class="edit-button"
        @click.stop="editarPasta"
        title="Editar nome da pasta"
      >
        <img src="/images/botaoEditar.svg" alt="Editar pasta" class="edit-icon" />
      </div>
      
      <!-- Texto sobreposto -->
      <div class="pasta-text-overlay">
        <div class="pasta-titulo" :class="{ 'titulo-ativo': ativa }">
          {{ titulo }}
        </div>
        <div class="pasta-arquivos" :class="{ 'arquivos-ativo': ativa }">
          {{ quantidadeArquivos }} arquivos
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  titulo: {
    type: String,
    required: true
  },
  quantidadeArquivos: {
    type: Number,
    required: true
  },
  ativaInicial: {
    type: Boolean,
    default: false
  },
  isPastaSistema: {
    type: Boolean,
    default: false
  },
  pastaId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['pasta-clicada', 'editar-pasta'])
const ativa = ref(props.ativaInicial)

const toggleAtiva = () => {
  ativa.value = !ativa.value
  emit('pasta-clicada', {
    titulo: props.titulo,
    ativa: ativa.value,
    isPastaSistema: props.isPastaSistema,
    pastaId: props.pastaId
  })
}

const editarPasta = () => {
  emit('editar-pasta', {
    titulo: props.titulo,
    pastaId: props.pastaId
  })
}

watch(() => props.ativaInicial, (novoValor) => {
  ativa.value = novoValor
})
</script>

<style scoped>
.pasta-card {
  width: 140px;
  height: 134px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.pasta-card:hover {
  transform: translateY(-2px);
}

.pasta-background {
  position: relative;
  width: 140px;
  height: 134px;
}

.pasta-background-img {
  width: 140px;
  height: 134px;
  object-fit: fill;
}

.pasta-text-overlay {
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: left;
  width: 85%;
  pointer-events: none;
}

.pasta-titulo {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 2px;
  color: #1f2937;
  word-break: break-word;
}

.pasta-titulo.titulo-ativo {
  color: white;
}

.pasta-arquivos {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: #3b82f6;
}

.pasta-arquivos.arquivos-ativo {
  color: white;
}

.edit-button {
  position: absolute;
  top: 22px;
  left: 12px;
  width: 43px;
  height: 43px;
  cursor: pointer;
  transition: transform 0.2s ease;
  z-index: 10;
}

.edit-button:hover {
  transform: scale(1.05);
}

.edit-icon {
  width: 43px;
  height: 43px;
  display: block;
}

/* Responsivo */
@media (max-width: 768px) {
  .pasta-card {
    width: 120px;
    height: 110px;
    flex-shrink: 0;
  }
  
  .pasta-background {
    width: 120px;
    height: 110px;
  }
  
  .pasta-background-img {
    width: 120px;
    height: 110px;
  }
  
  .pasta-titulo {
    font-size: 11px;
  }
  
  .pasta-arquivos {
    font-size: 9px;
  }
  
  .edit-button {
    top: 18px;
    left: 10px;
    width: 35px;
    height: 35px;
  }
  
  .edit-icon {
    width: 35px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .pasta-card {
    width: 100px;
    height: 95px;
    flex-shrink: 0;
  }
  
  .pasta-background {
    width: 100px;
    height: 95px;
  }
  
  .pasta-background-img {
    width: 100px;
    height: 95px;
  }
  
  .pasta-titulo {
    font-size: 10px;
  }
  
  .pasta-arquivos {
    font-size: 8px;
  }
  
  .edit-button {
    top: 15px;
    left: 8px;
    width: 30px;
    height: 30px;
  }
  
  .edit-icon {
    width: 30px;
    height: 30px;
  }
}
</style> 