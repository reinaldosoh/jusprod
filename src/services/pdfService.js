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
  }
} 