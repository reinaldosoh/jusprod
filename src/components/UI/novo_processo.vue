<script setup>
import { ref } from 'vue'
import { supabase } from '../../lib/supabase.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fechar', 'buscar', 'processo-encontrado'])

const numeroProcesso = ref('')
const loading = ref(false)
const error = ref('')

// Aplicar máscara do número do processo
const aplicarMascara = (valor) => {
  // Remove tudo que não é número
  let apenasNumeros = valor.replace(/\D/g, '')
  
  // Limita a 20 dígitos
  if (apenasNumeros.length > 20) {
    apenasNumeros = apenasNumeros.slice(0, 20)
  }
  
  // Aplica a máscara ######-##.####.#.##.####
  let numeroFormatado = apenasNumeros
  
  if (apenasNumeros.length > 6) {
    numeroFormatado = `${apenasNumeros.slice(0, 7)}-${apenasNumeros.slice(7)}`
  }
  if (apenasNumeros.length > 9) {
    numeroFormatado = `${apenasNumeros.slice(0, 7)}-${apenasNumeros.slice(7, 9)}.${apenasNumeros.slice(9)}`
  }
  if (apenasNumeros.length > 13) {
    numeroFormatado = `${apenasNumeros.slice(0, 7)}-${apenasNumeros.slice(7, 9)}.${apenasNumeros.slice(9, 13)}.${apenasNumeros.slice(13)}`
  }
  if (apenasNumeros.length > 14) {
    numeroFormatado = `${apenasNumeros.slice(0, 7)}-${apenasNumeros.slice(7, 9)}.${apenasNumeros.slice(9, 13)}.${apenasNumeros.slice(13, 14)}.${apenasNumeros.slice(14)}`
  }
  if (apenasNumeros.length > 16) {
    numeroFormatado = `${apenasNumeros.slice(0, 7)}-${apenasNumeros.slice(7, 9)}.${apenasNumeros.slice(9, 13)}.${apenasNumeros.slice(13, 14)}.${apenasNumeros.slice(14, 16)}.${apenasNumeros.slice(16)}`
  }
  
  return numeroFormatado
}

const handleInput = (event) => {
  const valorFormatado = aplicarMascara(event.target.value)
  numeroProcesso.value = valorFormatado
  event.target.value = valorFormatado
  // Limpar erro quando usuário digita
  if (error.value) {
    error.value = ''
  }
}

const buscarProcesso = async () => {
  if (!numeroProcesso.value.trim()) {
    error.value = 'Digite o número do processo'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Remove formatação para enviar apenas números
    const apenasNumeros = numeroProcesso.value.replace(/\D/g, '')
    
    console.log('Buscando processo:', apenasNumeros)

    // Obter JWT do usuário autenticado
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('Usuário não autenticado')
    }

    console.log('JWT obtido para busca de processo')

    // Fazer chamada para a Edge Function do Supabase
    const edgeFunctionUrl = 'https://zdfrfzgnhdnhgmihmrfo.supabase.co/functions/v1/buscar-processo'
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        numeroProcesso: apenasNumeros
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Erro ao buscar processo. Tente novamente.'
      throw new Error(errorMessage)
    }

    const resultado = await response.json()
    console.log('Resposta da Edge Function:', resultado)

    if (resultado.success && resultado.data) {
      console.log('Processo encontrado:', resultado.data)
      
      // Emitir eventos de sucesso
      emit('buscar', apenasNumeros)
      emit('processo-encontrado', resultado.data)
      
      // Fechar modal
      fecharModal()
    } else {
      throw new Error('Resposta inválida do servidor')
    }

  } catch (err) {
    console.error('Erro ao buscar processo:', err)
    error.value = err.message || 'Erro ao buscar processo. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const fecharModal = () => {
  numeroProcesso.value = ''
  error.value = ''
  loading.value = false
  emit('fechar')
}

// Fechar modal ao clicar fora
const handleClickOutside = (event) => {
  if (event.target.classList.contains('modal-overlay')) {
    fecharModal()
  }
}

// Permitir busca com Enter
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    buscarProcesso()
  }
}
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click="handleClickOutside">
    <div class="modal-container">
      <!-- Botão de fechar -->
      <button class="close-button" @click="fecharModal" :disabled="loading">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#98A2B3" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Título -->
      <h2 class="title">Procurar processos</h2>

      <!-- Descrição -->
      <p class="description">Insira o número do processo</p>

      <!-- Input com ícone de busca -->
      <div class="input-container">
        <div class="input-icon">
          <div v-if="loading" class="loading-spinner"></div>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="9.16667" cy="9.16667" r="7.5" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17.5 17.5L13.875 13.875" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <input
          v-model="numeroProcesso"
          @input="handleInput"
          @keypress="handleKeyPress"
          type="text"
          placeholder="0000000-00.0000.0.00.0000"
          class="input-field"
          :class="{ 'input-error': error }"
          maxlength="25"
          :disabled="loading"
        />
      </div>

      <!-- Mensagem de erro -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Botão de buscar -->
      <button 
        @click="buscarProcesso"
        :disabled="!numeroProcesso.trim() || loading"
        class="search-button"
        :class="{ 'loading': loading }"
      >
        <div v-if="loading" class="button-spinner"></div>
        <span v-else>Buscar processo</span>
        <span v-if="loading">Buscando...</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 366px;
  min-height: 242px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  box-shadow: 0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s ease;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: #F9FAFB;
}

.title {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  color: #101828;
  margin: 0;
  text-align: left;
}

.description {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #475467;
  margin: 0;
  text-align: left;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.input-field {
  width: 100%;
  height: 44px;
  padding: 10px 14px 10px 44px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #101828;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #0468FA;
  box-shadow: 0px 0px 0px 4px rgba(4, 104, 250, 0.12);
}

.input-field.input-error {
  border-color: #D0021B;
}

.input-field.input-error:focus {
  border-color: #D0021B;
  box-shadow: 0px 0px 0px 4px rgba(208, 2, 27, 0.12);
}

.input-field::placeholder {
  color: #667085;
  font-weight: 400;
}

.input-field:disabled {
  background-color: #F9FAFB;
  color: #667085;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E5E7EB;
  border-top: 2px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.search-button {
  width: 100%;
  height: 44px;
  background-color: #0468FA;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.search-button:hover:not(:disabled) {
  background-color: #0354CC;
}

.search-button:disabled {
  background-color: #D0D5DD;
  color: #667085;
  cursor: not-allowed;
}

.search-button.loading {
  background-color: #0468FA;
  color: white;
  cursor: not-allowed;
}

.search-button:focus {
  box-shadow: 0px 0px 0px 4px rgba(4, 104, 250, 0.12);
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #D0021B;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  margin-top: -12px;
  margin-bottom: 4px;
  text-align: left;
  padding: 8px 12px;
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 6px;
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 400px) {
  .modal-container {
    width: calc(100vw - 32px);
    max-width: 366px;
    min-height: auto;
    margin: 0 16px;
  }
  
  .modal-content {
    gap: 16px;
  }
  
  .title {
    font-size: 16px;
  }
  
  .description {
    font-size: 13px;
  }
}
</style> 