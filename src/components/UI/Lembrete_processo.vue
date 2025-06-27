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
    const lembretes = clientesAlvo.map(cliente => ({
      titulo: titulo.value.trim(),
      lembrete: textoLembrete.value.trim(),
      processo_id: parseInt(props.processoId),
      processo_cnj: props.cnj,
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      usuario_id: userData.id,
      uuid: session.user.id,
      created_at: new Date().toISOString()
    }));

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
        <h2 class="modal-title">Vincule esta nota a um cliente ou mais</h2>
        <button class="close-button" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo do modal -->
      <div class="modal-content">
        <!-- Título do conteúdo -->
        <h2 class="content-title">Adicione um título</h2>

        <!-- Campo Título -->
        <div class="field-wrapper">
          <div class="input-with-icon">
            <div class="input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3Z" stroke="#6B7280" stroke-width="1.33"/>
                <path d="M15 4L8 9L1 4" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="#6B7280" stroke-width="1.33"/>
                  <path d="M2 13C2 10.79 4.686 9 8 9S14 10.79 14 13" stroke="#6B7280" stroke-width="1.33"/>
                </svg>
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <!-- Poste central -->
                  <line x1="8" y1="2" x2="8" y2="14" stroke="#6B7280" stroke-width="1"/>
                  <!-- Braço da balança -->
                  <line x1="3" y1="6" x2="13" y2="6" stroke="#6B7280" stroke-width="1"/>
                  <!-- Prato esquerdo -->
                  <path d="M1 8 L5 8 L4 10 L2 10 Z" fill="#6B7280"/>
                  <line x1="3" y1="6" x2="3" y2="8" stroke="#6B7280" stroke-width="1"/>
                  <!-- Prato direito -->
                  <path d="M11 8 L15 8 L14 10 L12 10 Z" fill="#6B7280"/>
                  <line x1="13" y1="6" x2="13" y2="8" stroke="#6B7280" stroke-width="1"/>
                  <!-- Base -->
                  <line x1="6" y1="14" x2="10" y2="14" stroke="#6B7280" stroke-width="1.5"/>
                </svg>
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
  border-radius: 8px;
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
  justify-content: center;
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
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
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
</style> 