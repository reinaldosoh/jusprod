import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

// Estado global do usuário
const dadosUsuario = ref(null)
const loadingUsuario = ref(false)

export const useUsuario = () => {
  const authStore = useAuthStore()

  // Busca os dados do usuário na tabela usuario
  const buscarDadosUsuario = async () => {
    if (!authStore.user?.value?.id) {
      console.log('DEBUG useUsuario: Sem usuário autenticado')
      return null
    }

    console.log('DEBUG useUsuario: Buscando dados para UUID:', authStore.user.value.id)
    
    loadingUsuario.value = true
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('uuid', authStore.user.value.id)
        .single()

      console.log('DEBUG useUsuario: Resultado da busca:', { data, error })

      if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
        console.error('Erro ao buscar dados do usuário:', error)
        return null
      }

      dadosUsuario.value = data
      console.log('DEBUG useUsuario: Dados carregados:', data)
      return data
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err)
      return null
    } finally {
      loadingUsuario.value = false
    }
  }

  // Nome do usuário (prioriza a tabela usuario)
  const nomeUsuario = computed(() => {
    if (dadosUsuario.value?.nome) {
      return dadosUsuario.value.nome
    }
    
    // Fallback para dados do auth
    const user = authStore.user?.value
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    } else if (user?.user_metadata?.name) {
      return user.user_metadata.name
    } else if (user?.email) {
      const emailName = user.email.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, ' ')
    }
    
    return 'Usuário'
  })

  // Iniciais do usuário
  const iniciaisUsuario = computed(() => {
    const nome = nomeUsuario.value
    
    if (nome && nome !== 'Usuário') {
      const parts = nome.split(' ')
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return nome.substring(0, 2).toUpperCase()
    }
    
    const user = authStore.user?.value
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    
    return 'U'
  })

  // Email do usuário
  const emailUsuario = computed(() => {
    return dadosUsuario.value?.email || authStore.user?.value?.email || ''
  })

  // WhatsApp do usuário
  const whatsappUsuario = computed(() => {
    return dadosUsuario.value?.whatsapp || ''
  })

  return {
    dadosUsuario,
    loadingUsuario,
    buscarDadosUsuario,
    nomeUsuario,
    iniciaisUsuario,
    emailUsuario,
    whatsappUsuario
  }
} 