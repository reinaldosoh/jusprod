import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const alertasNaoVisualizados = ref(0)

export function useAlertas() {
  const buscarContadorAlertas = async () => {
    try {
      console.log('🔍 Buscando contador de alertas não visualizados...')
      
      // Obter usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('❌ Erro ao obter usuário autenticado:', authError)
        alertasNaoVisualizados.value = 0
        return
      }

      // Buscar alertas não visualizados do usuário
      const { count, error } = await supabase
        .from('alerta')
        .select('*', { count: 'exact', head: true })
        .eq('uuid', user.id)
        .eq('visualizado', false)

      if (error) {
        console.error('❌ Erro ao buscar alertas:', error)
        alertasNaoVisualizados.value = 0
        return
      }

      alertasNaoVisualizados.value = count || 0
      console.log('✅ Contador de alertas atualizado:', count)
      
    } catch (error) {
      console.error('❌ Erro ao buscar contador de alertas:', error)
      alertasNaoVisualizados.value = 0
    }
  }

  const configurarListenerAlertas = () => {
    try {
      console.log('🔄 Configurando listener para alertas...')
      
      const subscription = supabase
        .channel('alertas-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'alerta'
        }, (payload) => {
          console.log('📡 Mudança detectada na tabela alerta:', payload)
          
          // Recarregar contador quando houver mudanças
          buscarContadorAlertas()
        })
        .subscribe()

      console.log('✅ Listener de alertas configurado')
      return subscription
      
    } catch (error) {
      console.error('❌ Erro ao configurar listener de alertas:', error)
      return null
    }
  }

  const removerListenerAlertas = (subscription) => {
    try {
      if (subscription) {
        console.log('🔄 Removendo listener de alertas...')
        supabase.removeChannel(subscription)
        console.log('✅ Listener de alertas removido')
      }
    } catch (error) {
      console.error('❌ Erro ao remover listener de alertas:', error)
    }
  }

  // Função para marcar alerta como visualizado
  const marcarAlertaComoVisualizado = async (alertaId) => {
    try {
      const { error } = await supabase
        .from('alerta')
        .update({ visualizado: true })
        .eq('id', alertaId)

      if (error) {
        console.error('❌ Erro ao marcar alerta como visualizado:', error)
        return false
      }

      // Atualizar contador
      await buscarContadorAlertas()
      return true
      
    } catch (error) {
      console.error('❌ Erro ao marcar alerta como visualizado:', error)
      return false
    }
  }

  return {
    alertasNaoVisualizados: computed(() => alertasNaoVisualizados.value),
    buscarContadorAlertas,
    configurarListenerAlertas,
    removerListenerAlertas,
    marcarAlertaComoVisualizado
  }
} 