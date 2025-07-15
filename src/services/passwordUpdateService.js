import { supabase } from '../lib/supabase'

/**
 * Serviço para atualização de senha do usuário
 */
export const passwordUpdateService = {
  /**
   * Atualiza a senha do usuário
   * @param {Object} dados - Dados para atualização
   * @param {string} dados.senhaAtual - Senha atual do usuário para validação
   * @param {string} dados.novaSenha - Nova senha do usuário
   * @param {string} dados.repetirNovaSenha - Confirmação da nova senha
   * @returns {Promise<Object>} Resultado da operação
   */
  async atualizarSenha(dados) {
    try {
      const { senhaAtual, novaSenha, repetirNovaSenha } = dados

      // Validações básicas
      if (!senhaAtual || !novaSenha || !repetirNovaSenha) {
        throw new Error('Todos os campos são obrigatórios')
      }

      if (novaSenha !== repetirNovaSenha) {
        throw new Error('A nova senha e a confirmação não coincidem')
      }

      if (novaSenha.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres')
      }

      if (senhaAtual === novaSenha) {
        throw new Error('A nova senha deve ser diferente da senha atual')
      }

      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Usuário não autenticado')
      }

      // Verificar senha atual fazendo um re-login
      console.log('Verificando senha atual...')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senhaAtual
      })

      if (signInError) {
        console.error('Erro ao verificar senha atual:', signInError)
        throw new Error('Senha atual incorreta')
      }

      // Atualizar senha no Supabase Auth
      console.log('Atualizando senha...')
      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha
      })

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError)
        
        // Tratar erros específicos do Supabase
        if (updateError.message.includes('Password should be')) {
          throw new Error('A senha deve atender aos critérios de segurança')
        } else if (updateError.message.includes('same as')) {
          throw new Error('A nova senha deve ser diferente da atual')
        } else {
          throw new Error(updateError.message || 'Erro ao atualizar senha')
        }
      }

      console.log('Senha atualizada com sucesso')

      return {
        success: true,
        message: 'Senha atualizada com sucesso!',
        data: {
          passwordUpdated: true
        }
      }

    } catch (error) {
      console.error('Erro no passwordUpdateService:', error)
      
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null
      }
    }
  },

  /**
   * Valida se a senha atende aos critérios de segurança
   * @param {string} senha - Senha a ser validada
   * @returns {Object} Resultado da validação
   */
  validarSenha(senha) {
    const criterios = {
      minimoCaracteres: senha.length >= 6,
      temNumero: /\d/.test(senha),
      temLetra: /[a-zA-Z]/.test(senha),
      temCaractereEspecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)
    }

    const valida = criterios.minimoCaracteres
    const pontuacao = Object.values(criterios).filter(Boolean).length

    let forca = 'Fraca'
    if (pontuacao >= 4) forca = 'Muito forte'
    else if (pontuacao >= 3) forca = 'Forte'
    else if (pontuacao >= 2) forca = 'Média'

    return {
      valida,
      forca,
      criterios,
      pontuacao
    }
  },

  /**
   * Gera sugestões para melhorar a senha
   * @param {string} senha - Senha atual
   * @returns {Array} Lista de sugestões
   */
  obterSugestoesSenha(senha) {
    const sugestoes = []
    const validacao = this.validarSenha(senha)

    if (!validacao.criterios.minimoCaracteres) {
      sugestoes.push('Use pelo menos 6 caracteres')
    }

    if (!validacao.criterios.temNumero) {
      sugestoes.push('Inclua pelo menos um número')
    }

    if (!validacao.criterios.temLetra) {
      sugestoes.push('Inclua pelo menos uma letra')
    }

    if (!validacao.criterios.temCaractereEspecial) {
      sugestoes.push('Inclua pelo menos um caractere especial (!@#$%...)')
    }

    if (senha.length < 8) {
      sugestoes.push('Recomendamos pelo menos 8 caracteres para maior segurança')
    }

    return sugestoes
  }
} 