/**
 * Utilitário para traduzir mensagens de erro do Supabase para português
 */

const errorMessages = {
  // Erros de autenticação
  'Invalid login credentials': 'Credenciais de login inválidas',
  'Email not confirmed': 'Email não confirmado',
  'User already registered': 'Usuário já cadastrado',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
  'Email not found': 'Email não encontrado',
  'Invalid email': 'Email inválido',
  'Invalid password': 'Senha inválida',
  'Email already in use': 'Este email já está sendo utilizado',
  'Invalid email or password': 'Email ou senha inválidos',
  'Email/Password combination is incorrect': 'Combinação de email/senha incorreta',
  'Email already confirmed': 'Email já confirmado',
  'Invalid token': 'Token inválido',
  'JWT expired': 'Sessão expirada',
  'Invalid refresh token': 'Token de atualização inválido',
  'Invalid captcha token': 'Token de captcha inválido',
  'Password recovery initiated': 'Recuperação de senha iniciada',
  'User not found': 'Usuário não encontrado',
  
  // Erros de recuperação de senha
  'Error sending recovery email': 'Erro ao enviar email de recuperação. Verifique se o email está cadastrado ou tente novamente mais tarde.',
  'unexpected_failure': 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
  
  // Erros gerais
  'Server error': 'Erro no servidor',
  'Network error': 'Erro de conexão',
  'Request failed': 'Requisição falhou',
  'Too many requests': 'Muitas requisições, tente novamente mais tarde',
  'Service unavailable': 'Serviço indisponível',
  'Timeout': 'Tempo de espera esgotado',
  'Unknown error': 'Erro desconhecido'
};

/**
 * Traduz uma mensagem de erro do Supabase para português
 * @param {string} message - A mensagem de erro original em inglês
 * @returns {string} - A mensagem traduzida ou a original se não houver tradução
 */
export function translateError(message) {
  if (!message) return 'Ocorreu um erro desconhecido';
  
  // Verifica se há uma tradução exata
  if (errorMessages[message]) {
    return errorMessages[message];
  }
  
  // Verifica se a mensagem contém alguma das chaves
  for (const key in errorMessages) {
    if (message.includes(key)) {
      return errorMessages[key];
    }
  }
  
  // Retorna a mensagem original se não encontrar tradução
  return message;
}

export default translateError;
