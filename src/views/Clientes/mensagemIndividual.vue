<script setup>
import { ref, computed } from 'vue';
import Input from '../../components/UI/Input.vue';
import Button from '../../components/UI/Button.vue';
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue';
import AlertaErro from '../../components/UI/AlertaErro.vue';
import { FileText } from 'lucide-vue-next';
import { supabase } from '../../lib/supabase.js';

const props = defineProps({
  clienteId: {
    type: [Number, String],
    required: true
  },
  processoId: {
    type: [Number, String],
    required: false,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'mensagem-enviada']);

// Estados do componente
const titulo = ref('');
const textoMensagem = ref('');
const loading = ref(false);
const error = ref('');
const mostrarAlertaSucesso = ref(false);
const mostrarAlertaErro = ref(false);
const mensagemAlerta = ref('');

// Validar formulário
const formularioValido = computed(() => {
  return titulo.value.trim() && textoMensagem.value.trim();
});

// Resetar campos do formulário
const resetarCampos = () => {
  titulo.value = '';
  textoMensagem.value = '';
  error.value = '';
};

// Fechar o modal
const fecharModal = () => {
  resetarCampos();
  emit('close');
};

// Enviar mensagem
const enviarMensagem = async () => {
  if (!formularioValido.value) {
    error.value = 'Preencha todos os campos obrigatórios';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // 1. Obter sessão do usuário
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // 2. Buscar a lista de emails do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('lista_emails, empresa')
      .eq('id', props.clienteId)
      .single();

    if (clienteError) {
      throw new Error(`Erro ao buscar dados do cliente: ${clienteError.message}`);
    }

    // 3. Preparar os dados para cada email na lista
    const listaEmails = cliente.lista_emails || [];
    const timestamp = new Date().toISOString();
    const uuid = crypto.randomUUID();
    
    // Array para todos os emails (cliente + representantes legais se for empresa)
    const todosEmails = [...listaEmails];
    
    // 3.1. Se for empresa, buscar emails dos representantes legais
    if (cliente.empresa) {
      console.log('🏢 Cliente é empresa - buscando emails dos representantes legais...');
      
      const { data: representantes, error: representantesError } = await supabase
        .from('representante_legais')
        .select('email')
        .eq('cliente_id', props.clienteId);
      
      if (representantesError) {
        console.warn('⚠️ Erro ao buscar representantes legais:', representantesError);
      } else if (representantes && representantes.length > 0) {
        console.log(`📧 ${representantes.length} representante(s) legal(is) encontrado(s)`);
        
        // Adicionar emails dos representantes legais
        representantes.forEach(rep => {
          if (rep.email && rep.email.trim()) {
            todosEmails.push(rep.email.trim());
          }
        });
      } else {
        console.log('📧 Nenhum representante legal encontrado');
      }
    }
    
    // Remover duplicatas
    const emailsUnicos = [...new Set(todosEmails)];
    console.log(`📧 Total de emails únicos: ${emailsUnicos.length}`);
    
    // Criar um array com dados completos para cada email
    const dadosEmails = emailsUnicos.map(email => ({
      titulo: titulo.value,
      mensagem: textoMensagem.value,
      uuid: uuid,
      timestamp: timestamp,
      email: email
    }));
    
    // Fazer a chamada para o webhook com autenticação JWT
    const response = await fetch('https://n8nwebhook.estruturadeapi.com/webhook/cf299d2a-26f7-4679-b4c1-6bcc42835aca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(dadosEmails)
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar para webhook: ${response.status}`);
    }

    // 4. Preparar a mensagem de sucesso
    mensagemAlerta.value = 'Mensagem enviada com sucesso!';
    
    // Notifica o componente pai que a mensagem foi enviada
    emit('mensagem-enviada', {
      titulo: titulo.value,
      conteudo: textoMensagem.value,
      data_envio: new Date().toISOString()
    });
    
    // 5. Fechar o modal e então mostrar o alerta de sucesso
    fecharModal();
    mostrarAlertaSucesso.value = true;
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    mensagemAlerta.value = err.message || 'Ocorreu um erro ao enviar a mensagem. Tente novamente.';
    mostrarAlertaErro.value = true;
    error.value = 'Ocorreu um erro ao enviar a mensagem. Tente novamente.';
  } finally {
    loading.value = false;
  }
};

// Fechar modal ao clicar fora
const handleClickOutside = (event) => {
  if (event.target.classList.contains('modal-overlay')) {
    fecharModal();
  }
};
</script>

<template>
  <AlertaSucesso 
    v-if="mostrarAlertaSucesso" 
    :mensagem="mensagemAlerta" 
    @fechar="mostrarAlertaSucesso = false; fecharModal()" 
  />
  <AlertaErro 
    v-if="mostrarAlertaErro" 
    titulo="Erro" 
    :mensagem="mensagemAlerta" 
    @fechar="mostrarAlertaErro = false" 
  />
  <div v-if="show" class="modal-overlay" @click="handleClickOutside">
    <div class="modal-container">
      <!-- Tarja azul -->
      <div class="header-bar">
        <h2 class="modal-title">
          Informe ao cliente a fase do projeto
        </h2>
        <button class="close-button" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo do modal -->
      <div class="modal-content">
        <!-- Mensagem de erro (se houver) -->
        <div v-if="error" class="error-message">{{ error }}</div>

        <!-- Campo Título -->
        <div class="field-wrapper">
          <Input
            v-model="titulo"
            placeholder="Insira o título da mensagem"
          >
            <template #icon>
              <FileText size="20" />
            </template>
          </Input>
        </div>

        <!-- Campo Mensagem -->
        <div class="field-wrapper">
          <textarea
            v-model="textoMensagem"
            class="textarea-field"
            placeholder="Escreva seu texto aqui"
            rows="6"
          ></textarea>
        </div>

        <!-- Botões de ação -->
        <div class="actions-section">
          <Button
            label="Cancelar"
            type="secondary"
            @click="fecharModal"
          />
          <Button
            :label="loading ? 'Enviando...' : 'Enviar'"
            type="primary"
            :disabled="loading || !formularioValido"
            @click="enviarMensagem"
            :class="{'is-loading': loading}"
          />
        </div>
      </div>
    </div>
  </div>
</template>

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
  width: 540px;
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

.field-wrapper {
  margin-bottom: 16px;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
}

/* Input com ícone à esquerda */
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  width: 16px;
  height: 44px;
}

/* Textarea */
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
}

.textarea-field:focus {
  border-color: #0468FA;
}

.textarea-field::placeholder {
  color: #667085;
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

.actions-section {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 600px) {
  .modal-container {
    width: 90%;
    margin: 20px;
    max-height: 95vh;
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
  
  .actions-section :deep(.button) {
    width: 100%;
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
