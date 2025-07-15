import { supabase } from '../lib/supabase.js'

/**
 * Serviço para gerenciar alertas automáticos
 */
export const alertaService = {
  /**
   * Criar alerta para compromisso na agenda
   * @param {Object} agendaData - Dados do registro da agenda
   * @param {Object} userData - Dados do usuário
   * @param {Object} categoriaData - Dados da categoria
   */
  async criarAlertaAgenda(agendaData, userData, categoriaData) {
    try {
      console.log('📅 Criando alerta para agenda:', agendaData.id)
      
      // Calcular data de notificação (1 dia antes do compromisso)
      const dataCompromisso = new Date(agendaData.inicio)
      const dataNotificacao = new Date(dataCompromisso)
      dataNotificacao.setDate(dataNotificacao.getDate() - 1)
      
      // Preparar dados do alerta
      const dadosAlerta = {
        titulo: agendaData.titulo,
        cliente_nome: agendaData.nome_cliente,
        processo_cnj: agendaData.processo_cnj,
        data_notificacao: dataNotificacao.toISOString().split('T')[0], // Format: YYYY-MM-DD
        notificado: false,
        visualizado: false,
        uuid: userData.uuid || userData.id,
        categoria_titulo: categoriaData?.nome || 'Sem categoria',
        mensagem: this.gerarMensagemAgenda(agendaData, categoriaData),
        agenda_id: agendaData.id,
        recebiveis_id: null,
        categoria_id: agendaData.categoria_id
      }
      
      // Inserir alerta no banco
      const { data: alertaData, error: alertaError } = await supabase
        .from('alerta')
        .insert([dadosAlerta])
        .select()
        .single()
      
      if (alertaError) throw alertaError
      
      console.log('✅ Alerta criado para agenda:', alertaData.id)
      return alertaData
      
    } catch (error) {
      console.error('❌ Erro ao criar alerta para agenda:', error)
      throw error
    }
  },

  /**
   * Criar alerta para recebível
   * @param {Object} recebivelData - Dados do registro do recebível
   * @param {Object} userData - Dados do usuário
   * @param {Object} clienteData - Dados do cliente (opcional)
   * @param {Object} processoData - Dados do processo (opcional)
   */
  async criarAlertaRecebivel(recebivelData, userData, clienteData = null, processoData = null) {
    try {
      console.log('💰 Criando alerta para recebível:', recebivelData.id)
      
      // Calcular data de notificação (1 dia antes do vencimento)
      const dataVencimento = new Date(recebivelData.data_lancamento)
      const dataNotificacao = new Date(dataVencimento)
      dataNotificacao.setDate(dataNotificacao.getDate() - 1)
      
      // Preparar dados do alerta
      const dadosAlerta = {
        titulo: `Recebível: ${recebivelData.descricao}`,
        cliente_nome: clienteData?.nome || clienteData?.nome_razao_social || 'Cliente não informado',
        processo_cnj: processoData?.cnpj || processoData?.cnj || null,
        data_notificacao: dataNotificacao.toISOString().split('T')[0], // Format: YYYY-MM-DD
        notificado: false,
        visualizado: false,
        uuid: userData.uuid || userData.id,
        categoria_titulo: 'Financeiro',
        mensagem: this.gerarMensagemRecebivel(recebivelData, clienteData, processoData),
        agenda_id: null,
        recebiveis_id: recebivelData.id,
        categoria_id: null
      }
      
      // Inserir alerta no banco
      const { data: alertaData, error: alertaError } = await supabase
        .from('alerta')
        .insert([dadosAlerta])
        .select()
        .single()
      
      if (alertaError) throw alertaError
      
      console.log('✅ Alerta criado para recebível:', alertaData.id)
      return alertaData
      
    } catch (error) {
      console.error('❌ Erro ao criar alerta para recebível:', error)
      throw error
    }
  },

  /**
   * Criar alertas para parcelas de recebível
   * @param {Object} recebivelData - Dados do recebível principal
   * @param {Array} parcelas - Array de parcelas
   * @param {Object} userData - Dados do usuário
   * @param {Object} clienteData - Dados do cliente (opcional)
   * @param {Object} processoData - Dados do processo (opcional)
   */
  async criarAlertasParcelas(recebivelData, parcelas, userData, clienteData = null, processoData = null) {
    try {
      console.log('💰 Criando alertas para parcelas do recebível:', recebivelData.id)
      
      const alertasParcelas = []
      
      for (const parcela of parcelas) {
        // Calcular data de notificação (1 dia antes do vencimento da parcela)
        const dataVencimento = new Date(parcela.data_vencimento)
        const dataNotificacao = new Date(dataVencimento)
        dataNotificacao.setDate(dataNotificacao.getDate() - 1)
        
        // Preparar dados do alerta da parcela
        const dadosAlerta = {
          titulo: `Parcela ${parcela.numero_parcela}/${parcelas.length}: ${recebivelData.descricao}`,
          cliente_nome: clienteData?.nome || clienteData?.nome_razao_social || 'Cliente não informado',
          processo_cnj: processoData?.cnpj || processoData?.cnj || null,
          data_notificacao: dataNotificacao.toISOString().split('T')[0], // Format: YYYY-MM-DD
          notificado: false,
          visualizado: false,
          uuid: userData.uuid || userData.id,
          categoria_titulo: 'Financeiro',
          mensagem: this.gerarMensagemParcela(recebivelData, parcela, clienteData, processoData),
          agenda_id: null,
          recebiveis_id: recebivelData.id,
          categoria_id: null
        }
        
        alertasParcelas.push(dadosAlerta)
      }
      
      // Inserir todos os alertas das parcelas
      const { data: alertasData, error: alertasError } = await supabase
        .from('alerta')
        .insert(alertasParcelas)
        .select()
      
      if (alertasError) throw alertasError
      
      console.log(`✅ ${alertasData.length} alertas criados para parcelas do recebível`)
      return alertasData
      
    } catch (error) {
      console.error('❌ Erro ao criar alertas para parcelas:', error)
      throw error
    }
  },

  /**
   * Gerar mensagem personalizada para alerta de agenda
   * @param {Object} agendaData - Dados da agenda
   * @param {Object} categoriaData - Dados da categoria
   * @returns {string} Mensagem formatada
   */
  gerarMensagemAgenda(agendaData, categoriaData) {
    const dataCompromisso = new Date(agendaData.inicio)
    const dataFormatada = dataCompromisso.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const horaFormatada = dataCompromisso.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    
    let mensagem = `📅 Lembrete de compromisso para amanhã!\n\n`
    mensagem += `📋 Título: ${agendaData.titulo}\n`
    mensagem += `🗓️ Data: ${dataFormatada}\n`
    mensagem += `⏰ Horário: ${horaFormatada}\n`
    
    if (categoriaData?.nome) {
      mensagem += `📂 Categoria: ${categoriaData.nome}\n`
    }
    
    if (agendaData.nome_cliente) {
      mensagem += `👤 Cliente: ${agendaData.nome_cliente}\n`
    }
    
    if (agendaData.processo_cnj) {
      mensagem += `⚖️ Processo: ${agendaData.processo_cnj}\n`
    }
    
    if (agendaData.endereco) {
      mensagem += `📍 Local: ${agendaData.endereco}\n`
    }
    
    if (agendaData.link_reuniao) {
      mensagem += `🔗 Link: ${agendaData.link_reuniao}\n`
    }
    
    if (agendaData.descricao) {
      mensagem += `📝 Notas: ${agendaData.descricao}\n`
    }
    
    return mensagem
  },

  /**
   * Gerar mensagem personalizada para alerta de recebível
   * @param {Object} recebivelData - Dados do recebível
   * @param {Object} clienteData - Dados do cliente
   * @param {Object} processoData - Dados do processo
   * @returns {string} Mensagem formatada
   */
  gerarMensagemRecebivel(recebivelData, clienteData, processoData) {
    const dataVencimento = new Date(recebivelData.data_lancamento)
    const dataFormatada = dataVencimento.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(recebivelData.valor_total)
    
    let mensagem = `💰 Lembrete de recebível para amanhã!\n\n`
    mensagem += `📋 Descrição: ${recebivelData.descricao}\n`
    mensagem += `💵 Valor: ${valorFormatado}\n`
    mensagem += `🗓️ Data de vencimento: ${dataFormatada}\n`
    
    if (clienteData?.nome || clienteData?.nome_razao_social) {
      mensagem += `👤 Cliente: ${clienteData.nome || clienteData.nome_razao_social}\n`
    }
    
    if (processoData?.cnpj || processoData?.cnj) {
      mensagem += `⚖️ Processo: ${processoData.cnpj || processoData.cnj}\n`
    }
    
    if (recebivelData.quantidade_parcelas > 1) {
      mensagem += `📊 Parcelamento: ${recebivelData.quantidade_parcelas} parcelas\n`
    }
    
    return mensagem
  },

  /**
   * Gerar mensagem personalizada para alerta de parcela
   * @param {Object} recebivelData - Dados do recebível
   * @param {Object} parcela - Dados da parcela
   * @param {Object} clienteData - Dados do cliente
   * @param {Object} processoData - Dados do processo
   * @returns {string} Mensagem formatada
   */
  gerarMensagemParcela(recebivelData, parcela, clienteData, processoData) {
    const dataVencimento = new Date(parcela.data_vencimento)
    const dataFormatada = dataVencimento.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parcela.valor_parcela)
    
    let mensagem = `💰 Lembrete de parcela para amanhã!\n\n`
    mensagem += `📋 Descrição: ${recebivelData.descricao}\n`
    mensagem += `📊 Parcela: ${parcela.numero_parcela} de ${recebivelData.quantidade_parcelas}\n`
    mensagem += `💵 Valor da parcela: ${valorFormatado}\n`
    mensagem += `🗓️ Data de vencimento: ${dataFormatada}\n`
    
    if (clienteData?.nome || clienteData?.nome_razao_social) {
      mensagem += `👤 Cliente: ${clienteData.nome || clienteData.nome_razao_social}\n`
    }
    
    if (processoData?.cnpj || processoData?.cnj) {
      mensagem += `⚖️ Processo: ${processoData.cnpj || processoData.cnj}\n`
    }
    
    return mensagem
  }
} 