<script setup>
import { defineEmits, defineProps, ref, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase.js'
import { useAuthStore } from '../../stores/auth.js'
import Button from '../../components/UI/Button.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: true
  },
  tipo: {
    type: String,
    required: true, // 'recebivel', 'saida', 'despesa', etc.
  }
})

const emit = defineEmits(['cancelar', 'excluir'])

const { session } = useAuthStore()
const loading = ref(false)
const showSucesso = ref(false)
const mensagemSucesso = ref('')
const showErro = ref(false)
const mensagemErro = ref('')
const tituloErro = ref('Erro')
const modalVisible = ref(true)

// Configurações baseadas no tipo
const configuracoes = {
  recebivel: {
    tabela: 'recebiveis',
    titulo: 'Excluir recebível',
    mensagem: 'Você tem certeza que deseja excluir este recebível?',
    detalhes: 'Ao excluir este recebível, todas as parcelas e documentos relacionados serão removidos permanentemente.',
    confirmacao: 'Tem certeza que deseja excluir este recebível?',
    sucessoMsg: 'Recebível excluído com sucesso!',
    campos: ['cliente_nome', 'valor', 'data_vencimento']
  },
  saida: {
    tabela: 'saidas',
    titulo: 'Excluir saída',
    mensagem: 'Você tem certeza que deseja excluir esta saída?',
    detalhes: 'Ao excluir esta saída, todos os dados relacionados a ela serão removidos permanentemente do sistema.',
    confirmacao: 'Tem certeza que deseja excluir esta saída?',
    sucessoMsg: 'Saída excluída com sucesso!',
    campos: ['titulo', 'categoria_nome', 'valor', 'data_saida']
  },
  despesa: {
    tabela: 'outras_despesas',
    titulo: 'Excluir despesa',
    mensagem: 'Você tem certeza que deseja excluir esta despesa?',
    detalhes: 'Ao excluir esta despesa, todos os dados relacionados a ela serão removidos permanentemente do sistema.',
    confirmacao: 'Tem certeza que deseja excluir esta despesa?',
    sucessoMsg: 'Despesa excluída com sucesso!',
    campos: ['titulo', 'categoria_nome', 'valor', 'data_saida']
  }
}

const config = configuracoes[props.tipo] || configuracoes.recebivel

// Função para mostrar erro
const mostrarErro = (titulo, mensagem) => {
  console.log('❌ Mostrando erro:', titulo, mensagem)
  tituloErro.value = titulo
  mensagemErro.value = mensagem
  showErro.value = true
  modalVisible.value = false
}

const handleCancelar = () => {
  console.log('❌ handleCancelar chamado! showSucesso:', showSucesso.value, 'showErro:', showErro.value, 'modalVisible:', modalVisible.value)
  if (showSucesso.value) {
    console.log('❌ FECHANDO ALERTA DE SUCESSO via handleCancelar!')
    showSucesso.value = false
    modalVisible.value = true
  } else if (showErro.value) {
    console.log('❌ FECHANDO ALERTA DE ERRO via handleCancelar!')
    showErro.value = false
    modalVisible.value = true
  } else {
    console.log('❌ Emitindo evento cancelar')
    emit('cancelar')
  }
}

const handleExcluir = async () => {
  console.log('🗑️ INÍCIO DA FUNÇÃO HANDLEEXCLUIR - PRIMEIRA LINHA!')
  console.log('🔍 Debug - Props recebidas:', props)
  console.log('🔍 Debug - Item:', props.item)
  console.log('🔍 Debug - Tipo:', props.tipo)
  console.log('🔍 Debug - Session:', session)
  
  // Validações mais rigorosas
  if (!props.item) {
    console.error('❌ Item não disponível:', props.item)
    mostrarErro('Item não encontrado', 'Não foi possível encontrar o item para exclusão.')
    return
  }
  
  if (typeof props.item !== 'object') {
    console.error('❌ Item não é um objeto:', typeof props.item, props.item)
    mostrarErro('Dados inválidos', 'Os dados do item estão em formato inválido.')
    return
  }
  
  if (!props.item.id) {
    console.error('❌ Item não possui ID:', props.item)
    mostrarErro('ID inválido', 'O item não possui um identificador válido.')
    return
  }
  
  if (!session || !session.value) {
    console.error('❌ Sessão não disponível')
    mostrarErro('Sessão expirada', 'Sua sessão expirou. Por favor, faça login novamente.')
    return
  }
  
  if (!session.value.user || !session.value.user.id) {
    console.error('❌ Sessão sem usuário válido:', session.value)
    mostrarErro('Usuário inválido', 'Não foi possível identificar o usuário. Faça login novamente.')
    return
  }

  loading.value = true
  
  try {
    console.log('🔄 Iniciando processo de exclusão...')
    console.log('📋 Item:', props.item)
    console.log('🔑 Session:', session.value)
    console.log('📊 Tabela:', config.tabela)

    // Lógica especial para recebíveis
    if (props.tipo === 'recebivel') {
      // Se tem numero de parcela, é uma parcela específica
      if (props.item.parcela_numero) {
        console.log('🗑️ Excluindo parcela específica ID:', props.item.id)
        
        // Excluir apenas a parcela específica
        const { error: parcelaError } = await supabase
          .from('recebiveis_parcelas')
          .delete()
          .eq('id', props.item.id)
          .eq('uuid', session.value.user.id)

        if (parcelaError) {
          console.error('❌ Erro ao excluir parcela:', parcelaError)
          throw new Error('Erro ao excluir parcela do recebível')
        }
        
        console.log('✅ Parcela excluída com sucesso')
        
        // Não excluir o recebível principal, apenas a parcela
        
      } else {
        console.log('🗑️ Excluindo recebível completo e todas as parcelas ID:', props.item.id)
        
        // Excluir documentos das parcelas primeiro
        const { error: docsError } = await supabase
          .from('recebiveis_documentos')
          .delete()
          .eq('recebivel_id', props.item.id)
          .eq('uuid', session.value.user.id)

        if (docsError) {
          console.error('❌ Erro ao excluir documentos:', docsError)
          // Não bloquear por documentos, continuar
        }

        // Excluir todas as parcelas do recebível
        const { error: parcelasError } = await supabase
          .from('recebiveis_parcelas')
          .delete()
          .eq('recebivel_id', props.item.id)
          .eq('uuid', session.value.user.id)

        if (parcelasError) {
          console.error('❌ Erro ao excluir parcelas:', parcelasError)
          throw new Error('Erro ao excluir parcelas do recebível')
        }
        
        // Excluir o recebível principal também
        const { error: recebivelError } = await supabase
          .from('recebiveis')
          .delete()
          .eq('id', props.item.id)
          .eq('uuid', session.value.user.id)

        if (recebivelError) {
          console.error('❌ Erro ao excluir recebível:', recebivelError)
          throw new Error('Erro ao excluir recebível')
        }
      }
    } else {
      // Para saídas e despesas, excluir diretamente da tabela principal
      console.log('🗑️ Excluindo item ID:', props.item.id, 'da tabela:', config.tabela)
      
      const { error: deleteError } = await supabase
        .from(config.tabela)
        .delete()
        .eq('id', props.item.id)
        .eq('uuid', session.value.user.id) // Garantir que só exclua itens do usuário

      if (deleteError) {
        console.error('❌ Erro ao excluir item:', deleteError)
        throw new Error(`Erro ao excluir ${props.tipo}`)
      }
    }

    console.log('✅ Item excluído com sucesso')

    // Fechar modal PRIMEIRO - força fechamento
    console.log('🔒 Fechando modal - modalVisible:', modalVisible.value)
    modalVisible.value = false
    console.log('🔒 Modal fechado - modalVisible agora é:', modalVisible.value)
    
    // Aguardar animação de fechamento
    console.log('⏳ Aguardando animação de fechamento (400ms)...')
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Fechar completamente pelo pai e notificar que item foi excluído
    console.log('📢 Emitindo evento "excluir" para o pai recarregar os componentes')
    emit('excluir')
    
    // Aguardar mais um pouco
    console.log('⏳ Aguardando mais um pouco (200ms)...')
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // AGORA mostrar sucesso
    console.log('✅ Mostrando alerta de sucesso')
    mensagemSucesso.value = config.sucessoMsg
    showSucesso.value = true
    console.log('🎯 showSucesso definido como true:', showSucesso.value)

  } catch (error) {
    console.error('❌ Erro no processo de exclusão:', error)
    
    // Fechar modal primeiro mesmo em caso de erro
    modalVisible.value = false
    emit('excluir')
    
    // Aguardar fechar antes de mostrar erro
    setTimeout(() => {
      mostrarErro('Erro na exclusão', `Não foi possível excluir o ${props.tipo}: ${error.message}`)
    }, 600)
  } finally {
    loading.value = false
  }
}

const handleFecharSucesso = () => {
  console.log('🔔 handleFecharSucesso chamado! showSucesso era:', showSucesso.value)
  showSucesso.value = false
  console.log('🔔 showSucesso agora é:', showSucesso.value)
  // Modal já foi fechado, não precisa emitir novamente
}

const handleFecharErro = () => {
  console.log('🔔 handleFecharErro chamado! showErro era:', showErro.value)
  showErro.value = false
  console.log('🔔 showErro agora é:', showErro.value)
  // Modal já foi fechado, não precisa emitir novamente
}

// Função para formatar moeda
const formatarMoeda = (valor) => {
  if (!valor) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

// Função para formatar data
const formatarData = (dataISO) => {
  if (!dataISO) return '-'
  
  const data = new Date(dataISO)
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Debug - verificar quando o componente é montado
onMounted(() => {
  console.log('🚀 Componente ConfirmarExclusao Financeiro montado')
  console.log('🔍 Props no mounted:', props)
  console.log('🔍 Item no mounted:', props.item)
  console.log('🔍 Tipo no mounted:', props.tipo)
})

// Watch para monitorar mudanças na prop item
watch(() => props.item, (novoItem, itemAnterior) => {
  console.log('👀 Item alterado:')
  console.log('  - Anterior:', itemAnterior)
  console.log('  - Novo:', novoItem)
}, { immediate: true, deep: true })
</script>

<template>
  <!-- Loading quando item não está disponível -->
  <div v-if="visible && modalVisible && (!props.item || !props.item.id)" class="modal-overlay">
    <div class="modal-container">
      <div class="loading-process">
        <div class="loading-spinner"></div>
        <p>Carregando dados do item...</p>
      </div>
    </div>
  </div>

  <!-- Modal principal quando item está disponível -->
  <div v-else-if="visible && modalVisible && props.item && props.item.id" class="modal-overlay">
    <div class="modal-container">
      <!-- Ícone de fechar -->
      <button class="close-button" @click="handleCancelar" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5l10 10" stroke="#667085" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Ícone e Título na mesma linha -->
      <div class="header-container">
        <div class="icon-container">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#FEF3F2"/>
            <path d="M24 28V24M24 20H24.01M32 24C32 28.4183 28.4183 32 24 32C19.5817 32 16 28.4183 16 24C16 19.5817 19.5817 16 24 16C28.4183 16 32 19.5817 32 24Z" stroke="#F04438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="title">{{ config.titulo }}</h2>
      </div>

      <!-- Descrição -->
      <div class="description">
        <p class="small-text">
          {{ config.mensagem }}
        </p>
        <p class="small-text">
          {{ config.detalhes }}
        </p>
        <p class="confirmation">
          {{ config.confirmacao }}
        </p>
      </div>

      <!-- Informações do item -->
      <div class="item-info">
        <!-- Para recebíveis -->
        <div v-if="tipo === 'recebivel'">
          <p><strong>Cliente:</strong> {{ props.item.cliente_nome || 'N/A' }}</p>
          <p><strong>Valor:</strong> {{ formatarMoeda(props.item.valor) }}</p>
          <p><strong>Data Vencimento:</strong> {{ formatarData(props.item.data_vencimento) }}</p>
          <p v-if="props.item.parcela_numero"><strong>Parcela:</strong> {{ props.item.parcela_numero }}</p>
        </div>
        
        <!-- Para saídas -->
        <div v-else-if="tipo === 'saida'">
          <p><strong>Título:</strong> {{ props.item.titulo || 'N/A' }}</p>
          <p><strong>Categoria:</strong> {{ props.item.categoria_nome || 'N/A' }}</p>
          <p><strong>Valor:</strong> {{ formatarMoeda(props.item.valor) }}</p>
          <p><strong>Data:</strong> {{ formatarData(props.item.data_saida) }}</p>
        </div>
        
        <!-- Para despesas -->
        <div v-else-if="tipo === 'despesa'">
          <p><strong>Título:</strong> {{ props.item.titulo || 'N/A' }}</p>
          <p><strong>Categoria:</strong> {{ props.item.categoria_nome || 'N/A' }}</p>
          <p><strong>Valor:</strong> {{ formatarMoeda(props.item.valor) }}</p>
          <p><strong>Data:</strong> {{ formatarData(props.item.data_saida) }}</p>
        </div>
        
        <!-- Fallback genérico -->
        <div v-else>
          <p><strong>ID:</strong> {{ props.item.id }}</p>
          <p><strong>Valor:</strong> {{ formatarMoeda(props.item.valor) }}</p>
        </div>
      </div>

      <!-- Botões -->
      <div class="buttons-container">
        <Button 
          label="Cancelar" 
          type="outline" 
          @click="handleCancelar"
          :disabled="loading"
          class="cancel-button"
        />
        <button 
          @click="handleExcluir"
          :disabled="loading"
          class="custom-red-button"
        >
          {{ loading ? 'Excluindo...' : 'Excluir' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Alerta de Sucesso - Independente do modal (modal já foi fechado) -->
  <AlertaSucesso
    v-if="showSucesso"
    :mensagem="mensagemSucesso"
    @fechar="handleFecharSucesso"
  />

  <!-- Alerta de Erro - Independente do modal (modal já foi fechado) -->
  <AlertaErro
    v-if="showErro"
    :titulo="tituloErro"
    :mensagem="mensagemErro"
    @fechar="handleFecharErro"
  />
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 544px;
  background: white;
  border-radius: 18px;
  padding: 20px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: #F9FAFB;
}

.close-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.header-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.icon-container {
  flex-shrink: 0;
}

.title {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #101828;
  margin: 0;
  line-height: 1.3;
}

.description {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #475467;
  line-height: 1.4;
  margin-bottom: 16px;
  text-align: left;
  margin-left: 64px; /* 48px (largura do ícone) + 16px (gap) */
}

.description p {
  margin: 0 0 12px 0;
}

.description p:last-child {
  margin-bottom: 0;
}

.description .small-text {
  font-size: 12px;
}

.confirmation {
  font-weight: 500;
  color: #344054;
}

.item-info {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  margin-left: 64px; /* Alinhado com a descrição */
}

.item-info p {
  margin: 0 0 8px 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #374151;
}

.item-info p:last-child {
  margin-bottom: 0;
}

.item-info strong {
  color: #111827;
  font-weight: 500;
}

.buttons-container {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button,
.custom-red-button {
  flex: 1;
  max-width: 160px;
}

.custom-red-button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  background-color: #F04438;
  color: white;
  border: 1px solid #F04438;
}

.custom-red-button:hover {
  background-color: #D92D20;
  border-color: #D92D20;
}

.custom-red-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-process {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-process p {
  margin: 0;
  color: #475467;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

@media (max-width: 600px) {
  .modal-container {
    width: calc(100vw - 32px);
    max-width: 544px;
    margin: 0 16px;
    padding: 20px;
  }
  
  .buttons-container {
    flex-direction: column;
  }
  
  .cancel-button,
  .custom-red-button {
    max-width: none;
  }

  .description {
    margin-left: 0;
  }

  .item-info {
    margin-left: 0;
  }
}
</style> 