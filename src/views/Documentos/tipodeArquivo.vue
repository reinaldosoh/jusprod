<template>
  <div class="tipo-arquivo-container">
    <div class="tipo-arquivo-opcoes">
      <div 
        class="opcao-item" 
        @click="criarDocumento"
        :class="{ 'opcao-ativa': tipoSelecionado === 'documento' }"
      >
        <div class="icone-container">
          <img src="/images/papel.svg" alt="Criar documento" />
        </div>
        <span class="opcao-texto">Criar um documento</span>
      </div>
      
      <div 
        class="opcao-item"
        @click="carregarArquivo"
        :class="{ 'opcao-ativa': tipoSelecionado === 'arquivo' }"
      >
        <div class="icone-container">
          <img src="/images/upload.svg" alt="Carregar arquivo" />
        </div>
        <span class="opcao-texto">Carregar um arquivo</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TipoDeArquivo',
  props: {
    modelValue: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      tipoSelecionado: this.modelValue
    }
  },
  emits: ['update:modelValue', 'criar-documento', 'criar-documento-html', 'carregar-arquivo'],
  methods: {
    criarDocumento() {
      this.tipoSelecionado = 'documento'
      this.$emit('update:modelValue', 'documento')
      this.$emit('criar-documento')
      this.$emit('criar-documento-html')
    },
    carregarArquivo() {
      this.tipoSelecionado = 'arquivo'
      this.$emit('update:modelValue', 'arquivo')
      this.$emit('carregar-arquivo')
    }
  },
  watch: {
    modelValue(newValue) {
      this.tipoSelecionado = newValue
    }
  }
}
</script>

<style scoped>
.tipo-arquivo-container {
  width: 178px;
  border: 1px solid #E4E7EC;
  border-radius: 8px;
  background-color: #FFFFFF;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
}

.tipo-arquivo-opcoes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opcao-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #E4E7EC;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #FFFFFF;
}

.opcao-item:hover {
  border-color: #D0D5DD;
  background-color: #F9FAFB;
}

.opcao-item.opcao-ativa {
  border-color: #7C3AED;
  background-color: #F3F4F6;
}

.icone-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.icone-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.opcao-texto {
  font-size: 14px;
  font-weight: 500;
  color: #344054;
  line-height: 1.4;
  flex: 1;
}

.opcao-ativa .opcao-texto {
  color: #7C3AED;
}

/* Responsividade */
@media (max-width: 768px) {
  .tipo-arquivo-container {
    width: 178px;
    max-width: 90vw;
  }
}
</style> 