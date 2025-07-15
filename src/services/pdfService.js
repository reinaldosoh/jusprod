import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '@/lib/supabase'

export default {
  async gerarRelatorioPDF(dados) {
    try {
      console.log('📄 Iniciando geração do relatório PDF...', dados)
      
      // Buscar dados completos do banco
      const dadosCompletos = await this.buscarDadosCompletos(dados)
      
      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Gerar conteúdo do PDF
      await this.criarConteudoPDF(pdf, dadosCompletos)
      
      // Fazer download
      const nomeArquivo = `Relatorio_Despesas_Ativas_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(nomeArquivo)
      
      console.log('✅ PDF gerado com sucesso!')
      return { success: true, arquivo: nomeArquivo }
      
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error)
      throw error
    }
  },

  async buscarDadosCompletos(dados) {
    try {
      // Buscar dados do usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado')
      }

      console.log('🔍 Buscando dados completos para o usuário:', user.id)

      // Buscar dados do usuário
      const { data: usuario, error: userError } = await supabase
        .from('usuario')
        .select('*')
        .eq('uuid', user.id)
        .single()

      // Buscar dados do escritório
      const { data: escritorio, error: officeError } = await supabase
        .from('escritorio')
        .select('*')
        .eq('uuid', user.id)
        .single()

      // Buscar dados do cliente selecionado
      const cliente = await this.buscarDadosCliente(dados.clienteSelecionado?.id)

      // Buscar processos detalhados com informações completas
      const processosDetalhados = await this.buscarProcessosDetalhados(dados.processosParaRelatorio, user.id)

      return {
        ...dados,
        usuario: usuario || { nome: 'Usuário não encontrado', email: user.email },
        escritorio: escritorio || { nome_escritorio: 'Escritório não cadastrado' },
        cliente: cliente,
        processosDetalhados
      }
    } catch (error) {
      console.error('Erro ao buscar dados completos:', error)
      throw error
    }
  },

  async buscarDadosCliente(clienteId) {
    if (!clienteId) return null
    
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single()

      if (error) {
        console.warn('Erro ao buscar cliente:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error)
      return null
    }
  },

  async buscarProcessosDetalhados(processos, userId) {
    try {
      const processosDetalhados = []
      
      for (const processo of processos) {
        if (processo.id && processo.id !== 'todos') {
          // Buscar dados completos do processo
          const { data: processoDb, error } = await supabase
            .from('processos')
            .select('*')
            .eq('id', processo.id)
            .eq('uuid', userId)
            .single()
          
          if (error) {
            console.warn('Erro ao buscar processo:', error)
            processosDetalhados.push(processo)
            continue
          }

          // Buscar último andamento
          const { data: ultimoAndamento } = await supabase
            .from('intimacoes')
            .select('data_intimacao, assunto, conteudo')
            .eq('processo_id', processo.id)
            .eq('uuid', userId)
            .order('data_intimacao', { ascending: false })
            .limit(1)
            .single()
          
          processosDetalhados.push({
            ...processo,
            ...processoDb,
            ultimoAndamento: ultimoAndamento || null
          })
        } else {
          processosDetalhados.push(processo)
        }
      }
      
      return processosDetalhados
    } catch (error) {
      console.error('Erro ao buscar processos detalhados:', error)
      return processos
    }
  },

  async criarConteudoPDF(pdf, dados) {
    const pageWidth = pdf.internal.pageSize.width
    const pageHeight = pdf.internal.pageSize.height
    
    let yPosition = 20
    
    // 1. LOGO E TÍTULO
    yPosition = this.criarCabecalho(pdf, yPosition, pageWidth, dados)
    
    // 2. INFORMAÇÕES GERAIS
    yPosition = this.criarInformacoes(pdf, yPosition, pageWidth, dados)
    
    // 3. TABELA PRINCIPAL
    yPosition = this.criarTabelaPrincipal(pdf, yPosition, pageWidth, dados)
    
    // 4. SEÇÃO DE PROGNÓSTICO
    yPosition = this.criarPrognostico(pdf, yPosition, pageWidth, dados)
    
    // 5. RODAPÉ
    this.criarRodape(pdf, pageHeight, pageWidth, dados)
  },

  criarCabecalho(pdf, y, pageWidth, dados) {
    // Logo Jusprod no topo esquerdo
    pdf.setFontSize(24)
    pdf.setTextColor(70, 130, 180)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Jusprod', 20, y)
    
    // Retângulo azul pequeno ao lado do logo
    pdf.setFillColor(70, 130, 180)
    pdf.rect(16, y - 6, 4, 8, 'F')
    
    y += 25
    
    // Título principal
    pdf.setFontSize(14)
    pdf.setTextColor(54, 117, 196)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Relatório de andamento processual tributário auditoria - Demandas ativas', 20, y)
    
    return y + 15
  },

  criarInformacoes(pdf, y, pageWidth, dados) {
    // Título "Todos os processos"
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Todos os processos', 20, y)
    
    y += 10
    
    // Cliente
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Cliente: ', 20, y)
    pdf.setFont('helvetica', 'bold')
    pdf.text(dados.cliente?.nome || 'Kirchner panquecas', 37, y)
    
    y += 8
    
    // Período
    pdf.setFont('helvetica', 'normal')
    pdf.text('Período: ', 20, y)
    pdf.setFont('helvetica', 'bold')
    const hoje = new Date()
    const periodoInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const periodoFim = hoje
    pdf.text(`${periodoInicio.toLocaleDateString('pt-BR')} até ${periodoFim.toLocaleDateString('pt-BR')}`, 44, y)
    
    return y + 15
  },

  criarTabelaPrincipal(pdf, y, pageWidth, dados) {
    // Dados da tabela baseados na referência
    const cabecalho = [
      'Escritório responsável',
      'Número do processo',
      'Vara/Comarca',
      'Natureza/Objeto da causa',
      'RÉ (U)',
      'Valor envolvido'
    ]
    
    const linhas = []
    
    // Processar dados reais ou usar dados de exemplo
    if (dados.processosDetalhados && dados.processosDetalhados.length > 0) {
      dados.processosDetalhados.forEach(processo => {
        linhas.push([
          dados.escritorio?.nome_escritorio || 'Paio Neto e Moraes Paul - Advogados',
          processo.cnpj || processo.numeroProcesso || '334567000 189981821234',
          processo.vara || 'Vara/comarca',
          processo.natureza || 'Natureza',
          processo.reu || 'Coca-Cola',
          processo.valor_causa ? 
            `R$ ${processo.valor_causa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
            'R$ 457.124,00'
        ])
      })
    } else {
      // Dados de exemplo baseados na referência
      linhas.push([
        dados.escritorio?.nome_escritorio || 'Paio Neto e Moraes Paul - Advogados',
        '334567000 189981821234',
        'Vara/comarca',
        'Natureza',
        'Coca-Cola',
        'R$ 457.124,00'
      ])
    }
    
    // Criar tabela
    autoTable(pdf, {
      startY: y,
      head: [cabecalho],
      body: linhas,
      theme: 'grid',
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 }
      },
      margin: { left: 20, right: 20 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.5
    })
    
    return pdf.lastAutoTable.finalY + 20
  },

  criarPrognostico(pdf, y, pageWidth, dados) {
    // Verificar se há dados de prognóstico
    let prognosticoData = { provavel: 'R$ 100.000,00', possivel: 'R$ 150.000,00', remota: 'R$ 170.000,00', total: 'R$ 0,00' }
    
    if (dados.processosDetalhados && dados.processosDetalhados.length > 0) {
      const processo = dados.processosDetalhados[0]
      if (processo.prognostico) {
        prognosticoData = processo.prognostico
      }
    }
    
    // Criar tabela de prognóstico
    const linhas = [
      ['Provável', prognosticoData.provavel || 'R$ 100.000,00'],
      ['Possível', prognosticoData.possivel || 'R$ 150.000,00'],
      ['Remota', prognosticoData.remota || 'R$ 170.000,00'],
      ['Total', prognosticoData.total || 'R$ 0,00']
    ]
    
    autoTable(pdf, {
      startY: y,
      body: linhas,
      theme: 'grid',
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { 
          cellWidth: 40, 
          fillColor: [245, 245, 245], 
          fontStyle: 'bold' 
        },
        1: { cellWidth: 40 }
      },
      margin: { left: 20, right: 20 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.5
    })
    
    return pdf.lastAutoTable.finalY + 20
  },

  criarRodape(pdf, pageHeight, pageWidth, dados) {
    const y = pageHeight - 50
    
    // Primeira linha do rodapé
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    
    // Observação com PIX
    pdf.text('Observação: ', 20, y)
    pdf.setFont('helvetica', 'bold')
    pdf.text('PIX: 12.345.567/0001/23', 45, y)
    
    // Segunda linha - Emitido por
    pdf.setFont('helvetica', 'normal')
    pdf.text('Emitido por: ', 20, y + 8)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${dados.usuario?.nome || 'Vini Paio Neto'} - OAB 230123SP`, 48, y + 8)
    
    // Terceira linha - Elaborado em
    pdf.setFont('helvetica', 'normal')
    pdf.text('Elaborado em: ', 20, y + 16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('jusprod.com.br', 55, y + 16)
    
    // Quarta linha - Data emissão
    pdf.setFont('helvetica', 'normal')
    pdf.text('Data emissão: ', 20, y + 24)
    pdf.setFont('helvetica', 'bold')
    pdf.text(new Date().toLocaleDateString('pt-BR'), 55, y + 24)
    
    // Quinta linha - Páginas
    pdf.setFont('helvetica', 'normal')
    pdf.text('Páginas: ', 20, y + 32)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${pdf.internal.getNumberOfPages()} de ${pdf.internal.getNumberOfPages()}`, 40, y + 32)
    
    // Logo Jusprod no canto direito
    pdf.setFontSize(12)
    pdf.setTextColor(70, 130, 180)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Jusprod', pageWidth - 35, y + 20)
    
    // Retângulo azul pequeno ao lado do logo
    pdf.setFillColor(70, 130, 180)
    pdf.rect(pageWidth - 39, y + 16, 3, 6, 'F')
  }
} 