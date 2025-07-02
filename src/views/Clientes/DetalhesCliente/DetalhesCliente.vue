<template>
  <div>
    <MenuFixo />
    <div class="main-content">
      <BotaoVoltar class="botao-voltar-posicao" />
      
      <div v-if="loading" class="loading-container">
        <p>Carregando dados do cliente...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="cliente" class="cliente-container">
        <div class="cliente-info">
          <CardDetalhe 
            :cliente="cliente" 
            @toggle-favorito="handleToggleFavorito"
            @editar="handleEditar"
            @conversar="handleConversar"
            @expandir="handleExpandir"
          />
          <FasesProcesso 
            :processo-id="processoSelecionado"
            @organizar-fases="handleOrganizarFases"
            @fases-criadas="handleFasesCriadas"
          />
          <EditarValorProcesso 
            v-if="processoSelecionado"
            :processo-id="processoSelecionado"
            :valor-causa="processoAtual?.valor_causa || 0"
            @valor-atualizado="handleValorAtualizado"
            class="valor-processo-spacing"
          />
        </div>
        
        <div class="cliente-tabs">
          <Tabs 
            :cliente="cliente" 
            @processo-selecionado="handleProcessoSelecionado"
          />
        </div>
      </div>

    <!-- Modal Resumo Cliente -->
    <div v-if="expandido && cliente && cliente.id" class="modal-overlay" @click="fecharModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Resumo do Cliente</h2>
          <button class="modal-close-btn" @click="fecharModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <ResumoCliente 
            :cliente="cliente"
            @novo-processo="handleNovoProcesso"
            @editar-processo="handleEditarProcesso"
          />
        </div>
      </div>
    </div>

    <!-- Modal de Mensagem Individual -->
    <MensagemIndividual
      v-if="cliente"
      :show="showMensagemModal"
      :cliente-id="cliente?.id"
      @close="showMensagemModal = false"
    />

    <!-- Formulários de Edição -->
    <FormularioPF
      v-if="showFormularioPF"
      :cliente-para-edicao="cliente"
      :modo-edicao="true"
      @close="fecharFormularioEdicao"
      @clienteSalvo="handleClienteAtualizado"
      @switchToPJ="switchToPJ"
      @switchToLote="switchToLote"
    />

    <FormularioPJ
      v-if="showFormularioPJ"
      :empresa-para-edicao="cliente"
      :modo-edicao="true"
      @close="fecharFormularioEdicao"
      @clienteSalvo="handleClienteAtualizado"
      @switchToPF="switchToPF"
      @switchToLote="switchToLote"
    />

    <!-- Alerta de Sucesso -->
    <AlertaSucesso 
      v-if="mostrarAlertaSucesso" 
      :mensagem="mensagemSucesso" 
      @fechar="fecharAlertaSucesso"
    />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useClientes } from '../../../composables/useClientes'

import MenuFixo from '../../../components/UI/MenuFixo.vue'
import BotaoVoltar from './botaoVoltar.vue'
import CardDetalhe from './card_detalhe.vue'
import FasesProcesso from './fasesprocesso.vue'
import EditarValorProcesso from './editar_valor_processo.vue'
import Tabs from './tabs.vue'
import MensagemIndividual from '../mensagemIndividual.vue'
import ResumoCliente from './resumoCliente.vue'
import FormularioPF from '../FormularioPF.vue'
import FormularioPJ from '../FormularioPJ.vue'
import AlertaSucesso from '../../../components/UI/AlertaSucesso.vue'

const route = useRoute()
const { buscarClientePorId, toggleFavorito, loading, error } = useClientes()

const cliente = ref(null)
const expandido = ref(false)
const showMensagemModal = ref(false)
const showFormularioPF = ref(false)
const showFormularioPJ = ref(false)
const mostrarAlertaSucesso = ref(false)
const mensagemSucesso = ref('')
const processoSelecionado = ref(null) // ID do processo será recebido do dropdown
const processoAtual = ref(null) // Dados completos do processo selecionado

// Handler para quando um processo é selecionado no dropdown
const handleProcessoSelecionado = (processo) => {
  processoSelecionado.value = processo?.id || null
  processoAtual.value = processo || null
  console.log('Processo selecionado para fases:', processoSelecionado.value)
  console.log('Valor da causa:', processo?.valor_causa)
}

onMounted(async () => {
  const clienteId = route.params.id
  if (clienteId) {
    const resultado = await buscarClientePorId(clienteId)
    if (resultado.success) {
      cliente.value = resultado.data
    }
  }
})

const handleToggleFavorito = async () => {
  if (!cliente.value) return
  
  try {
    const result = await toggleFavorito(cliente.value.id, cliente.value.favorito)
    if (result.success) {
      cliente.value.favorito = !cliente.value.favorito
    }
  } catch (err) {
    console.error('Erro ao alterar favorito:', err)
  }
}

const handleEditar = () => {
  console.log('Editar cliente:', cliente.value)
  
  // Determinar qual formulário abrir baseado no campo 'empresa'
  if (cliente.value.empresa) {
    console.log('Abrindo formulário de edição para Pessoa Jurídica')
    showFormularioPJ.value = true
  } else {
    console.log('Abrindo formulário de edição para Pessoa Física')
    showFormularioPF.value = true
  }
}

const handleConversar = () => {
  if (!cliente.value) return
  showMensagemModal.value = true
}

const handleExpandir = () => {
  expandido.value = !expandido.value
  console.log('Expandir detalhes:', expandido.value)
}

const fecharModal = () => {
  expandido.value = false
}

const fecharFormularioEdicao = () => {
  showFormularioPF.value = false
  showFormularioPJ.value = false
}

const handleClienteAtualizado = async (dadosCliente) => {
  console.log('Cliente atualizado com sucesso:', dadosCliente)
  
  // Configurar mensagem de sucesso
  mensagemSucesso.value = dadosCliente.mensagem || 'Cliente atualizado com sucesso!'
  
  // Recarregar os dados do cliente
  const clienteId = route.params.id
  if (clienteId) {
    const resultado = await buscarClientePorId(clienteId)
    if (resultado.success) {
      cliente.value = resultado.data
    }
  }
  
  // Fechar formulários
  fecharFormularioEdicao()
  
  // Mostrar alerta de sucesso
  mostrarAlertaSucesso.value = true
}

// Funções para alternar entre formulários durante a edição
const switchToPJ = () => {
  showFormularioPF.value = false
  showFormularioPJ.value = true
}

const switchToPF = () => {
  showFormularioPJ.value = false
  showFormularioPF.value = true
}

const switchToLote = () => {
  // Em modo de edição, não permitir trocar para lote
  console.log('Troca para formulário em lote não permitida durante edição')
  // Não fazer nada em modo de edição
}

const fecharAlertaSucesso = () => {
  mostrarAlertaSucesso.value = false
  mensagemSucesso.value = ''
}

const handleNovoProcesso = (numeroProcesso) => {
  console.log('Novo processo criado:', numeroProcesso)
  // Implementar lógica para novo processo
}

const handleEditarProcesso = (processo) => {
  console.log('Editar processo:', processo)
  // Implementar lógica para editar processo
}

const handleOrganizarFases = () => {
  console.log('Organizar fases do processo para cliente:', cliente.value)
  // Implementar lógica para organizar fases do processo
}

const handleFasesCriadas = (dadosFases) => {
  console.log('Fases criadas com sucesso:', dadosFases)
  
  // Configurar mensagem de sucesso
  mensagemSucesso.value = dadosFases.mensagem || 'Fases criadas com sucesso!'
  
  // Mostrar alerta de sucesso
  mostrarAlertaSucesso.value = true
  
  // Aqui você pode adicionar lógica adicional como:
  // - Recarregar lista de fases
  // - Atualizar interface
  // - Etc.
}

const handleValorAtualizado = (novoValor) => {
  console.log('Valor da causa atualizado:', novoValor)
  
  // Atualizar o valor na referência do processo atual
  if (processoAtual.value) {
    processoAtual.value.valor_causa = novoValor
  }
  
  // Configurar mensagem de sucesso
  mensagemSucesso.value = 'Valor da causa atualizado com sucesso!'
  
  // Mostrar alerta de sucesso
  mostrarAlertaSucesso.value = true
}
</script>

<style scoped>
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  width: calc(100% - 240px); /* Considerando o espaço do menu lateral */
  box-sizing: border-box;
}

.botao-voltar-posicao {
  margin-bottom: 1.5rem;
}

.cliente-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.cliente-info {
  flex: 0 0 380px;
}

.valor-processo-spacing {
  margin-top: 24px;
}

.cliente-tabs {
  flex: 1;
  min-width: 300px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 16px;
}

.error-container {
  padding: 1rem;
  background-color: #fee2e2;
  border-radius: 8px;
  color: #b91c1c;
  margin-bottom: 1rem;
}

/* Modal Styles */
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
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 855px;
  height: 569px;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  height: 60px;
  box-sizing: border-box;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-content {
  overflow: hidden;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 855px;
  height: 509px; /* 569px - 60px do header */
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    width: 95vw;
    height: 95vh;
    max-width: 855px;
    max-height: 569px;
  }
  
  .modal-content {
    width: 100%;
    height: calc(100% - 60px);
    max-height: 509px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-top: 60px; /* Espaço para o menu mobile */
  }
  
  .cliente-container {
    flex-direction: column;
  }
  
  .cliente-info {
    width: 100%;
    max-width: 100%;
  }
  
  .modal-overlay {
    padding: 5px;
  }
  
  .modal-container {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .modal-content {
    width: 100%;
    height: calc(100% - 60px);
  }
}
</style>
