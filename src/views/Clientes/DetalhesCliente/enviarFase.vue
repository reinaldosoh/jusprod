<template>
  <div v-if="show" class="modal-overlay" @click="handleClickOutside">
    <div class="modal-container">
      <!-- Tarja azul -->
      <div class="header-bar">
        <h2 class="modal-title">
          Enviar Fase do processo
        </h2>
        <button class="close-button" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo do modal -->
      <div class="modal-content">
        <!-- Título da seção -->
        <h3 class="content-title">Informe ao cliente a fase do processo</h3>

        <!-- Mensagem de erro (se houver) -->
        <div v-if="error" class="error-message">{{ error }}</div>

        <!-- Container da primeira linha (Título e Dropdown) -->
        <div class="campos-linha">
          <!-- Campo Título -->
          <div class="campo-titulo">
            <div class="input-with-icon">
              <div class="input-icon">
                <img src="/images/papel.svg" alt="Papel" width="18" height="18">
              </div>
              <input
                v-model="titulo"
                type="text"
                placeholder="Insira um título"
                class="input-field"
              />
            </div>
          </div>

          <!-- Dropdown de Fases -->
          <div class="campo-dropdown">
            <Dropdown
              :options="opcoesDropdown"
              :defaultSelected="faseAtualIndex"
              placeholder-text="Aguardando descisão..."
              :show-placeholder-icon="true"
              icon-type="categorias"
              @option-selected="selecionarFase"
            />
          </div>
        </div>

        <!-- Campo Mensagem -->
        <div class="field-wrapper">
          <textarea
            v-model="textoMensagem"
            class="textarea-field"
            placeholder="Escreva a mensagem"
            rows="6"
          ></textarea>
        </div>

        <!-- Botões de ação -->
        <div class="actions-section">
          <Button
            label="Cancelar"
            type="outline"
            @click="fecharModal"
          />
          <Button
            :label="loading ? 'Enviando...' : 'Enviar'"
            type="primary"
            :disabled="loading || !formularioValido"
            @click="enviarFase"
            :class="{'is-loading': loading}"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dropdown from '../../../components/UI/Dropdown.vue'
import Button from '../../../components/UI/Button.vue'
import AlertaSucesso from '../../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../../components/UI/AlertaErro.vue'
import { supabase } from '../../../lib/supabase'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  faseAtual: {
    type: Object,
    required: true
  },
  todasFases: {
    type: Array,
    default: () => []
  },
  clienteId: {
    type: [Number, String],
    required: true
  },
  processoId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['close', 'fase-enviada'])

// Estados do componente
const titulo = ref('')
const textoMensagem = ref('')
const faseSelecionada = ref(null)
const loading = ref(false)
const error = ref('')

// Opções do dropdown baseadas nas fases disponíveis
const opcoesDropdown = computed(() => {
  return props.todasFases.map((fase, index) => ({
    id: fase.id,
    label: `Fase ${fase.numero_fase} - ${fase.titulo}`,
    active: fase.id === props.faseAtual?.id,
    icon: '/images/categorias.svg'
  }))
})

// Índice da fase atual no dropdown
const faseAtualIndex = computed(() => {
  return opcoesDropdown.value.findIndex(opcao => opcao.active)
})

// Inicializar fase selecionada
watch(() => props.faseAtual, (newFase) => {
  if (newFase) {
    faseSelecionada.value = newFase
  }
}, { immediate: true })

// Validar formulário
const formularioValido = computed(() => {
  return titulo.value.trim() && textoMensagem.value.trim() && faseSelecionada.value
})

// Resetar campos do formulário
const resetarCampos = () => {
  titulo.value = ''
  textoMensagem.value = ''
  error.value = ''
  faseSelecionada.value = props.faseAtual
}

// Fechar o modal
const fecharModal = () => {
  resetarCampos()
  emit('close')
}

// Selecionar fase no dropdown
const selecionarFase = (opcao) => {
  const fase = props.todasFases.find(f => f.id === opcao.id)
  faseSelecionada.value = fase
}

// Função para formatar data no formato dia-mes-ano
const formatarDataParaEnvio = (data) => {
  if (!data) return ''
  try {
    const dataObj = new Date(data)
    const dia = String(dataObj.getDate()).padStart(2, '0')
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0')
    const ano = dataObj.getFullYear()
    return `${dia}-${mes}-${ano}`
  } catch (error) {
    return ''
  }
}

// Enviar fase
const enviarFase = async () => {
  if (!formularioValido.value) {
    error.value = 'Preencha todos os campos obrigatórios'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 1. Obter sessão do usuário
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      throw new Error('Usuário não autenticado')
    }

    // 2. Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('lista_emails, empresa')
      .eq('id', props.clienteId)
      .single()

    if (clienteError) {
      throw new Error(`Erro ao buscar dados do cliente: ${clienteError.message}`)
    }

    // 3. Buscar dados do processo
    const { data: processo, error: processoError } = await supabase
      .from('processos')
      .select('cnpj, tribunal, autor, reu')
      .eq('id', props.processoId)
      .single()

    if (processoError) {
      throw new Error(`Erro ao buscar dados do processo: ${processoError.message}`)
    }

    // 4. Preparar lista de emails
    const listaEmails = cliente.lista_emails || []
    const todosEmails = [...listaEmails]
    
    // 4.1. Se for empresa, buscar emails dos representantes legais
    if (cliente.empresa) {
      console.log('🏢 Cliente é empresa - buscando emails dos representantes legais...')
      
      const { data: representantes, error: representantesError } = await supabase
        .from('representante_legais')
        .select('email')
        .eq('cliente_id', props.clienteId)
      
      if (representantesError) {
        console.warn('⚠️ Erro ao buscar representantes legais:', representantesError)
      } else if (representantes && representantes.length > 0) {
        console.log(`📧 ${representantes.length} representante(s) legal(is) encontrado(s)`)
        
        // Adicionar emails dos representantes legais
        representantes.forEach(rep => {
          if (rep.email && rep.email.trim()) {
            todosEmails.push(rep.email.trim())
          }
        })
      }
    }
    
    // Remover duplicatas
    const emailsUnicos = [...new Set(todosEmails)]
    console.log(`📧 Total de emails únicos: ${emailsUnicos.length}`)
    
    // 5. Preparar timestamp
    const timestamp = new Date().toISOString()
    
    // 6. Criar array com dados para cada email
    const dadosEmails = emailsUnicos.map(email => ({
      // Dados do processo
      cnpj: processo.cnpj || '',
      tribunal: processo.tribunal || '',
      autor: processo.autor || '',
      reu: processo.reu || '',
      
      // Dados da fase selecionada
      titulo: faseSelecionada.value?.titulo || '',
      descricao: faseSelecionada.value?.descricao || '',
      data_inicio: formatarDataParaEnvio(faseSelecionada.value?.data_inicio),
      data_fim: formatarDataParaEnvio(faseSelecionada.value?.data_final),
      
      // Dados do formulário
      titulo_mensagem: titulo.value.trim(),
      mensagem: textoMensagem.value.trim(),
      
      // Metadata
      userUuid: session.user.id,
      timestamp: timestamp,
      email: email
    }))
    
    // 7. Fazer chamada para o webhook
    const response = await fetch('https://n8nwebhook.estruturadeapi.com/webhook/b6537383-cdde-4a72-9c3d-6cb6f07d80e5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(dadosEmails)
    })

    if (!response.ok) {
      throw new Error(`Erro ao enviar para webhook: ${response.status}`)
    }

    console.log('✅ Fase enviada com sucesso para', emailsUnicos.length, 'emails')

    // Emitir evento de sucesso
    emit('fase-enviada', {
      titulo: titulo.value,
      fase: faseSelecionada.value,
      mensagem: textoMensagem.value,
      totalEmails: emailsUnicos.length
    })

    // Fechar modal
    fecharModal()

  } catch (err) {
    console.error('Erro ao enviar fase:', err)
    error.value = err.message || 'Ocorreu um erro ao enviar a fase. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Fechar modal ao clicar fora
const handleClickOutside = (event) => {
  if (event.target.classList.contains('modal-overlay')) {
    fecharModal()
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  width: 647px;
  max-width: 95vw;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.header-bar {
  background-color: #0468FA;
  color: white;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  text-align: center;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  border-radius: 4px;
  position: absolute;
  right: 20px;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
  font-family: 'Inter', sans-serif;
}

.error-message {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
}

.campos-linha {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.campo-titulo {
  width: 100%;
}

.campo-dropdown {
  width: 100%;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.input-field {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 48px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #0468FA;
}

.input-field::placeholder {
  color: #667085;
}

.field-wrapper {
  margin-bottom: 16px;
}

.textarea-field {
  width: 100%;
  min-height: 100px;
  padding: 12px 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.textarea-field:focus {
  border-color: #0468FA;
}

.textarea-field::placeholder {
  color: #667085;
}

.actions-section {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 800px) {
  .modal-container {
    width: 90%;
    margin: 20px;
    max-height: 95vh;
  }
  
  .campos-linha {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .header-bar {
    height: auto;
    min-height: 45px;
    padding: 8px 15px;
  }
  
  .modal-title {
    font-size: 14px;
    line-height: 1.2;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 8px;
  }
}

/* Estilos para o botão em estado de carregamento */
.is-loading {
  position: relative;
  pointer-events: none;
}

.is-loading:after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  margin-left: 8px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  transform: translateY(-50%);
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}
</style> 