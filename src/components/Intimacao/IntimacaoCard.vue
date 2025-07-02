<template>
  <div 
    class="intimacao-card-component"
    :class="{ 'expanded': expanded }"
    @click="$emit('toggle-expandir', intimacao.id)"
  >
    <!-- Ícone da Intimação -->
    <div class="intimacao-icon">
      <svg viewBox="0 0 24 24" fill="none" :stroke="!intimacao.visualizado ? '#EF4444' : 'currentColor'" class="mail-icon">
        <!-- Envelope -->
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
        <!-- Indicador de novo (se não visualizada) -->
        <circle v-if="!intimacao.visualizado" cx="20" cy="4" r="3" fill="#EF4444"/>
      </svg>
    </div>

    <!-- Informações da Intimação -->
    <div class="intimacao-info">
      <div class="intimacao-header">
        <h3 class="intimacao-processo">{{ intimacao.cnj || 'N/A' }}</h3>
        <span class="intimacao-status" :class="{ 'nova': !intimacao.visualizado }">
          {{ intimacao.visualizado ? 'Visualizada' : 'Nova' }}
        </span>
      </div>
      
      <div class="intimacao-details">
        <p class="intimacao-titulo">
          <span class="label">Tipo:</span> {{ intimacao.tipo || 'N/A' }}
        </p>
        <p class="intimacao-data">
          <span class="label">Data:</span> {{ formatarData(intimacao.data) }}
        </p>
        <p class="intimacao-tribunal">
          <span class="label">Tribunal:</span> {{ intimacao.tribunal || 'N/A' }}
        </p>
        
        <!-- Snippet - mostrado apenas quando não expandido -->
        <div v-if="!expanded && intimacao.snippet" class="intimacao-snippet">
          <span class="label">Resumo:</span> {{ intimacao.snippet }}
        </div>
      </div>

      <!-- Detalhes expandidos -->
      <div v-if="expanded" class="intimacao-detalhes-expandidos">
        <div class="detalhes-linha">
          <span class="label">CNJ:</span> {{ intimacao.cnj || '-' }}
        </div>
        <div class="detalhes-linha">
          <span class="label">Autor:</span> {{ intimacao.autor || '-' }}
        </div>
        <div class="detalhes-linha">
          <span class="label">Réu:</span> {{ intimacao.reu || '-' }}
        </div>
        <div class="detalhes-linha">
          <span class="label">Seção:</span> {{ intimacao.secao || '-' }}
        </div>
        
        <!-- Conteúdo com HTML renderizado -->
        <div v-if="intimacao.conteudo" class="detalhes-conteudo">
          <span class="label">Conteúdo:</span>
          <div class="conteudo-html" v-html="intimacao.conteudo"></div>
        </div>

        <div class="detalhes-linha">
          <span class="label">Data criação:</span> {{ formatarData(intimacao.created_at) }}
        </div>
      </div>
    </div>

    <!-- Ícones de Ações -->
    <div class="intimacao-actions">
      <!-- Ícone Expandir/Recolher -->
      <img 
        src="/images/iconvisualizar.svg" 
        alt="Expandir detalhes" 
        class="action-icon action-icon-expandir"
        @click.stop="$emit('toggle-expandir', intimacao.id)"
        :title="expanded ? 'Recolher detalhes' : 'Expandir detalhes'"
      />
      
      <slot name="acoes-adicionais"></slot>
      
      <!-- Ícone Marcar como Visualizada -->
      <button 
        v-if="!intimacao.visualizado"
        class="action-icon action-icon-check"
        @click.stop="$emit('marcar-visualizada', intimacao.id)"
        title="Marcar como visualizada"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  intimacao: {
    type: Object,
    required: true
  },
  expanded: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-expandir', 'marcar-visualizada']);

const formatarData = (data) => {
  if (!data) return 'N/A';
  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};
</script>

<style scoped>
.intimacao-card {
  display: flex;
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.intimacao-card:hover {
  border-color: #0468FA;
  box-shadow: 0 2px 6px rgba(4, 104, 250, 0.15);
}

.intimacao-card.expanded {
  box-shadow: 0 4px 8px rgba(4, 104, 250, 0.15);
  border-color: #0468FA;
}

.intimacao-icon {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  background-color: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mail-icon {
  width: 24px;
  height: 24px;
  stroke-width: 1.5;
}

.intimacao-info {
  flex: 1;
  min-width: 0;
}

.intimacao-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.intimacao-processo {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intimacao-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #E2E8F0;
  color: #64748B;
}

.intimacao-status.nova {
  background-color: #FEE2E2;
  color: #EF4444;
}

.intimacao-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #475569;
}

.intimacao-details p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 500;
  color: #64748B;
}

.intimacao-snippet {
  margin-top: 8px;
  font-size: 14px;
  color: #475569;
  line-height: 1.4;
}

.intimacao-detalhes-expandidos {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detalhes-linha {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
}

.detalhes-conteudo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.conteudo-html {
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  max-height: 300px;
  overflow-y: auto;
}

.intimacao-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon:hover {
  background-color: #0468FA;
  border-color: #0468FA;
  color: white;
}
</style>
