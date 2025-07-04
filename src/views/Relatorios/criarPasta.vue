<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">Criar nova pasta de relatórios</h2>
        <button class="close-button" @click="fechar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <form @submit.prevent="criarPasta">
          <div class="input-group">
            <label for="nomePasta" class="input-label">Nome da pasta</label>
            <input
              id="nomePasta"
              type="text"
              v-model="nomePasta"
              placeholder="Digite o nome da pasta de relatórios"
              class="input-field"
              maxlength="100"
              required
              :disabled="isLoading"
            />
            <div class="input-help">A pasta será criada para organizar seus relatórios</div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button type="button" class="button secondary" @click="fechar" :disabled="isLoading">
          Cancelar
        </button>
        <button 
          type="button" 
          class="button primary" 
          @click="criarPasta"
          :disabled="!nomePasta.trim() || isLoading"
        >
          <span v-if="!isLoading">Criar pasta</span>
          <span v-else class="loading-content">
            <div class="spinner"></div>
            Criando...
          </span>
        </button>
      </div>
    </div>
  </div>

  <!-- Alerta de erro -->
  <AlertaErro 
    v-if="mostrarErro"
    :titulo="erroTitulo"
    :mensagem="erroMensagem"
    @fechar="fecharErro"
  />
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../../lib/supabase'
import AlertaErro from '../../components/UI/AlertaErro.vue'

const emit = defineEmits(['close', 'pasta-criada', 'pasta-criada-sucesso'])

// Estados
const nomePasta = ref('')
const isLoading = ref(false)
const mostrarErro = ref(false)
const erroTitulo = ref('')
const erroMensagem = ref('')

// Métodos
const fechar = () => {
  if (isLoading.value) return
  emit('close')
}

const handleOverlayClick = () => {
  fechar()
}

const fecharErro = () => {
  mostrarErro.value = false
  erroTitulo.value = ''
  erroMensagem.value = ''
}

const mostrarErroModal = (titulo, mensagem) => {
  erroTitulo.value = titulo
  erroMensagem.value = mensagem
  mostrarErro.value = true
}

const criarPasta = async () => {
  if (!nomePasta.value.trim() || isLoading.value) {
    return
  }

  try {
    isLoading.value = true
    fecharErro()

    console.log('🔄 Criando pasta de relatórios:', nomePasta.value)

    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    console.log('👤 Usuário:', user.id)

    // Verificar se já existe uma pasta com o mesmo nome
    const { data: pastaExistente, error: verificacaoError } = await supabase
      .from('pasta_relatorios')
      .select('id')
      .eq('nome', nomePasta.value.trim())
      .eq('uuid', user.id)
      .single()

    if (verificacaoError && verificacaoError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar pasta existente:', verificacaoError)
      throw new Error('Erro ao verificar pastas existentes')
    }

    if (pastaExistente) {
      mostrarErroModal(
        'Pasta já existe',
        'Já existe uma pasta de relatórios com este nome. Escolha um nome diferente.'
      )
      return
    }

    // Criar a pasta na tabela pasta_relatorios
    const { data: novaPasta, error: criarError } = await supabase
      .from('pasta_relatorios')
      .insert({
        nome: nomePasta.value.trim(),
        uuid: user.id
      })
      .select()
      .single()

    if (criarError) {
      console.error('❌ Erro ao criar pasta:', criarError)
      throw new Error('Erro ao criar pasta de relatórios')
    }

    console.log('✅ Pasta de relatórios criada:', novaPasta)

    // Emitir eventos de sucesso
    emit('pasta-criada-sucesso')
    emit('pasta-criada')
    emit('close')

  } catch (error) {
    console.error('❌ Erro ao criar pasta de relatórios:', error)
    mostrarErroModal(
      'Erro ao criar pasta',
      error.message || 'Ocorreu um erro inesperado ao criar a pasta de relatórios'
    )
  } finally {
    isLoading.value = false
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
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.input-group {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  height: 44px;
  padding: 0 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.input-field:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.input-field::placeholder {
  color: #9ca3af;
}

.input-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 40px;
  padding: 0 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 80px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.button.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.button.secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.button.primary {
  background: #3b82f6;
  color: white;
}

.button.primary:hover:not(:disabled) {
  background: #2563eb;
}

.button.primary:disabled {
  background: #9ca3af;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsivo */
@media (max-width: 640px) {
  .modal-container {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .button {
    width: 100%;
  }
}
</style> 