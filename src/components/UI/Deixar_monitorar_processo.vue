<script setup>
import { defineEmits, defineProps, ref, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase.js'
import { useAuthStore } from '../../stores/auth.js'
import Button from './Button.vue'
import AlertaSucesso from './AlertaSucesso.vue'

const props = defineProps({
  processo: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['cancelar', 'arquivar'])

const { session } = useAuthStore()
const loading = ref(false)
const showSucesso = ref(false)
const mensagemSucesso = ref('')
const modalVisible = ref(true)

const handleCancelar = () => {
  console.log('❌ handleCancelar chamado! showSucesso:', showSucesso.value, 'modalVisible:', modalVisible.value)
  if (showSucesso.value) {
    console.log('❌ FECHANDO ALERTA DE SUCESSO via handleCancelar!')
    showSucesso.value = false
    modalVisible.value = true
  } else {
    console.log('❌ Emitindo evento cancelar')
    emit('cancelar')
  }
}

const handleArquivar = async () => {
  console.log('🚨🚨🚨 INÍCIO DA FUNÇÃO HANDLEARQUIVAR - PRIMEIRA LINHA!!! 🚨🚨🚨')
  console.log('🔍 Debug - Props recebidas:', props)
  console.log('🔍 Debug - Processo:', props.processo)
  console.log('🔍 Debug - Session:', session)
  
  // Validações mais rigorosas
  if (!props.processo) {
    console.error('❌ Processo não disponível:', props.processo)
    alert('Erro: Processo não encontrado')
    return
  }
  
  if (typeof props.processo !== 'object') {
    console.error('❌ Processo não é um objeto:', typeof props.processo, props.processo)
    alert('Erro: Dados do processo inválidos')
    return
  }
  
  if (!props.processo.id) {
    console.error('❌ Processo não possui ID:', props.processo)
    alert('Erro: Processo não possui ID válido')
    return
  }
  
  if (!props.processo.cnpj) {
    console.error('❌ Processo não possui CNPJ:', props.processo)
    alert('Erro: Processo não possui CNPJ válido')
    return
  }
  
  if (!session || !session.value) {
    console.error('❌ Sessão não disponível')
    alert('Erro: Sessão não encontrada')
    return
  }
  
  if (!session.value.user || !session.value.user.id) {
    console.error('❌ Sessão sem usuário válido:', session.value)
    alert('Erro: Sessão de usuário inválida')
    return
  }

  loading.value = true
  
  try {
    console.log('🔄 Iniciando processo de arquivamento...')
    console.log('📋 Processo:', props.processo)
    console.log('🔑 Session:', session.value)

    // 1. Verificar se existe outro registro com o mesmo CNPJ onde arquivado = false
    const { data: outrosProcessos, error: checkError } = await supabase
      .from('processos')
      .select('id, arquivado, cnpj')
      .eq('cnpj', props.processo.cnpj)
      .eq('arquivado', false)
      .neq('id', props.processo.id) // Excluir o processo atual
      .eq('uuid', session.value.user.id)

    if (checkError) {
      console.error('❌ Erro ao verificar outros processos:', checkError)
      throw new Error('Erro ao verificar processos relacionados')
    }

    console.log('🔍 Outros processos com mesmo CNPJ (não arquivados):', outrosProcessos)

    // 2. Verificar se precisa fazer chamada para webhook (ANTES de arquivar)
    const temOutroProcessoAtivo = outrosProcessos && outrosProcessos.length > 0
    
    console.log('🔍 Verificação de webhook:')
    console.log('  - Outros processos ativos:', outrosProcessos)
    console.log('  - Tem outro processo ativo?', temOutroProcessoAtivo)
    
    if (!temOutroProcessoAtivo) {
      console.log('🌐 Fazendo chamada para webhook - não há outros processos ativos com o mesmo CNPJ')
      
      // Buscar o monitoramento_id da tabela intimacoes relacionada ao processo
      console.log('🔍 Buscando intimação para processo ID:', props.processo.id)
      const { data: intimacao, error: intimacaoError } = await supabase
        .from('intimacoes')
        .select('monitoramento_id')
        .eq('processo_id', props.processo.id)
        .limit(1)
        .single()

      console.log('📋 Resultado da busca de intimação:')
      console.log('  - Intimação encontrada:', intimacao)
      console.log('  - Erro na busca:', intimacaoError)

      if (intimacaoError && intimacaoError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Erro ao buscar intimação:', intimacaoError)
        throw new Error('Erro ao buscar dados de monitoramento')
      }

      if (intimacao && intimacao.monitoramento_id) {
        console.log('📨 Enviando para webhook - monitoramento_id:', intimacao.monitoramento_id)
        
        // 🔑 OBTER JWT IGUAL AO WHATSAPP SERVICE
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (!currentSession?.access_token) {
          throw new Error('Usuário não autenticado')
        }

        console.log('🔑 JWT obtido:', currentSession.access_token.substring(0, 20) + '...')
        
        // Fazer chamada para o webhook
        console.log('🚀 Iniciando chamada do webhook...')
        console.log('📤 Dados que serão enviados:', {
          monitoramento_id: intimacao.monitoramento_id,
          url: 'https://n8nwebhook.estruturadeapi.com/webhook/7862ea7c-c748-4f1b-97c2-f02525526c1a'
        })
        
        try {
          const response = await fetch('https://n8nwebhook.estruturadeapi.com/webhook/7862ea7c-c748-4f1b-97c2-f02525526c1a', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${currentSession.access_token}`
            },
            body: JSON.stringify({
              monitoramento_id: intimacao.monitoramento_id
            })
          })

          console.log('📨 Resposta do webhook:')
          console.log('  - Status:', response.status)
          console.log('  - Status Text:', response.statusText)
          console.log('  - OK:', response.ok)

          if (!response.ok) {
            console.error('❌ Erro na chamada do webhook:', response.status, response.statusText)
            const errorText = await response.text()
            console.error('❌ Resposta de erro:', errorText)
            throw new Error(`Erro no webhook: ${response.status} - ${response.statusText}`)
          } else {
            console.log('✅ Webhook chamado com sucesso')
            
            // Tentar ler a resposta
            try {
              const responseData = await response.text()
              console.log('📋 Resposta do webhook:', responseData)
            } catch (readError) {
              console.log('ℹ️ Não foi possível ler resposta do webhook')
            }
          }
        } catch (webhookError) {
          console.error('❌ Erro ao chamar webhook:', webhookError)
          throw webhookError
        }
      } else {
        console.log('⚠️ Nenhuma intimação encontrada ou sem monitoramento_id - CONTINUANDO SEM WEBHOOK')
        console.log('  - Intimação:', intimacao)
        console.log('  - Monitoramento ID:', intimacao?.monitoramento_id)
      }
      
      // 🔄 Arquivar processo AQUI (depois do webhook quando necessário)
      console.log('📦 Arquivando processo ID:', props.processo.id, '(caso COM webhook)')
      
      const { error: updateError1 } = await supabase
        .from('processos')
        .update({ arquivado: true })
        .eq('id', props.processo.id)
        .eq('uuid', session.value.user.id)

      if (updateError1) {
        console.error('❌ Erro ao arquivar processo:', updateError1)
        throw new Error('Erro ao arquivar processo')
      }

      console.log('✅ Processo arquivado com sucesso (caso COM webhook)')
      
    } else {
      console.log('ℹ️ Não chamando webhook - existem outros processos ativos com o mesmo CNPJ')
      console.log('  - Quantidade de outros processos:', outrosProcessos?.length)
      
      // 🔄 Arquivar processo AQUI TAMBÉM (caso SEM webhook)
      console.log('📦 Arquivando processo ID:', props.processo.id, '(caso SEM webhook)')
      
      const { error: updateError2 } = await supabase
        .from('processos')
        .update({ arquivado: true })
        .eq('id', props.processo.id)
        .eq('uuid', session.value.user.id)

      if (updateError2) {
        console.error('❌ Erro ao arquivar processo:', updateError2)
        throw new Error('Erro ao arquivar processo')
      }

      console.log('✅ Processo arquivado com sucesso (caso SEM webhook)')
    }

    // 4. Fechar modal PRIMEIRO - força fechamento
    console.log('🔒 Fechando modal - modalVisible:', modalVisible.value)
    modalVisible.value = false
    console.log('🔒 Modal fechado - modalVisible agora é:', modalVisible.value)
    
    // Aguardar animação de fechamento
    console.log('⏳ Aguardando animação de fechamento (400ms)...')
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Fechar completamente pelo pai
    console.log('📢 Emitindo evento "arquivar" para o pai')
    emit('arquivar')
    
    // Aguardar mais um pouco
    console.log('⏳ Aguardando mais um pouco (200ms)...')
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // AGORA mostrar sucesso
    console.log('✅ Mostrando alerta de sucesso')
    mensagemSucesso.value = 'Processo arquivado com sucesso!'
    showSucesso.value = true
    console.log('🎯 showSucesso definido como true:', showSucesso.value)

  } catch (error) {
    console.error('❌ Erro no processo de arquivamento:', error)
    
    // Fechar modal primeiro mesmo em caso de erro
    emit('arquivar')
    
    // Aguardar fechar antes de mostrar erro
    setTimeout(() => {
      alert(`Erro: ${error.message}`)
    }, 500)
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

// Debug - verificar quando o componente é montado
onMounted(() => {
  console.log('🚀 Componente Deixar_monitorar_processo montado')
  console.log('🔍 Props no mounted:', props)
  console.log('🔍 Processo no mounted:', props.processo)
})

// Watch para monitorar mudanças na prop processo
watch(() => props.processo, (novoProcesso, processoAnterior) => {
  console.log('👀 Processo alterado:')
  console.log('  - Anterior:', processoAnterior)
  console.log('  - Novo:', novoProcesso)
}, { immediate: true, deep: true })
</script>

<template>
  <!-- Loading quando processo não está disponível -->
  <div v-if="visible && modalVisible && (!props.processo || !props.processo.id)" class="modal-overlay">
    <div class="modal-container">
      <div class="loading-process">
        <div class="loading-spinner"></div>
        <p>Carregando dados do processo...</p>
      </div>
    </div>
  </div>

  <!-- Modal principal quando processo está disponível -->
  <div v-else-if="visible && modalVisible && props.processo && props.processo.id" class="modal-overlay">
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
        <h2 class="title">Deixar de monitorar processo</h2>
      </div>

      <!-- Descrição -->
      <div class="description">
        <p class="small-text">
          Você tem certeza que deseja deixar de monitorar esse processo? Ao realizar essa ação você não mais receberá notificações sobre atualizações deste processo.
        </p>
        <p class="small-text">
          Você poderá reativar o monitoramento deste processo a qualquer momento na aba 
          <span class="link">"processos não monitorados"</span> 
          e assim voltará a receber notificações do mesmo.
        </p>
        <p class="confirmation">
          Tem certeza que deseja deixar de monitorar?
        </p>
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
          @click="handleArquivar"
          :disabled="loading"
          class="custom-red-button"
        >
          {{ loading ? 'Processando...' : 'Arquivar' }}
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
  margin-bottom: 20px;
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

.link {
  color: #0468FA;
  text-decoration: none;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

.confirmation {
  font-weight: 500;
  color: #344054;
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
}
</style>

