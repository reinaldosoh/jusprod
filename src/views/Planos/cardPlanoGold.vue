<script setup>
import { computed } from 'vue';
import Button from '../../components/UI/Button.vue';

const props = defineProps({
  isAnual: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select']);

const preco = computed(() => {
  if (props.isAnual) {
    return 'R$ 159,90/mês';
  }
  return 'R$ 199,90/mês';
});

const precoOriginal = computed(() => {
  if (props.isAnual) {
    return 'De R$ 199,90/mês';
  }
  return '';
});

function selecionarPlano() {
  if (!props.isDisabled) {
    emit('select', 'gold');
  }
}
</script>

<template>
  <div 
    class="card-plano gold"
    :class="{ 
      'selected': isSelected && !isDisabled, 
      'disabled': isDisabled 
    }"
    @click="selecionarPlano"
  >
    <div class="plano-header">
      <h3 class="plano-nome">Plano Gold</h3>
      <div class="preco-container">
        <div v-if="precoOriginal" class="preco-original">{{ precoOriginal }}</div>
        <div class="plano-preco">{{ preco }}</div>
      </div>
      <p class="plano-descricao">Seu escritório decolando.</p>
    </div>

    <Button 
      :type="isSelected && !isDisabled ? 'secondary' : 'white'"
      :label="isDisabled ? 'Plano Atual' : (isSelected ? 'Selecionado' : 'Selecionar')"
      @click.stop="selecionarPlano"
      :disabled="isDisabled"
      class="btn-selecionar"
    />

    <div class="plano-beneficios">
      <div class="beneficio">
        <span class="check">✓</span>
        Busca 100% automática de todos os seus processos.
      </div>
      <div class="beneficio">
        <span class="check">✓</span>
        Monitore até 150 processos.
      </div>
      <div class="beneficio">
        <span class="check">✓</span>
        Recebimento automático de todas as intimações.
      </div>
      <div class="beneficio">
        <span class="check">✓</span>
        Cadastre e gerencie até 15 contratos diferentes.
      </div>
      <div class="beneficio">
        <span class="check">✓</span>
        Relatórios ilimitados, profissionais e personalizáveis.
      </div>
      <div class="beneficio">
        <span class="check">✓</span>
        10GB de armazenamento
      </div>
      <div class="beneficio">
        <span class="check">✓</span>
        Mensagens ilimitadas para WhatsApp e e-mail.
      </div>
      <div class="beneficio">
        <span class="check">✓</span>
        Alertas direto no seu celular. (App Jusprod)
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-plano {
  background: linear-gradient(135deg, #0468FA 0%, #0052CC 100%);
  border: 2px solid #0468FA;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  color: white;
}

.card-plano:hover:not(.disabled) {
  box-shadow: 0 8px 24px rgba(4, 104, 250, 0.3);
  transform: translateY(-2px);
}

.card-plano.selected {
  box-shadow: 0 8px 24px rgba(4, 104, 250, 0.4);
  transform: translateY(-2px);
}

.card-plano.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
  border-color: #9CA3AF;
}

.plano-header {
  text-align: center;
  margin-bottom: 8px;
}

.plano-nome {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.preco-container {
  margin-bottom: 8px;
}

.preco-original {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: line-through;
  margin-bottom: 2px;
}

.plano-preco {
  font-size: 18px;
  color: white;
  font-weight: 600;
}

.plano-descricao {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
}

.btn-selecionar {
  width: 100%;
  height: 40px;
  margin-bottom: 8px;
}

.plano-beneficios {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.beneficio {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
}

.check {
  color: #10B981;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 1px;
}

@media (max-width: 768px) {
  .card-plano {
    padding: 16px;
  }
  
  .plano-nome {
    font-size: 18px;
  }
  
  .plano-preco {
    font-size: 16px;
  }
  
  .beneficio {
    font-size: 13px;
  }
}
</style> 