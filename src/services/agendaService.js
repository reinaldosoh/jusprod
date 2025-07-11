import { supabase } from '../lib/supabase.js';

/**
 * Serviço para gerenciar agenda com integração Supabase
 */
export const agendaService = {
  /**
   * Busca compromissos da agenda com categorias
   * @param {Object} filtros - Filtros de data e período
   * @returns {Promise<Array>} Lista de compromissos
   */
  async buscarCompromissos(filtros = {}) {
    try {
      console.log('🔄 Buscando compromissos da agenda...', filtros);
      
      // Obter usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Erro de autenticação:', authError);
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 Usuário autenticado:', user.id);

      // Construir consulta base
      let query = supabase
        .from('agenda')
        .select(`
          *,
          categoria_agenda (
            id,
            nome,
            cor,
            iconeColorido,
            iconeBranco
          )
        `)
        .eq('uuid', user.id)
        .order('inicio', { ascending: true });

      // Aplicar filtros de data se fornecidos
      if (filtros.dataInicio) {
        query = query.gte('inicio', filtros.dataInicio);
        console.log('📅 Filtro dataInicio aplicado:', filtros.dataInicio);
      }
      
      if (filtros.dataFim) {
        query = query.lte('inicio', filtros.dataFim);
        console.log('📅 Filtro dataFim aplicado:', filtros.dataFim);
      }

      // Executar consulta
      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro na consulta SQL:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Dados brutos retornados do Supabase:', data);
      console.log('✅ Compromissos encontrados:', data?.length || 0);

      // Processar dados para formato esperado pelos componentes
      const compromissosFormatados = (data || []).map(compromisso => {
        console.log('🔄 Processando compromisso:', compromisso.id, compromisso.titulo);
        return {
          id: compromisso.id,
          titulo: compromisso.titulo,
          descricao: compromisso.descricao,
          inicio: compromisso.inicio,
          fim: compromisso.fim,
          cor: compromisso.cor,
          categoria_id: compromisso.categoria_id,
          categoria_nome: compromisso.categoria_agenda?.nome || 'Sem categoria',
          categoria_cor: compromisso.categoria_agenda?.cor || compromisso.cor || '#0468FA',
          categoria_icone: compromisso.categoria_agenda?.iconeColorido,
          categoria_icone_branco: compromisso.categoria_agenda?.iconeBranco,
          nome_cliente: compromisso.nome_cliente,
          processo_cnj: compromisso.processo_cnj,
          processo_id: compromisso.processo_id,
          cliente_id: compromisso.cliente_id,
          link_reuniao: compromisso.link_reuniao,
          endereco: compromisso.endereco,
          dia_inteiro: compromisso.dia_inteiro,
          tipo: compromisso.tipo
        };
      });

      console.log('✅ Compromissos formatados:', compromissosFormatados);
      return compromissosFormatados;

    } catch (error) {
      console.error('❌ Erro no buscarCompromissos:', error);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  },

  /**
   * Busca compromissos de um período específico (semana, mês, ano)
   * @param {Date} dataReferencia - Data de referência
   * @param {string} tipoPeriodo - 'dia', 'semana', 'mes', 'ano'
   * @returns {Promise<Array>} Lista de compromissos do período
   */
  async buscarCompromissosPorPeriodo(dataReferencia, tipoPeriodo = 'semana') {
    try {
      let dataInicio, dataFim;
      const data = new Date(dataReferencia);

      switch (tipoPeriodo) {
        case 'dia':
          dataInicio = new Date(data);
          dataInicio.setHours(0, 0, 0, 0);
          dataFim = new Date(data);
          dataFim.setHours(23, 59, 59, 999);
          break;

        case 'semana':
          // Início da semana (segunda-feira)
          const diaSemana = data.getDay();
          const diasParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
          dataInicio = new Date(data);
          dataInicio.setDate(data.getDate() + diasParaSegunda);
          dataInicio.setHours(0, 0, 0, 0);
          
          // Fim da semana (domingo)
          dataFim = new Date(dataInicio);
          dataFim.setDate(dataInicio.getDate() + 6);
          dataFim.setHours(23, 59, 59, 999);
          break;

        case 'mes':
        case 'mês':
          dataInicio = new Date(data.getFullYear(), data.getMonth(), 1);
          dataFim = new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59, 999);
          break;

        case 'ano':
          dataInicio = new Date(data.getFullYear(), 0, 1);
          dataFim = new Date(data.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;

        default:
          throw new Error(`Tipo de período inválido: ${tipoPeriodo}`);
      }

      console.log(`📅 Buscando compromissos para ${tipoPeriodo}:`, {
        dataReferencia: data.toISOString(),
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString()
      });

      return await this.buscarCompromissos({
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString()
      });

    } catch (error) {
      console.error('Erro no buscarCompromissosPorPeriodo:', error);
      throw error;
    }
  },

  /**
   * Busca categorias de agenda disponíveis
   * @returns {Promise<Array>} Lista de categorias
   */
  async buscarCategorias() {
    try {
      const { data, error } = await supabase
        .from('categoria_agenda')
        .select('*')
        .order('nome');

      if (error) {
        console.error('❌ Erro ao buscar categorias:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Erro no buscarCategorias:', error);
      throw error;
    }
  },

  /**
   * Determina a cor de prioridade para um dia com múltiplos compromissos
   * @param {Array} compromissos - Lista de compromissos do dia
   * @returns {string|null} Cor da categoria de maior prioridade ou null se não há compromissos
   */
  determinarCorPrioridade(compromissos) {
    if (!compromissos || compromissos.length === 0) return null;

    // Sistema de prioridades baseado na categoria_id:
    // 1 = Prazo fatal (#6606A5) - prioridade máxima
    // 2 = Audiência (#F04438) - prioridade média  
    // Outras = (#0468FA) - prioridade baixa

    const temCategoria1 = compromissos.some(c => c.categoria_id === 1);
    const temCategoria2 = compromissos.some(c => c.categoria_id === 2);

    if (temCategoria1) return '#6606A5'; // Prazo fatal
    if (temCategoria2) return '#F04438'; // Audiência
    return '#0468FA'; // Outras categorias
  },

  /**
   * Agrupa compromissos por data
   * @param {Array} compromissos - Lista de compromissos
   * @returns {Object} Objeto com datas como chaves e arrays de compromissos como valores
   */
  agruparCompromissosPorData(compromissos) {
    const agrupados = {};
    
    compromissos.forEach(compromisso => {
      const data = new Date(compromisso.inicio).toISOString().split('T')[0];
      if (!agrupados[data]) {
        agrupados[data] = [];
      }
      agrupados[data].push(compromisso);
    });

    return agrupados;
  },

  /**
   * Verifica se um compromisso está ativo (não foi deletado)
   * @param {number} compromissoId - ID do compromisso
   * @returns {Promise<boolean>} True se compromisso existe e está ativo
   */
  async verificarCompromissoAtivo(compromissoId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('agenda')
        .select('id')
        .eq('id', compromissoId)
        .eq('uuid', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;

    } catch (error) {
      console.error('Erro no verificarCompromissoAtivo:', error);
      return false;
    }
  }
}; 