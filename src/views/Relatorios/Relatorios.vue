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
        :mostrar-busca="mostrarBuscaRelatorio"
        :mostrar-botao-novo="mostrarBotaoNovoRelatorio"
        :pasta-id="pastaSelecionada.tipo === 'usuario' ? pastaSelecionada.id : null"
        @buscar="handleBuscarRelatorio"
        @novo-relatorio="handleNovoRelatorio"
        @carregar-relatorio="handleCarregarRelatorio"
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

    <!-- Modal Carregar Arquivo -->
    <CarregarArquivo
      :is-visible="mostrarCarregarArquivo"
      :pasta-id="pastaSelecionada.tipo === 'usuario' ? pastaSelecionada.id : null"
      @fechar="fecharCarregarArquivo"
      @arquivo-carregado="handleArquivoCarregado"
      @erro="handleErroRelatorio"
    />

    <!-- Modal Visualizador de Arquivo -->
    <VisualizadorFile
      :is-visible="mostrarVisualizadorFile"
      :relatorio="relatorioParaVisualizar"
      @fechar="fecharVisualizadorFile"
    />

    <!-- Modal Renomear/Duplicar Relatório -->
    <RenomearArquivo
      v-if="mostrarModalRenomear && relatorioParaDuplicar"
      :relatorio="relatorioParaDuplicar"
      @close="fecharModalRenomear"
      @relatorio-duplicado="handleRelatorioDuplicado"
    />

    <!-- Modal Mover Relatório -->
    <MoverArquivoPasta
      v-if="mostrarModalMover && relatorioParaMover"
      :relatorio="relatorioParaMover"
      @close="fecharModalMover"
      @relatorio-movido="handleRelatorioMovido"
    />

    <!-- Modal Confirmar Exclusão -->
    <ConfirmarExclusaoRelatorio
      v-if="mostrarModalExclusao && relatorioParaExcluir"
      :visible="mostrarModalExclusao"
      :relatorio="relatorioParaExcluir"
      @cancelar="fecharModalExclusao"
      @excluir="handleRelatorioExcluido"
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
import CarregarArquivo from './carregarArquivo.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'
import MenuFixo from '../../components/UI/MenuFixo.vue'
import VisualizadorFile from './visualizadorFile.vue'
import RenomearArquivo from './renomearArquivo.vue'
import MoverArquivoPasta from './mover_Arquivo_Pasta.vue'
import ConfirmarExclusaoRelatorio from '../../components/UI/ConfirmarExclusaoRelatorio.vue'

const searchTerm = ref('')
const pastaSelecionada = ref({ tipo: 'sistema', id: 'modelos-relatorios', titulo: 'Modelos padrão' })
const listaPastasRef = ref(null)
const filtroRelatoriosRef = ref(null)
const listaRelatoriosPadraoRef = ref(null)
const listaRelatoriosClienteRef = ref(null)
const mostrarSucessoDocumento = ref(false)
const mostrarAlertaErro = ref(false)
const mostrarEditarPasta = ref(false)
const mostrarCarregarArquivo = ref(false)
const mensagemErro = ref('')
const mensagemSucesso = ref('Pasta de relatórios criada com sucesso!')
const termoBusca = ref('')
const pastaEditando = ref({ id: null, nome: '' })

// Novos estados para funcionalidades completas
const mostrarVisualizadorFile = ref(false)
const relatorioParaVisualizar = ref(null)
const mostrarModalRenomear = ref(false)
const relatorioParaDuplicar = ref(null)
const mostrarModalMover = ref(false)
const relatorioParaMover = ref(null)
const mostrarModalExclusao = ref(false)
const relatorioParaExcluir = ref(null)

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

// Computed para mostrar campo de busca apenas em pastas de usuário (não mostrar na pasta "Modelos padrão")
const mostrarBuscaRelatorio = computed(() => {
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

const handlePastaCriada = async () => {
  console.log('Pasta de relatórios criada, recarregando lista...')
  mensagemSucesso.value = 'Pasta de relatórios criada com sucesso!'
  mostrarSucessoDocumento.value = true
  await recarregarPastas(false) // Recarga completa para nova pasta
}

const recarregarPastas = async (forcarQuantidades = false) => {
  if (listaPastasRef.value) {
    if (forcarQuantidades) {
      console.log('📁 Forçando atualização das quantidades...')
      await listaPastasRef.value.forcarAtualizacaoQuantidades()
    } else {
      console.log('📁 Recarregando lista completa...')
      await listaPastasRef.value.recarregar()
    }
  }
}

const handlePastaSelecionada = (pastaInfo) => {
  pastaSelecionada.value = pastaInfo
  // Limpar termo de busca ao trocar de pasta
  termoBusca.value = ''
  // Limpar também o campo de busca no filtro
  if (filtroRelatoriosRef.value) {
    filtroRelatoriosRef.value.limparBusca()
  }
  console.log('📁 Pasta de relatório selecionada:', pastaInfo)
  console.log('📊 Mostrar relatórios padrão:', mostrarRelatoriosPadrao.value)
  console.log('👤 Mostrar relatórios cliente:', mostrarRelatoriosCliente.value)
  console.log('🔍 Mostrar busca:', mostrarBuscaRelatorio.value)
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

const handleCarregarRelatorio = () => {
  console.log('Carregar arquivo de relatório')
  mostrarCarregarArquivo.value = true
}

const fecharCarregarArquivo = () => {
  mostrarCarregarArquivo.value = false
}

const handleArquivoCarregado = async (relatorio) => {
  console.log('✅ Arquivo de relatório carregado:', relatorio)
  
  // Primeiro fechar o modal
  fecharCarregarArquivo()
  
  // Aguardar um momento para garantir que o modal foi fechado
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Depois mostrar mensagem de sucesso
  mensagemSucesso.value = 'Relatório carregado com sucesso!'
  mostrarSucessoDocumento.value = true
  
  // Aguardar mais um pouco para garantir que a transação no banco foi commitada
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Recarregar dados - fazer sequencialmente para garantir que não haja conflitos
  try {
    console.log('🔄 Iniciando recarregamento das listas...')
    
    // 1. Primeiro forçar atualização das quantidades das pastas
    if (listaPastasRef.value) {
      console.log('📁 Forçando atualização das quantidades das pastas...')
      await listaPastasRef.value.forcarAtualizacaoQuantidades()
      console.log('✅ Quantidades das pastas atualizadas')
    }
    
    // 2. Depois recarregar lista de relatórios do cliente se estiver ativa
    if (listaRelatoriosClienteRef.value && mostrarRelatoriosCliente.value) {
      console.log('📊 Recarregando lista de relatórios...')
      await listaRelatoriosClienteRef.value.recarregar()
      console.log('✅ Lista de relatórios recarregada')
    }
    
    console.log('🎉 Todas as listas foram recarregadas com sucesso!')
    
  } catch (error) {
    console.error('⚠️ Erro ao recarregar listas (não crítico):', error)
    // Não mostrar erro para o usuário pois o arquivo foi carregado com sucesso
  }
}

const handleErroRelatorio = (erro) => {
  console.error('❌ Erro com relatório:', erro)
  
  // Melhorar a mensagem de erro para o usuário
  let mensagemAmigavel = 'Erro desconhecido ao processar relatório'
  
  if (typeof erro === 'string') {
    if (erro.includes('Bucket not found')) {
      mensagemAmigavel = 'Erro de configuração do sistema. Contate o suporte.'
    } else if (erro.includes('Falha no upload')) {
      mensagemAmigavel = 'Falha no upload do arquivo. Tente novamente.'
    } else if (erro.includes('Falha ao salvar no banco')) {
      mensagemAmigavel = 'Erro ao salvar dados. Verifique sua conexão.'
    } else if (erro.includes('Usuário não autenticado')) {
      mensagemAmigavel = 'Sessão expirada. Faça login novamente.'
    } else {
      mensagemAmigavel = erro
    }
  }
  
  mensagemErro.value = mensagemAmigavel
  mostrarAlertaErro.value = true
}

// Handlers para ações dos relatórios do cliente
const handleVisualizarRelatorio = async (relatorio) => {
  try {
    console.log('📄 Visualizando relatório:', relatorio)
    console.log('🔍 Tipo isFile:', relatorio.isFile)
    
    // Se for arquivo carregado (isFile: true), usar visualizador de arquivo
    if (relatorio.isFile) {
      console.log('📁 Abrindo visualizador de arquivo')
      relatorioParaVisualizar.value = relatorio
      mostrarVisualizadorFile.value = true
    } else {
      // Se for relatório HTML (isFile: false), exibir em nova aba ou modal HTML
      console.log('📝 Abrindo relatório HTML')
      // Para relatórios HTML, abrir em nova aba
      if (relatorio.html) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${relatorio.nome}</title>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1, h2, h3 { color: #333; }
            </style>
          </head>
          <body>
            <h1>${relatorio.nome}</h1>
            <div>${relatorio.html}</div>
          </body>
          </html>
        `
        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao visualizar relatório:', error)
    mensagemErro.value = 'Erro ao visualizar relatório'
    mostrarAlertaErro.value = true
  }
}

const handleDuplicarRelatorio = (relatorio) => {
  console.log('Duplicar relatório:', relatorio)
  relatorioParaDuplicar.value = relatorio
  mostrarModalRenomear.value = true
}

const handleMoverRelatorio = (relatorio) => {
  console.log('Mover relatório:', relatorio)
  relatorioParaMover.value = relatorio
  mostrarModalMover.value = true
}

const handleEnviarRelatorio = (relatorio) => {
  console.log('Enviar relatório:', relatorio)
  // TODO: Implementar envio por email/WhatsApp
  mensagemErro.value = 'Funcionalidade de envio ainda não implementada'
  mostrarAlertaErro.value = true
}

const handleExportarRelatorio = async (relatorio) => {
  console.log('Exportar relatório:', relatorio)
  
  try {
    if (relatorio.isFile && relatorio.url) {
      // Para arquivos, fazer download direto
      const link = document.createElement('a')
      link.href = relatorio.url
      link.download = relatorio.nome || 'relatorio'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (relatorio.html) {
      // Para relatórios HTML, exportar como PDF
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      
      // Criar elemento temporário para renderizar o HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = relatorio.html
      tempDiv.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 600px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        color: #333;
        padding: 20px;
        background: white;
      `
      document.body.appendChild(tempDiv)
      
      // Converter para canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      document.body.removeChild(tempDiv)
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // Adicionar título
      pdf.setFontSize(16)
      pdf.setTextColor(4, 104, 250)
      pdf.text(relatorio.nome, 105, 20, { align: 'center' })
      
      // Adicionar imagem
      const imgData = canvas.toDataURL('image/png')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 40
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight)
      
      // Salvar
      const nomeArquivo = `${relatorio.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      pdf.save(nomeArquivo)
    }
    
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    mensagemErro.value = 'Erro ao exportar relatório em PDF'
    mostrarAlertaErro.value = true
  }
}

const handleHistoricoRelatorio = (relatorio) => {
  console.log('Histórico relatório:', relatorio)
  // TODO: Implementar histórico de versões
  mensagemErro.value = 'Funcionalidade de histórico ainda não implementada'
  mostrarAlertaErro.value = true
}

const handleExcluirRelatorio = (relatorio) => {
  console.log('🗑️ handleExcluirRelatorio chamado!')
  console.log('📋 Relatório a excluir:', relatorio)
  console.log('🔍 Tipo do relatório:', typeof relatorio)
  console.log('🆔 ID do relatório:', relatorio?.id)
  
  relatorioParaExcluir.value = relatorio
  mostrarModalExclusao.value = true
  
  console.log('✅ Modal de exclusão ativado:', mostrarModalExclusao.value)
  console.log('📝 Relatório definido para exclusão:', relatorioParaExcluir.value)
}

const handleAcoesRelatorio = ({ acao, relatorio }) => {
  console.log('Ação selecionada:', acao, 'para relatório:', relatorio)
  
  switch (acao) {
    case 'visualizar':
      handleVisualizarRelatorio(relatorio)
      break
    case 'duplicar':
      handleDuplicarRelatorio(relatorio)
      break
    case 'mover':
      handleMoverRelatorio(relatorio)
      break
    case 'exportar':
      handleExportarRelatorio(relatorio)
      break
    case 'excluir':
      handleExcluirRelatorio(relatorio)
      break
    default:
      console.warn('Ação não reconhecida:', acao)
  }
}

// Handlers para modais dos relatórios
const fecharVisualizadorFile = () => {
  mostrarVisualizadorFile.value = false
  relatorioParaVisualizar.value = null
}

const fecharModalRenomear = () => {
  mostrarModalRenomear.value = false
  relatorioParaDuplicar.value = null
}

const handleRelatorioDuplicado = async (novoRelatorio) => {
  console.log('✅ Relatório duplicado:', novoRelatorio)
  
  fecharModalRenomear()
  mensagemSucesso.value = 'Relatório duplicado com sucesso!'
  mostrarSucessoDocumento.value = true
  
  // Recarregar listas
  try {
    await recarregarPastas(true) // Forçar atualização das quantidades
    
    if (listaRelatoriosClienteRef.value && mostrarRelatoriosCliente.value) {
      await listaRelatoriosClienteRef.value.recarregar()
    }
  } catch (error) {
    console.error('Erro ao recarregar listas:', error)
  }
}

const fecharModalMover = () => {
  mostrarModalMover.value = false
  relatorioParaMover.value = null
}

const handleRelatorioMovido = async (dadosMovimento) => {
  console.log('✅ Relatório movido:', dadosMovimento)
  
  fecharModalMover()
  mensagemSucesso.value = `Relatório movido para "${dadosMovimento.pastaDestinoTitulo}" com sucesso!`
  mostrarSucessoDocumento.value = true
  
  // Recarregar listas
  try {
    await recarregarPastas(true) // Forçar atualização das quantidades
    
    if (listaRelatoriosClienteRef.value && mostrarRelatoriosCliente.value) {
      await listaRelatoriosClienteRef.value.recarregar()
    }
  } catch (error) {
    console.error('Erro ao recarregar listas:', error)
  }
}

const fecharModalExclusao = () => {
  mostrarModalExclusao.value = false
  relatorioParaExcluir.value = null
}

const handleRelatorioExcluido = async () => {
  console.log('✅ Relatório excluído com sucesso')
  
  fecharModalExclusao()
  mensagemSucesso.value = 'Relatório excluído com sucesso!'
  mostrarSucessoDocumento.value = true
  
  // Recarregar listas
  try {
    await recarregarPastas(true) // Forçar atualização das quantidades
    
    if (listaRelatoriosClienteRef.value && mostrarRelatoriosCliente.value) {
      await listaRelatoriosClienteRef.value.recarregar()
    }
  } catch (error) {
    console.error('Erro ao recarregar listas:', error)
  }
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
  
  // DEPOIS: Recarregar as pastas (usar recarga completa para edição de pasta)
  await recarregarPastas(false)
  
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