<script setup>
import { defineEmits, defineProps, ref, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase.js'
import { useAuthStore } from '../../stores/auth.js'
import Button from './Button.vue'
import AlertaSucesso from './AlertaSucesso.vue'

const props = defineProps({
  intimacao: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['cancelar', 'excluir'])

const { session } = useAuthStore()
const loading = ref(false)
const showSucesso = ref(false)
const mensagemSucesso = ref('')
const modalVisible = ref(true)

const handleCancelar = () => {
  console.log('❌ handleCancelar chamado! showSucesso:', showSucesso.value, 'modalVisible:', modalVisible.value)
  if (showSucesso.value) {
    console.log('❌ FECHANDO ALERTA DE SUCESSO via handleCancelar!')
    showSucesso.value = false
    modalVisible.value = true
  } else {
    console.log('❌ Emitindo evento cancelar')
    emit('cancelar')
  }
}

const handleExcluir = async () => {
  console.log('🗑️ INÍCIO DA FUNÇÃO HANDLEEXCLUIR - PRIMEIRA LINHA!')
  console.log('🔍 Debug - Props recebidas:', props)
  console.log('🔍 Debug - Intimação:', props.intimacao)
  console.log('🔍 Debug - Session:', session)
  
  // Validações mais rigorosas
  if (!props.intimacao) {
    console.error('❌ Intimação não disponível:', props.intimacao)
    alert('Erro: Intimação não encontrada')
    return
  }
  
  if (typeof props.intimacao !== 'object') {
    console.error('❌ Intimação não é um objeto:', typeof props.intimacao, props.intimacao)
    alert('Erro: Dados da intimação inválidos')
    return
  }
  
  if (!props.intimacao.id) {
    console.error('❌ Intimação não possui ID:', props.intimacao)
    alert('Erro: Intimação não possui ID válido')
    return
  }
  
  if (!session || !session.value) {
    console.error('❌ Sessão não disponível')
    alert('Erro: Sessão não encontrada')
    return
  }
  
  if (!session.value.user || !session.value.user.id) {
    console.error('❌ Sessão sem usuário válido:', session.value)
    alert('Erro: Sessão de usuário inválida')
    return
  }

  loading.value = true
  
  try {
    console.log('🔄 Iniciando processo de exclusão...')
    console.log('📋 Intimação:', props.intimacao)
    console.log('🔑 Session:', session.value)

    // Excluir a intimação do banco de dados
    console.log('🗑️ Excluindo intimação ID:', props.intimacao.id)
    
    const { error: deleteError } = await supabase
      .from('intimacoes')
      .delete()
      .eq('id', props.intimacao.id)
      .eq('uuid', session.value.user.id) // Garantir que só exclua intimações do usuário

    if (deleteError) {
      console.error('❌ Erro ao excluir intimação:', deleteError)
      throw new Error('Erro ao excluir intimação')
    }

    console.log('✅ Intimação excluída com sucesso')

    // Fechar modal PRIMEIRO - força fechamento
    console.log('🔒 Fechando modal - modalVisible:', modalVisible.value)
    modalVisible.value = false
    console.log('🔒 Modal fechado - modalVisible agora é:', modalVisible.value)
    
    // Aguardar animação de fechamento
    console.log('⏳ Aguardando animação de fechamento (400ms)...')
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Fechar completamente pelo pai
    console.log('📢 Emitindo evento "excluir" para o pai')
    emit('excluir')
    
    // Aguardar mais um pouco
    console.log('⏳ Aguardando mais um pouco (200ms)...')
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // AGORA mostrar sucesso
    console.log('✅ Mostrando alerta de sucesso')
    mensagemSucesso.value = 'Intimação excluída com sucesso!'
    showSucesso.value = true
    console.log('🎯 showSucesso definido como true:', showSucesso.value)

  } catch (error) {
    console.error('❌ Erro no processo de exclusão:', error)
    
    // Fechar modal primeiro mesmo em caso de erro
    emit('excluir')
    
    // Aguardar fechar antes de mostrar erro
    setTimeout(() => {
      alert(`Erro: ${error.message}`)
    }, 500)
  } finally {
    loading.value = false
  }
}

const handleFecharSucesso = () => {
  console.log('🔔 handleFecharSucesso chamado! showSucesso era:', showSucesso.value)
  showSucesso.value = false
  console.log('🔔 showSucesso agora é:', showSucesso.value)
  // Modal já foi fechado, não precisa emitir novamente
}

// Debug - verificar quando o componente é montado
onMounted(() => {
  console.log('🚀 Componente ConfirmarExclusao montado')
  console.log('🔍 Props no mounted:', props)
  console.log('🔍 Intimação no mounted:', props.intimacao)
})

// Watch para monitorar mudanças na prop intimacao
watch(() => props.intimacao, (novaIntimacao, intimacaoAnterior) => {
  console.log('👀 Intimação alterada:')
  console.log('  - Anterior:', intimacaoAnterior)
  console.log('  - Nova:', novaIntimacao)
}, { immediate: true, deep: true })
</script>

<template>
  <!-- Loading quando intimação não está disponível -->
  <div v-if="visible && modalVisible && (!props.intimacao || !props.intimacao.id)" class="modal-overlay">
    <div class="modal-container">
      <div class="loading-process">
        <div class="loading-spinner"></div>
        <p>Carregando dados da intimação...</p>
      </div>
    </div>
  </div>

  <!-- Modal principal quando intimação está disponível -->
  <div v-else-if="visible && modalVisible && props.intimacao && props.intimacao.id" class="modal-overlay">
    <div class="modal-container">
      <!-- Ícone de fechar -->
      <button class="close-button" @click="handleCancelar" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5l10 10" stroke="#667085" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Ícone e Título na mesma linha -->
      <div class="header-container">
        <div class="icon-container">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#FEF3F2"/>
            <path d="M24 28V24M24 20H24.01M32 24C32 28.4183 28.4183 32 24 32C19.5817 32 16 28.4183 16 24C16 19.5817 19.5817 16 24 16C28.4183 16 32 19.5817 32 24Z" stroke="#F04438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="title">Excluir intimação</h2>
      </div>

      <!-- Descrição -->
      <div class="description">
        <p class="small-text">
          Você tem certeza que deseja excluir esta intimação? Esta ação não pode ser desfeita.
        </p>
        <p class="small-text">
          Ao excluir esta intimação, todos os dados relacionados a ela serão removidos permanentemente do sistema.
        </p>
        <p class="confirmation">
          Tem certeza que deseja excluir esta intimação?
        </p>
      </div>

      <!-- Informações da intimação -->
      <div class="intimacao-info">
        <p><strong>CNJ:</strong> {{ props.intimacao.cnj || 'N/A' }}</p>
        <p><strong>Tipo:</strong> {{ props.intimacao.tipo || 'N/A' }}</p>
        <p><strong>Tribunal:</strong> {{ props.intimacao.tribunal || 'N/A' }}</p>
      </div>

      <!-- Botões -->
      <div class="buttons-container">
        <Button 
          label="Cancelar" 
          type="outline" 
          @click="handleCancelar"
          :disabled="loading"
          class="cancel-button"
        />
        <button 
          @click="handleExcluir"
          :disabled="loading"
          class="custom-red-button"
        >
          {{ loading ? 'Excluindo...' : 'Excluir' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Alerta de Sucesso - Independente do modal (modal já foi fechado) -->
  <AlertaSucesso
    v-if="showSucesso"
    :mensagem="mensagemSucesso"
    @fechar="handleFecharSucesso"
  />
</template>

<style scoped>
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
  width: 544px;
  background: white;
  border-radius: 18px;
  padding: 20px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: #F9FAFB;
}

.close-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.header-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.icon-container {
  flex-shrink: 0;
}

.title {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #101828;
  margin: 0;
  line-height: 1.3;
}

.description {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #475467;
  line-height: 1.4;
  margin-bottom: 16px;
  text-align: left;
  margin-left: 64px; /* 48px (largura do ícone) + 16px (gap) */
}

.description p {
  margin: 0 0 12px 0;
}

.description p:last-child {
  margin-bottom: 0;
}

.description .small-text {
  font-size: 12px;
}

.confirmation {
  font-weight: 500;
  color: #344054;
}

.intimacao-info {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  margin-left: 64px; /* Alinhado com a descrição */
}

.intimacao-info p {
  margin: 0 0 8px 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #374151;
}

.intimacao-info p:last-child {
  margin-bottom: 0;
}

.intimacao-info strong {
  color: #111827;
  font-weight: 500;
}

.buttons-container {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button,
.custom-red-button {
  flex: 1;
  max-width: 160px;
}

.custom-red-button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  background-color: #F04438;
  color: white;
  border: 1px solid #F04438;
}

.custom-red-button:hover {
  background-color: #D92D20;
  border-color: #D92D20;
}

.custom-red-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-process {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-process p {
  margin: 0;
  color: #475467;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

@media (max-width: 600px) {
  .modal-container {
    width: calc(100vw - 32px);
    max-width: 544px;
    margin: 0 16px;
    padding: 20px;
  }
  
  .buttons-container {
    flex-direction: column;
  }
  
  .cancel-button,
  .custom-red-button {
    max-width: none;
  }

  .description {
    margin-left: 0;
  }

  .intimacao-info {
    margin-left: 0;
  }
}
</style> 