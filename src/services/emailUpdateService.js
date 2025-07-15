import { supabase } from '../lib/supabase'

// Controle de rate limiting
let ultimaTentativa = 0
const DELAY_MINIMO = 10000 // 10 segundos em milissegundos

/**
 * Serviço para atualização de email do usuário
 */
export const emailUpdateService = {
  /**
   * Atualiza o email do usuário
   * @param {Object} dados - Dados para atualização
   * @param {string} dados.novoEmail - Novo email do usuário
   * @param {string} dados.confirmarEmail - Confirmação do novo email
   * @param {string} dados.senhaAtual - Senha atual do usuário para validação
   * @returns {Promise<Object>} Resultado da operação
   */
  async atualizarEmail(dados) {
    try {
      const { novoEmail, confirmarEmail, senhaAtual } = dados

      // Validações básicas
      if (!novoEmail || !confirmarEmail || !senhaAtual) {
        throw new Error('Todos os campos são obrigatórios')
      }

      if (novoEmail !== confirmarEmail) {
        throw new Error('Os e-mails não coincidem')
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(novoEmail)) {
        throw new Error('Formato de e-mail inválido')
      }

      // Verificar rate limiting
      const agora = Date.now()
      const tempoDecorrido = agora - ultimaTentativa
      
      if (ultimaTentativa > 0 && tempoDecorrido < DELAY_MINIMO) {
        const tempoRestante = Math.ceil((DELAY_MINIMO - tempoDecorrido) / 1000)
        throw new Error(`Aguarde ${tempoRestante} segundos antes de tentar novamente por segurança.`)
      }

      // Obter usuário atual
      const { data: { user }, error: getUserError } = await supabase.auth.getUser()
      
      if (getUserError || !user) {
        throw new Error('Usuário não autenticado')
      }

      // Verificar se o novo email é diferente do atual
      if (user.email === novoEmail) {
        throw new Error('O novo email deve ser diferente do email atual')
      }

      // Verificar se o novo email já está em uso por outro usuário
      const { data: existingUser, error: checkEmailError } = await supabase
        .from('usuario')
        .select('id')
        .eq('email', novoEmail)
        .neq('uuid', user.id)
        .single()

      if (checkEmailError && checkEmailError.code !== 'PGRST116') {
        // PGRST116 é o código para "não encontrado", que é o que queremos
        throw new Error('Erro ao verificar disponibilidade do email')
      }

      if (existingUser) {
        throw new Error('Este e-mail já está sendo usado por outro usuário')
      }

      // Validar senha atual tentando fazer login com ela
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senhaAtual
      })

      if (signInError) {
        throw new Error('Senha atual incorreta')
      }

      // Registrar a tentativa
      ultimaTentativa = agora

      // Solicitar mudança de email no auth (enviará email de confirmação)
      const resultado = await this._solicitarMudancaEmail(novoEmail, user.id, user.email)
      
      if (!resultado.success) {
        throw new Error(resultado.message)
      }

      return {
        success: true,
        message: 'Solicitação de mudança de email enviada! Verifique sua caixa de entrada do NOVO EMAIL e clique no link de confirmação. Após a confirmação, o email será atualizado automaticamente.',
        data: {
          novoEmail,
          emailAtual: user.email,
          needsVerification: true
        }
      }

    } catch (error) {
      console.error('Erro no emailUpdateService:', error)
      
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null
      }
    }
  },

  /**
   * Solicita mudança de email com retry automático em caso de rate limiting
   * @param {string} novoEmail - Novo email
   * @param {string} userId - ID do usuário
   * @param {string} emailAtual - Email atual do usuário
   * @returns {Promise<Object>} Resultado da operação
   */
  async _solicitarMudancaEmail(novoEmail, userId, emailAtual, tentativa = 1) {
    const MAX_TENTATIVAS = 3
    const DELAY_RETRY = 10000 // 10 segundos

    try {
      console.log(`Solicitando mudança de email (tentativa ${tentativa}/${MAX_TENTATIVAS}): ${emailAtual} -> ${novoEmail}`)

      // Solicitar mudança de email no auth do Supabase
      // IMPORTANTE: Isto envia um email de confirmação, NÃO atualiza imediatamente
      const { error: updateAuthError } = await supabase.auth.updateUser({
        email: novoEmail
      })

      if (updateAuthError) {
        console.error('Erro ao solicitar mudança de email:', updateAuthError)
        
        // Verificar se é erro de rate limiting
        if (updateAuthError.message.includes('you can only request this after') || 
            updateAuthError.message.includes('rate limit')) {
          
          if (tentativa < MAX_TENTATIVAS) {
            console.log(`Erro de rate limiting detectado. Tentativa ${tentativa}/${MAX_TENTATIVAS}. Aguardando...`)
            
            // Aguardar antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, DELAY_RETRY))
            
            // Tentar novamente
            return await this._solicitarMudancaEmail(novoEmail, userId, emailAtual, tentativa + 1)
          } else {
            return {
              success: false,
              message: 'Muitas tentativas de atualização. Aguarde alguns minutos e tente novamente.'
            }
          }
        }
        
        return {
          success: false,
          message: 'Erro ao solicitar mudança de email: ' + updateAuthError.message
        }
      }

      console.log('✅ Solicitação de mudança de email enviada com sucesso!')

      // NÃO atualizar a tabela usuario aqui!
      // A tabela será atualizada apenas após a confirmação do email
      // através do webhook ou verificação periódica

      return {
        success: true,
        message: 'Solicitação de mudança de email enviada com sucesso!'
      }

    } catch (error) {
      console.error('Erro no _solicitarMudancaEmail:', error)
      
      return {
        success: false,
        message: error.message || 'Erro interno durante a solicitação'
      }
    }
  },

  /**
   * Verifica se o email foi confirmado e atualiza a tabela usuario
   * @returns {Promise<Object>} Resultado da verificação
   */
  async verificarEAtualizarEmail() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar dados atuais na tabela usuario
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuario')
        .select('email')
        .eq('uuid', user.id)
        .single()

      if (usuarioError) {
        throw new Error('Erro ao buscar dados do usuário')
      }

      // Verificar se o email no auth é diferente do email na tabela
      if (user.email !== usuarioData.email) {
        console.log(`📧 Email confirmado! Atualizando tabela: ${usuarioData.email} -> ${user.email}`)
        
        // Atualizar tabela usuario com o email confirmado
        const { error: updateError } = await supabase
          .from('usuario')
          .update({ email: user.email })
          .eq('uuid', user.id)

        if (updateError) {
          console.error('Erro ao atualizar tabela usuario:', updateError)
          throw new Error('Erro ao sincronizar email na tabela')
        }

        return {
          success: true,
          message: 'Email confirmado e atualizado com sucesso!',
          data: {
            emailAtualizado: true,
            novoEmail: user.email,
            emailAnterior: usuarioData.email
          }
        }
      }

      return {
        success: true,
        message: 'Email já está sincronizado',
        data: {
          emailAtualizado: false,
          email: user.email
        }
      }

    } catch (error) {
      console.error('Erro ao verificar e atualizar email:', error)
      
      return {
        success: false,
        message: error.message || 'Erro ao verificar status do email',
        data: null
      }
    }
  },

  /**
   * Verifica o status de verificação do email
   * @returns {Promise<Object>} Status da verificação
   */
  async verificarStatusEmail() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar dados da tabela usuario para comparar
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuario')
        .select('email')
        .eq('uuid', user.id)
        .single()

      const emailTabela = usuarioError ? null : usuarioData.email

      return {
        success: true,
        data: {
          emailAuth: user.email,
          emailTabela: emailTabela,
          emailConfirmed: user.email_confirmed_at !== null,
          lastSignInAt: user.last_sign_in_at,
          sincronizado: user.email === emailTabela,
          aguardandoConfirmacao: user.email !== emailTabela
        }
      }

    } catch (error) {
      console.error('Erro ao verificar status do email:', error)
      
      return {
        success: false,
        message: error.message || 'Erro ao verificar status do email',
        data: null
      }
    }
  },

  /**
   * Reenvia email de confirmação para mudança de email
   * @returns {Promise<Object>} Resultado da operação
   */
  async reenviarConfirmacao() {
    try {
      const { data: { user }, error: getUserError } = await supabase.auth.getUser()
      
      if (getUserError || !user) {
        throw new Error('Usuário não autenticado')
      }

      // Para mudança de email, usar type: 'email_change'
      const { error } = await supabase.auth.resend({
        type: 'email_change',
        email: user.email
      })

      if (error) {
        throw new Error('Erro ao reenviar confirmação: ' + error.message)
      }

      return {
        success: true,
        message: 'Email de confirmação reenviado com sucesso! Verifique sua caixa de entrada.',
        data: null
      }

    } catch (error) {
      console.error('Erro ao reenviar confirmação:', error)
      
      return {
        success: false,
        message: error.message || 'Erro ao reenviar confirmação',
        data: null
      }
    }
  },

  /**
   * Verifica se é possível fazer uma nova tentativa de atualização
   * @returns {Object} Status da disponibilidade
   */
  verificarDisponibilidade() {
    const agora = Date.now()
    const tempoDecorrido = agora - ultimaTentativa
    
    if (ultimaTentativa === 0 || tempoDecorrido >= DELAY_MINIMO) {
      return {
        disponivel: true,
        tempoRestante: 0
      }
    }
    
    return {
      disponivel: false,
      tempoRestante: Math.ceil((DELAY_MINIMO - tempoDecorrido) / 1000)
    }
  }
} 