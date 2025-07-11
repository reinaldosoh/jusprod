import { supabase } from '../lib/supabase.js'

export const webhookService = {
  async chamarWebhook(processoId) {
    try {
      // Obter a sessão do usuário autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar os dados completos do processo no Supabase
      const { data: processo, error: processoError } = await supabase
        .from('processos')
        .select(`
          *,
          clientes (
            cnpj
          )
        `)
        .eq('id', processoId)
        .single()

      if (processoError || !processo) {
        throw new Error('Processo não encontrado')
      }

      // Preparar os dados para enviar ao webhook
      const dadosWebhook = {
        usuario_uuid: session.user.id,
        processo_id: processoId,
        cnpj: processo.cnpj || processo.clientes?.cnpj || null, // CNPJ da tabela processos ou da tabela clientes
        numero_processo: processo.cnpj, // O campo cnpj na tabela processos contém o número do processo
        autor: processo.autor,
        reu: processo.reu,
        tribunal: processo.tribunal,
        area: processo.area,
        classe: processo.classe,
        assunto: processo.assunto,
        orgao_julgador: processo.orgao_julgador,
        valor_causa: processo.valor_causa,
        data_envio: new Date().toISOString()
      }

      // Chamar o webhook N8N
      const response = await fetch('https://n8nwebhook.estruturadeapi.com/webhook/9fcb2606-f74f-4617-8d55-b96751f9cabc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(dadosWebhook)
      })

      if (!response.ok) {
        throw new Error(`Erro na chamada do webhook: ${response.status} ${response.statusText}`)
      }

      // O webhook retorna texto simples, não JSON
      const resultado = await response.text()
      return { success: true, data: resultado }

    } catch (error) {
      console.error('Erro ao chamar webhook:', error)
      throw error
    }
  }
}