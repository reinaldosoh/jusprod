<template>
  <div>
    <!-- Menu Fixo (já inclui HeaderMobile para mobile) -->
    <MenuFixo />
    
    <div class="main-content">
      <FiltroFinanceiro @filtros-alterados="handleFiltrosAlterados" />
      <CardFinanceiro 
        ref="cardFinanceiroRef"
        :data-inicio="filtros.dataInicio"
        :data-final="filtros.dataFinal"
        @adicionar-recebiveis="mostrarFormRecebiveis"
        @adicionar-saidas="handleAdicionarSaidas"
        @adicionar-outras-despesas="handleAdicionarOutrasDespesas"
      />
      <FiltrodeLista @filtro-alterado="handleFiltroListaAlterado" />
      <div class="componentes-section">
        <PrevisaoRecebiveis 
          ref="previsaoRecebiveisRef"
          :data-inicio="filtros.dataInicio"
          :data-final="filtros.dataFinal"
        />
        <!-- Lista de Recebíveis -->
        <ListaRecebiveis 
          v-if="filtroLista === 'recebiveis'"
          ref="listaRecebiveisRef"
          :tipo-filtro="filtroLista"
          :data-inicio="filtros.dataInicio"
          :data-final="filtros.dataFinal"
          @visualizar-recebivel="visualizarRecebivel"
          @editar-recebivel="editarRecebivel"
          @excluir-recebivel="excluirRecebivel"
        />
        <!-- Lista de Saídas -->
        <ListaSaidas 
          v-if="filtroLista === 'saidas'"
          ref="listaSaidasRef"
          :data-inicio="filtros.dataInicio"
          :data-final="filtros.dataFinal"
          @visualizar-saida="visualizarSaida"
          @editar-saida="editarSaida"
          @excluir-saida="excluirSaida"
        />
        <!-- Lista de Outras Despesas -->
        <ListaOutrasDespesas 
          v-if="filtroLista === 'outras_despesas'"
          ref="listaOutrasDespesasRef"
          :data-inicio="filtros.dataInicio"
          :data-final="filtros.dataFinal"
          @visualizar-outras-despesas="visualizarOutraDespesa"
          @editar-outras-despesas="editarOutraDespesa"
          @excluir-outras-despesas="excluirOutraDespesa"
        />
      </div>
    </div>
    
    <!-- Modal com Form de Recebíveis -->
    <div v-if="formRecebiveisVisivel" class="modal-overlay">
      <FormsRecebiveis 
        :modo="modoFormRecebiveis"
        :dados-recebivel="recebivelSelecionado"
        @fechar="fecharFormRecebiveis"
        @salvar="salvarRecebivel"
        @recarregar="salvarRecebivel"
        @mostrar-alerta-sucesso="handleAlertaSucesso"
        @mostrar-alerta-erro="handleAlertaErro"
      />
    </div>

    <!-- Modal com Form de Saídas -->
    <div v-if="formSaidaVisivel" class="modal-overlay">
      <FormsSaida 
        :dados-edicao="saidaSelecionada"
        :modo-visualizacao="modoVisualizacaoSaida"
        @fechar="fecharFormSaida"
        @salvar="salvarSaida"
        @mostrar-alerta-sucesso="handleAlertaSucesso"
        @mostrar-alerta-erro="handleAlertaErro"
      />
    </div>

    <!-- Modal com Form de Outras Despesas -->
    <div v-if="formOutrasDespesasVisivel" class="modal-overlay">
      <FormsOutrasDespesas 
        :dados-edicao="outraDespesaSelecionada"
        :modo-visualizacao="modoVisualizacaoOutrasDespesas"
        @fechar="fecharFormOutrasDespesas"
        @salvar="salvarOutrasDespesas"
        @mostrar-alerta-sucesso="handleAlertaSucesso"
        @mostrar-alerta-erro="handleAlertaErro"
      />
    </div>

    <!-- Alerta de Erro -->
    <AlertaErro 
      v-if="alertaErroVisivel"
      titulo="Funcionalidade em desenvolvimento"
      :mensagem="mensagemErro"
      @fechar="fecharAlertaErro"
    />

    <!-- Alerta de Sucesso -->
    <AlertaSucesso 
      v-if="alertaSucessoVisivel"
      :mensagem="mensagemSucesso"
      @fechar="fecharAlertaSucesso"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MenuFixo from '../../components/UI/MenuFixo.vue'
import FiltroFinanceiro from './filtroFinanceiro.vue'
import CardFinanceiro from './cardFinanceiro.vue'
import FiltrodeLista from './filtrodeLista.vue'
import PrevisaoRecebiveis from './previsaoRecebiveis.vue'
import ListaRecebiveis from './listaRecebiveis.vue'
import ListaSaidas from './listaSaidas.vue'
import ListaOutrasDespesas from './lista_outras_despesas.vue'
import FormsRecebiveis from './formsRecebiveis.vue'
import FormsSaida from './formsSaida.vue'
import FormsOutrasDespesas from './formsOutrasDespesas.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'

// Estados reativos
const filtros = ref({
  dataInicio: null,
  dataFinal: null
})

const filtroLista = ref('recebiveis')
const formRecebiveisVisivel = ref(false)
const modoFormRecebiveis = ref('criar') // 'criar' ou 'visualizar'
const recebivelSelecionado = ref(null)
const formSaidaVisivel = ref(false)
const saidaSelecionada = ref(null)
const modoVisualizacaoSaida = ref(false)
const formOutrasDespesasVisivel = ref(false)
const outraDespesaSelecionada = ref(null)
const modoVisualizacaoOutrasDespesas = ref(false)
const listaRecebiveisRef = ref(null)
const listaSaidasRef = ref(null)
const listaOutrasDespesasRef = ref(null)
const cardFinanceiroRef = ref(null)
const previsaoRecebiveisRef = ref(null)
const alertaErroVisivel = ref(false)
const mensagemErro = ref('')
const alertaSucessoVisivel = ref(false)
const mensagemSucesso = ref('')

// Handlers
const handleFiltrosAlterados = (novosFiltros) => {
  console.log('🔄 Filtros alterados no Financeiro.vue:', {
    anterior: filtros.value,
    novo: novosFiltros
  })
  filtros.value = novosFiltros
  
  // Recarregar componentes quando filtros mudam
  console.log('🔄 Recarregando componentes com novos filtros...')
  if (cardFinanceiroRef.value) {
    cardFinanceiroRef.value.recarregar()
  }
  if (previsaoRecebiveisRef.value) {
    previsaoRecebiveisRef.value.recarregar()
  }
  if (listaRecebiveisRef.value) {
    listaRecebiveisRef.value.recarregar()
  }
  if (listaSaidasRef.value) {
    listaSaidasRef.value.recarregar()
  }
  if (listaOutrasDespesasRef.value) {
    listaOutrasDespesasRef.value.recarregar()
  }
}

const handleFiltroListaAlterado = (novoFiltro) => {
  filtroLista.value = novoFiltro.value // Usar o valor string do objeto
  console.log('Filtro lista alterado:', novoFiltro)
}

const mostrarFormRecebiveis = () => {
  modoFormRecebiveis.value = 'criar'
  recebivelSelecionado.value = null
  formRecebiveisVisivel.value = true
}

// === HANDLERS RECEBÍVEIS ===
const visualizarRecebivel = (recebivel) => {
  console.log('Visualizando recebível:', recebivel)
  modoFormRecebiveis.value = 'visualizar'
  recebivelSelecionado.value = recebivel
  formRecebiveisVisivel.value = true
}

const editarRecebivel = (recebivel) => {
  console.log('Editando recebível:', recebivel)
  modoFormRecebiveis.value = 'editar'
  recebivelSelecionado.value = recebivel
  formRecebiveisVisivel.value = true
}

const excluirRecebivel = (recebivel) => {
  console.log('✅ [Financeiro] Recebível excluído - recarregando componentes:', recebivel)
  
  // Recarregar os cards financeiros
  if (cardFinanceiroRef.value) {
    console.log('🔄 [Financeiro] Recarregando cardFinanceiro após exclusão de recebível')
    cardFinanceiroRef.value.recarregar()
  } else {
    console.warn('⚠️ [Financeiro] cardFinanceiroRef não está disponível')
  }
  
  // Recarregar a previsão de recebíveis
  if (previsaoRecebiveisRef.value) {
    console.log('🔄 [Financeiro] Recarregando previsaoRecebiveis após exclusão de recebível')
    previsaoRecebiveisRef.value.recarregar()
  } else {
    console.warn('⚠️ [Financeiro] previsaoRecebiveisRef não está disponível')
  }
}

// === HANDLERS SAÍDAS ===
const visualizarSaida = (saida) => {
  console.log('👁️ Visualizando saída:', saida)
  saidaSelecionada.value = saida
  modoVisualizacaoSaida.value = true
  formSaidaVisivel.value = true
}

const editarSaida = (saida) => {
  console.log('✏️ Editando saída:', saida)
  saidaSelecionada.value = saida
  modoVisualizacaoSaida.value = false
  formSaidaVisivel.value = true
}

const excluirSaida = (saida) => {
  console.log('✅ [Financeiro] Saída excluída - recarregando componentes:', saida)
  
  // Recarregar os cards financeiros
  if (cardFinanceiroRef.value) {
    console.log('🔄 [Financeiro] Recarregando cardFinanceiro após exclusão de saída')
    cardFinanceiroRef.value.recarregar()
  } else {
    console.warn('⚠️ [Financeiro] cardFinanceiroRef não está disponível')
  }
}

// === HANDLERS OUTRAS DESPESAS ===
const visualizarOutraDespesa = (despesa) => {
  console.log('👁️ Visualizando outra despesa:', despesa)
  outraDespesaSelecionada.value = despesa
  modoVisualizacaoOutrasDespesas.value = true
  formOutrasDespesasVisivel.value = true
}

const editarOutraDespesa = (despesa) => {
  console.log('✏️ Editando outra despesa:', despesa)
  outraDespesaSelecionada.value = despesa
  modoVisualizacaoOutrasDespesas.value = false
  formOutrasDespesasVisivel.value = true
}

const excluirOutraDespesa = (despesa) => {
  console.log('✅ [Financeiro] Outra despesa excluída - recarregando componentes:', despesa)
  
  // Recarregar os cards financeiros
  if (cardFinanceiroRef.value) {
    console.log('🔄 [Financeiro] Recarregando cardFinanceiro após exclusão de outra despesa')
    cardFinanceiroRef.value.recarregar()
  } else {
    console.warn('⚠️ [Financeiro] cardFinanceiroRef não está disponível')
  }
}

const fecharFormRecebiveis = () => {
  formRecebiveisVisivel.value = false
  modoFormRecebiveis.value = 'criar'
  recebivelSelecionado.value = null
}

const fecharFormSaida = () => {
  formSaidaVisivel.value = false
  saidaSelecionada.value = null
  modoVisualizacaoSaida.value = false
}

const fecharFormOutrasDespesas = () => {
  formOutrasDespesasVisivel.value = false
  outraDespesaSelecionada.value = null
  modoVisualizacaoOutrasDespesas.value = false
}

const salvarRecebivel = () => {
  // Recarregar a lista de recebíveis
  if (listaRecebiveisRef.value) {
    listaRecebiveisRef.value.recarregar()
  }
  
  // Recarregar os cards financeiros
  if (cardFinanceiroRef.value) {
    cardFinanceiroRef.value.recarregar()
  }
  
  // Recarregar a previsão de recebíveis
  if (previsaoRecebiveisRef.value) {
    previsaoRecebiveisRef.value.recarregar()
  }
  
  // Fechar o form após salvar
  fecharFormRecebiveis()
}

const salvarSaida = () => {
  // Recarregar os cards financeiros
  if (cardFinanceiroRef.value) {
    cardFinanceiroRef.value.recarregar()
  }
  
  // Recarregar a lista de saídas
  if (listaSaidasRef.value) {
    listaSaidasRef.value.recarregar()
  }
  
  // Fechar o form após salvar
  fecharFormSaida()
}

const salvarOutrasDespesas = () => {
  // Recarregar os cards financeiros
  if (cardFinanceiroRef.value) {
    cardFinanceiroRef.value.recarregar()
  }
  
  // Recarregar a lista de outras despesas
  if (listaOutrasDespesasRef.value) {
    listaOutrasDespesasRef.value.recarregar()
  }
  
  // Fechar o form após salvar
  fecharFormOutrasDespesas()
}

const handleAdicionarSaidas = () => {
  saidaSelecionada.value = null
  modoVisualizacaoSaida.value = false
  formSaidaVisivel.value = true
}

const handleAdicionarOutrasDespesas = () => {
  console.log('➕ Abrindo modal para adicionar outras despesas')
  outraDespesaSelecionada.value = null
  modoVisualizacaoOutrasDespesas.value = false
  formOutrasDespesasVisivel.value = true
}

const handleAlertaSucesso = (mensagem) => {
  mensagemSucesso.value = mensagem
  alertaSucessoVisivel.value = true
}

const handleAlertaErro = (mensagem) => {
  mensagemErro.value = mensagem
  alertaErroVisivel.value = true
}

const fecharAlertaErro = () => {
  alertaErroVisivel.value = false
  mensagemErro.value = ''
}

const fecharAlertaSucesso = () => {
  alertaSucessoVisivel.value = false
  mensagemSucesso.value = ''
}
</script>

<style scoped>
/* Desktop Layout */
@media (min-width: 769px) {
  .main-content {
    margin-left: auto;
    margin-right: auto;
    padding: 0px 16px 32px 16px; /* Mesmo padding do MenuFixo (px-4 = 16px) */
    background: white;
    min-height: 100vh;
    max-width: 1280px; /* Mesmo max-width do MenuFixo */
  }
  
  .componentes-section {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    justify-content: flex-start;
    padding-left: 0; /* Remove padding extra para alinhar com as tabs */
    max-width: 1248px; /* Largura máxima disponível (1280 - 32px padding) */
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  }
}

/* Mobile Layout */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-right: 0;
    padding: 16px 12px;
    background: white;
    min-height: 100vh;
    max-width: 100%;
    padding-top: 0; /* Remove top padding para ficar logo abaixo do HeaderMobile */
  }
  
  .componentes-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
    justify-content: flex-start;
    padding-left: 0;
  }
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .componentes-section {
    flex-direction: column;
    gap: 20px;
    padding-left: 0;
  }
}

/* === MODAL OVERLAY === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow: visible !important;
}

/* Mobile modal adjustments */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
    align-items: flex-start;
    padding-top: 60px; /* Espaço para o HeaderMobile */
  }
}
</style> 