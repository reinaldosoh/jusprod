import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { useAuthStore } from '../stores/auth.js'

export function useClientes() {
  const { session } = useAuthStore()
  const clientes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed para separar clientes por status
  const clientesNovo = computed(() => 
    clientes.value.filter(cliente => cliente.cliente_novo)
  )

  const clientesAndamento = computed(() => 
    clientes.value.filter(cliente => cliente.cliente_andamento)
  )

  const clientesFinalizado = computed(() => 
    clientes.value.filter(cliente => cliente.cliente_finalizado)
  )

  // Função para carregar clientes
  const carregarClientes = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('clientes')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (supabaseError) {
        throw supabaseError
      }

      clientes.value = data || []
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Função para atualizar status do cliente
  const atualizarStatusCliente = async (clienteId, novoStatus) => {
    try {
      // Resetar todos os status
      const statusUpdate = {
        cliente_novo: false,
        cliente_andamento: false,
        cliente_finalizado: false
      }

      // Definir o novo status
      statusUpdate[novoStatus] = true

      const { error: updateError } = await supabase
        .from('clientes')
        .update(statusUpdate)
        .eq('id', clienteId)
        .eq('uuid', session.value.user.id)

      if (updateError) {
        throw updateError
      }

      // Recarregar dados
      await carregarClientes()
      
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar status do cliente:', err)
      return { success: false, error: err.message }
    }
  }

  // Função para alternar favorito
  const toggleFavorito = async (clienteId, favorito) => {
    try {
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ favorito: !favorito })
        .eq('id', clienteId)
        .eq('uuid', session.value.user.id)

      if (updateError) {
        throw updateError
      }

      // Recarregar dados
      await carregarClientes()
      
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar favorito:', err)
      return { success: false, error: err.message }
    }
  }

  // Função para excluir cliente (desativar)
  const excluirCliente = async (clienteId) => {
    try {
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ ativo: false })
        .eq('id', clienteId)
        .eq('uuid', session.value.user.id)

      if (updateError) {
        throw updateError
      }

      // Recarregar dados
      await carregarClientes()
      
      return { success: true }
    } catch (err) {
      console.error('Erro ao excluir cliente:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    clientes,
    clientesNovo,
    clientesAndamento,
    clientesFinalizado,
    loading,
    error,
    carregarClientes,
    atualizarStatusCliente,
    toggleFavorito,
    excluirCliente
  }
} 