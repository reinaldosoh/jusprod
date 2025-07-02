<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- Botão de fechar (X) -->
      <button class="btn-close" @click="$emit('close')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Ícone superior -->
      <div class="icone-superior">
        <img src="/images/iconeMoedas.svg" alt="Ícone moedas" width="56" height="56">
      </div>

      <!-- Título -->
      <h2 class="titulo">Qual o valor da causa?</h2>

      <!-- Input com ícone -->
      <div class="input-container">
        <img src="/images/moeda.svg" alt="Moeda" width="20" height="20" class="input-icon">
        <input 
          v-model="valorInput" 
          type="text" 
          placeholder="R$ 0,00"
          class="input-valor"
          @input="formatarValor"
          @focus="$event.target.select()"
        >
      </div>

      <!-- Botões -->
      <div class="botoes-container">
        <Button 
          label="Cancelar" 
          type="outline" 
          button-type="button"
          @click="$emit('close')"
        />
        <Button 
          label="Salvar" 
          type="primary" 
          button-type="button"
          :disabled="loading"
          @click="salvarValor"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../../../lib/supabase'
import Button from '../../../components/UI/Button.vue'

const props = defineProps({
  processoId: {
    type: Number,
    required: true
  },
  valorAtual: {
    type: [Number, String],
    default: 0
  }
})

const emit = defineEmits(['close', 'valor-atualizado'])

const valorInput = ref('')
const loading = ref(false)

// Inicializar com valor atual
watch(() => props.valorAtual, (newVal) => {
  const valor = Number(newVal) || 0
  valorInput.value = formatarMoeda(valor)
}, { immediate: true })

// Função para formatar como moeda brasileira
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

// Função para formatar valor durante digitação
function formatarValor(event) {
  let valor = event.target.value
  
  // Remove tudo que não é número
  valor = valor.replace(/\D/g, '')
  
  // Converte para número (centavos)
  const numeroValor = parseInt(valor) || 0
  
  // Formata como moeda
  valorInput.value = formatarMoeda(numeroValor / 100)
}

// Função para extrair valor numérico do input formatado
function extrairValorNumerico() {
  const valor = valorInput.value.replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(valor) || 0
}

// Função para salvar o valor
async function salvarValor() {
  loading.value = true
  
  try {
    const novoValor = extrairValorNumerico()
    
    const { error } = await supabase
      .from('processos')
      .update({ valor_causa: novoValor })
      .eq('id', props.processoId)
    
    if (error) {
      console.error('Erro ao atualizar valor:', error)
      alert('Erro ao atualizar o valor da causa. Tente novamente.')
      return
    }
    
    // Emitir evento de sucesso
    emit('valor-atualizado', novoValor)
    emit('close')
    
  } catch (error) {
    console.error('Erro ao salvar valor:', error)
    alert('Erro ao salvar o valor. Tente novamente.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.btn-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: #f3f4f6;
}

.icone-superior {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  margin-top: 8px;
}

.titulo {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  text-align: left;
  margin: 0 0 20px 0;
}

.input-container {
  position: relative;
  margin-bottom: 24px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}

.input-valor {
  width: 100%;
  height: 44px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 0 16px 0 48px;
  font-size: 16px;
  color: #111827;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.input-valor:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-valor::placeholder {
  color: #9CA3AF;
}

.botoes-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

@media (max-width: 480px) {
  .modal-content {
    padding: 24px;
    margin: 16px;
  }
  
  .botoes-container {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style> 