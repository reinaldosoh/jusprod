import { supabase } from '../lib/supabase.js'

// Buscar quantidade de documentos do sistema (Modelos Jusprod)
export async function getQuantidadeDocumentosSistema() {
  try {
    const { count, error } = await supabase
      .from('documento_sistema')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Erro ao buscar quantidade de documentos do sistema:', error)
    return 0
  }
}

// Buscar pastas do usuário com contagem de documentos
export async function getPastasComContagem() {
  try {
    const { data, error } = await supabase
      .from('view_pastas_com_contagem')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar pastas com contagem:', error)
    return []
  }
}

// Criar nova pasta
export async function criarPasta(titulo) {
  try {
    const { data, error } = await supabase
      .from('pasta_documentos')
      .insert([{ titulo }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar pasta:', error)
    throw error
  }
}

// Deletar pasta
export async function deletarPasta(id) {
  try {
    const { error } = await supabase
      .from('pasta_documentos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar pasta:', error)
    throw error
  }
}

// Atualizar pasta
export async function atualizarPasta(id, titulo) {
  try {
    const { data, error } = await supabase
      .from('pasta_documentos')
      .update({ titulo })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar pasta:', error)
    throw error
  }
} 