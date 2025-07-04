<template>
  <div class="modal-overlay" @click="fecharModal">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">Duplicar Relatório</h2>
        <button class="close-button" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <div class="form-group">
          <label for="nomeRelatorio" class="form-label">Nome do novo relatório:</label>
          <input
            id="nomeRelatorio"
            v-model="nomeRelatorio"
            type="text"
            class="form-input"
            :class="{ 'input-error': mostrarErro }"
            placeholder="Digite o nome do relatório"
            @keyup.enter="duplicarRelatorio"
          />
          <div v-if="mostrarErro" class="error-message">
            {{ mensagemErro }}
          </div>
        </div>

        <div class="form-group">
          <label for="pastaDestino" class="form-label">Pasta de destino:</label>
          <select
            id="pastaDestino"
            v-model="pastaDestinoId"
            class="form-select"
            :class="{ 'input-error': mostrarErro }"
          >
            <option value="">Selecione uma pasta</option>
            <option 
              v-for="pasta in pastasUsuario" 
              :key="pasta.id" 
              :value="pasta.id"
            >
              {{ pasta.titulo }}
            </option>
          </select>
        </div>

        <div class="info-box">
          <div class="info-icon">ℹ️</div>
          <div class="info-text">
            <p><strong>Relatório original:</strong> {{ relatorio?.nome }}</p>
            <p><strong>Pasta atual:</strong> {{ relatorio?.pasta_titulo || 'Sem pasta' }}</p>
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
          @click="duplicarRelatorio"
          :disabled="loading || !nomeRelatorio.trim() || !pastaDestinoId"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Duplicando...' : 'Duplicar Relatório' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  relatorio: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'relatorio-duplicado'])

// Estados
const nomeRelatorio = ref('')
const pastaDestinoId = ref('')
const pastasUsuario = ref([])
const loading = ref(false)
const mostrarErro = ref(false)
const mensagemErro = ref('')

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
    
    // Selecionar a pasta atual como padrão
    if (props.relatorio?.pasta_id) {
      pastaDestinoId.value = props.relatorio.pasta_id
    }

  } catch (error) {
    console.error('Erro ao carregar pastas:', error)
    mostrarErro.value = true
    mensagemErro.value = 'Erro ao carregar pastas disponíveis'
  }
}

// Duplicar relatório
const duplicarRelatorio = async () => {
  if (!nomeRelatorio.value.trim()) {
    mostrarErro.value = true
    mensagemErro.value = 'Nome do relatório é obrigatório'
    return
  }

  if (!pastaDestinoId.value) {
    mostrarErro.value = true
    mensagemErro.value = 'Selecione uma pasta de destino'
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

    // Verificar se nome já existe na pasta de destino
    const { data: existeRelatorio, error: errorVerificar } = await supabase
      .from('relatorios')
      .select('id')
      .eq('nome', nomeRelatorio.value.trim())
      .eq('pasta_id', pastaDestinoId.value)
      .eq('uuid', usuario.id)

    if (errorVerificar) {
      throw errorVerificar
    }

    if (existeRelatorio && existeRelatorio.length > 0) {
      mostrarErro.value = true
      mensagemErro.value = 'Já existe um relatório com este nome na pasta selecionada'
      return
    }

    // Duplicar relatório
    const novoRelatorio = {
      nome: nomeRelatorio.value.trim(),
      pasta_id: pastaDestinoId.value,
      uuid: usuario.id,
      html: props.relatorio.html || '',
      url: props.relatorio.url || null,
      tamanho: props.relatorio.tamanho || 0,
      tipo: props.relatorio.tipo || 'REPORT',
      isFile: props.relatorio.isFile || false,
      categoria: props.relatorio.categoria || 'Relatório Geral',
      cliente_id: props.relatorio.cliente_id || null,
      processocnj: props.relatorio.processocnj || null,
      created_at: new Date().toISOString()
    }

    const { data: relatorioCriado, error: errorCriar } = await supabase
      .from('relatorios')
      .insert([novoRelatorio])
      .select()

    if (errorCriar) {
      throw errorCriar
    }

    console.log('✅ Relatório duplicado com sucesso:', relatorioCriado)

    // Emitir evento de sucesso
    emit('relatorio-duplicado', relatorioCriado[0])

  } catch (error) {
    console.error('Erro ao duplicar relatório:', error)
    mostrarErro.value = true
    mensagemErro.value = 'Erro ao duplicar relatório. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Fechar modal
const fecharModal = () => {
  emit('close')
}

// Gerar nome sugerido
const gerarNomeSugerido = () => {
  if (props.relatorio?.nome) {
    const nomeOriginal = props.relatorio.nome
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    nomeRelatorio.value = `${nomeOriginal} - Cópia (${dataAtual})`
  }
}

// Limpar erros quando nome mudar
watch(nomeRelatorio, () => {
  if (mostrarErro.value) {
    mostrarErro.value = false
  }
})

// Carregar dados quando component montar
onMounted(() => {
  carregarPastasUsuario()
  gerarNomeSugerido()
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

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 3px rgba(4, 104, 250, 0.1);
}

.form-select {
  cursor: pointer;
  background: white;
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
  margin-top: 1rem;
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