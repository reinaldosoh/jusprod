<template>
  <div>
    <MenuFixo />
    <FiltroPasta 
      @search="handleSearch"
      @nova-pasta="handleNovaPasta"
      @pasta-criada="handlePastaCriada"
    />
    <div class="lista-spacing">
      <ListaPastas 
        :searchTerm="searchTerm" 
        @pasta-selecionada="handlePastaSelecionada"
        @editar-pasta="handleEditarPasta"
        ref="listaPastasRef"
      />
    </div>

    <!-- Filtro de Relatórios -->
    <div class="filtro-relatorios-spacing">
      <FiltroRelatorios 
        :titulo-pasta="pastaSelecionada.titulo"
        :mostrar-busca="true"
        :mostrar-botao-novo="mostrarBotaoNovoRelatorio"
        :pasta-id="pastaSelecionada.tipo === 'usuario' ? pastaSelecionada.id : null"
        @buscar="handleBuscarRelatorio"
        @novo-relatorio="handleNovoRelatorio"
        @relatorio-criado="handleRelatorioCriado"
        @erro="handleErroRelatorio"
        ref="filtroRelatoriosRef"
      />
    </div>

    <!-- Lista de Relatórios Padrão (apenas quando pasta sistema estiver ativa) -->
    <div v-if="mostrarRelatoriosPadrao" class="relatorios-padrao-spacing">
      <ListaRelatoriosPadrao 
        @visualizar-relatorio="handleVisualizarRelatorioPadrao"
        @relatorio-criado="handleRelatorioCriado"
        ref="listaRelatoriosPadraoRef"
      />
    </div>

    <!-- Lista de Relatórios do Cliente (apenas quando pasta de usuário estiver ativa) -->
    <div v-if="mostrarRelatoriosCliente" class="relatorios-cliente-spacing">
      <ListaRelatoriosCliente 
        :pasta-id="pastaSelecionada.id"
        :termo-busca="termoBusca"
        @visualizar-relatorio="handleVisualizarRelatorio"
        @duplicar-relatorio="handleDuplicarRelatorio"
        @mover-relatorio="handleMoverRelatorio"
        @enviar-relatorio="handleEnviarRelatorio"
        @exportar-relatorio="handleExportarRelatorio"
        @historico-relatorio="handleHistoricoRelatorio"
        @excluir-relatorio="handleExcluirRelatorio"
        @acoes-relatorio="handleAcoesRelatorio"
        ref="listaRelatoriosClienteRef"
      />
    </div>



    <!-- Modal Editar Pasta -->
    <EditarPasta
      v-if="mostrarEditarPasta"
      :pasta-id="pastaEditando.id"
      :nome-atual="pastaEditando.nome"
      @close="fecharEditarPasta"
      @pasta-editada-sucesso="handlePastaEditadaSucesso"
    />

    <!-- Alerta de Sucesso -->
    <AlertaSucesso 
      v-if="mostrarSucessoDocumento"
      :mensagem="mensagemSucesso"
      @fechar="fecharSucessoDocumento"
    />
    
    <!-- Alerta de Erro -->
    <AlertaErro 
      v-if="mostrarAlertaErro"
      :mensagem="mensagemErro"
      @fechar="fecharAlertaErro"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FiltroPasta from './filtroPasta.vue'
import ListaPastas from './listaPastas.vue'
import FiltroRelatorios from './filtroRelatorios.vue'
import ListaRelatoriosPadrao from './listaRelatoriosPadrao.vue'
import ListaRelatoriosCliente from './listaRelatoriosCliente.vue'
import EditarPasta from './editarPasta.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'
import MenuFixo from '../../components/UI/MenuFixo.vue'

const searchTerm = ref('')
const pastaSelecionada = ref({ tipo: 'sistema', id: 'modelos-relatorios', titulo: 'Modelos padrão' })
const listaPastasRef = ref(null)
const filtroRelatoriosRef = ref(null)
const listaRelatoriosPadraoRef = ref(null)
const listaRelatoriosClienteRef = ref(null)
const mostrarSucessoDocumento = ref(false)
const mostrarAlertaErro = ref(false)
const mostrarEditarPasta = ref(false)
const mensagemErro = ref('')
const mensagemSucesso = ref('Pasta de relatórios criada com sucesso!')
const termoBusca = ref('')
const pastaEditando = ref({ id: null, nome: '' })

// Computed para mostrar relatórios padrão apenas quando pasta sistema estiver ativa
const mostrarRelatoriosPadrao = computed(() => {
  return pastaSelecionada.value && pastaSelecionada.value.tipo === 'sistema'
})

// Computed para mostrar relatórios de cliente quando pasta de usuário estiver ativa
const mostrarRelatoriosCliente = computed(() => {
  return pastaSelecionada.value && pastaSelecionada.value.tipo === 'usuario'
})

// Computed para mostrar botão "Novo relatório" apenas em pastas de usuário
const mostrarBotaoNovoRelatorio = computed(() => {
  return pastaSelecionada.value && pastaSelecionada.value.tipo === 'usuario'
})

const handleSearch = (term) => {
  searchTerm.value = term
  console.log('Pesquisando pastas de relatórios por:', term)
}

const handleNovaPasta = () => {
  console.log('Abrindo modal para nova pasta de relatórios')
}

const handlePastaCriada = () => {
  console.log('Pasta de relatórios criada, recarregando lista...')
  mensagemSucesso.value = 'Pasta de relatórios criada com sucesso!'
  mostrarSucessoDocumento.value = true
  recarregarPastas()
}

const recarregarPastas = () => {
  if (listaPastasRef.value) {
    listaPastasRef.value.recarregar()
  }
}

const handlePastaSelecionada = (pastaInfo) => {
  pastaSelecionada.value = pastaInfo
  console.log('📁 Pasta de relatório selecionada:', pastaInfo)
  console.log('📊 Mostrar relatórios padrão:', mostrarRelatoriosPadrao.value)
  console.log('👤 Mostrar relatórios cliente:', mostrarRelatoriosCliente.value)
}

const handleEditarPasta = (pastaInfo) => {
  console.log('Editar pasta de relatório:', pastaInfo)
  pastaEditando.value = {
    id: pastaInfo.pastaId,
    nome: pastaInfo.titulo
  }
  mostrarEditarPasta.value = true
}

const handleVisualizarRelatorioPadrao = (relatorio) => {
  console.log('Visualizar relatório padrão:', relatorio)
  // Relatório já é aberto automaticamente em nova aba pelo componente
}

const handleRelatorioCriado = (relatorio) => {
  console.log('Relatório criado:', relatorio)
  // Implementar lógica se necessário
}

const handleBuscarRelatorio = (termo) => {
  termoBusca.value = termo
  console.log('Pesquisando relatórios por:', termo)
}

const handleNovoRelatorio = () => {
  console.log('Criar novo relatório')
  // Implementar lógica para criar novo relatório
}

const handleErroRelatorio = (erro) => {
  console.error('Erro com relatório:', erro)
  mensagemErro.value = erro
  mostrarAlertaErro.value = true
}

// Handlers para ações dos relatórios do cliente
const handleVisualizarRelatorio = (relatorio) => {
  console.log('Visualizar relatório:', relatorio)
  // Implementar lógica para visualizar relatório
}

const handleDuplicarRelatorio = (relatorio) => {
  console.log('Duplicar relatório:', relatorio)
  // Implementar lógica para duplicar relatório
}

const handleMoverRelatorio = (relatorio) => {
  console.log('Mover relatório:', relatorio)
  // Implementar lógica para mover relatório
}

const handleEnviarRelatorio = (relatorio) => {
  console.log('Enviar relatório:', relatorio)
  // Implementar lógica para enviar relatório
}

const handleExportarRelatorio = (relatorio) => {
  console.log('Exportar relatório:', relatorio)
  // Implementar lógica para exportar relatório
}

const handleHistoricoRelatorio = (relatorio) => {
  console.log('Histórico relatório:', relatorio)
  // Implementar lógica para histórico do relatório
}

const handleExcluirRelatorio = (relatorio) => {
  console.log('Excluir relatório:', relatorio)
  // Implementar lógica para excluir relatório
}

const handleAcoesRelatorio = (dadosAcao) => {
  console.log('Ações relatório:', dadosAcao)
  // Implementar lógica para outras ações do relatório
}

const fecharEditarPasta = () => {
  mostrarEditarPasta.value = false
  pastaEditando.value = { id: null, nome: '' }
}

const atualizarTituloPastaEditada = async () => {
  try {
    // Só atualizar se estivermos na pasta editada
    if (pastaSelecionada.value.tipo === 'usuario' && pastaSelecionada.value.id === pastaEditando.value.id) {
      // Buscar o novo nome da pasta no banco
      const { supabase } = await import('../../lib/supabase.js')
      const { data, error } = await supabase
        .from('pasta_relatorios')
        .select('titulo')
        .eq('id', pastaEditando.value.id)
        .single()
      
      if (error) {
        console.error('Erro ao buscar nome atualizado da pasta:', error)
        return
      }
      
      if (data) {
        // Atualizar o título da pasta selecionada
        pastaSelecionada.value.titulo = data.titulo
        console.log('✅ Título da pasta atualizado:', data.titulo)
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar título da pasta:', error)
  }
}

const handlePastaEditadaSucesso = async () => {
  console.log('Pasta de relatórios editada com sucesso!')
  mensagemSucesso.value = 'Pasta de relatórios editada com sucesso!'
  mostrarSucessoDocumento.value = true
  
  // Recarregar as pastas
  recarregarPastas()
  
  // Buscar o novo nome da pasta editada e atualizar o título
  await atualizarTituloPastaEditada()
}

const fecharSucessoDocumento = () => {
  mostrarSucessoDocumento.value = false
}

const fecharAlertaErro = () => {
  mostrarAlertaErro.value = false
  mensagemErro.value = ''
}
</script>

<style scoped>
.lista-spacing {
  padding-top: 24px;
  width: 100%;
  overflow-x: auto;
}

.filtro-relatorios-spacing {
  padding-top: 0;
}

.relatorios-padrao-spacing {
  padding-top: 0;
}

.relatorios-cliente-spacing {
  padding-top: 32px;
}

/* Garante que o container principal não corte as pastas */
@media (max-width: 768px) {
  .lista-spacing {
    padding-top: 16px;
    overflow-x: visible;
  }
}
</style> 