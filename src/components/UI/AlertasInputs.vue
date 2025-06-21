<script setup>
const props = defineProps({
  tipo: {
    type: String,
    required: true,
    validator: (value) => ['oab', 'email', 'cpf'].includes(value)
  },
  valor: {
    type: String,
    required: true
  },
  valorSecundario: {
    type: String,
    default: null // Para UF da OAB
  }
})

const emit = defineEmits(['confirmar'])

// Ação do botão
const handleSuporteClick = () => {
  emit('confirmar', 'suporte')
}

// Mensagens dinâmicas baseadas no tipo
const getMensagem = () => {
  switch (props.tipo) {
    case 'oab':
      return 'Verificar se digitou número e estado corretos e tente novamente. Caso o erro persista, entre em contato com o nosso suporte.'
    case 'email':
      return 'Verificar se digitou o email correto e tente novamente. Caso o erro persista, entre em contato com o nosso suporte.'
    case 'cpf':
      return 'Verificar se digitou o CPF correto e tente novamente. Caso o erro persista, entre em contato com o nosso suporte.'
    default:
      return 'Verificar se digitou os dados corretos e tente novamente. Caso o erro persista, entre em contato com o nosso suporte.'
  }
}

// Valor formatado para exibição
const getValorFormatado = () => {
  switch (props.tipo) {
    case 'oab':
      return `OAB: ${props.valor}${props.valorSecundario}`
    case 'email':
      return `Email: ${props.valor}`
    case 'cpf':
      // Formatar CPF para exibição
      const cpfFormatado = props.valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      return `CPF: ${cpfFormatado}`
    default:
      return props.valor
  }
}

// Pergunta dinâmica baseada no tipo
const getPergunta = () => {
  switch (props.tipo) {
    case 'oab':
      return 'Essa OAB pertence a você?'
    case 'email':
      return 'Esse email pertence a você?'
    case 'cpf':
      return 'Esse CPF pertence a você?'
    default:
      return 'Esses dados pertencem a você?'
  }
}
</script>

<template>
  <div class="overlay">
    <div class="alerta-inputs">
      <!-- Botão X para fechar -->
      <button class="btn-fechar" @click="emit('confirmar', 'fechar')">×</button>
      
      <!-- Header com ícone e título -->
      <div class="header-container">
        <div class="icone-alerta">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="#E74C3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="titulo">Atenção</h2>
      </div>
      
      <!-- Mensagem -->
      <p class="mensagem">
        {{ getMensagem() }}
      </p>
      
      <!-- Info do dado -->
      <div class="info-dado">
        {{ getValorFormatado() }}
      </div>
      
      <!-- Pergunta e botão na mesma linha -->
      <div class="pergunta-container">
        <span class="pergunta">{{ getPergunta() }}</span>
        <button class="botao-azul" @click="handleSuporteClick">
          Falar com suporte
        </button>
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

.alerta-inputs {
  width: 544px;
  min-height: 213px;
  height: auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  padding: 20px 24px 24px 24px;
  box-sizing: border-box;
  z-index: 1001;
  position: relative;
  font-family: 'Inter', sans-serif;
}

.btn-fechar {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-family: 'Inter', sans-serif;
}

.btn-fechar:hover {
  color: #666;
}

.header-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.icone-alerta {
  width: 48px;
  height: 48px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.titulo {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
}

.mensagem {
  font-size: 14px;
  color: #666666;
  line-height: 1.4;
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
  text-align: left;
}

.info-dado {
  background-color: #F8F9FA;
  border: 1px solid #E9ECEF;
  border-radius: 6px;
  padding: 8px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #495057;
  margin-bottom: 16px;
  align-self: flex-start;
}

.pergunta-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: auto;
}

.pergunta {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin: 0;
  font-family: 'Inter', sans-serif;
  line-height: 1.4;
}

.botao-azul {
  background-color: #0468FA;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  flex-shrink: 0;
}

.botao-azul:hover {
  background-color: #0354CC;
}

/* Responsividade mobile */
@media (max-width: 768px) {
  .alerta-inputs {
    width: calc(100vw - 32px);
    max-width: 500px;
    height: auto;
    min-height: 200px;
    margin: 16px;
    padding: 16px 20px 20px 20px;
  }
  
  .mensagem {
    font-size: 13px;
    max-width: 100%;
  }
  
  .info-dado {
    font-size: 13px;
    padding: 6px 12px;
  }
  
  .pergunta-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .botao-azul {
    padding: 12px 20px;
    align-self: center;
  }
}
</style> 