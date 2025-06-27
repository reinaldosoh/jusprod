<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Dropdown from './Dropdown.vue';
import Input from './Input.vue';
import Button from './Button.vue';
import { clienteService } from '../../services/clienteService.js';

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

const emit = defineEmits(['close', 'cliente-vinculado']);

// Estados do componente
const clientes = ref([]);
const clientesVinculados = ref([]);
const clienteSelecionado = ref(null);
const loading = ref(false);
const error = ref('');

// Options para o dropdown de clientes
const clientesOptions = computed(() => [
  { id: null, label: 'Selecione um cliente' },
  ...clientes.value.map(cliente => ({
    id: cliente.id,
    label: cliente.nome,
    cliente: cliente
  }))
]);

// Carregar dados iniciais
onMounted(() => {
  if (props.show) {
    carregarDados();
  }
});

// Observar mudanças na prop show
watch(() => props.show, (newValue) => {
  if (newValue) {
    carregarDados();
  }
});

async function carregarDados() {
  loading.value = true;
  error.value = '';
  
  try {
    // Carregar clientes do usuário
    const clientesData = await clienteService.listarClientes();
    clientes.value = clientesData;

    // Carregar clientes já vinculados ao processo
    const vinculadosData = await clienteService.listarClientesVinculados(props.processoId);
    clientesVinculados.value = vinculadosData;

  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    error.value = 'Erro ao carregar dados. Tente novamente.';
  } finally {
    loading.value = false;
  }
}

async function vincularCliente() {
  if (!clienteSelecionado.value) {
    error.value = 'Selecione um cliente para vincular';
    return;
  }

  // Verificar se o cliente já está vinculado
  const jaVinculado = clientesVinculados.value.some(
    cliente => cliente.id === clienteSelecionado.value.id
  );

  if (jaVinculado) {
    error.value = 'Este cliente já está vinculado ao processo';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await clienteService.vincularClienteProcesso(props.processoId, clienteSelecionado.value.id);
    
    // Adicionar cliente à lista de vinculados
    clientesVinculados.value.push(clienteSelecionado.value);
    
    // Limpar seleção
    clienteSelecionado.value = null;
    
    // Emitir evento de sucesso e fechar modal
    emit('cliente-vinculado', {
      tipo: 'vinculacao',
      cliente: clientesVinculados.value[clientesVinculados.value.length - 1]
    });
    emit('close');
    
  } catch (err) {
    console.error('Erro ao vincular cliente:', err);
    error.value = 'Erro ao vincular cliente. Tente novamente.';
  } finally {
    loading.value = false;
  }
}

async function desvincularCliente(cliente) {
  loading.value = true;
  error.value = '';

  try {
    await clienteService.desvincularClienteProcesso(props.processoId, cliente.id);
    
    // Remover cliente da lista de vinculados
    clientesVinculados.value = clientesVinculados.value.filter(
      c => c.id !== cliente.id
    );
    
    // Emitir evento de sucesso
    emit('cliente-vinculado', {
      tipo: 'desvinculacao',
      cliente: cliente
    });
    
  } catch (err) {
    console.error('Erro ao desvincular cliente:', err);
    error.value = 'Erro ao desvincular cliente. Tente novamente.';
  } finally {
    loading.value = false;
  }
}

function onClienteSelected(option) {
  if (option.cliente) {
    clienteSelecionado.value = option.cliente;
  } else {
    clienteSelecionado.value = null;
  }
  error.value = '';
}

function fecharModal() {
  emit('close');
}

function salvarModal() {
  if (clienteSelecionado.value) {
    vincularCliente();
  } else {
    fecharModal();
  }
}

// Fechar modal ao clicar fora
function handleClickOutside(event) {
  if (event.target.classList.contains('modal-overlay')) {
    fecharModal();
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="handleClickOutside">
    <div class="modal-container">
      <!-- Tarja azul -->
      <div class="header-bar">
        <h2 class="modal-title">Vincule esse cliente ao processo</h2>
        <button class="close-button" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo do modal -->
      <div class="modal-content">
        <!-- Título do conteúdo -->
        <h2 class="content-title">Vincule esse cliente ao processo</h2>

        <!-- Linha com os dois campos -->
        <div class="fields-row">
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
                placeholder="CNJ"
                class="input-with-padding"
              />
            </div>
          </div>

          <!-- Dropdown de clientes -->
          <div class="field-wrapper">
            <div class="dropdown-with-icon">
              <div class="dropdown-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 14V12.6667C13.3333 11.9594 13.0524 11.2811 12.5523 10.781C12.0522 10.2809 11.3739 10 10.6667 10H5.33333C4.62609 10 3.94781 10.2809 3.44772 10.781C2.94762 11.2811 2.66667 11.9594 2.66667 12.6667V14M10.6667 4.66667C10.6667 6.13943 9.47276 7.33333 8 7.33333C6.52724 7.33333 5.33333 6.13943 5.33333 4.66667C5.33333 3.19391 6.52724 2 8 2C9.47276 2 10.6667 3.19391 10.6667 4.66667Z" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <Dropdown
                :options="clientesOptions"
                :default-selected="0"
                @option-selected="onClienteSelected"
                class="dropdown-with-padding"
              />
            </div>
          </div>
        </div>

        <!-- Título da seção de vinculados -->
        <h3 class="section-title">Clientes vinculados a esse processo</h3>

        <!-- Lista de clientes vinculados -->
        <div class="clientes-vinculados">
          <div v-if="loading" class="loading-message">
            Carregando...
          </div>
          
          <div v-else-if="clientesVinculados.length === 0" class="empty-message">
            Nenhum cliente vinculado
          </div>
          
          <div v-else class="clientes-list">
            <div 
              v-for="cliente in clientesVinculados" 
              :key="cliente.id"
              class="cliente-item"
            >
              <!-- Ícone de pessoa -->
              <div class="cliente-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 14V12.6667C13.3333 11.9594 13.0524 11.2811 12.5523 10.781C12.0522 10.2809 11.3739 10 10.6667 10H5.33333C4.62609 10 3.94781 10.2809 3.44772 10.781C2.94762 11.2811 2.66667 11.9594 2.66667 12.6667V14M10.6667 4.66667C10.6667 6.13943 9.47276 7.33333 8 7.33333C6.52724 7.33333 5.33333 6.13943 5.33333 4.66667C5.33333 3.19391 6.52724 2 8 2C9.47276 2 10.6667 3.19391 10.6667 4.66667Z" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              
              <!-- Nome do cliente -->
              <span class="cliente-nome">{{ cliente.nome }}</span>
              
              <!-- Botão remover -->
              <button 
                class="remover-button"
                @click="desvincularCliente(cliente)"
                :disabled="loading"
                title="Desvincular cliente"
              >
                ×
              </button>
            </div>
          </div>
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
            :disabled="loading"
            @click="salvarModal"
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

.fields-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.field-wrapper {
  flex: 1;
  position: relative;
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

/* Estilos para dropdown com ícone */
.dropdown-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.dropdown-icon {
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

.dropdown-with-icon :deep(.dropdown-header) {
  padding-left: 40px;
  padding-right: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  border-radius: 8px !important;
  height: 44px;
  display: flex;
  align-items: center;
}

.dropdown-with-icon :deep(.dropdown-container) {
  border-radius: 8px !important;
  width: 100%;
  max-width: none;
}

.dropdown-with-icon :deep(.dropdown-menu) {
  border-radius: 8px !important;
}

/* Garantir arredondamento nos componentes */
.field-wrapper :deep(.input-container),
.field-wrapper :deep(.dropdown-container) {
  border-radius: 8px !important;
}

.field-wrapper :deep(.input-wrapper),
.field-wrapper :deep(.dropdown-header) {
  border-radius: 8px !important;
  font-family: 'Inter', sans-serif;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
}

.clientes-vinculados {
  margin-bottom: 20px;
  min-height: 80px;
}

.loading-message {
  text-align: center;
  color: #6B7280;
  padding: 30px 20px;
  font-style: italic;
  font-size: 14px;
}

.empty-message {
  text-align: center;
  color: #6B7280;
  padding: 30px 20px;
  font-size: 14px;
}

.clientes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cliente-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.cliente-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.cliente-nome {
  flex: 1;
  font-size: 14px;
  color: #111827;
  font-family: 'Inter', sans-serif;
}

.remover-button {
  background: none;
  border: none;
  color: #EF4444;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remover-button:hover:not(:disabled) {
  background-color: #FEF2F2;
  color: #DC2626;
}

.remover-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
}

.actions-section :deep(.button) {
  width: 176px;
  height: 44px;
}

@media (max-width: 600px) {
  .modal-container {
    width: 90%;
    margin: 20px;
  }
  
  .modal-content {
    padding: 20px;
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