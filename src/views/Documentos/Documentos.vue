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

    <!-- Filtro de Documentos -->
    <div class="filtro-documentos-spacing">
      <FiltroDocumentos 
        :titulo-pasta="tituloPastaSelecionada"
        :mostrar-busca="mostrarDocumentosCliente"
        :mostrar-botao-novo="mostrarBotaoNovoDocumento"
        :pasta-id="pastaSelecionada.id"
        @buscar="handleBuscarDocumentos"
        @novo-documento="handleNovoDocumento"
        @documento-criado="handleDocumentoCriado"
        @erro="handleErroDocumento"
        ref="filtroDocumentosRef"
      />
    </div>

    <!-- Lista de Documentos Padrão (apenas quando pasta sistema estiver ativa) -->
    <div v-if="mostrarDocumentosPadrao" class="documentos-padrao-spacing">
      <ListaDocumentoPadrao 
        @visualizar-documento="handleVisualizarDocumentoPadrao"
        @documento-criado="handleDocumentoCriado"
        ref="listaDocumentosPadraoRef"
      />
    </div>

    <!-- Lista de Documentos do Cliente (quando pasta de usuário estiver ativa) -->
    <div v-if="mostrarDocumentosCliente" class="documentos-cliente-spacing">
      <ListaDocumentosCliente 
        :pasta-id="pastaSelecionada.id"
        :termo-busca="termoBuscaDocumentos"
        @acoes-documento="handleAcoesDocumento"
        @visualizar-documento="handleVisualizarDocumentoCliente"
        @duplicar-documento="handleDuplicarDocumento"
        @mover-documento="handleMoverDocumento"
        @enviar-documento="handleEnviarDocumento"
        @exportar-documento="handleExportarDocumento"
        @historico-documento="handleHistoricoDocumento"
        @excluir-documento="handleExcluirDocumento"
        ref="listaDocumentosClienteRef"
      />
    </div>

    <!-- Modal Editar Pasta -->
    <EditarPasta 
      v-if="mostrarModalEditarPasta && pastaParaEditar"
      :pasta-id="pastaParaEditar.pastaId"
      :nome-atual="pastaParaEditar.titulo"
      @close="fecharModalEditarPasta"
      @pasta-editada-sucesso="handlePastaEditadaSucesso"
    />

    <!-- Alerta de Sucesso para Edição -->
    <AlertaSucesso 
      v-if="mostrarSucessoEdicao"
      mensagem="Pasta editada com sucesso!"
      @fechar="fecharSucessoEdicao"
    />

    <!-- Alerta de Sucesso para Documento Criado -->
    <AlertaSucesso 
      v-if="mostrarSucessoDocumento"
      mensagem="Documento salvo com sucesso!"
      @fechar="fecharSucessoDocumento"
    />

    <!-- Editor HTML -->
    <EditorHTML
      :is-visible="mostrarEditor"
      :titulo="documentoParaEditar?.nome || 'Editar documento'"
      :conteudo="documentoParaEditar?.html || ''"
      @fechar="fecharEditor"
      @salvar="salvarDocumento"
      @cancelar="cancelarEdicao"
    />

    <!-- Visualizador de Arquivo -->
    <VisualizadorFile
      :is-visible="mostrarVisualizadorFile"
      :documento="documentoParaVisualizar"
      @fechar="fecharVisualizadorFile"
    />

    <!-- Modal Renomear Arquivo -->
    <RenomearArquivo
      v-if="mostrarModalRenomear && documentoParaDuplicar"
      :documento="documentoParaDuplicar"
      @close="fecharModalRenomear"
      @documento-duplicado="handleDocumentoDuplicado"
    />

    <!-- Alerta de Sucesso para Documento Duplicado -->
    <AlertaSucesso 
      v-if="mostrarSucessoDuplicacao"
      mensagem="Documento duplicado com sucesso!"
      @fechar="fecharSucessoDuplicacao"
    />

    <!-- Modal Mover Arquivo -->
    <MoverArquivoPasta
      v-if="mostrarModalMover && documentoParaMover"
      :documento="documentoParaMover"
      @close="fecharModalMover"
      @documento-movido="handleDocumentoMovido"
    />

    <!-- Alerta de Sucesso para Documento Movido -->
    <AlertaSucesso 
      v-if="mostrarSucessoMover"
      mensagem="Documento movido com sucesso!"
      @fechar="fecharSucessoMover"
    />

    <!-- Modal Confirmar Exclusão -->
    <ConfirmarExclusaoDocumento
      v-if="mostrarModalExclusao && documentoParaExcluir"
      :documento="documentoParaExcluir"
      @cancelar="fecharModalExclusao"
      @excluir="handleDocumentoExcluido"
    />

    <!-- Alerta de Sucesso para Documento Excluído -->
    <AlertaSucesso 
      v-if="mostrarSucessoExclusao"
      mensagem="Documento excluído com sucesso!"
      @fechar="fecharSucessoExclusao"
    />
    
    <!-- Alerta de Erro -->
    <AlertaErro 
      v-if="mostrarAlertaErro"
      :mensagem="mensagemErro"
      @fechar="fecharAlertaErro"
    />
    
    <!-- Debug info -->
    <div v-if="false" style="display: none;">
      <!-- Debug removido -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FiltroPasta from './filtroPasta.vue'
import ListaPastas from './listaPastas.vue'
import FiltroDocumentos from './filtroDocumentos.vue'
import ListaDocumentoPadrao from './listaDocumentoPadrao.vue'
import ListaDocumentosCliente from './listaDocumentosCliente.vue'
import EditarPasta from './editarPasta.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import MenuFixo from '../../components/UI/MenuFixo.vue'
import EditorHTML from './editorHTML.vue'
import VisualizadorFile from './visualizadorFile.vue'
import RenomearArquivo from './renomearArquivo.vue'
import MoverArquivoPasta from './mover_Arquivo_Pasta.vue'
import ConfirmarExclusaoDocumento from '../../components/UI/ConfirmarExclusaoDocumento.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'

const searchTerm = ref('')
const pastaSelecionada = ref({ tipo: 'sistema', id: 'modelos-jusprod', titulo: 'Modelos padrão' })
const listaPastasRef = ref(null)
const listaDocumentosPadraoRef = ref(null)
const listaDocumentosClienteRef = ref(null)
const filtroDocumentosRef = ref(null)
const mostrarModalEditarPasta = ref(false)
const pastaParaEditar = ref(null)
const mostrarSucessoEdicao = ref(false)
const mostrarSucessoDocumento = ref(false)
const tituloPastaSelecionada = ref('Modelos padrão')
const termoBuscaDocumentos = ref('')
const mostrarEditor = ref(false)
const documentoParaEditar = ref(null)
const mostrarVisualizadorFile = ref(false)
const documentoParaVisualizar = ref(null)
const mostrarModalRenomear = ref(false)
const documentoParaDuplicar = ref(null)
const mostrarSucessoDuplicacao = ref(false)
const mostrarModalMover = ref(false)
const documentoParaMover = ref(null)
const mostrarSucessoMover = ref(false)
const mostrarModalExclusao = ref(false)
const documentoParaExcluir = ref(null)
const mostrarSucessoExclusao = ref(false)
const mostrarAlertaErro = ref(false)
const mensagemErro = ref('')

// Computed para mostrar documentos padrão apenas quando pasta sistema estiver ativa
const mostrarDocumentosPadrao = computed(() => {
  return pastaSelecionada.value && pastaSelecionada.value.tipo === 'sistema'
})

// Computed para mostrar documentos de cliente quando pasta de usuário estiver ativa
const mostrarDocumentosCliente = computed(() => {
  return pastaSelecionada.value && pastaSelecionada.value.tipo === 'usuario'
})

// Computed para mostrar botão "Novo documento" apenas para pastas de usuário
const mostrarBotaoNovoDocumento = computed(() => {
  return pastaSelecionada.value && pastaSelecionada.value.tipo === 'usuario'
})

const handleSearch = (term) => {
  searchTerm.value = term
  console.log('Pesquisando por:', term)
}

const handleNovaPasta = () => {
  console.log('Abrindo modal para nova pasta')
  // Aqui você pode implementar a lógica para abrir um modal de nova pasta
}

const handlePastaCriada = () => {
  console.log('Pasta criada, recarregando lista...')
  recarregarPastas()
}

const recarregarPastas = () => {
  if (listaPastasRef.value) {
    listaPastasRef.value.recarregar()
  }
  // Recarregar também a lista de documentos de cliente se estiver ativa
  if (listaDocumentosClienteRef.value && mostrarDocumentosCliente.value) {
    listaDocumentosClienteRef.value.recarregar()
  }
}

const handleEditarPasta = (pastaInfo) => {
  console.log('Abrindo modal para editar pasta:', pastaInfo)
  pastaParaEditar.value = pastaInfo
  mostrarModalEditarPasta.value = true
}

const fecharModalEditarPasta = () => {
  mostrarModalEditarPasta.value = false
  pastaParaEditar.value = null
}

const handlePastaEditadaSucesso = () => {
  mostrarSucessoEdicao.value = true
}

const fecharSucessoEdicao = () => {
  mostrarSucessoEdicao.value = false
  recarregarPastas()
}

const fecharSucessoDocumento = () => {
  mostrarSucessoDocumento.value = false
}

const fecharModalRenomear = () => {
  mostrarModalRenomear.value = false
  documentoParaDuplicar.value = null
}

const handleDocumentoDuplicado = (novoDocumento) => {
  console.log('Documento duplicado:', novoDocumento)
  mostrarSucessoDuplicacao.value = true
  
  // Recarregar lista de documentos
  if (listaDocumentosClienteRef.value) {
    listaDocumentosClienteRef.value.recarregar()
  }
  
  fecharModalRenomear()
}

const fecharSucessoDuplicacao = () => {
  mostrarSucessoDuplicacao.value = false
}

const fecharModalMover = () => {
  mostrarModalMover.value = false
  documentoParaMover.value = null
}

const handleDocumentoMovido = (dadosMovimento) => {
  console.log('Documento movido:', dadosMovimento)
  mostrarSucessoMover.value = true
  
  // Recarregar lista de documentos
  if (listaDocumentosClienteRef.value) {
    listaDocumentosClienteRef.value.recarregar()
  }
  
  // Recarregar lista de pastas para atualizar contadores
  recarregarPastas()
  
  fecharModalMover()
}

const fecharSucessoMover = () => {
  mostrarSucessoMover.value = false
}

const fecharModalExclusao = () => {
  mostrarModalExclusao.value = false
  documentoParaExcluir.value = null
}

const handleDocumentoExcluido = () => {
  console.log('Documento excluído com sucesso')
  mostrarSucessoExclusao.value = true
  
  // Recarregar lista de documentos
  if (listaDocumentosClienteRef.value) {
    listaDocumentosClienteRef.value.recarregar()
  }
  
  // Recarregar lista de pastas para atualizar contadores
  recarregarPastas()
  
  fecharModalExclusao()
}

const fecharSucessoExclusao = () => {
  mostrarSucessoExclusao.value = false
}

const handlePastaSelecionada = (pastaInfo) => {
  pastaSelecionada.value = pastaInfo
  tituloPastaSelecionada.value = pastaInfo.titulo
  // Limpar termo de busca ao trocar de pasta
  termoBuscaDocumentos.value = ''
  // Limpar também o campo de busca no filtro
  if (filtroDocumentosRef.value) {
    filtroDocumentosRef.value.limparBusca()
  }
  console.log('📁 Pasta selecionada:', pastaInfo)
  console.log('🖥️ Mostrar documentos padrão:', mostrarDocumentosPadrao.value)
  console.log('👤 Mostrar documentos cliente:', mostrarDocumentosCliente.value)
  
  // Aqui você pode implementar a lógica para carregar documentos da pasta selecionada
  // Por exemplo, carregar documentos do sistema se for "Modelos Jusprod"
  // ou carregar documentos do usuário filtrados por pasta_id
}

const handleBuscarDocumentos = (termo) => {
  termoBuscaDocumentos.value = termo
  console.log('Buscando documentos:', termo)
  
  // Aqui você pode implementar a lógica para buscar documentos
  // na pasta selecionada usando o termo de busca
}

const handleNovoDocumento = () => {
  console.log('Abrindo modal para novo documento')
  // Aqui você pode implementar a lógica para abrir modal de novo documento
}

const handleErroDocumento = (erro) => {
  console.error('❌ Erro ao criar documento (recebido em Documentos.vue):', erro)
  mensagemErro.value = erro
  mostrarAlertaErro.value = true
}

const fecharAlertaErro = () => {
  mostrarAlertaErro.value = false
  mensagemErro.value = ''
}

const handleAcoesDocumento = ({ acao, documento }) => {
  console.log('Ação:', acao, 'Documento:', documento)
  
  switch (acao) {
    case 'visualizar':
      handleVisualizarDocumentoCliente(documento)
      break
    case 'duplicar':
      handleDuplicarDocumento(documento)
      break
    case 'mover':
      handleMoverDocumento(documento)
      break
    case 'exportar':
      handleExportarDocumento(documento)
      break
    case 'excluir':
      handleExcluirDocumento(documento)
      break
    default:
      console.warn('Ação não reconhecida:', acao)
  }
}

// Handlers específicos para cada ação
const handleVisualizarDocumentoPadrao = (documento) => {
  // Para documentos padrão, apenas logamos - o LeitorHtml.vue já está sendo gerenciado internamente
  console.log('Visualizar documento padrão:', documento)
  // Não fazemos nada aqui, o listaDocumentoPadrao.vue já controla o LeitorHtml.vue
}

const handleVisualizarDocumentoCliente = async (documento) => {
  try {
    console.log('📄 Visualizando documento:', documento)
    console.log('🔍 Tipo isFile:', documento.isFile)
    
    // Se for arquivo carregado (isFile: true), usar visualizador de arquivo
    if (documento.isFile) {
      console.log('📁 Abrindo visualizador de arquivo')
      documentoParaVisualizar.value = documento
      mostrarVisualizadorFile.value = true
    } else {
      // Se for documento HTML (isFile: false), usar editor HTML
      console.log('📝 Abrindo editor HTML')
      
      // Processar o HTML substituindo as variáveis
      const htmlProcessado = await processarVariaveisDocumento(documento)
      
      // Criar documento com HTML processado
      const documentoProcessado = {
        ...documento,
        html: htmlProcessado
      }
      
      documentoParaEditar.value = documentoProcessado
      mostrarEditor.value = true
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar documento:', error)
    // Em caso de erro, tentar abrir com o tipo correto baseado em isFile
    if (documento.isFile) {
      documentoParaVisualizar.value = documento
      mostrarVisualizadorFile.value = true
    } else {
      documentoParaEditar.value = documento
      mostrarEditor.value = true
    }
  }
}

const handleDuplicarDocumento = (documento) => {
  console.log('Duplicar documento:', documento)
  documentoParaDuplicar.value = documento
  mostrarModalRenomear.value = true
}

const handleMoverDocumento = (documento) => {
  console.log('Mover documento:', documento)
  documentoParaMover.value = documento
  mostrarModalMover.value = true
}



const handleExportarDocumento = async (documento) => {
  console.log('Exportar documento:', documento)
  
  try {
    // Dinamicamente importar jsPDF
    const { jsPDF } = await import('jspdf')
    
    // Processar o HTML substituindo as variáveis
    const htmlProcessado = await processarVariaveisDocumento(documento)
    
    // Criar um novo documento PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Carregar o logotipo
    const logoImg = await carregarImagem('/images/logotipo.png')
    
    // Adicionar logotipo no topo do PDF (canto superior direito)
    if (logoImg) {
      pdf.addImage(logoImg, 'PNG', 150, 10, 40, 16) // x, y, width, height
    }
    
    // Criar um elemento temporário para renderizar o HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlProcessado
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
    
    // Usar html2canvas para converter o HTML em imagem
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 600,
      height: tempDiv.scrollHeight
    })
    
    // Remover o elemento temporário
    document.body.removeChild(tempDiv)
    
    // Adicionar título
    pdf.setFontSize(16)
    pdf.setTextColor(4, 104, 250) // #0468FA
    pdf.text(documento.nome, 105, 40, { align: 'center' })
    
    // Converter canvas para imagem
    const imgData = canvas.toDataURL('image/png')
    
    // Calcular dimensões para caber na página
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 40 // margens de 20mm de cada lado
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let yPosition = 50
    
         // Se a imagem for maior que a página, dividir em páginas
     if (imgHeight > pageHeight - 60) {
       const availableHeight = pageHeight - 60 // Altura disponível na primeira página
       const availableHeightNextPages = pageHeight - 30 // Altura disponível nas próximas páginas
       
       let remainingHeight = imgHeight
       let currentY = 0
       let pageCount = 0
       
       while (remainingHeight > 0) {
         const maxHeightThisPage = pageCount === 0 ? availableHeight : availableHeightNextPages
         const heightThisPage = Math.min(remainingHeight, maxHeightThisPage)
         
         if (pageCount > 0) {
           pdf.addPage()
           yPosition = 20
         }
         
         // Calcular qual parte da imagem original mostrar
         const sourceYRatio = currentY / imgHeight
         const sourceHeightRatio = heightThisPage / imgHeight
         
         const sourceY = sourceYRatio * canvas.height
         const sourceHeight = sourceHeightRatio * canvas.height
         
         // Criar um canvas para esta parte da imagem
         const pageCanvas = document.createElement('canvas')
         pageCanvas.width = canvas.width
         pageCanvas.height = sourceHeight
         const pageCtx = pageCanvas.getContext('2d')
         pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)
         
         const pageImgData = pageCanvas.toDataURL('image/png')
         
         pdf.addImage(pageImgData, 'PNG', 20, yPosition, imgWidth, heightThisPage)
         
         currentY += heightThisPage
         remainingHeight -= heightThisPage
         pageCount++
       }
     } else {
       pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight)
     }
    
    // Salvar o PDF
    const nomeArquivo = `${documento.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    pdf.save(nomeArquivo)
    
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    alert('Erro ao exportar documento em PDF. Tente novamente.')
  }
}

// Função para carregar imagem como base64
const carregarImagem = (src) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        console.warn('Erro ao converter imagem:', error)
        resolve(null)
      }
    }
    img.onerror = () => {
      console.warn('Erro ao carregar imagem:', src)
      resolve(null)
    }
    img.src = src
  })
}





const handleExcluirDocumento = (documento) => {
  console.log('Excluir documento:', documento)
  documentoParaExcluir.value = documento
  mostrarModalExclusao.value = true
}

// Handlers do Editor HTML
const fecharEditor = () => {
  mostrarEditor.value = false
  documentoParaEditar.value = null
}

// Handlers do Visualizador de Arquivo
const fecharVisualizadorFile = () => {
  mostrarVisualizadorFile.value = false
  documentoParaVisualizar.value = null
}

const salvarDocumento = async (htmlContent) => {
  try {
    if (!documentoParaEditar.value) return
    
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js')
    
    // Atualizar documento no banco
    const { error } = await supabase
      .from('documentos')
      .update({ html: htmlContent })
      .eq('id', documentoParaEditar.value.id)
    
    if (error) {
      throw error
    }
    
    // Mostrar sucesso
    mostrarSucessoDocumento.value = true
    
    // Recarregar lista de documentos
    if (listaDocumentosClienteRef.value) {
      listaDocumentosClienteRef.value.recarregar()
    }
    
    // Fechar editor
    fecharEditor()
    
  } catch (error) {
    console.error('Erro ao salvar documento:', error)
    // Aqui você pode mostrar um alerta de erro
  }
}

const cancelarEdicao = () => {
  fecharEditor()
}

// Função para processar variáveis do documento
const processarVariaveisDocumento = async (documento) => {
  try {
    console.log('🔄 Processando variáveis do documento...')
    console.log('📋 Cliente ID:', documento.cliente_id)
    
    // Importar supabase e auth store
    const { supabase } = await import('../../lib/supabase.js')
    const { useAuthStore } = await import('../../stores/auth.js')
    const authStore = useAuthStore()
    
    let htmlProcessado = documento.html || ''
    
    // 1. Buscar dados do cliente
    if (documento.cliente_id) {
      console.log('👤 Buscando dados do cliente:', documento.cliente_id)
      
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('nome, nacionalidade, estado_civil, profissao, rg, cpf')
        .eq('id', documento.cliente_id)
        .single()
      
      if (!clienteError && cliente) {
        console.log('✅ Dados do cliente encontrados:', cliente)
        
        // Substituir variáveis do cliente
        htmlProcessado = htmlProcessado.replace(/\[NOME_CLIENTE\]/g, cliente.nome || '')
        htmlProcessado = htmlProcessado.replace(/\[NACIONALIDADE_CLIENTE\]/g, cliente.nacionalidade || '')
        htmlProcessado = htmlProcessado.replace(/\[ESTADO_CIVIL_CLIENTE\]/g, cliente.estado_civil || '')
        htmlProcessado = htmlProcessado.replace(/\[PROFISSÃO_CLIENTE\]/g, cliente.profissao || '')
        htmlProcessado = htmlProcessado.replace(/\[IDENTIDADE_CLIENTE\]/g, cliente.rg || '')
        htmlProcessado = htmlProcessado.replace(/\[CPF\]/g, cliente.cpf || '')
        
        console.log('🔄 Substituições do cliente realizadas!')
      } else {
        console.log('⚠️ Erro ao buscar cliente ou cliente não encontrado:', clienteError)
      }
    } else {
      console.log('⚠️ Documento sem cliente_id - limpando variáveis do cliente')
      
      // Limpar variáveis do cliente quando não há cliente vinculado
      htmlProcessado = htmlProcessado.replace(/\[NOME_CLIENTE\]/g, '[NOME DO CLIENTE]')
      htmlProcessado = htmlProcessado.replace(/\[NACIONALIDADE_CLIENTE\]/g, '[NACIONALIDADE]')
      htmlProcessado = htmlProcessado.replace(/\[ESTADO_CIVIL_CLIENTE\]/g, '[ESTADO CIVIL]')
      htmlProcessado = htmlProcessado.replace(/\[PROFISSÃO_CLIENTE\]/g, '[PROFISSÃO]')
      htmlProcessado = htmlProcessado.replace(/\[IDENTIDADE_CLIENTE\]/g, '[RG]')
      htmlProcessado = htmlProcessado.replace(/\[CPF\]/g, '[CPF]')
    }
    
    // 2. Buscar dados do usuário logado
    const userUuid = authStore.user.value?.id
    if (userUuid) {
      console.log('👨‍💼 Buscando dados do usuário:', userUuid)
      
      // Buscar dados da tabela usuario (corrigindo nomes das colunas)
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuario')
        .select('email, whatsapp, nome, telefone')
        .eq('uuid', userUuid)
        .single()
      
      if (!usuarioError && usuario) {
        console.log('✅ Dados do usuário encontrados:', usuario)
        
        // Substituir variáveis do usuário (apenas colunas que existem)
        htmlProcessado = htmlProcessado.replace(/\[EMAIL_PROFISSIONAL_USUARIO_1\]/g, usuario.email || '[EMAIL]')
        htmlProcessado = htmlProcessado.replace(/\[CELULAR_PROFISSIONAL_USUARIO_1\]/g, usuario.whatsapp || '[CELULAR]')
        htmlProcessado = htmlProcessado.replace(/\[NOME_USUARIO_2\]/g, usuario.nome || '[NOME ADVOGADO]')
        htmlProcessado = htmlProcessado.replace(/\[TEL_FIXO_USUARIO_1\]/g, usuario.telefone || '[TELEFONE]')
        
        // Variáveis que ainda não têm dados (valores padrão)
        htmlProcessado = htmlProcessado.replace(/\[NACIONALIDADE_USUARIO_1\]/g, 'brasileiro(a)')
        htmlProcessado = htmlProcessado.replace(/\[ESTADO_CIVIL_USUARIO_1\]/g, 'advogado(a)')
        htmlProcessado = htmlProcessado.replace(/\[ENDERECO_PROFISSIONAL_USUARIO_1\]/g, '[ENDEREÇO]')
        
        console.log('🔄 Substituições do usuário realizadas!')
      } else {
        console.log('⚠️ Erro ao buscar usuário:', usuarioError)
      }
      
      // Buscar dados da OAB
      const { data: oab, error: oabError } = await supabase
        .from('OAB')
        .select('OAB_num, OAB_uf')
        .eq('uuid', userUuid)
        .single()
      
      if (!oabError && oab) {
        console.log('✅ Dados da OAB encontrados:', oab)
        
        // Substituir variáveis da OAB
        htmlProcessado = htmlProcessado.replace(/\[NR_OAB_USUARIO_1\]/g, oab.OAB_num || '')
        htmlProcessado = htmlProcessado.replace(/\[SP\]/g, oab.OAB_uf || '')
        
        console.log('🔄 Substituições da OAB realizadas!')
      } else {
        console.log('⚠️ Erro ao buscar OAB:', oabError)
      }
    }
    
    // 3. Limpar variáveis que ainda não estão implementadas
    htmlProcessado = htmlProcessado.replace(/\[CEP_PROFISSIONAL_USUARIO_1\]/g, '[CEP]')
    htmlProcessado = htmlProcessado.replace(/\[UF_OAB_USUARIO_2\]/g, '[UF]')
    htmlProcessado = htmlProcessado.replace(/\[NR_OAB_USUARIO_2\]/g, '[OAB Nº]')
    
    console.log('🎯 Processamento de variáveis concluído!')
    
    return htmlProcessado
    
  } catch (error) {
    console.error('❌ Erro no processamento de variáveis:', error)
    return documento.html || ''
  }
}

const handleDocumentoCriado = async (documento) => {
  console.log('📄 Documento criado (recebido em Documentos.vue):', documento)
  
  try {
    // Mostrar mensagem de sucesso
    console.log('✅ Mostrando alerta de sucesso para documento')
    mostrarSucessoDocumento.value = true
    
    // Recarregar lista de pastas para atualizar contadores
    console.log('🔄 Recarregando lista de pastas')
    recarregarPastas()
    
    // Selecionar automaticamente a pasta onde o documento foi criado (opcional)
    if (documento && documento.pasta_id) {
      // Buscar informações da pasta criada
      const { supabase } = await import('../../lib/supabase.js')
      const { data: pasta, error } = await supabase
        .from('pasta_documentos')
        .select('id, titulo')
        .eq('id', documento.pasta_id)
        .single()
      
      if (!error && pasta) {
        // Selecionar a pasta automaticamente
        const pastaInfo = {
          tipo: 'usuario',
          id: pasta.id,
          titulo: pasta.titulo,
          ativa: true
        }
        
        // Aguardar um momento para a lista recarregar
        setTimeout(() => {
          try {
            // Selecionar a pasta na lista
            if (listaPastasRef.value && listaPastasRef.value.selecionarPasta) {
              listaPastasRef.value.selecionarPasta(pasta.id, false)
            }
            // Atualizar estado local
            handlePastaSelecionada(pastaInfo)
          } catch (selectionError) {
            console.warn('Erro ao selecionar pasta automaticamente:', selectionError)
          }
        }, 500)
      } else {
        console.warn('Pasta não encontrada ou erro na busca:', error)
      }
    }
  } catch (error) {
    console.error('Erro no handleDocumentoCriado:', error)
    // Não propagar o erro para não mostrar alerta de erro
    // O documento já foi criado com sucesso, então não deve mostrar erro
  }
}

// Expor função para outros componentes
defineExpose({
  recarregarPastas
})

// Registrar componentes
const componentes = {
  ConfirmarExclusaoDocumento
}
</script>

<style scoped>
.lista-spacing {
  padding-top: 24px;
  width: 100%;
  overflow-x: auto;
}

.filtro-documentos-spacing {
  padding-top: 32px;
}

.documentos-padrao-spacing {
  padding-top: 0;
}

.documentos-cliente-spacing {
  padding-top: 0;
}

/* Garante que o container principal não corte as pastas */
@media (max-width: 768px) {
  .lista-spacing {
    padding-top: 16px;
    overflow-x: visible;
  }
}
</style> 