import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

const intimacoesNaoVisualizadas = ref(0)
const loading = ref(false)

export function useIntimacoes() {
  /**
   * Busca a contagem de intimações não visualizadas do usuário atual
   */
  const buscarContadorIntimacoes = async () => {
    loading.value = true
    
    try {
      // Obter usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('❌ Erro ao obter usuário autenticado:', authError)
        intimacoesNaoVisualizadas.value = 0
        return
      }

      console.log('📊 Buscando contagem de intimações não visualizadas para usuário:', user.id)

      // Buscar apenas a contagem das intimações não visualizadas
      const { count, error } = await supabase
        .from('intimacoes')
        .select('*', { count: 'exact', head: true })
        .eq('uuid', user.id)
        .eq('visualizado', false)

      if (error) {
        console.error('❌ Erro ao buscar contagem de intimações:', error)
        intimacoesNaoVisualizadas.value = 0
        return
      }

      console.log('✅ Contagem de intimações não visualizadas:', count)
      intimacoesNaoVisualizadas.value = count || 0

    } catch (error) {
      console.error('❌ Erro no buscarContadorIntimacoes:', error)
      intimacoesNaoVisualizadas.value = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * Marca uma intimação como visualizada e atualiza o contador
   * @param {string} intimacaoId - ID da intimação
   */
  const marcarComoVisualizada = async (intimacaoId) => {
    try {
      const { error } = await supabase
        .from('intimacoes')
        .update({ visualizado: true })
        .eq('id', intimacaoId)

      if (error) {
        console.error('❌ Erro ao marcar intimação como visualizada:', error)
        throw error
      }

      // Atualizar contador
      await buscarContadorIntimacoes()
      
      return true
    } catch (error) {
      console.error('❌ Erro ao marcar intimação como visualizada:', error)
      return false
    }
  }

  /**
   * Configura um listener para atualizações em tempo real nas intimações
   */
  const configurarListenerIntimacoes = () => {
    const subscription = supabase
      .channel('intimacoes-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'intimacoes',
          filter: 'visualizado=eq.false'
        }, 
        (payload) => {
          console.log('🔄 Mudança detectada na tabela intimacoes:', payload)
          
          // Atualizar contador quando houver mudanças
          buscarContadorIntimacoes()
        }
      )
      .subscribe()

    return subscription
  }

  /**
   * Força uma atualização do contador
   */
  const atualizarContador = async () => {
    await buscarContadorIntimacoes()
  }

  return {
    // Estados
    intimacoesNaoVisualizadas: computed(() => intimacoesNaoVisualizadas.value),
    loading: computed(() => loading.value),
    
    // Métodos
    buscarContadorIntimacoes,
    marcarComoVisualizada,
    configurarListenerIntimacoes,
    atualizarContador
  }
} 