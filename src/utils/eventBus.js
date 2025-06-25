import { ref } from 'vue';

// EventBus simples para comunicação entre componentes
class EventBus {
  constructor() {
    this.events = {};
  }

  // Registrar um listener para um evento
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // Remover um listener
  off(event, callback) {
    if (!this.events[event]) return;
    
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  // Emitir um evento
  emit(event, data) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro ao executar callback do evento ${event}:`, error);
      }
    });
  }

  // Limpar todos os listeners de um evento
  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Instância singleton do eventBus
export const eventBus = new EventBus();

// Eventos específicos do sistema
export const EVENTS = {
  PROCESSO_MONITORADO: 'processo:monitorado',
  PROCESSO_ARQUIVADO: 'processo:arquivado', 
  STATUS_ATUALIZADO: 'status:atualizado',
  USER_AUTHENTICATED: 'user:authenticated',
  USER_SIGNED_OUT: 'user:signed_out'
};

export default eventBus; 