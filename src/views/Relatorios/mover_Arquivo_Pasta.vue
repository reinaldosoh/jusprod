<template>
  <div class="modal-overlay" @click="fecharModal">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">Mover Relatório</h2>
        <button class="close-button" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <div class="form-group">
          <label for="pastaDestino" class="form-label">Selecione a pasta de destino:</label>
          <select
            id="pastaDestino"
            v-model="pastaDestinoId"
            class="form-select"
            :class="{ 'input-error': mostrarErro }"
          >
            <option value="">Selecione uma pasta</option>
            <option 
              v-for="pasta in pastasDisponiveis" 
              :key="pasta.id" 
              :value="pasta.id"
              :disabled="pasta.id === relatorio?.pasta_id"
            >
              {{ pasta.titulo }}
              <span v-if="pasta.id === relatorio?.pasta_id"> (atual)</span>
            </option>
          </select>
          <div v-if="mostrarErro" class="error-message">
            {{ mensagemErro }}
          </div>
        </div>

        <div class="info-box">
          <div class="info-icon">📁</div>
          <div class="info-text">
            <p><strong>Relatório:</strong> {{ relatorio?.nome }}</p>
            <p><strong>Pasta atual:</strong> {{ relatorio?.pasta_titulo || 'Sem pasta' }}</p>
            <p><strong>Tamanho:</strong> {{ formatarTamanho(relatorio?.tamanho || 0) }}</p>
          </div>
        </div>

        <div class="warning-box" v-if="pastaDestinoId && pastasDisponiveis.length > 0">
          <div class="warning-icon">⚠️</div>
          <div class="warning-text">
            <p><strong>Atenção:</strong> O relatório será movido para a pasta selecionada.</p>
            <p>Esta ação não pode ser desfeita.</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button 
          type="button" 
          class="secondary-btn" 
          @click="fecharModal"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button 
          type="button" 
          class="primary-btn" 
          @click="moverRelatorio"
          :disabled="loading || !pastaDestinoId || pastaDestinoId === relatorio?.pasta_id"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Movendo...' : 'Mover Relatório' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  relatorio: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'relatorio-movido'])

// Estados
const pastaDestinoId = ref('')
const pastasUsuario = ref([])
const loading = ref(false)
const mostrarErro = ref(false)
const mensagemErro = ref('')

// Computed para pastas disponíveis (excluindo a atual)
const pastasDisponiveis = computed(() => {
  return pastasUsuario.value.filter(pasta => pasta.id !== props.relatorio?.pasta_id)
})

// Carregar pastas do usuário
const carregarPastasUsuario = async () => {
  try {
    const { supabase } = await import('../../lib/supabase.js')
    const { useAuthStore } = await import('../../stores/auth.js')
    
    const authStore = useAuthStore()
    const usuario = authStore.user.value
    
    if (!usuario) {
      throw new Error('Usuário não autenticado')
    }

    const { data: pastas, error } = await supabase
      .from('pasta_relatorios')
      .select('id, titulo')
      .eq('uuid', usuario.id)
      .order('titulo', { ascending: true })

    if (error) {
      throw error
    }

    pastasUsuario.value = pastas || []

  } catch (error) {
    console.error('Erro ao carregar pastas:', error)
    mostrarErro.value = true
    mensagemErro.value = 'Erro ao carregar pastas disponíveis'
  }
}

// Mover relatório
const moverRelatorio = async () => {
  if (!pastaDestinoId.value) {
    mostrarErro.value = true
    mensagemErro.value = 'Selecione uma pasta de destino'
    return
  }

  if (pastaDestinoId.value === props.relatorio?.pasta_id) {
    mostrarErro.value = true
    mensagemErro.value = 'Selecione uma pasta diferente da atual'
    return
  }

  try {
    loading.value = true
    mostrarErro.value = false

    const { supabase } = await import('../../lib/supabase.js')
    const { useAuthStore } = await import('../../stores/auth.js')
    
    const authStore = useAuthStore()
    const usuario = authStore.user.value
    
    if (!usuario) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se já existe um relatório com o mesmo nome na pasta de destino
    const { data: existeRelatorio, error: errorVerificar } = await supabase
      .from('relatorios')
      .select('id')
      .eq('nome', props.relatorio.nome)
      .eq('pasta_id', pastaDestinoId.value)
      .eq('uuid', usuario.id)

    if (errorVerificar) {
      throw errorVerificar
    }

    if (existeRelatorio && existeRelatorio.length > 0) {
      mostrarErro.value = true
      mensagemErro.value = 'Já existe um relatório com este nome na pasta de destino'
      return
    }

    // Mover relatório
    const { error: errorMover } = await supabase
      .from('relatorios')
      .update({ pasta_id: pastaDestinoId.value })
      .eq('id', props.relatorio.id)
      .eq('uuid', usuario.id)

    if (errorMover) {
      throw errorMover
    }

    // Buscar informações da pasta de destino
    const pastaDestino = pastasUsuario.value.find(p => p.id === pastaDestinoId.value)
    
    console.log('✅ Relatório movido com sucesso')

    // Emitir evento de sucesso
    emit('relatorio-movido', {
      relatorio: props.relatorio,
      pastaDestinoId: pastaDestinoId.value,
      pastaDestinoTitulo: pastaDestino?.titulo || 'Pasta desconhecida'
    })

  } catch (error) {
    console.error('Erro ao mover relatório:', error)
    mostrarErro.value = true
    mensagemErro.value = 'Erro ao mover relatório. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Fechar modal
const fecharModal = () => {
  emit('close')
}

// Formatar tamanho do arquivo
const formatarTamanho = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Carregar dados quando component montar
onMounted(() => {
  carregarPastasUsuario()
})
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  background: #0468FA;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  line-height: 1;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  cursor: pointer;
  background: white;
}

.form-select:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 3px rgba(4, 104, 250, 0.1);
}

.form-select option:disabled {
  color: #9ca3af;
  font-style: italic;
}

.input-error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.info-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.info-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
}

.info-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.info-text p:not(:last-child) {
  margin-bottom: 0.5rem;
}

.warning-box {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
}

.warning-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.warning-text {
  flex: 1;
}

.warning-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #92400e;
}

.warning-text p:not(:last-child) {
  margin-bottom: 0.5rem;
}

.modal-footer {
  background: #f8fafc;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 12px 12px;
}

.secondary-btn,
.primary-btn {
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.secondary-btn {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.secondary-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.primary-btn {
  background: #0468FA;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: #0356D6;
}

.primary-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
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
@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .modal-header {
    padding: 0.75rem 1rem;
  }
  
  .modal-title {
    font-size: 1rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1rem;
    flex-direction: column;
  }
  
  .secondary-btn,
  .primary-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
  }
  
  .modal-container {
    border-radius: 0;
    height: 100vh;
    max-height: 100vh;
    margin: 0;
    max-width: 100%;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .modal-footer {
    border-radius: 0;
  }
}
</style> 