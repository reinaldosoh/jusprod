<template>
  <div class="modal-overlay" @click="cancelar">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="warning-icon">⚠️</div>
        <h2 class="modal-title">Confirmar Exclusão</h2>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <p class="confirmation-text">
          Tem certeza que deseja excluir o relatório <strong>"{{ relatorio?.nome }}"</strong>?
        </p>
        
        <div class="info-box">
          <div class="info-details">
            <p><strong>Pasta:</strong> {{ relatorio?.pasta_titulo || 'Sem pasta' }}</p>
            <p><strong>Tamanho:</strong> {{ formatarTamanho(relatorio?.tamanho || 0) }}</p>
            <p><strong>Criado em:</strong> {{ formatarData(relatorio?.created_at) }}</p>
          </div>
        </div>

        <div class="warning-box">
          <div class="warning-content">
            <p><strong>Atenção:</strong> Esta ação não pode ser desfeita.</p>
            <p>O relatório será permanentemente removido do sistema.</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button 
          type="button" 
          class="secondary-btn" 
          @click="cancelar"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button 
          type="button" 
          class="danger-btn" 
          @click="confirmarExclusao"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Excluindo...' : 'Excluir Relatório' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  relatorio: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['cancelar', 'excluir'])

const loading = ref(false)

const confirmarExclusao = async () => {
  try {
    loading.value = true
    
    const { supabase } = await import('../../lib/supabase.js')
    const { useAuthStore } = await import('../../stores/auth.js')
    
    const authStore = useAuthStore()
    const usuario = authStore.user.value
    
    if (!usuario) {
      throw new Error('Usuário não autenticado')
    }

    // Excluir relatório do banco
    const { error: errorExcluir } = await supabase
      .from('relatorios')
      .delete()
      .eq('id', props.relatorio.id)
      .eq('uuid', usuario.id)

    if (errorExcluir) {
      throw errorExcluir
    }

    // Se o relatório tem arquivo (isFile: true), tentar excluir do storage
    if (props.relatorio.isFile && props.relatorio.url) {
      try {
        // Extrair o nome do arquivo da URL
        const urlParts = props.relatorio.url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        const { error: errorStorage } = await supabase.storage
          .from('relatorios')
          .remove([fileName])
        
        if (errorStorage) {
          console.warn('Erro ao excluir arquivo do storage:', errorStorage)
          // Não falhar a exclusão se o arquivo não puder ser removido do storage
        }
      } catch (storageError) {
        console.warn('Erro ao excluir arquivo do storage:', storageError)
      }
    }

    console.log('✅ Relatório excluído com sucesso')
    emit('excluir')

  } catch (error) {
    console.error('Erro ao excluir relatório:', error)
    // Aqui você pode adicionar tratamento de erro específico
    throw error
  } finally {
    loading.value = false
  }
}

const cancelar = () => {
  emit('cancelar')
}

const formatarTamanho = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatarData = (dateString) => {
  if (!dateString) return 'Data não disponível'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Data inválida'
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #fecaca;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #dc2626;
}

.modal-content {
  padding: 1.5rem;
}

.confirmation-text {
  font-size: 1rem;
  color: #374151;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.info-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-details p {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.info-details p:not(:last-child) {
  margin-bottom: 0.5rem;
}

.warning-box {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
}

.warning-content p {
  margin: 0;
  font-size: 0.875rem;
  color: #92400e;
}

.warning-content p:not(:last-child) {
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
.danger-btn {
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

.danger-btn {
  background: #dc2626;
  color: white;
}

.danger-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.danger-btn:disabled,
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
  .danger-btn {
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