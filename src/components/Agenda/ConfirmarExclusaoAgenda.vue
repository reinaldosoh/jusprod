<template>
  <div class="modal-backdrop">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-content">
          <h3 class="modal-title">Confirmar Exclusão</h3>
          <p class="modal-subtitle">Esta ação não pode ser desfeita</p>
        </div>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <p class="confirmation-text">
          Tem certeza que deseja excluir o compromisso 
          <strong>"{{ compromisso?.titulo }}"</strong>?
        </p>
        
        <div v-if="compromisso" class="compromisso-details">
          <div class="detail-item">
            <img src="/images/calendario.svg" alt="Data" class="detail-icon">
            <span>{{ dataFormatada }}</span>
          </div>
          
          <div v-if="!compromisso.dia_inteiro" class="detail-item">
            <img src="/images/relogio.svg" alt="Horário" class="detail-icon">
            <span>{{ horarioFormatado }}</span>
          </div>
          
          <div v-if="compromisso.nome_cliente" class="detail-item">
            <img src="/images/user.svg" alt="Cliente" class="detail-icon">
            <span>{{ compromisso.nome_cliente }}</span>
          </div>
          
          <div v-if="compromisso.processo_cnj" class="detail-item">
            <img src="/images/papel.svg" alt="Processo" class="detail-icon">
            <span>{{ compromisso.processo_cnj }}</span>
          </div>
        </div>

        <div class="warning-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22h20L12 2zm0 6v6m0 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div>
            <p class="warning-title">Atenção</p>
            <p class="warning-text">
              Este compromisso será permanentemente removido da sua agenda e não poderá ser recuperado.
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button @click="$emit('cancelar')" class="cancel-button">
          Cancelar
        </button>
        <button @click="confirmarExclusao" :disabled="excluindo" class="delete-button">
          <span v-if="excluindo">Excluindo...</span>
          <span v-else>Sim, Excluir</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmarExclusaoAgenda',
  props: {
    compromisso: {
      type: Object,
      required: true
    }
  },
  emits: ['confirmar', 'cancelar'],
  data() {
    return {
      excluindo: false
    }
  },
  computed: {
    dataFormatada() {
      if (!this.compromisso?.inicio) return ''
      const data = new Date(this.compromisso.inicio)
      return data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    horarioFormatado() {
      if (!this.compromisso?.inicio || !this.compromisso?.fim) return ''
      const inicio = new Date(this.compromisso.inicio)
      const fim = new Date(this.compromisso.fim)
      
      const inicioStr = inicio.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      const fimStr = fim.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      return `${inicioStr} - ${fimStr}`
    }
  },
  methods: {
    async confirmarExclusao() {
      this.excluindo = true
      try {
        await this.$emit('confirmar')
      } finally {
        this.excluindo = false
      }
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* Header */
.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 24px 20px 24px;
}

.header-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Content */
.modal-content {
  padding: 0 24px 24px 24px;
}

.confirmation-text {
  font-size: 16px;
  color: #374151;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.compromisso-details {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

/* Warning box */
.warning-box {
  display: flex;
  gap: 12px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 16px;
  color: #92400e;
}

.warning-box svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-title {
  font-weight: 600;
  font-size: 14px;
  margin: 0 0 4px 0;
}

.warning-text {
  font-size: 13px;
  margin: 0;
  line-height: 1.4;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.cancel-button,
.delete-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.cancel-button {
  background: #f3f4f6;
  color: #374151;
}

.cancel-button:hover {
  background: #e5e7eb;
}

.delete-button {
  background: #dc2626;
  color: white;
  min-width: 120px;
}

.delete-button:hover:not(:disabled) {
  background: #b91c1c;
}

.delete-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .delete-button {
    justify-content: center;
  }
}
</style> 