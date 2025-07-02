<template>
  <div class="card-detalhe">
    <div class="cliente-info">
      <div class="cliente-avatar">
        <div class="avatar" :class="getStatusClass">
          {{ iniciais }}
          <button 
            type="button"
            class="estrela" 
            @click.stop="$emit('toggle-favorito')"
            :class="{ 'favorito': cliente.favorito }"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.99992 1.33334L10.0599 5.50668L14.6666 6.18001L11.3333 9.42668L12.1199 14.0133L7.99992 11.8467L3.87992 14.0133L4.66659 9.42668L1.33325 6.18001L5.93992 5.50668L7.99992 1.33334Z" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :fill="cliente.favorito ? '#3b82f6' : '#ffffff'"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="cliente-dados">
        <h2 class="cliente-nome">{{ cliente.nome }}</h2>
        <p class="cliente-desde">Cliente desde {{ dataFormatada }}</p>
      </div>
    </div>
    
    <div class="acoes">
      <button class="acao-btn" @click.stop="$emit('editar')">
        <img src="/images/editDetalhes.svg" alt="Editar" width="20" height="20">
      </button>
      
      <button class="acao-btn" @click.stop="$emit('conversar')">
        <img src="/images/msgDetalhes.svg" alt="Mensagem" width="20" height="20">
      </button>
      
      <button class="acao-btn" @click.stop="$emit('expandir')">
        <img src="/images/setaDetalhes.svg" alt="Expandir" width="20" height="20">
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cliente: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle-favorito', 'editar', 'conversar', 'expandir'])

// Calcular iniciais do nome do cliente
const iniciais = computed(() => {
  const nome = props.cliente.nome || ''
  const partes = nome.split(' ')
  
  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase()
  }
  
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
})

// Formatar data de criação do banco de dados
const dataFormatada = computed(() => {
  if (!props.cliente.created_at) return ''
  
  const data = new Date(props.cliente.created_at)
  const dia = data.getDate().toString().padStart(2, '0')
  const mes = (data.getMonth() + 1).toString().padStart(2, '0')
  const ano = data.getFullYear()
  
  return `${dia}/${mes}/${ano}`
})

// Determinar classe de status
const getStatusClass = computed(() => {
  if (props.cliente.cliente_novo) return 'status-novo'
  if (props.cliente.cliente_andamento) return 'status-andamento'
  if (props.cliente.cliente_finalizado) return 'status-finalizado'
  return ''
})
</script>

<style scoped>
.card-detalhe {
  width: 380px;
  height: 113px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.03);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cliente-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cliente-avatar {
  position: relative;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: #4b5563;
  position: relative;
}

.status-novo {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-andamento {
  background-color: #fef3c7;
  color: #92400e;
}

.status-finalizado {
  background-color: #dcfce7;
  color: #166534;
}

.estrela {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.estrela.favorito svg path {
  fill: #3b82f6;
}

.cliente-dados {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cliente-nome {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.cliente-desde {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.acoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.acao-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.acao-btn:hover {
  background-color: #f3f4f6;
}
</style>
