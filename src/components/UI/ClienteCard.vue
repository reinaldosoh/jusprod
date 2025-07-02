<template>
  <div class="cliente-card" @click="navegarParaDetalhes">
    <!-- Botões de ação -->
    <div class="acoes-container">
      <button class="botao-favorito" @click.stop="toggleFavoritoCliente">
        <!-- Estrela preenchida quando favorito (azul do sistema) -->
        <svg v-if="cliente.favorito" width="18" height="18" viewBox="0 0 24 24" fill="#0468FA" stroke="#0468FA" stroke-width="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
        </svg>
        <!-- Estrela vazia quando não favorito -->
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
        </svg>
      </button>
      
      <div class="botoes-direita">
        <button class="botao-editar" @click.stop="$emit('editar', cliente)">
          <!-- Ícone de editar -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5">
            <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
          </svg>
        </button>
        
        <button class="botao-excluir" @click.stop="$emit('excluir', cliente)">
          <!-- Ícone de lixeira -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" x2="10" y1="11" y2="17"/>
            <line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Avatar e Nome -->
    <div class="cliente-info">
      <div 
        class="avatar" 
        :class="{
          'avatar-novo': cliente.cliente_novo,
          'avatar-andamento': cliente.cliente_andamento,
          'avatar-finalizado': cliente.cliente_finalizado
        }"
      >
        <span>{{ iniciais }}</span>
      </div>
      <div class="nome-container">
        <h3 class="nome-cliente">{{ cliente.nome }}</h3>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats">
      <div class="stat-item">
        <!-- Ícone de balança para processos -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
          <path d="M7 21h10"/>
          <path d="M12 3v18"/>
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
        </svg>
        <span>Processos: {{ cliente.total_processos || 0 }}</span>
      </div>
      
      <div class="stat-item">
        <!-- Ícone de documento para contratos -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" x2="8" y1="13" y2="13"/>
          <line x1="16" x2="8" y1="17" y2="17"/>
          <line x1="10" x2="8" y1="9" y2="9"/>
        </svg>
        <span>Contratos: {{ cliente.total_contratos || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  cliente: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const emits = defineEmits(['editar', 'excluir', 'toggle-favorito'])

// Calcular iniciais do nome do cliente
const iniciais = computed(() => {
  const nome = props.cliente.nome || ''
  const partes = nome.split(' ')
  
  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase()
  }
  
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
})

// Função para alternar o estado de favorito
const toggleFavoritoCliente = () => {
  // Emite o evento para o componente pai lidar com a atualização
  emits('toggle-favorito', props.cliente)
}

// Função para navegar para a página de detalhes do cliente
const navegarParaDetalhes = () => {
  router.push(`/clientes/${props.cliente.id}`)
}
</script>

<style scoped>
.cliente-card {
  width: 343px;
  min-height: 156px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(16, 30, 54, 0.08);
  border: 1px solid #e5e7eb;
  padding: 32px 16px 16px 16px;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cliente-card:hover {
  box-shadow: 0 4px 12px rgba(16, 30, 54, 0.12);
  transform: translateY(-1px);
}

/* Container para os botões de ação */
.acoes-container {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 0;
}

.botao-favorito {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.botao-favorito:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

.botao-favorito svg,
.botao-editar svg,
.botao-excluir svg {
  display: block;
  flex-shrink: 0;
}

/* Botões de editar e excluir à direita */
.botoes-direita {
  display: flex;
  gap: 8px;
}

.botao-editar,
.botao-excluir {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.botao-editar:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

.botao-excluir:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

.cliente-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f3f4f6; /* Fundo cinza */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827; /* Texto preto */
  font-weight: 600;
  font-size: 18px;
  font-family: 'Inter', sans-serif;
  flex-shrink: 0;
  border: 2px solid transparent; /* Borda transparente por padrão */
}

/* Bordas coloridas de acordo com o status */
.avatar-novo {
  border-color: #10b981; /* Verde */
}

.avatar-andamento {
  border-color: #f59e0b; /* Laranja */
}

.avatar-finalizado {
  border-color: #111827; /* Preto */
}

.nome-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nome-cliente {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-width: 200px;
  word-break: break-word;
}

/* Estatísticas */
.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-item svg {
  flex-shrink: 0;
  display: block;
}

/* Garante que todos os SVGs sejam renderizados corretamente */
svg {
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Responsividade */

/* Tablets */
@media (max-width: 900px) {
  .cliente-card {
    width: 300px;
    min-height: 140px;
    padding: 28px 14px 14px 14px;
  }
  
  .nome-cliente {
    font-size: 15px;
    max-width: 180px;
  }
  
  .avatar {
    width: 44px;
    height: 44px;
    font-size: 16px;
    border-width: 2px;
  }
  
  .stat-item {
    font-size: 13px;
  }
}

/* Mobile grande */
@media (max-width: 768px) {
  .cliente-card {
    width: 260px;
    min-height: 130px;
    padding: 26px 12px 12px 12px;
    gap: 12px;
  }
  
  .acoes-container {
    top: 6px;
    right: 6px;
    gap: 10px;
  }
  
  .botao-favorito {
    width: 22px;
    height: 22px;
  }
  
  .botao-favorito svg {
    width: 16px;
    height: 16px;
  }
  
  .botao-editar,
  .botao-excluir {
    width: 18px;
    height: 18px;
  }
  
  .botao-editar svg,
  .botao-excluir svg {
    width: 14px;
    height: 14px;
  }
  
  .nome-cliente {
    font-size: 14px;
    max-width: 160px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    font-size: 15px;
    border-width: 2px;
  }
  
  .stat-item {
    font-size: 12px;
  }
  
  .stat-item svg {
    width: 16px;
    height: 16px;
  }
}

/* Mobile pequeno */
@media (max-width: 480px) {
  .cliente-card {
    width: 240px;
    min-height: 120px;
    padding: 24px 10px 10px 10px;
    gap: 10px;
  }
  
  .acoes-container {
    top: 4px;
    right: 4px;
    gap: 8px;
  }
  
  .botao-favorito {
    width: 20px;
    height: 20px;
  }
  
  .botao-favorito svg {
    width: 14px;
    height: 14px;
  }
  
  .botao-editar,
  .botao-excluir {
    width: 16px;
    height: 16px;
  }
  
  .botao-editar svg,
  .botao-excluir svg {
    width: 12px;
    height: 12px;
  }
  
  .cliente-info {
    gap: 10px;
  }
  
  .nome-cliente {
    font-size: 13px;
    max-width: 140px;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
    font-size: 14px;
    border-width: 1.5px;
  }
  
  .stats {
    gap: 6px;
  }
  
  .stat-item {
    font-size: 11px;
    gap: 6px;
  }
  
  .stat-item svg {
    width: 14px;
    height: 14px;
  }
}

/* Mobile muito pequeno */
@media (max-width: 360px) {
  .cliente-card {
    width: 220px;
    min-height: 110px;
    padding: 22px 8px 8px 8px;
    gap: 8px;
  }
  
  .nome-cliente {
    font-size: 12px;
    max-width: 120px;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    font-size: 13px;
    border-width: 1.5px;
  }
  
  .stat-item {
    font-size: 10px;
    gap: 4px;
  }
  
  .stat-item svg {
    width: 12px;
    height: 12px;
  }
}
</style> 