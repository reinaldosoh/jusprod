import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

// Estado global para evitar múltiplas instâncias
const intimacoesNaoVisualizadas = ref(0)
const loading = ref(false)
let subscription = null
let isConfigured = false

// Garantir que o valor inicial seja sempre 0
if (intimacoesNaoVisualizadas.value === undefined || intimacoesNaoVisualizadas.value === null) {
  intimacoesNaoVisualizadas.value = 0
  console.log('📊 useIntimacoes: Valor inicial definido como 0')
}

export function useIntimacoes() {
  /**
   * Busca a contagem de intimações não visualizadas do usuário atual
   */
  const buscarContadorIntimacoes = async () => {
    try {
      loading.value = true
      console.log('📊 useIntimacoes: Iniciando busca de contagem de intimações não visualizadas...')
      
      // Obter usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('❌ useIntimacoes: Erro de autenticação:', authError)
        intimacoesNaoVisualizadas.value = 0
        return
      }
      
      if (!user) {
        console.log('⚠️ useIntimacoes: Usuário não autenticado, definindo contador como 0')
        intimacoesNaoVisualizadas.value = 0
        return
      }

      console.log('📊 useIntimacoes: Buscando contagem para usuário:', user.id)

      // Contar intimações não visualizadas
      const { count, error } = await supabase
        .from('intimacoes')
        .select('*', { count: 'exact', head: true })
        .eq('uuid', user.id)
        .eq('visualizado', false)

      if (error) {
        console.error('❌ useIntimacoes: Erro ao buscar contagem de intimações:', error)
        // Em caso de erro, manter o valor atual ou definir como 0
        if (intimacoesNaoVisualizadas.value === undefined) {
          intimacoesNaoVisualizadas.value = 0
        }
        return
      }

      const novaContagem = count || 0
      intimacoesNaoVisualizadas.value = novaContagem
      console.log('✅ useIntimacoes: Contagem atualizada:', novaContagem)
      
    } catch (error) {
      console.error('❌ useIntimacoes: Erro geral ao buscar contagem:', error)
      // Em caso de erro, garantir que o valor seja 0 se não estiver definido
      if (intimacoesNaoVisualizadas.value === undefined) {
        intimacoesNaoVisualizadas.value = 0
      }
    } finally {
      loading.value = false
      console.log('📊 useIntimacoes: Busca finalizada. Valor atual:', intimacoesNaoVisualizadas.value)
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
   * Usa singleton pattern para evitar múltiplas subscrições
   */
  const configurarListenerIntimacoes = () => {
    // Se já existe uma subscrição ativa, retorna ela
    if (subscription && isConfigured) {
      console.log('🔄 Reutilizando listener existente de intimações')
      return subscription
    }

    // Limpar subscrição anterior se existir
    if (subscription) {
      console.log('🧹 Removendo listener anterior')
      subscription.unsubscribe()
    }

    console.log('🔄 Configurando novo listener de intimações')
    
    // Criar nova subscrição com nome único baseado em timestamp
    const channelName = `intimacoes-changes-${Date.now()}`
    
    subscription = supabase
      .channel(channelName)
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
      .subscribe((status) => {
        console.log('📡 Status da subscrição de intimações:', status)
        if (status === 'SUBSCRIBED') {
          isConfigured = true
        }
      })

    return subscription
  }

  /**
   * Remove o listener de intimações
   */
  const removerListenerIntimacoes = () => {
    if (subscription) {
      console.log('🧹 Removendo listener de intimações')
      subscription.unsubscribe()
      subscription = null
      isConfigured = false
    }
  }

  /**
   * Força uma atualização do contador
   */
  const atualizarContador = async () => {
    await buscarContadorIntimacoes()
  }

  /**
   * Inicialização automática do contador quando o composable é usado
   */
  const inicializarAutomaticamente = async () => {
    // Verificar se já foi inicializado recentemente (cache de 5 segundos)
    const agora = Date.now()
    const ultimaInicializacao = localStorage.getItem('intimacoes_ultima_inicializacao')
    
    if (ultimaInicializacao && (agora - parseInt(ultimaInicializacao)) < 5000) {
      console.log('📊 useIntimacoes: Inicialização recente detectada, pulando...')
      return
    }
    
    console.log('📊 useIntimacoes: Inicializando automaticamente...')
    localStorage.setItem('intimacoes_ultima_inicializacao', agora.toString())
    
    // Tentar carregar o contador
    await buscarContadorIntimacoes()
  }

  // Inicializar automaticamente quando o composable for usado
  if (typeof window !== 'undefined') {
    // Usar setTimeout para não bloquear a renderização
    setTimeout(inicializarAutomaticamente, 100)
  }

  return {
    // Estados
    intimacoesNaoVisualizadas: computed(() => intimacoesNaoVisualizadas.value),
    loading: computed(() => loading.value),
    
    // Métodos
    buscarContadorIntimacoes,
    marcarComoVisualizada,
    configurarListenerIntimacoes,
    removerListenerIntimacoes,
    atualizarContador,
    inicializarAutomaticamente
  }
}