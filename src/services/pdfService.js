import jsPDF from 'jspdf'

export const pdfService = {
  /**
   * Gera PDF do processo com layout formatado
   * @param {Object} processo - Dados do processo
   * @returns {Promise<void>} Download do PDF
   */
  async gerarPDFProcesso(processo) {
    try {
      // Criar novo documento PDF (A4)
      const pdf = new jsPDF('portrait', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Cores do tema Jusprod
      const cores = {
        azulPrimario: [4, 104, 250], // #0468FA
        azulSecundario: [59, 130, 246], // #3B82F6
        cinzaTexto: [55, 65, 81], // #374151
        cinzaClaro: [243, 244, 246], // #F3F4F6
        branco: [255, 255, 255],
        preto: [0, 0, 0]
      }
      
      // Carregar logotipo
      const logoImg = await this.carregarImagem('/images/logotipo.png')
      
      // Carregar marca d'água
      const marcaAguaImg = await this.carregarImagem('/images/marcadagua.png')
      
      // Adicionar marca d'água (fundo, transparente)
      if (marcaAguaImg) {
        pdf.addImage(marcaAguaImg, 'PNG', 30, 60, pageWidth - 60, pageHeight - 120, undefined, 'NONE', 0.08)
      }
      
      // Header com fundo azul
      pdf.setFillColor(...cores.azulPrimario)
      pdf.rect(0, 0, pageWidth, 45, 'F')
      
      // Adicionar logotipo no header
      if (logoImg) {
        pdf.addImage(logoImg, 'PNG', 15, 12, 45, 20)
      }
      
      // Título no header
      pdf.setTextColor(...cores.branco)
      pdf.setFontSize(22)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RELATÓRIO DE PROCESSO', pageWidth - 15, 28, { align: 'right' })
      
      // Subtítulo no header
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Sistema Jusprod', pageWidth - 15, 36, { align: 'right' })
      
      // Reset cor do texto
      pdf.setTextColor(...cores.preto)
      
      let yPosition = 65
      
      // Card principal com informações do processo
      pdf.setFillColor(...cores.cinzaClaro)
      pdf.setDrawColor(...cores.azulPrimario)
      pdf.setLineWidth(0.5)
      pdf.roundedRect(15, yPosition - 5, pageWidth - 30, 40, 3, 3, 'FD')
      
      // Número do processo (destaque)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...cores.azulPrimario)
      pdf.text(`PROCESSO: ${processo.cnpj || 'Não informado'}`, 20, yPosition + 8)
      
      // Tribunal (canto direito)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...cores.cinzaTexto)
      const tribunal = processo.tribunal || 'Tribunal não informado'
      pdf.text(tribunal, pageWidth - 20, yPosition + 8, { align: 'right' })
      
      // Data de geração
      const dataAtual = new Date().toLocaleDateString('pt-BR')
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Gerado em: ${dataAtual}`, pageWidth - 20, yPosition + 18, { align: 'right' })
      
      yPosition += 55
      
      // Seção das partes
      this.adicionarSecao(pdf, 'PARTES DO PROCESSO', yPosition, cores)
      yPosition += 15
      
      // Autor e Réu em cards
      const partesData = [
        { label: 'AUTOR', valor: processo.autor || 'Não informado', icone: '👤' },
        { label: 'RÉU', valor: processo.reu || 'Não informado', icone: '⚖️' }
      ]
      
      partesData.forEach((parte, index) => {
        this.adicionarCardInfo(pdf, parte.label, parte.valor, 20 + (index * 85), yPosition, 80, cores)
      })
      
      yPosition += 35
      
      // Seção dos detalhes
      this.adicionarSecao(pdf, 'DETALHES PROCESSUAIS', yPosition, cores)
      yPosition += 15
      
      // Detalhes em grid 2x3
      const detalhes = [
        { label: 'ÁREA', valor: processo.area || 'Não informado' },
        { label: 'CLASSE', valor: processo.classe || 'Não informado' },
        { label: 'ASSUNTO', valor: processo.assunto || 'Não informado' },
        { label: 'ÓRGÃO JULGADOR', valor: processo.orgao_julgador || 'Não informado' },
        { label: 'VALOR DA CAUSA', valor: processo.valor_causa || 'Não informado' },
        { label: 'STATUS', valor: processo.arquivado ? 'Não Monitorado' : 'Monitorado' }
      ]
      
      // Grid 2 colunas
      detalhes.forEach((detalhe, index) => {
        const coluna = index % 2
        const linha = Math.floor(index / 2)
        const x = 20 + (coluna * 85)
        const y = yPosition + (linha * 25)
        
        this.adicionarCardInfo(pdf, detalhe.label, detalhe.valor, x, y, 80, cores, 20)
      })
      
      yPosition += (Math.ceil(detalhes.length / 2) * 25) + 20
      
      // Footer decorativo
      const footerY = pageHeight - 25
      pdf.setFillColor(...cores.azulPrimario)
      pdf.rect(0, footerY - 5, pageWidth, 30, 'F')
      
      // Texto do footer
      pdf.setTextColor(...cores.branco)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const dataHora = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`
      pdf.text(`Relatório gerado em: ${dataHora}`, 15, footerY + 5)
      
      pdf.setFont('helvetica', 'bold')
      pdf.text('JUSPROD', pageWidth - 15, footerY + 5, { align: 'right' })
      pdf.setFont('helvetica', 'normal')
      pdf.text('Sistema de Gestão Jurídica', pageWidth - 15, footerY + 12, { align: 'right' })
      
      // Fazer download do PDF
      const nomeArquivo = `processo_${processo.cnpj?.replace(/[^\w]/g, '_') || 'sem_numero'}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(nomeArquivo)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      throw new Error('Erro ao gerar PDF do processo')
    }
  },

  /**
   * Adiciona uma seção com título estilizado
   */
  adicionarSecao(pdf, titulo, y, cores) {
    // Fundo da seção
    pdf.setFillColor(...cores.azulSecundario)
    pdf.rect(15, y - 3, pdf.internal.pageSize.getWidth() - 30, 12, 'F')
    
    // Texto da seção
    pdf.setTextColor(...cores.branco)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text(titulo, 20, y + 5)
    
    // Reset cor
    pdf.setTextColor(...cores.preto)
  },

  /**
   * Adiciona um card de informação estilizado
   */
  adicionarCardInfo(pdf, label, valor, x, y, width, cores, height = 25) {
    // Card com borda
    pdf.setFillColor(...cores.branco)
    pdf.setDrawColor(...cores.cinzaClaro)
    pdf.setLineWidth(0.5)
    pdf.roundedRect(x, y, width, height, 2, 2, 'FD')
    
    // Label
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...cores.azulPrimario)
    pdf.text(label, x + 3, y + 6)
    
    // Valor (com quebra de texto se necessário)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...cores.cinzaTexto)
    
    const textoQuebrado = pdf.splitTextToSize(valor, width - 6)
    const maxLinhas = Math.floor((height - 8) / 4)
    const linhasParaMostrar = textoQuebrado.slice(0, maxLinhas)
    
    linhasParaMostrar.forEach((linha, index) => {
      pdf.text(linha, x + 3, y + 12 + (index * 4))
    })
    
    // Se o texto foi cortado, adicionar "..."
    if (textoQuebrado.length > maxLinhas) {
      pdf.text('...', x + width - 8, y + height - 3)
    }
  },
  
  /**
   * Carrega imagem como base64 para uso no PDF
   * @param {string} src - Caminho da imagem
   * @returns {Promise<string>} Imagem em base64
   */
  carregarImagem(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        // Criar canvas para converter para base64
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.width
        canvas.height = img.height
        
        ctx.drawImage(img, 0, 0)
        
        try {
          const dataURL = canvas.toDataURL('image/png')
          resolve(dataURL)
        } catch (error) {
          console.warn(`Erro ao carregar imagem ${src}:`, error)
          resolve(null)
        }
      }
      
      img.onerror = () => {
        console.warn(`Erro ao carregar imagem ${src}`)
        resolve(null) // Continuar sem a imagem
      }
      
      img.src = src
    })
  },

  /**
   * Gera PDF da intimação com layout formatado
   * @param {Object} intimacao - Dados da intimação
   * @returns {Promise<void>} Download do PDF
   */
  async gerarPDFIntimacao(intimacao) {
    try {
      // Criar novo documento PDF (A4)
      const pdf = new jsPDF('portrait', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Cores do tema Jusprod
      const cores = {
        azulPrimario: [4, 104, 250], // #0468FA
        azulSecundario: [59, 130, 246], // #3B82F6
        cinzaTexto: [55, 65, 81], // #374151
        cinzaClaro: [243, 244, 246], // #F3F4F6
        branco: [255, 255, 255],
        preto: [0, 0, 0],
        vermelhoIntimacao: [239, 68, 68] // #EF4444
      }
      
      // Carregar logotipo
      const logoImg = await this.carregarImagem('/images/logotipo.png')
      
      // Carregar marca d'água
      const marcaAguaImg = await this.carregarImagem('/images/marcadagua.png')
      
      // Adicionar marca d'água (fundo, transparente)
      if (marcaAguaImg) {
        pdf.addImage(marcaAguaImg, 'PNG', 30, 60, pageWidth - 60, pageHeight - 120, undefined, 'NONE', 0.08)
      }
      
      // Header com fundo azul
      pdf.setFillColor(...cores.azulPrimario)
      pdf.rect(0, 0, pageWidth, 45, 'F')
      
      // Adicionar logotipo no header
      if (logoImg) {
        pdf.addImage(logoImg, 'PNG', 15, 12, 45, 20)
      }
      
      // Título no header
      pdf.setTextColor(...cores.branco)
      pdf.setFontSize(22)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RELATÓRIO DE INTIMAÇÃO', pageWidth - 15, 28, { align: 'right' })
      
      // Subtítulo no header
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Sistema Jusprod', pageWidth - 15, 36, { align: 'right' })
      
      // Reset cor do texto
      pdf.setTextColor(...cores.preto)
      
      let yPosition = 65
      
      // Card principal com informações da intimação
      pdf.setFillColor(...cores.cinzaClaro)
      pdf.setDrawColor(...cores.vermelhoIntimacao)
      pdf.setLineWidth(0.5)
      pdf.roundedRect(15, yPosition - 5, pageWidth - 30, 50, 3, 3, 'FD')
      
      // Número CNJ (destaque)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...cores.azulPrimario)
      pdf.text(`CNJ: ${intimacao.cnj || 'Não informado'}`, 20, yPosition + 8)
      
      // Status da intimação (canto direito)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      const statusColor = intimacao.visualizado ? cores.azulPrimario : cores.vermelhoIntimacao
      pdf.setTextColor(...statusColor)
      const status = intimacao.visualizado ? 'VISUALIZADA' : 'NÃO VISUALIZADA'
      pdf.text(status, pageWidth - 20, yPosition + 8, { align: 'right' })
      
      // Tribunal
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...cores.cinzaTexto)
      const tribunal = intimacao.tribunal || 'Tribunal não informado'
      pdf.text(`Tribunal: ${tribunal}`, 20, yPosition + 20)
      
      // Tipo da intimação
      const tipoIntimacao = intimacao.tipo || 'Tipo não informado'
      pdf.text(`Tipo: ${tipoIntimacao}`, 20, yPosition + 30)
      
      // Data da intimação (canto direito)
      const dataIntimacao = intimacao.data ? new Date(intimacao.data).toLocaleDateString('pt-BR') : 'Data não informada'
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Data: ${dataIntimacao}`, pageWidth - 20, yPosition + 20, { align: 'right' })
      
      // Data de geração
      const dataAtual = new Date().toLocaleDateString('pt-BR')
      pdf.text(`Gerado em: ${dataAtual}`, pageWidth - 20, yPosition + 30, { align: 'right' })
      
      yPosition += 65
      
      // Seção das partes
      this.adicionarSecao(pdf, 'PARTES DO PROCESSO', yPosition, cores)
      yPosition += 15
      
      // Autor e Réu em cards
      const partesData = [
        { label: 'AUTOR', valor: intimacao.autor || 'Não informado', icone: '👤' },
        { label: 'RÉU', valor: intimacao.reu || 'Não informado', icone: '⚖️' }
      ]
      
      partesData.forEach((parte, index) => {
        this.adicionarCardInfo(pdf, parte.label, parte.valor, 20 + (index * 85), yPosition, 80, cores)
      })
      
      yPosition += 35
      
      // Seção dos detalhes da intimação
      this.adicionarSecao(pdf, 'DETALHES DA INTIMAÇÃO', yPosition, cores)
      yPosition += 15
      
      // Detalhes em grid
      const detalhes = [
        { label: 'SEÇÃO', valor: intimacao.secao || 'Não informado' },
        { label: 'STATUS', valor: intimacao.visualizado ? 'Visualizada' : 'Não Visualizada' },
        { label: 'DATA CRIAÇÃO', valor: intimacao.created_at ? new Date(intimacao.created_at).toLocaleDateString('pt-BR') : 'Não informado' },
        { label: 'LIDA', valor: intimacao.lido ? 'Sim' : 'Não' }
      ]
      
      // Grid 2 colunas
      detalhes.forEach((detalhe, index) => {
        const coluna = index % 2
        const linha = Math.floor(index / 2)
        const x = 20 + (coluna * 85)
        const y = yPosition + (linha * 25)
        
        this.adicionarCardInfo(pdf, detalhe.label, detalhe.valor, x, y, 80, cores, 20)
      })
      
      yPosition += (Math.ceil(detalhes.length / 2) * 25) + 20
      
      // Seção do snippet (se existir)
      if (intimacao.snippet && intimacao.snippet.trim()) {
        this.adicionarSecao(pdf, 'RESUMO DA INTIMAÇÃO', yPosition, cores)
        yPosition += 15
        
        // Card do snippet
        const snippetHeight = Math.max(30, Math.min(50, Math.ceil(intimacao.snippet.length / 80) * 5))
        pdf.setFillColor(...cores.branco)
        pdf.setDrawColor(...cores.cinzaClaro)
        pdf.setLineWidth(0.5)
        pdf.roundedRect(15, yPosition, pageWidth - 30, snippetHeight, 2, 2, 'FD')
        
        // Texto do snippet
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...cores.cinzaTexto)
        
        const snippetTexto = pdf.splitTextToSize(intimacao.snippet, pageWidth - 40)
        const maxLinhasSnippet = Math.floor((snippetHeight - 8) / 4)
        const linhasSnippet = snippetTexto.slice(0, maxLinhasSnippet)
        
        linhasSnippet.forEach((linha, index) => {
          pdf.text(linha, 20, yPosition + 8 + (index * 4))
        })
        
        if (snippetTexto.length > maxLinhasSnippet) {
          pdf.text('...', pageWidth - 25, yPosition + snippetHeight - 3)
        }
        
        yPosition += snippetHeight + 15
      }
      
      // Seção do conteúdo - SEMPRE MOSTRAR
      console.log('🔍 DEBUG - Verificando conteúdo da intimação:', intimacao.conteudo)
      console.log('🔍 DEBUG - Snippet da intimação:', intimacao.snippet)
      
      // Verificar se há espaço suficiente na página
      const espacoRestante = pageHeight - yPosition - 40 // 40 para footer
      
      // Se não há espaço, criar nova página
      if (espacoRestante < 80) {
        console.log('📄 DEBUG - Criando nova página para o conteúdo')
        pdf.addPage()
        yPosition = 30 // Reset da posição Y na nova página
      }
      
      this.adicionarSecao(pdf, 'CONTEÚDO DA INTIMAÇÃO', yPosition, cores)
      yPosition += 15
      
      // Card do conteúdo - usar todo o espaço disponível
      const espacoDisponivel = pageHeight - yPosition - 40
      const conteudoHeight = Math.max(60, Math.min(espacoDisponivel, 150))
      
      pdf.setFillColor(...cores.branco)
      pdf.setDrawColor(...cores.cinzaClaro)
      pdf.setLineWidth(0.5)
      pdf.roundedRect(15, yPosition, pageWidth - 30, conteudoHeight, 2, 2, 'FD')
      
      // SEMPRE adicionar conteúdo - mesmo que seja só o snippet
      let conteudoParaMostrar = intimacao.conteudo || intimacao.snippet || 'Conteúdo não disponível'
      
      console.log('📄 DEBUG - Conteúdo que será mostrado:', conteudoParaMostrar.substring(0, 200))
      
      // Processar conteúdo de forma SUPER SIMPLES
      const conteudoLimpo = conteudoParaMostrar
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      console.log('📄 DEBUG - Conteúdo limpo:', conteudoLimpo.substring(0, 200))
      
      // Adicionar texto diretamente
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(...cores.cinzaTexto)
      
      const linhas = pdf.splitTextToSize(conteudoLimpo, pageWidth - 50)
      const maxLinhas = Math.floor((conteudoHeight - 10) / 4)
      
      console.log('📄 DEBUG - Número de linhas:', linhas.length, 'Max linhas:', maxLinhas)
      
      for (let i = 0; i < Math.min(linhas.length, maxLinhas); i++) {
        pdf.text(linhas[i], 20, yPosition + 10 + (i * 4))
      }
      
      if (linhas.length > maxLinhas) {
        pdf.text('... (conteúdo continua)', 20, yPosition + 10 + (maxLinhas * 4))
      }
      
      console.log('✅ DEBUG - Conteúdo adicionado ao PDF!')
      
      yPosition += conteudoHeight + 15
      
      // Footer decorativo
      const footerY = pageHeight - 25
      pdf.setFillColor(...cores.azulPrimario)
      pdf.rect(0, footerY - 5, pageWidth, 30, 'F')
      
      // Texto do footer
      pdf.setTextColor(...cores.branco)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const dataHora = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`
      pdf.text(`Relatório gerado em: ${dataHora}`, 15, footerY + 5)
      
      pdf.setFont('helvetica', 'bold')
      pdf.text('JUSPROD', pageWidth - 15, footerY + 5, { align: 'right' })
      pdf.setFont('helvetica', 'normal')
      pdf.text('Sistema de Gestão Jurídica', pageWidth - 15, footerY + 12, { align: 'right' })
      
      // Fazer download do PDF
      const cnj = intimacao.cnj?.replace(/[^\w]/g, '_') || 'sem_cnj'
      const tipoArquivo = intimacao.tipo?.replace(/[^\w]/g, '_') || 'intimacao'
      const data = new Date().toISOString().split('T')[0]
      const nomeArquivo = `intimacao_${cnj}_${tipoArquivo}_${data}.pdf`
      pdf.save(nomeArquivo)
      
    } catch (error) {
      console.error('Erro ao gerar PDF da intimação:', error)
      throw new Error('Erro ao gerar PDF da intimação')
    }
  },

  /**
   * Gera PDF da intimação e retorna como blob para upload (versão otimizada)
   * @param {Object} intimacao - Dados da intimação
   * @returns {Promise<{blob: Blob, nomeArquivo: string}>} PDF como blob e nome do arquivo
   */
  async gerarPDFIntimacaoParaUpload(intimacao) {
    try {
      // Criar novo documento PDF (A4) com compressão
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true // Ativar compressão
      })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Cores do tema Jusprod
      const cores = {
        azulPrimario: [4, 104, 250], // #0468FA
        azulSecundario: [59, 130, 246], // #3B82F6
        cinzaTexto: [55, 65, 81], // #374151
        cinzaClaro: [243, 244, 246], // #F3F4F6
        branco: [255, 255, 255],
        preto: [0, 0, 0],
        vermelhoIntimacao: [239, 68, 68] // #EF4444
      }
      
      // VERSÃO OTIMIZADA - SEM IMAGENS PARA REDUZIR TAMANHO
      console.log('📄 Gerando PDF otimizado sem imagens para reduzir tamanho...')
      
      // Header simples com fundo azul
      pdf.setFillColor(...cores.azulPrimario)
      pdf.rect(0, 0, pageWidth, 35, 'F')
      
      // Título no header (centralizado e menor)
      pdf.setTextColor(...cores.branco)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RELATÓRIO DE INTIMAÇÃO', pageWidth / 2, 18, { align: 'center' })
      
      // Subtítulo no header (centralizado)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Sistema Jusprod', pageWidth / 2, 26, { align: 'center' })
      
      // Reset cor do texto
      pdf.setTextColor(...cores.preto)
      
      let yPosition = 50 // Posição inicial menor devido ao header reduzido
      
      // Card principal com informações da intimação
      pdf.setFillColor(...cores.cinzaClaro)
      pdf.setDrawColor(...cores.vermelhoIntimacao)
      pdf.setLineWidth(0.5)
      pdf.roundedRect(15, yPosition - 5, pageWidth - 30, 50, 3, 3, 'FD')
      
      // Número CNJ (destaque)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...cores.azulPrimario)
      pdf.text(`CNJ: ${intimacao.cnj || 'Não informado'}`, 20, yPosition + 8)
      
      // Status da intimação (canto direito)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      const statusColor = intimacao.visualizado ? cores.azulPrimario : cores.vermelhoIntimacao
      pdf.setTextColor(...statusColor)
      const status = intimacao.visualizado ? 'VISUALIZADA' : 'NÃO VISUALIZADA'
      pdf.text(status, pageWidth - 20, yPosition + 8, { align: 'right' })
      
      // Tribunal
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...cores.cinzaTexto)
      const tribunal = intimacao.tribunal || 'Tribunal não informado'
      pdf.text(`Tribunal: ${tribunal}`, 20, yPosition + 20)
      
      // Tipo da intimação
      const tipoIntimacao = intimacao.tipo || 'Tipo não informado'
      pdf.text(`Tipo: ${tipoIntimacao}`, 20, yPosition + 30)
      
      // Data da intimação (canto direito)
      const dataIntimacao = intimacao.data ? new Date(intimacao.data).toLocaleDateString('pt-BR') : 'Data não informada'
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Data: ${dataIntimacao}`, pageWidth - 20, yPosition + 20, { align: 'right' })
      
      // Data de geração
      const dataAtual = new Date().toLocaleDateString('pt-BR')
      pdf.text(`Gerado em: ${dataAtual}`, pageWidth - 20, yPosition + 30, { align: 'right' })
      
      yPosition += 65
      
      // Seção das partes
      this.adicionarSecao(pdf, 'PARTES DO PROCESSO', yPosition, cores)
      yPosition += 15
      
      // Autor e Réu em cards
      const partesData = [
        { label: 'AUTOR', valor: intimacao.autor || 'Não informado', icone: '👤' },
        { label: 'RÉU', valor: intimacao.reu || 'Não informado', icone: '⚖️' }
      ]
      
      partesData.forEach((parte, index) => {
        this.adicionarCardInfo(pdf, parte.label, parte.valor, 20 + (index * 85), yPosition, 80, cores)
      })
      
      yPosition += 35
      
      // Seção dos detalhes da intimação
      this.adicionarSecao(pdf, 'DETALHES DA INTIMAÇÃO', yPosition, cores)
      yPosition += 15
      
      // Detalhes em grid
      const detalhes = [
        { label: 'SEÇÃO', valor: intimacao.secao || 'Não informado' },
        { label: 'STATUS', valor: intimacao.visualizado ? 'Visualizada' : 'Não Visualizada' },
        { label: 'DATA CRIAÇÃO', valor: intimacao.created_at ? new Date(intimacao.created_at).toLocaleDateString('pt-BR') : 'Não informado' },
        { label: 'TIPO', valor: intimacao.tipo || 'Não informado' }
      ]
      
      // Grid 2 colunas
      detalhes.forEach((detalhe, index) => {
        const coluna = index % 2
        const linha = Math.floor(index / 2)
        const x = 20 + (coluna * 85)
        const y = yPosition + (linha * 25)
        
        this.adicionarCardInfo(pdf, detalhe.label, detalhe.valor, x, y, 80, cores, 20)
      })
      
      yPosition += (Math.ceil(detalhes.length / 2) * 25) + 20
      
      // Seção do snippet (se existir)
      if (intimacao.snippet && intimacao.snippet.trim()) {
        this.adicionarSecao(pdf, 'RESUMO DA INTIMAÇÃO', yPosition, cores)
        yPosition += 15
        
        // Card do snippet
        const snippetHeight = Math.max(30, Math.min(50, Math.ceil(intimacao.snippet.length / 80) * 5))
        pdf.setFillColor(...cores.branco)
        pdf.setDrawColor(...cores.cinzaClaro)
        pdf.setLineWidth(0.5)
        pdf.roundedRect(15, yPosition, pageWidth - 30, snippetHeight, 2, 2, 'FD')
        
        // Texto do snippet
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...cores.cinzaTexto)
        
        const snippetTexto = pdf.splitTextToSize(intimacao.snippet, pageWidth - 40)
        const maxLinhasSnippet = Math.floor((snippetHeight - 8) / 4)
        const linhasSnippet = snippetTexto.slice(0, maxLinhasSnippet)
        
        linhasSnippet.forEach((linha, index) => {
          pdf.text(linha, 20, yPosition + 8 + (index * 4))
        })
        
        if (snippetTexto.length > maxLinhasSnippet) {
          pdf.text('...', pageWidth - 25, yPosition + snippetHeight - 3)
        }
        
        yPosition += snippetHeight + 15
      }
      
      // Seção do conteúdo (se necessário criar nova página)
      const espacoRestante = pageHeight - yPosition - 40
      if (espacoRestante < 80) {
        pdf.addPage()
        yPosition = 30
      }
      
      this.adicionarSecao(pdf, 'CONTEÚDO DA INTIMAÇÃO', yPosition, cores)
      yPosition += 15
      
      // Card do conteúdo
      const espacoDisponivel = pageHeight - yPosition - 40
      const conteudoHeight = Math.max(60, Math.min(espacoDisponivel, 150))
      
      pdf.setFillColor(...cores.branco)
      pdf.setDrawColor(...cores.cinzaClaro)
      pdf.setLineWidth(0.5)
      pdf.roundedRect(15, yPosition, pageWidth - 30, conteudoHeight, 2, 2, 'FD')
      
      // Processar conteúdo (versão otimizada - limitada para reduzir tamanho)
      let conteudoParaMostrar = intimacao.conteudo || intimacao.snippet || 'Conteúdo não disponível'
      const conteudoLimpo = conteudoParaMostrar
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000) // LIMITE DE 2000 caracteres para reduzir tamanho
      
      // Adicionar texto
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(...cores.cinzaTexto)
      
      const linhas = pdf.splitTextToSize(conteudoLimpo, pageWidth - 50)
      const maxLinhas = Math.floor((conteudoHeight - 10) / 4)
      
      for (let i = 0; i < Math.min(linhas.length, maxLinhas); i++) {
        pdf.text(linhas[i], 20, yPosition + 10 + (i * 4))
      }
      
      if (conteudoParaMostrar.length > 2000 || linhas.length > maxLinhas) {
        pdf.text('... (conteúdo truncado para otimização)', 20, yPosition + 10 + (maxLinhas * 4))
      }
      
      yPosition += conteudoHeight + 15
      
      // Footer decorativo
      const footerY = pageHeight - 25
      pdf.setFillColor(...cores.azulPrimario)
      pdf.rect(0, footerY - 5, pageWidth, 30, 'F')
      
      // Texto do footer
      pdf.setTextColor(...cores.branco)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const dataHora = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`
      pdf.text(`Relatório gerado em: ${dataHora}`, 15, footerY + 5)
      
      pdf.setFont('helvetica', 'bold')
      pdf.text('JUSPROD', pageWidth - 15, footerY + 5, { align: 'right' })
      pdf.setFont('helvetica', 'normal')
      pdf.text('Sistema de Gestão Jurídica', pageWidth - 15, footerY + 12, { align: 'right' })
      
      // Gerar nome do arquivo
      const cnj = intimacao.cnj?.replace(/[^\w]/g, '_') || 'sem_cnj'
      const tipoArquivo = intimacao.tipo?.replace(/[^\w]/g, '_') || 'intimacao'
      const data = new Date().toISOString().split('T')[0]
      const nomeArquivo = `intimacao_${cnj}_${tipoArquivo}_${data}.pdf`
      
      // Retornar PDF como blob
      const pdfBlob = pdf.output('blob')
      
      return {
        blob: pdfBlob,
        nomeArquivo: nomeArquivo
      }
      
    } catch (error) {
      console.error('Erro ao gerar PDF da intimação para upload:', error)
      throw new Error('Erro ao gerar PDF da intimação')
    }
  }

} 