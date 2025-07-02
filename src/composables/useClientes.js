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
      // Usando a view clientes_kanban que já inclui as contagens de processos e contratos
      const { data, error: supabaseError } = await supabase
        .from('clientes_kanban')
        .select('*')
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

  // Função para buscar cliente por ID
  const buscarClientePorId = async (clienteId) => {
    if (!clienteId) return { success: false, message: 'ID do cliente não fornecido' }
    
    try {
      loading.value = true
      error.value = null
      
      console.log('🔍 Buscando cliente por ID:', clienteId)
      
      const { data, error: supabaseError } = await supabase
        .from('clientes')
        .select(`
          *,
          representante_legais(
            id,
            nome_completo,
            email
          )
        `)
        .eq('id', clienteId)
        .single()
      
      if (supabaseError) throw supabaseError
      
      console.log('✅ Cliente encontrado:', data)
      
      return { success: true, data }
    } catch (err) {
      console.error('Erro ao buscar cliente:', err)
      error.value = err.message
      return { success: false, message: err.message }
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

      // Atualizar estado local em vez de recarregar todos os dados
      const clienteIndex = clientes.value.findIndex(c => c.id === clienteId);
      if (clienteIndex !== -1) {
        // Atualizar os status do cliente localmente
        clientes.value[clienteIndex].cliente_novo = false;
        clientes.value[clienteIndex].cliente_andamento = false;
        clientes.value[clienteIndex].cliente_finalizado = false;
        clientes.value[clienteIndex][novoStatus] = true;
      }
      
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

      // Atualizar estado local em vez de recarregar todos os dados
      // Encontrar o cliente na lista e atualizar seu estado
      const clienteIndex = clientes.value.findIndex(c => c.id === clienteId);
      if (clienteIndex !== -1) {
        clientes.value[clienteIndex].favorito = !favorito;
      }
      
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

      // Atualizar estado local em vez de recarregar todos os dados
      // Remover o cliente da lista local
      clientes.value = clientes.value.filter(c => c.id !== clienteId);
      
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
    excluirCliente,
    buscarClientePorId
  }
} 