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
import { ref, computed, nextTick, watch, triggerRef } from 'vue'
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

// Watch para observar mudanças no título da pasta selecionada
watch(() => pastaSelecionada.value.titulo, (novoTitulo, tituloAnterior) => {
  console.log('📝 WATCH: Título da pasta mudou:', {
    anterior: tituloAnterior,
    novo: novoTitulo,
    pastaSelecionada: pastaSelecionada.value
  })
}, { deep: true, immediate: true })

// Watch para observar mudanças no objeto completo pastaSelecionada
watch(pastaSelecionada, (novaPasta, pastaAnterior) => {
  console.log('📝 WATCH: Pasta selecionada mudou:', {
    anterior: pastaAnterior,
    nova: novaPasta
  })
}, { deep: true })

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
    console.log('🔄 INICIANDO ATUALIZAÇÃO DO TÍTULO...')
    console.log('📊 Pasta selecionada ID:', pastaSelecionada.value.id)
    console.log('📝 Pasta editando ID:', pastaEditando.value.id)
    console.log('📝 Pasta editando nome:', pastaEditando.value.nome)
    
         // Verificar se estamos na pasta que foi editada
     if (pastaSelecionada.value.tipo === 'usuario' && pastaSelecionada.value.id === pastaEditando.value.id) {
       console.log('✅ CONDIÇÕES ATENDIDAS - Buscando novo nome...')
       
       // Validar ID antes da query
       const pastaId = parseInt(pastaEditando.value.id)
       if (!pastaId || isNaN(pastaId)) {
         console.error('❌ ID da pasta inválido:', pastaEditando.value.id)
         return false
       }
       
       console.log('📝 ID validado para busca:', pastaId)
       
       // Verificar autenticação
       const { useAuthStore } = await import('../../stores/auth.js')
       const { user } = useAuthStore()
       
       if (!user.value?.id) {
         console.error('❌ Usuário não autenticado')
         return false
       }
       
       console.log('📝 Usuário autenticado:', user.value.id)
       
       // Buscar o novo nome da pasta no banco
       const { supabase } = await import('../../lib/supabase.js')
       const { data, error } = await supabase
         .from('pasta_relatorios')
         .select('titulo')
         .eq('id', pastaId)
         .eq('uuid', user.value.id)
         .single()
      
             if (error) {
         console.error('❌ ERRO ao buscar nome atualizado da pasta:', error)
         console.log('🔄 Tentando usar nome do modal como fallback...')
         
         // Fallback: usar o nome que está no pastaEditando (vem do modal)
         if (pastaEditando.value.nome && pastaEditando.value.nome.trim()) {
           const nomeFromModal = pastaEditando.value.nome.trim()
           console.log('📝 Usando nome do modal:', nomeFromModal)
           
           const tituloAnterior = pastaSelecionada.value.titulo
           
           // Aplicar os 3 métodos de atualização
           pastaSelecionada.value.titulo = nomeFromModal
           triggerRef(pastaSelecionada)
           pastaSelecionada.value = {
             ...pastaSelecionada.value,
             titulo: nomeFromModal
           }
           
           console.log('✅ TÍTULO ATUALIZADO COM FALLBACK!')
           console.log('📝 TÍTULO ANTERIOR:', tituloAnterior)
           console.log('📝 TÍTULO NOVO:', nomeFromModal)
           
           await nextTick()
           return true
         }
         
         return false
       }
      
      if (data && data.titulo) {
        const tituloAnterior = pastaSelecionada.value.titulo
        const novoTitulo = data.titulo
        
        console.log('📝 TÍTULO ANTERIOR:', tituloAnterior)
        console.log('📝 TÍTULO NOVO:', novoTitulo)
        
        // MÉTODO 1: Atualizar diretamente
        pastaSelecionada.value.titulo = novoTitulo
        
        // MÉTODO 2: Forçar reatividade
        triggerRef(pastaSelecionada)
        
        // MÉTODO 3: Criar novo objeto (força reatividade)
        pastaSelecionada.value = {
          ...pastaSelecionada.value,
          titulo: novoTitulo
        }
        
        console.log('✅ TÍTULO ATUALIZADO COM SUCESSO!')
        console.log('✅ Pasta selecionada final:', pastaSelecionada.value)
        
        // Aguardar um momento para garantir que a atualização foi aplicada
        await nextTick()
        
        return true
      }
    } else {
      console.log('⚠️ NÃO É NECESSÁRIO ATUALIZAR - pasta não corresponde')
      console.log('⚠️ Tipo:', pastaSelecionada.value.tipo)
      console.log('⚠️ ID pasta selecionada:', pastaSelecionada.value.id)
      console.log('⚠️ ID pasta editando:', pastaEditando.value.id)
    }
  } catch (error) {
    console.error('❌ ERRO FATAL ao atualizar título da pasta:', error)
  }
  
  return false
}

const handlePastaEditadaSucesso = async (dadosAtualizacao) => {
  console.log('🎉 PASTA EDITADA COM SUCESSO!')
  console.log('📊 Dados da atualização recebidos:', dadosAtualizacao)
  console.log('📊 Estado ANTES da atualização:', {
    pastaSelecionada: pastaSelecionada.value,
    pastaEditando: pastaEditando.value
  })
  
  mensagemSucesso.value = 'Pasta de relatórios editada com sucesso!'
  mostrarSucessoDocumento.value = true
  
  // MÉTODO DIRETO: Usar o nome que vem do evento
  if (dadosAtualizacao && dadosAtualizacao.novoNome && pastaSelecionada.value.tipo === 'usuario' && pastaSelecionada.value.id === dadosAtualizacao.id) {
    const novoNome = dadosAtualizacao.novoNome
    const tituloAnterior = pastaSelecionada.value.titulo
    
    console.log('🔄 ATUALIZANDO TÍTULO DIRETAMENTE...')
    console.log('📝 TÍTULO ANTERIOR:', tituloAnterior)
    console.log('📝 TÍTULO NOVO:', novoNome)
    
    // Aplicar os 3 métodos de atualização
    pastaSelecionada.value.titulo = novoNome
    triggerRef(pastaSelecionada)
    pastaSelecionada.value = {
      ...pastaSelecionada.value,
      titulo: novoNome
    }
    
    console.log('✅ TÍTULO ATUALIZADO DIRETAMENTE!')
    
    // Atualizar também o pastaEditando para manter sincronizado
    pastaEditando.value.nome = novoNome
    
    await nextTick()
  } else {
    console.log('🔄 Tentando atualizar via banco de dados...')
    // Fallback: tentar buscar do banco
    const tituloAtualizado = await atualizarTituloPastaEditada()
    
    if (tituloAtualizado) {
      console.log('✅ TÍTULO ATUALIZADO VIA BANCO!')
    } else {
      console.log('⚠️ TÍTULO NÃO FOI ATUALIZADO')
    }
  }
  
  // Aguardar um pouco para garantir que foi aplicado
  await nextTick()
  
  // DEPOIS: Recarregar as pastas
  recarregarPastas()
  
  console.log('📊 Estado FINAL:', {
    pastaSelecionada: pastaSelecionada.value,
    pastaEditando: pastaEditando.value
  })
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