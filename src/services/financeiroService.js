import { supabase } from '../lib/supabase'

export const financeiroService = {
  // Buscar total de recebíveis
  async getTotalRecebiveis(userId, dataInicio = null, dataFinal = null) {
    try {
      let query = supabase
        .from('recebiveis')
        .select('valor_total')
        .eq('user_id', userId)

      if (dataInicio) {
        query = query.gte('data_lancamento', dataInicio)
      }
      if (dataFinal) {
        query = query.lte('data_lancamento', dataFinal)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar recebíveis:', error)
        return 0
      }

      const total = data.reduce((sum, item) => sum + (item.valor_total || 0), 0)
      return total
    } catch (error) {
      console.error('Erro ao calcular total de recebíveis:', error)
      return 0
    }
  },

  // Buscar total de saídas
  async getTotalSaidas(userId, dataInicio = null, dataFinal = null) {
    try {
      let query = supabase
        .from('saidas')
        .select('valor')
        .eq('user_id', userId)

      if (dataInicio) {
        query = query.gte('data_saida', dataInicio)
      }
      if (dataFinal) {
        query = query.lte('data_saida', dataFinal)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar saídas:', error)
        return 0
      }

      const total = data.reduce((sum, item) => sum + (item.valor || 0), 0)
      return total
    } catch (error) {
      console.error('Erro ao calcular total de saídas:', error)
      return 0
    }
  },

  // Buscar total de outras despesas
  async getTotalOutrasDespesas(userId, dataInicio = null, dataFinal = null) {
    try {
      let query = supabase
        .from('outras_despesas')
        .select('valor')
        .eq('user_id', userId)

      if (dataInicio) {
        query = query.gte('data_saida', dataInicio)
      }
      if (dataFinal) {
        query = query.lte('data_saida', dataFinal)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar outras despesas:', error)
        return 0
      }

      const total = data.reduce((sum, item) => sum + (item.valor || 0), 0)
      return total
    } catch (error) {
      console.error('Erro ao calcular total de outras despesas:', error)
      return 0
    }
  },

  // Buscar todos os totais de uma vez
  async getTotaisFinanceiros(userId, dataInicio = null, dataFinal = null) {
    try {
      const [recebiveis, saidas, outrasDespesas] = await Promise.all([
        this.getTotalRecebiveis(userId, dataInicio, dataFinal),
        this.getTotalSaidas(userId, dataInicio, dataFinal),
        this.getTotalOutrasDespesas(userId, dataInicio, dataFinal)
      ])

      return {
        recebiveis,
        saidas,
        outrasDespesas,
        diferenca: recebiveis - saidas
      }
    } catch (error) {
      console.error('Erro ao buscar totais financeiros:', error)
      return {
        recebiveis: 0,
        saidas: 0,
        outrasDespesas: 0,
        diferenca: 0
      }
    }
  },

  // Buscar dados detalhados de recebíveis
  async getRecebiveis(userId, dataInicio = null, dataFinal = null) {
    try {
      let query = supabase
        .from('recebiveis')
        .select(`
          *,
          clientes (nome_razao),
          processos (numero_processo)
        `)
        .eq('user_id', userId)
        .order('data_lancamento', { ascending: false })

      if (dataInicio) {
        query = query.gte('data_lancamento', dataInicio)
      }
      if (dataFinal) {
        query = query.lte('data_lancamento', dataFinal)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar recebíveis detalhados:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar recebíveis detalhados:', error)
      return []
    }
  },

  // Buscar dados detalhados de saídas
  async getSaidas(userId, dataInicio = null, dataFinal = null) {
    try {
      let query = supabase
        .from('saidas')
        .select('*')
        .eq('user_id', userId)
        .order('data_saida', { ascending: false })

      if (dataInicio) {
        query = query.gte('data_saida', dataInicio)
      }
      if (dataFinal) {
        query = query.lte('data_saida', dataFinal)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar saídas detalhadas:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar saídas detalhadas:', error)
      return []
    }
  },

  // Buscar dados detalhados de outras despesas
  async getOutrasDespesas(userId, dataInicio = null, dataFinal = null) {
    try {
      let query = supabase
        .from('outras_despesas')
        .select(`
          *,
          clientes (nome_razao),
          processos (numero_processo)
        `)
        .eq('user_id', userId)
        .order('data_saida', { ascending: false })

      if (dataInicio) {
        query = query.gte('data_saida', dataInicio)
      }
      if (dataFinal) {
        query = query.lte('data_saida', dataFinal)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar outras despesas detalhadas:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar outras despesas detalhadas:', error)
      return []
    }
  }
}

export default financeiroService 