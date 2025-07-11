<script setup>
import { ref, computed, watch } from 'vue';
import Input from './Input.vue';
import Button from './Button.vue';
import Dropdown from './Dropdown.vue';
import { supabase } from '../../lib/supabase.js';

const props = defineProps({
  processoId: {
    type: [Number, String],
    required: true
  },
  cnj: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  },
  intimacao: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'lembrete-criado']);

// Estados do componente
const titulo = ref('');
const textoLembrete = ref('');
const clienteSelecionado = ref('');
const selecionarTodosClientes = ref(false);
const clientesVinculados = ref([]);
const loading = ref(false);
const error = ref('');

// Computed para opções do dropdown de clientes
const clientesOptions = computed(() => [
  { id: null, label: 'Selecionar Cliente', placeholder: true },
  ...clientesVinculados.value.map(cliente => ({
    id: cliente.id,
    label: cliente.nome,
    icon: null,
    placeholder: false
  }))
]);

// Validar formulário
const formularioValido = computed(() => {
  return titulo.value.trim() && 
         textoLembrete.value.trim() && 
         (clienteSelecionado.value || selecionarTodosClientes.value);
});

// Função para carregar clientes vinculados
const carregarClientesVinculados = async () => {
  try {
    // Validar se processoId é válido
    if (!props.processoId || props.processoId === 'null' || props.processoId === null) {
      console.warn('⚠️ ProcessoId inválido:', props.processoId);
      clientesVinculados.value = [];
      return;
    }

    const { data, error } = await supabase
      .from('processo_cliente')
      .select(`
        cliente_id,
        cliente:cliente_id (
          id,
          nome
        )
      `)
      .eq('processo_id', parseInt(props.processoId));
    
    if (error) throw error;
    
    clientesVinculados.value = (data || []).map(item => ({
      id: item.cliente.id,
      nome: item.cliente.nome
    }));
    
    console.log('👥 Clientes vinculados carregados:', clientesVinculados.value);
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    clientesVinculados.value = [];
  }
};

// Função para resetar todos os campos
function resetarCampos() {
  titulo.value = '';
  textoLembrete.value = '';
  clienteSelecionado.value = '';
  selecionarTodosClientes.value = false;
  error.value = '';
}

// Função para selecionar cliente no dropdown
const onClienteSelected = (option) => {
  clienteSelecionado.value = option.id || '';
  
  // Se selecionar um cliente específico, desmarcar "todos os clientes"
  if (option.id) {
    selecionarTodosClientes.value = false;
  }
};

// Watcher para o checkbox "todos os clientes"
watch(() => selecionarTodosClientes.value, (novoValor) => {
  if (novoValor) {
    // Se marcar "todos os clientes", limpar seleção individual
    clienteSelecionado.value = '';
  }
});

// Função principal para criar lembrete
async function criarLembrete() {
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

    // 2. Obter dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('id')
      .eq('uuid', session.user.id)
      .single();

    if (userError) throw userError;

    // 3. Determinar clientes alvo
    let clientesAlvo = [];
    
    if (selecionarTodosClientes.value) {
      // Todos os clientes vinculados
      clientesAlvo = clientesVinculados.value;
    } else {
      // Cliente específico selecionado
      const cliente = clientesVinculados.value.find(c => c.id === parseInt(clienteSelecionado.value));
      if (cliente) {
        clientesAlvo = [cliente];
      }
    }

    if (clientesAlvo.length === 0) {
      throw new Error('Nenhum cliente selecionado');
    }

    // 4. Criar lembretes para cada cliente
    const lembretes = clientesAlvo.map(cliente => {
      let textoLembreteCompleto = textoLembrete.value.trim();
      
      // Se for uma intimação, adicionar contexto da intimação no texto do lembrete
      if (props.intimacao) {
        const contextIntimacao = [
          `📋 LEMBRETE RELACIONADO À INTIMAÇÃO`,
          `Tipo: ${props.intimacao.tipo || 'N/A'}`,
          `Tribunal: ${props.intimacao.tribunal || 'N/A'}`,
          props.intimacao.secao ? `Seção: ${props.intimacao.secao}` : '',
          props.intimacao.data ? `Data da Intimação: ${new Date(props.intimacao.data).toLocaleDateString('pt-BR')}` : '',
          props.intimacao.snippet ? `Resumo: ${props.intimacao.snippet}` : '',
          ``,
          `📝 LEMBRETE:`,
          textoLembreteCompleto
        ].filter(linha => linha !== '').join('\n');
        
        textoLembreteCompleto = contextIntimacao;
        
        console.log('📝 Contexto da intimação adicionado ao texto do lembrete');
      }

      const lembrete = {
      titulo: titulo.value.trim(),
        lembrete: textoLembreteCompleto,
      processo_id: parseInt(props.processoId),
      processo_cnj: props.cnj,
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      usuario_id: userData.id,
      uuid: session.user.id,
      created_at: new Date().toISOString()
      };

      return lembrete;
    });

    // 5. Inserir lembretes no banco
    const { data: lembretesData, error: lembretesError } = await supabase
      .from('lembretes')
      .insert(lembretes)
      .select();

    if (lembretesError) throw lembretesError;

    console.log('✅ Lembretes criados:', lembretesData);

    // 6. Resetar campos e emitir evento
    const totalLembretes = lembretesData.length;
    
    resetarCampos();
    
    emit('lembrete-criado', {
      titulo: titulo.value || lembretesData[0]?.titulo,
      totalLembretes: totalLembretes,
      clientes: clientesAlvo.map(c => c.nome),
      mensagem: totalLembretes === 1 
        ? `Lembrete criado com sucesso para ${clientesAlvo[0].nome}!`
        : `Lembrete criado com sucesso para ${totalLembretes} clientes!`
    });
    
    emit('close');
    
  } catch (err) {
    console.error('Erro ao criar lembrete:', err);
    error.value = err.message || 'Erro ao criar lembrete. Tente novamente.';
  } finally {
    loading.value = false;
  }
}

function fecharModal() {
  resetarCampos();
  emit('close');
}

// Fechar modal ao clicar fora
function handleClickOutside(event) {
  if (event.target.classList.contains('modal-overlay')) {
    fecharModal();
  }
}

// Carregar dados quando modal abrir
watch(() => props.show, async (newShow, oldShow) => {
  if (newShow && !oldShow) {
    console.log('🎯 Modal de lembrete aberto! Carregando clientes...');
    await carregarClientesVinculados();
  }
});
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="handleClickOutside">
    <div class="modal-container">
      <!-- Tarja azul -->
      <div class="header-bar">
        <h2 class="modal-title">
          {{ props.intimacao ? 'Vincule esta nota relacionada à intimação a um cliente ou mais' : 'Vincule esta nota a um cliente ou mais' }}
        </h2>
        <button class="close-button" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo do modal -->
      <div class="modal-content">
        <!-- Informações da Intimação (se aplicável) -->
        <div v-if="props.intimacao" class="intimacao-info-section">
          <h3 class="intimacao-info-title">📋 Detalhes da Intimação</h3>
          <div class="intimacao-info-grid">
            <div class="intimacao-info-item">
              <span class="info-label">Tipo:</span>
              <span class="info-value">{{ props.intimacao.tipo || 'N/A' }}</span>
            </div>
            <div class="intimacao-info-item">
              <span class="info-label">Tribunal:</span>
              <span class="info-value">{{ props.intimacao.tribunal || 'N/A' }}</span>
            </div>
            <div class="intimacao-info-item">
              <span class="info-label">Seção:</span>
              <span class="info-value">{{ props.intimacao.secao || 'N/A' }}</span>
            </div>
            <div class="intimacao-info-item">
              <span class="info-label">Data:</span>
              <span class="info-value">{{ props.intimacao.data ? new Date(props.intimacao.data).toLocaleDateString('pt-BR') : 'N/A' }}</span>
            </div>
            <div v-if="props.intimacao.snippet" class="intimacao-info-item span-full">
              <span class="info-label">Resumo:</span>
              <span class="info-value">{{ props.intimacao.snippet }}</span>
            </div>
          </div>
        </div>

        <!-- Título do conteúdo -->
        <h2 class="content-title">Adicione um título</h2>

        <!-- Campo Título -->
        <div class="field-wrapper">
          <div class="input-with-icon">
            <div class="input-icon">
              <img src="/images/papel.svg" alt="Título" width="16" height="16" />
            </div>
            <Input
              v-model="titulo"
              placeholder="Título"
              class="input-with-padding"
            />
          </div>
        </div>

        <!-- Linha com Cliente e CNJ -->
        <div class="fields-row">
          <!-- Campo Cliente -->
          <div class="field-wrapper">
            <div class="dropdown-with-icon">
              <div class="input-icon">
                <img src="/images/user.svg" alt="Cliente" width="16" height="16" />
              </div>
              <div class="dropdown-with-padding">
                <Dropdown 
                  :options="clientesOptions"
                  @option-selected="onClienteSelected"
                />
              </div>
            </div>
          </div>

          <!-- Campo CNJ -->
          <div class="field-wrapper">
            <div class="input-with-icon">
              <div class="input-icon">
                <img src="/images/balanca.svg" alt="Processo" width="16" height="16" />
              </div>
              <Input
                :model-value="cnj"
                :disabled="true"
                placeholder="[processoCNJ]"
                class="input-with-padding"
              />
            </div>
          </div>
        </div>

        <!-- Checkbox para todos os clientes -->
        <div class="checkbox-section">
          <div class="checkbox-container">
            <input
              id="checkbox-todos"
              v-model="selecionarTodosClientes"
              type="checkbox"
              class="checkbox-input"
            />
            <label for="checkbox-todos" class="checkbox-label">
              Vincular a todos os clientes desse processo
            </label>
          </div>
        </div>

        <!-- Campo de Lembrete -->
        <div class="field-wrapper">
          <textarea
            v-model="textoLembrete"
            placeholder="Escreva o texto aqui"
            class="textarea-field"
            rows="4"
          ></textarea>
        </div>

        <!-- Mensagem de erro -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Botões de ação -->
        <div class="actions-section">
          <Button
            label="Cancelar"
            type="secondary"
            @click="fecharModal"
          />
          <Button
            label="Salvar"
            type="primary"
            :disabled="loading || !formularioValido"
            @click="criarLembrete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  width: 547px;
  background: white;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
}

.header-bar {
  height: 35px;
  background-color: #0468FA;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
}

.modal-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  margin: 0;
  text-align: center;
  flex: 1;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 20px;
}

.content-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  font-family: 'Inter', sans-serif;
}

.field-wrapper {
  margin-bottom: 16px;
}

.fields-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.fields-row .field-wrapper {
  flex: 1;
  margin-bottom: 0;
}

/* Estilos para input com ícone */
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

.input-with-icon :deep(.icon-container) {
  display: none;
}

.input-with-icon :deep(.input-field) {
  padding-left: 40px;
  padding-right: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  height: 44px;
  line-height: 1;
}

.input-with-icon :deep(.input-wrapper) {
  border-radius: 8px;
  height: 44px;
  align-items: center;
}

.input-with-icon :deep(.input-container) {
  width: 100%;
  margin-bottom: 0;
}

/* Dropdown com ícone à esquerda */
.dropdown-with-icon {
  position: relative;
}

.dropdown-with-padding {
  width: 100%;
}

.dropdown-with-padding :deep(.dropdown-container) {
  width: 100%;
  margin-bottom: 0;
}

.dropdown-with-padding :deep(.dropdown-header) {
  padding-left: 40px !important;
  padding-right: 16px !important;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  height: 44px;
  background-color: white !important;
  border: 1px solid #D0D5DD !important;
  border-radius: 8px;
}

.dropdown-with-padding :deep(.dropdown-options) {
  z-index: 1001 !important;
}

/* Garantir que o ícone à esquerda seja visível */
.dropdown-with-icon .input-icon {
  z-index: 10;
}

/* Checkbox */
.checkbox-section {
  margin: 16px 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #0468FA;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: #111827;
  font-weight: 400;
  cursor: pointer;
  user-select: none;
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

.actions-section :deep(.button) {
  width: 176px;
  height: 44px;
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
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .modal-title {
    font-size: 13px;
    width: auto;
    white-space: normal;
    line-height: 1.2;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .fields-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .actions-section :deep(.button) {
    width: 100%;
  }
}

/* Estilos para seção de informações da intimação */
.intimacao-info-section {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.intimacao-info-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
}

.intimacao-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.intimacao-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.intimacao-info-item.span-full {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Inter', sans-serif;
}

.info-value {
  font-size: 14px;
  font-weight: 400;
  color: #374151;
  font-family: 'Inter', sans-serif;
  line-height: 1.4;
}

@media (max-width: 600px) {
  .intimacao-info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 