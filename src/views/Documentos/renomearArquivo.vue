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
        <img src="/images/iconeDoc.svg" alt="Ícone documento" width="56" height="56">
      </div>

      <!-- Título -->
      <h2 class="titulo">Duplicar documento</h2>

      <!-- Subtítulo -->
      <p class="subtitulo">Dê um nome para a cópia do documento</p>

      <!-- Input com ícone -->
      <div class="input-container">
        <img src="/images/iconPasta.svg" alt="Pasta" width="18" height="18" class="input-icon">
        <input 
          v-model="nomeDocumento" 
          type="text" 
          placeholder="Nome do documento"
          class="input-nome"
          @keyup.enter="duplicarDocumento"
          maxlength="100"
        >
      </div>

      <!-- Mensagem de erro -->
      <div v-if="mostrarErro" class="erro-mensagem">
        Esse nome está em uso. Dê outro nome ao documento.
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
          label="Duplicar" 
          type="primary" 
          button-type="button"
          :disabled="loading || !nomeDocumento.trim()"
          @click="duplicarDocumento"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'
import Button from '../../components/UI/Button.vue'

const props = defineProps({
  documento: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'documento-duplicado'])

const { user } = useAuthStore()
const nomeDocumento = ref('')
const loading = ref(false)
const mostrarErro = ref(false)

// Inicializar nome com base no documento original
onMounted(() => {
  if (props.documento?.nome) {
    // Adicionar "Cópia de" no início do nome
    nomeDocumento.value = `Cópia de ${props.documento.nome}`
  }
})

// Função para verificar se nome já existe na pasta
async function verificarNomeExistente(nome) {
  try {
    if (!user.value?.id || !props.documento?.pasta_id) {
      console.error('Usuário não autenticado ou pasta não identificada')
      return false
    }

    const { data, error } = await supabase
      .from('documentos')
      .select('id')
      .eq('pasta_id', props.documento.pasta_id)
      .eq('nome', nome.trim())
      .limit(1)

    if (error) {
      console.error('Erro ao verificar nome:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Erro ao verificar nome:', error)
    return false
  }
}

// Função para duplicar o documento
async function duplicarDocumento() {
  if (!nomeDocumento.value.trim()) return
  
  loading.value = true
  mostrarErro.value = false
  
  try {
    // Verificar se nome já existe
    const nomeExiste = await verificarNomeExistente(nomeDocumento.value)
    
    if (nomeExiste) {
      mostrarErro.value = true
      loading.value = false
      return
    }
    
    // Verificar se usuário está autenticado
    if (!user.value?.id) {
      alert('Usuário não autenticado. Faça login novamente.')
      return
    }
    
    // Criar documento duplicado
    const { data, error } = await supabase
      .from('documentos')
      .insert({
        nome: nomeDocumento.value.trim(),
        html: props.documento.html || '',
        url: props.documento.url || '',
        isFile: props.documento.isFile || false,
        pasta_id: props.documento.pasta_id,
        cliente_id: props.documento.cliente_id,
        processo_id: props.documento.processo_id,
        processocnj: props.documento.processocnj,
        uuid: user.value.id
      })
      .select()
    
    if (error) {
      console.error('Erro ao duplicar documento:', error)
      alert('Erro ao duplicar o documento. Tente novamente.')
      return
    }
    
    // Sucesso - emitir evento e fechar modal
    emit('documento-duplicado', data[0])
    emit('close')
    
  } catch (error) {
    console.error('Erro ao duplicar documento:', error)
    alert('Erro ao duplicar o documento. Tente novamente.')
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
  margin: 0 0 8px 0;
}

.subtitulo {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  text-align: left;
  margin: 0 0 20px 0;
}

.input-container {
  position: relative;
  margin-bottom: 8px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}

.input-nome {
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

.input-nome:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-nome::placeholder {
  color: #9CA3AF;
}

.erro-mensagem {
  color: #DC2626;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: left;
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