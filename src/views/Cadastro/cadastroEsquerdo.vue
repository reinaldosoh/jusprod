<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Input from '../../components/UI/Input.vue';
import Button from '../../components/UI/Button.vue';
import AlertaErro from '../../components/UI/AlertaErro.vue';
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue';
import AlertasInputs from '../../components/UI/AlertasInputs.vue';
import Dropdown from '../../components/UI/Dropdown.vue';
import { useAuthStore } from '../../stores/auth';
import { CreditCard, User, Asterisk, FileText, Smartphone, Lock, CheckCircle, XCircle } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

// Estados para controle do formulário multistep
const etapaAtual = ref(1);
const totalEtapas = 2;

// Dados do formulário - Etapa 1
const oabs = ref([{ numero: '', uf: 'SC' }]);
const email = ref('');
const nomeCompleto = ref('');
const cpf = ref('');
const telefone = ref('');
const senha = ref('');
const confirmarSenha = ref('');

// Estados de UI
const isLoading = ref(false);
const isVerificandoOAB = ref(false);
const errorTitulo = ref('');
const errorMessage = ref('');
const mostrarErro = ref(false);
const mostrarSucesso = ref(false);
const mensagemSucesso = ref('');

// Estados para verificação de duplicatas
const mostrarAlertaOAB = ref(false);
const mostrarAlertaEmail = ref(false);
const mostrarAlertaCPF = ref(false);
const oabVerificando = ref({ numero: '', uf: '' });
const emailVerificando = ref('');
const cpfVerificando = ref('');

// Estado para aceite dos termos
const aceitouTermos = ref(false);

// Lista de UFs brasileiras
const listaUFs = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Converter lista de UFs para o formato do componente Dropdown
const ufOptions = computed(() => {
  return listaUFs.map((uf, index) => ({
    id: index + 1,
    label: uf,
    value: uf,
    active: uf === 'SC'
  }));
});

// Adicionar nova OAB
function adicionarOAB() {
  oabs.value.push({ numero: '', uf: 'SC' });
}

// Remover OAB
function removerOAB(index) {
  if (oabs.value.length > 1) {
    oabs.value.splice(index, 1);
  }
}

// Atualizar UF selecionada
function handleUfSelected(option, index) {
  oabs.value[index].uf = option.value;
  // Verificar OAB após selecionar UF
  verificarOABDuplicada(index);
}

// Verificar se OAB já existe no banco
async function verificarOABDuplicada(index) {
  const oab = oabs.value[index];
  
  // Só verifica se ambos os campos estão preenchidos
  if (!oab.numero || !oab.uf) {
    return;
  }
  
  // Limpar número da OAB (remover caracteres não numéricos)
  const numeroLimpo = oab.numero.replace(/\D/g, '');
  
  // Só verifica se o número tem pelo menos 4 dígitos
  if (numeroLimpo.length < 4) {
    return;
  }
  
  try {
    // Verificar se existe no banco
    const existe = await verificarOABExisteNoBanco(numeroLimpo, oab.uf);
    
    // SÓ MOSTRA O ALERTA SE ENCONTRAR A OAB NO BANCO
    if (existe) {
      oabVerificando.value = {
        numero: numeroLimpo,
        uf: oab.uf
      };
      mostrarAlertaOAB.value = true;
    }
    
  } catch (error) {
    console.error('Erro ao verificar OAB:', error);
  }
}

// Verificar se email já existe no banco
async function verificarEmailDuplicado() {
  // Só verifica se o email está preenchido e é válido
  if (!email.value || !email.value.includes('@')) {
    return;
  }
  
  try {
    const existe = await verificarEmailExisteNoBanco(email.value);
    
    // SÓ MOSTRA O ALERTA SE ENCONTRAR O EMAIL NO BANCO
    if (existe) {
      emailVerificando.value = email.value;
      mostrarAlertaEmail.value = true;
    }
    
  } catch (error) {
    console.error('Erro ao verificar email:', error);
  }
}

// Verificar se CPF já existe no banco
async function verificarCPFDuplicado() {
  // Só verifica se o CPF está preenchido
  if (!cpf.value) {
    return;
  }
  
  // Limpar CPF (remover caracteres não numéricos)
  const cpfLimpo = cpf.value.replace(/\D/g, '');
  
  // Só verifica se o CPF tem 11 dígitos
  if (cpfLimpo.length !== 11) {
    return;
  }
  
  try {
    const existe = await verificarCPFExisteNoBanco(cpfLimpo);
    
    // SÓ MOSTRA O ALERTA SE ENCONTRAR O CPF NO BANCO
    if (existe) {
      cpfVerificando.value = cpfLimpo;
      mostrarAlertaCPF.value = true;
    }
    
  } catch (error) {
    console.error('Erro ao verificar CPF:', error);
  }
}

// Formatação de número de OAB
function formatarOAB(value) {
  if (!value) return '';
  
  // Remove todos os caracteres não numéricos
  const oabNumerico = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos (padrão comum de OAB)
  const oabLimitado = oabNumerico.slice(0, 8);
  
  return oabLimitado;
}

// Atualizar número de OAB
function atualizarOAB(valor, index) {
  if (!valor) return '';
  
  // Remove caracteres não numéricos e limita a 8 dígitos
  const numerico = valor.toString().replace(/\D/g, '').slice(0, 8);
  
  // Atualiza o valor
  oabs.value[index].numero = numerico;
  
  return numerico;
}

// Lidar com blur do campo OAB (quando o usuário sai do campo)
function handleOABBlur(index) {
  verificarOABDuplicada(index);
}

// Lidar com confirmação do alerta de OAB
function handleConfirmacaoOAB(acao) {
  mostrarAlertaOAB.value = false;
  
  if (acao === 'suporte') {
    // Redirecionar para suporte ou abrir modal de contato
    const subject = encodeURIComponent(`Problema com OAB ${oabVerificando.value.numero}${oabVerificando.value.uf}`);
    const body = encodeURIComponent(`Olá, estou tentando cadastrar a OAB ${oabVerificando.value.numero}/${oabVerificando.value.uf} mas o sistema indica que ela já está cadastrada. Preciso de ajuda.`);
    window.open(`mailto:suporte@jusprod.com.br?subject=${subject}&body=${body}`, '_blank');
  } else if (acao === 'continuar') {
    // Usuário confirmou que a OAB é dele, continuar normalmente
    console.log('Usuário confirmou que a OAB é dele, permitindo continuar');
  } else if (acao === 'fechar') {
    // Usuário fechou o alerta sem tomar ação
    console.log('Usuário fechou o alerta de OAB');
  }
}

// Lidar com confirmação do alerta de Email
function handleConfirmacaoEmail(acao) {
  mostrarAlertaEmail.value = false;
  
  if (acao === 'suporte') {
    const subject = encodeURIComponent(`Problema com email ${emailVerificando.value}`);
    const body = encodeURIComponent(`Olá, estou tentando cadastrar o email ${emailVerificando.value} mas o sistema indica que ele já está cadastrado. Preciso de ajuda.`);
    window.open(`mailto:suporte@jusprod.com.br?subject=${subject}&body=${body}`, '_blank');
  } else if (acao === 'fechar') {
    console.log('Usuário fechou o alerta de email');
  }
}

// Lidar com confirmação do alerta de CPF
function handleConfirmacaoCPF(acao) {
  mostrarAlertaCPF.value = false;
  
  if (acao === 'suporte') {
    const cpfFormatado = cpfVerificando.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    const subject = encodeURIComponent(`Problema com CPF ${cpfFormatado}`);
    const body = encodeURIComponent(`Olá, estou tentando cadastrar o CPF ${cpfFormatado} mas o sistema indica que ele já está cadastrado. Preciso de ajuda.`);
    window.open(`mailto:suporte@jusprod.com.br?subject=${subject}&body=${body}`, '_blank');
  } else if (acao === 'fechar') {
    console.log('Usuário fechou o alerta de CPF');
  }
}

// Validação da primeira etapa
function validarEtapa1() {
  // Validar OABs
  for (let i = 0; i < oabs.value.length; i++) {
    const oab = oabs.value[i];
    
    if (!oab.numero || !oab.uf) {
      errorTitulo.value = 'Campo obrigatório';
      errorMessage.value = 'Por favor, preencha todos os campos de OAB';
      mostrarErro.value = true;
      return false;
    }
    
    // Verificar se o número da OAB tem pelo menos 4 dígitos
    const numeroLimpo = oab.numero.replace(/\D/g, '');
    if (numeroLimpo.length < 4) {
      errorTitulo.value = 'OAB inválida';
      errorMessage.value = 'O número da OAB deve ter pelo menos 4 dígitos';
      mostrarErro.value = true;
      return false;
    }
  }
  
  // Verificar OABs duplicadas dentro do próprio formulário
  const oabsUnicas = new Set();
  for (const oab of oabs.value) {
    const chaveOAB = `${oab.numero}-${oab.uf}`;
    if (oabsUnicas.has(chaveOAB)) {
      errorTitulo.value = 'OAB duplicada';
      errorMessage.value = 'Você não pode adicionar a mesma OAB duas vezes';
      mostrarErro.value = true;
      return false;
    }
    oabsUnicas.add(chaveOAB);
  }

  // Validar email
  if (!email.value) {
    errorTitulo.value = 'Campo obrigatório';
    errorMessage.value = 'Por favor, informe seu e-mail';
    mostrarErro.value = true;
    return false;
  }

  // Validar nome completo
  if (!nomeCompleto.value) {
    errorTitulo.value = 'Campo obrigatório';
    errorMessage.value = 'Por favor, informe seu nome completo';
    mostrarErro.value = true;
    return false;
  }

  // Validar CPF
  if (!cpf.value) {
    errorTitulo.value = 'Campo obrigatório';
    errorMessage.value = 'Por favor, informe seu CPF';
    mostrarErro.value = true;
    return false;
  }
  
  // Verificar se o CPF tem exatamente 11 dígitos
  const cpfLimpo = cpf.value.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) {
    errorTitulo.value = 'CPF inválido';
    errorMessage.value = 'O CPF deve ter exatamente 11 dígitos';
    mostrarErro.value = true;
    return false;
  }

  // Validar telefone (opcional, mas se preenchido deve ter 10 ou 11 dígitos)
  if (telefone.value) {
    const telefoneLimpo = telefone.value.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      errorTitulo.value = 'Telefone inválido';
      errorMessage.value = 'O telefone deve ter 10 ou 11 dígitos (incluindo DDD)';
      mostrarErro.value = true;
      return false;
    }
  }

  mostrarErro.value = false;
  return true;
}

// Validação da segunda etapa
function validarEtapa2() {
  // Validar senha
  if (!senha.value) {
    errorTitulo.value = 'Campo obrigatório';
    errorMessage.value = 'Por favor, crie uma senha';
    mostrarErro.value = true;
    return false;
  }

  // Validar confirmação de senha
  if (!confirmarSenha.value) {
    errorTitulo.value = 'Campo obrigatório';
    errorMessage.value = 'Por favor, confirme sua senha';
    mostrarErro.value = true;
    return false;
  }

  // Verificar se as senhas coincidem
  if (senha.value !== confirmarSenha.value) {
    errorTitulo.value = 'Senhas diferentes';
    errorMessage.value = 'As senhas não coincidem';
    mostrarErro.value = true;
    return false;
  }

  // Validar requisitos de senha
  if (senha.value.length < 6) {
    errorTitulo.value = 'Senha fraca';
    errorMessage.value = 'A senha deve conter no mínimo 6 caracteres';
    mostrarErro.value = true;
    return false;
  }

  if (!/\d/.test(senha.value)) {
    errorTitulo.value = 'Senha fraca';
    errorMessage.value = 'A senha deve conter pelo menos 1 número';
    mostrarErro.value = true;
    return false;
  }

  if (!/[A-Z]/.test(senha.value)) {
    errorTitulo.value = 'Senha fraca';
    errorMessage.value = 'A senha deve conter pelo menos 1 letra maiúscula';
    mostrarErro.value = true;
    return false;
  }

  if (!/[^\w\s]/.test(senha.value)) {
    errorTitulo.value = 'Senha fraca';
    errorMessage.value = 'A senha deve conter pelo menos 1 caractere especial';
    mostrarErro.value = true;
    return false;
  }

  mostrarErro.value = false;
  return true;
}

// Avançar para próxima etapa
async function proximaEtapa() {
  if (etapaAtual.value === 1 && validarEtapa1()) {
    isVerificandoOAB.value = true;
    
    // Verificar todas as OABs, email e CPF no banco antes de prosseguir
    const verificacoesPendentes = [];
    
    // Verificar OABs
    for (let i = 0; i < oabs.value.length; i++) {
      const oab = oabs.value[i];
      const numeroLimpo = oab.numero.replace(/\D/g, '');
      
      if (numeroLimpo.length >= 4) {
        verificacoesPendentes.push(
          verificarOABExisteNoBanco(numeroLimpo, oab.uf)
        );
      }
    }
    
    // Verificar email
    if (email.value && email.value.includes('@')) {
      verificacoesPendentes.push(
        verificarEmailExisteNoBanco(email.value)
      );
    }
    
    // Verificar CPF
    const cpfLimpo = cpf.value.replace(/\D/g, '');
    if (cpfLimpo.length === 11) {
      verificacoesPendentes.push(
        verificarCPFExisteNoBanco(cpfLimpo)
      );
    }
    
    try {
      const resultados = await Promise.all(verificacoesPendentes);
      const temDuplicada = resultados.some(resultado => resultado);
      
      if (temDuplicada) {
        errorTitulo.value = 'Dados já cadastrados';
        errorMessage.value = 'Um ou mais dados (OAB, email ou CPF) já estão cadastrados no sistema. Verifique os dados ou entre em contato conosco.';
        mostrarErro.value = true;
        return;
      }
      
      // Se chegou até aqui, todos os dados são válidos
      etapaAtual.value = 2;
      
    } catch (error) {
      console.error('Erro ao verificar dados:', error);
      errorTitulo.value = 'Erro de verificação';
      errorMessage.value = 'Não foi possível verificar os dados. Tente novamente.';
      mostrarErro.value = true;
    } finally {
      isVerificandoOAB.value = false;
    }
  }
}

// Verificar se OAB existe no banco (função auxiliar)
async function verificarOABExisteNoBanco(numero, uf) {
  try {
    const { supabase } = await import('../../lib/supabase.js');
    
    const { data, error } = await supabase
      .from('OAB')
      .select('id')
      .eq('OAB_num', numero)
      .eq('OAB_uf', uf)
      .limit(1);
    
    if (error) throw error;
    
    return data && data.length > 0;
    
  } catch (error) {
    console.error('Erro ao verificar OAB no banco:', error);
    return false;
  }
}

// Verificar se email existe no banco (função auxiliar)
async function verificarEmailExisteNoBanco(email) {
  try {
    const { supabase } = await import('../../lib/supabase.js');
    
    const { data, error } = await supabase
      .from('usuario')
      .select('id')
      .eq('email', email)
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na consulta Supabase:', error);
      throw error;
    }
    
    const existe = data && data.length > 0;
    return existe;
    
  } catch (error) {
    console.error('❌ Erro ao verificar email no banco:', error);
    return false;
  }
}

// Verificar se CPF existe no banco (função auxiliar)
async function verificarCPFExisteNoBanco(cpf) {
  try {
    const { supabase } = await import('../../lib/supabase.js');
    
    const { data, error } = await supabase
      .from('usuario')
      .select('id')
      .eq('cpf', cpf)
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na consulta Supabase:', error);
      throw error;
    }
    
    const existe = data && data.length > 0;
    return existe;
    
  } catch (error) {
    console.error('❌ Erro ao verificar CPF no banco:', error);
    return false;
  }
}

// Finalizar cadastro
async function concluirCadastro() {
  if (!validarEtapa2()) {
    return;
  }
  
  try {
    isLoading.value = true;
    mostrarErro.value = false;
    
    console.log('🚀 Iniciando processo de cadastro via Edge Function...');
    
    // Preparar dados para enviar à Edge Function
    const cpfLimpo = cpf.value.replace(/\D/g, '');
    const telefoneLimpo = telefone.value.replace(/\D/g, '');
    
    // Preparar OABs (limpar números)
    const oabsLimpas = oabs.value.map(oab => ({
      numero: oab.numero.replace(/\D/g, ''),
      uf: oab.uf
    }));
    
    const dadosCadastro = {
      email: email.value,
      password: senha.value,
      nomeCompleto: nomeCompleto.value.trim(),
      cpf: cpfLimpo,
      telefone: telefoneLimpo,
      oabs: oabsLimpas
    };
    
    console.log('📤 Enviando dados para Edge Function...');
    
    // Chamar Edge Function
    const { supabase } = await import('../../lib/supabase.js');
    
    const { data, error } = await supabase.functions.invoke('cadastro-completo', {
      body: dadosCadastro
    });
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      throw new Error(error.message || 'Erro ao processar cadastro');
    }
    
    if (!data || !data.success) {
      console.error('❌ Resposta inválida da Edge Function:', data);
      throw new Error(data?.error || 'Erro desconhecido no cadastro');
    }
    
    console.log('✅ Cadastro processado com sucesso:', data);
    
    // Log do código de verificação (apenas para desenvolvimento)
    if (data.verification?.codigo) {
      console.log('🔑 Código de verificação gerado:', data.verification.codigo);
    }
    
    console.log('🎉 Cadastro concluído com sucesso!');
    
    // Mostrar mensagem de sucesso
    mensagemSucesso.value = 'Conta criada com sucesso!';
    mostrarSucesso.value = true;
    
    return;
    
  } catch (error) {
    console.error('❌ Erro no cadastro:', error);
    
    // Tratar diferentes tipos de erro
    let mensagemErro = 'Falha ao criar conta. Tente novamente.';
    
    if (error.message) {
      if (error.message.includes('User already registered') || error.message.includes('já está cadastrado')) {
        mensagemErro = 'Este e-mail já está cadastrado. Tente fazer login.';
      } else if (error.message.includes('Password should be at least') || error.message.includes('senha')) {
        mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message.includes('Invalid email') || error.message.includes('email')) {
        mensagemErro = 'E-mail inválido. Verifique o formato.';
      } else if (error.message.includes('CPF')) {
        mensagemErro = 'Erro relacionado ao CPF. Verifique os dados informados.';
      } else if (error.message.includes('nome')) {
        mensagemErro = 'Erro relacionado ao nome. Verifique os dados informados.';
      } else if (error.message.includes('telefone')) {
        mensagemErro = 'Erro relacionado ao telefone. Verifique os dados informados.';
      } else if (error.message.includes('OAB')) {
        mensagemErro = 'Erro relacionado à OAB. Verifique os dados informados.';
      } else {
        mensagemErro = error.message;
      }
    }
    
    errorTitulo.value = 'Erro no cadastro';
    errorMessage.value = mensagemErro;
    mostrarErro.value = true;
    isLoading.value = false;
  }
}

// Verificar requisitos de senha
const temMinimo6Caracteres = computed(() => senha.value.length >= 6);
const temNumero = computed(() => /\d/.test(senha.value));
const temLetraMaiuscula = computed(() => /[A-Z]/.test(senha.value));
const temCaractereEspecial = computed(() => /[^\w\s]/.test(senha.value));
const senhasSaoIguais = computed(() => senha.value && senha.value === confirmarSenha.value);

// Validação completa da senha
const senhaValida = computed(() => {
  return temMinimo6Caracteres.value && 
         temNumero.value && 
         temLetraMaiuscula.value && 
         temCaractereEspecial.value && 
         senhasSaoIguais.value;
});

// Validação para habilitar o botão de concluir
const podeFinalizarCadastro = computed(() => {
  return senhaValida.value && aceitouTermos.value && !isLoading.value;
});

// Voltar para etapa anterior
function etapaAnterior() {
  if (etapaAtual.value > 1) {
    etapaAtual.value--;
  } else {
    // Se estiver na primeira etapa, volta para a página de login
    router.push({ name: 'login' });
  }
}



// Função para bloquear caracteres não numéricos no CPF
function bloquearNaoNumericoCPF(event) {
  const key = event.key;
  const input = event.target;
  const valor = input.value;
  const numerico = valor.replace(/\D/g, '');
  
  // Permite teclas de controle (backspace, delete, tab, etc.)
  const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  
  if (teclasPermitidas.includes(key)) {
    return; // Permite teclas de controle
  }
  
  // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if (event.ctrlKey || event.metaKey) {
    return;
  }
  
  // Bloqueia se não for número
  if (!/[0-9]/.test(key)) {
    event.preventDefault();
    return;
  }
  
  // Bloqueia se já tem 11 dígitos
  if (numerico.length >= 11) {
    event.preventDefault();
    return;
  }
}

// Função para validar entrada de CPF em tempo real
function validarEntradaCPF(event) {
  const input = event.target;
  const valor = input.value;
  
  // Remove todos os caracteres não numéricos
  const numerico = valor.replace(/\D/g, '');
  
  // BLOQUEIA se exceder 11 dígitos
  if (numerico.length > 11) {
    event.preventDefault();
    return;
  }
  
  // Aplica a máscara do CPF: ###.###.###-##
  let formatado = '';
  
  if (numerico.length <= 3) {
    formatado = numerico;
  } else if (numerico.length <= 6) {
    formatado = `${numerico.slice(0, 3)}.${numerico.slice(3)}`;
  } else if (numerico.length <= 9) {
    formatado = `${numerico.slice(0, 3)}.${numerico.slice(3, 6)}.${numerico.slice(6)}`;
  } else {
    formatado = `${numerico.slice(0, 3)}.${numerico.slice(3, 6)}.${numerico.slice(6, 9)}-${numerico.slice(9, 11)}`;
  }
  
  // Atualiza o valor diretamente no input e no modelo
  input.value = formatado;
  cpf.value = formatado;
}

// Watch para formatar CPF (mantido para compatibilidade)
function atualizarCPF(valor) {
  if (!valor) {
    cpf.value = '';
    return '';
  }
  
  // Remove todos os caracteres não numéricos
  const numerico = valor.toString().replace(/\D/g, '');
  
  // LIMITA RIGOROSAMENTE a exatamente 11 dígitos - não aceita mais que isso
  const numeroLimitado = numerico.slice(0, 11);
  
  // Se o usuário tentar digitar mais de 11 dígitos, bloqueia
  if (numerico.length > 11) {
    // Não atualiza o valor se exceder 11 dígitos
    return cpf.value;
  }
  
  // Aplica a máscara do CPF: ###.###.###-##
  let formatado = '';
  
  if (numeroLimitado.length <= 3) {
    formatado = numeroLimitado;
  } else if (numeroLimitado.length <= 6) {
    formatado = `${numeroLimitado.slice(0, 3)}.${numeroLimitado.slice(3)}`;
  } else if (numeroLimitado.length <= 9) {
    formatado = `${numeroLimitado.slice(0, 3)}.${numeroLimitado.slice(3, 6)}.${numeroLimitado.slice(6)}`;
  } else {
    formatado = `${numeroLimitado.slice(0, 3)}.${numeroLimitado.slice(3, 6)}.${numeroLimitado.slice(6, 9)}-${numeroLimitado.slice(9, 11)}`;
  }
  
  // Atualiza o valor
  cpf.value = formatado;
  
  return formatado;
}



// Função para bloquear caracteres não numéricos no telefone
function bloquearNaoNumericoTelefone(event) {
  const key = event.key;
  const input = event.target;
  const valor = input.value;
  const numerico = valor.replace(/\D/g, '');
  
  // Permite teclas de controle (backspace, delete, tab, etc.)
  const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  
  if (teclasPermitidas.includes(key)) {
    return; // Permite teclas de controle
  }
  
  // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if (event.ctrlKey || event.metaKey) {
    return;
  }
  
  // Bloqueia se não for número
  if (!/[0-9]/.test(key)) {
    event.preventDefault();
    return;
  }
  
  // Bloqueia se já tem 11 dígitos
  if (numerico.length >= 11) {
    event.preventDefault();
    return;
  }
}

// Função para validar entrada de telefone em tempo real
function validarEntradaTelefone(event) {
  const input = event.target;
  const valor = input.value;
  
  // Remove todos os caracteres não numéricos
  const numerico = valor.replace(/\D/g, '');
  
  // BLOQUEIA se exceder 11 dígitos
  if (numerico.length > 11) {
    event.preventDefault();
    return;
  }
  
  // Aplica a máscara do telefone: (##) ####-#### ou (##) #####-####
  let formatado = '';
  
  if (numerico.length === 0) {
    formatado = '';
  } else if (numerico.length <= 2) {
    formatado = `(${numerico}`;
  } else if (numerico.length <= 6) {
    // Para números com 10 dígitos: (##) ####-####
    formatado = `(${numerico.slice(0, 2)}) ${numerico.slice(2)}`;
  } else if (numerico.length <= 10) {
    // Para números com 10 dígitos: (##) ####-####
    formatado = `(${numerico.slice(0, 2)}) ${numerico.slice(2, 6)}-${numerico.slice(6, 10)}`;
  } else {
    // Para números com 11 dígitos: (##) #####-####
    formatado = `(${numerico.slice(0, 2)}) ${numerico.slice(2, 7)}-${numerico.slice(7, 11)}`;
  }
  
  // Atualiza o valor diretamente no input e no modelo
  input.value = formatado;
  telefone.value = formatado;
}

// Watch para formatar telefone (mantido para compatibilidade)
function atualizarTelefone(valor) {
  if (!valor) {
    telefone.value = '';
    return '';
  }
  
  // Remove todos os caracteres não numéricos
  const numerico = valor.toString().replace(/\D/g, '');
  
  // LIMITA RIGOROSAMENTE a exatamente 11 dígitos - não aceita mais que isso
  const numeroLimitado = numerico.slice(0, 11);
  
  // Se o usuário tentar digitar mais de 11 dígitos, bloqueia
  if (numerico.length > 11) {
    // Não atualiza o valor se exceder 11 dígitos
    return telefone.value;
  }
  
  // Aplica a máscara do telefone: (##) ####-#### ou (##) #####-####
  let formatado = '';
  
  if (numeroLimitado.length === 0) {
    formatado = '';
  } else if (numeroLimitado.length <= 2) {
    formatado = `(${numeroLimitado}`;
  } else if (numeroLimitado.length <= 6) {
    // Para números com 10 dígitos: (##) ####-####
    formatado = `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2)}`;
  } else if (numeroLimitado.length <= 10) {
    // Para números com 10 dígitos: (##) ####-####
    formatado = `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2, 6)}-${numeroLimitado.slice(6, 10)}`;
  } else {
    // Para números com 11 dígitos: (##) #####-####
    formatado = `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2, 7)}-${numeroLimitado.slice(7, 11)}`;
  }
  
  // Atualiza o valor
  telefone.value = formatado;
  
  return formatado;
}

// Fechar alerta de erro
function fecharAlertaErro() {
  mostrarErro.value = false;
}

// Fechar alerta de sucesso
function fecharAlertaSucesso() {
  mostrarSucesso.value = false;
  // Redirecionar para a página de login
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="lado-esquerdo">
    <div class="logo-container">
      <img src="/images/logotipo.png" alt="Jusprod" class="logo" />
    </div>

    <div class="form-container">

      
      <div class="header-container">
        <h1 class="titulo">Cadastro</h1>
        <div class="etapas-indicador">
          <span class="etapa-texto">Etapa {{ etapaAtual }}/{{ totalEtapas }}</span>
          <div class="barra-progresso">
            <div 
              class="barra-progresso-preenchida" 
              :style="{ width: `${(etapaAtual / totalEtapas) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div v-if="mostrarErro">
        <AlertaErro 
          :titulo="errorTitulo" 
          :mensagem="errorMessage" 
          @fechar="fecharAlertaErro"
        />
      </div>

      <div v-if="mostrarSucesso">
        <AlertaSucesso 
          :mensagem="mensagemSucesso" 
          @fechar="fecharAlertaSucesso"
        />
      </div>

      <!-- Alerta para verificação de OAB -->
      <AlertasInputs
        v-if="mostrarAlertaOAB"
        tipo="oab"
        :valor="oabVerificando.numero"
        :valorSecundario="oabVerificando.uf"
        @confirmar="handleConfirmacaoOAB"
      />

      <!-- Alerta para verificação de Email -->
      <AlertasInputs
        v-if="mostrarAlertaEmail"
        tipo="email"
        :valor="emailVerificando"
        @confirmar="handleConfirmacaoEmail"
      />

      <!-- Alerta para verificação de CPF -->
      <AlertasInputs
        v-if="mostrarAlertaCPF"
        tipo="cpf"
        :valor="cpfVerificando"
        @confirmar="handleConfirmacaoCPF"
      />

      <!-- Etapa 1 do formulário -->
      <form v-if="etapaAtual === 1" class="formulario" @submit.prevent="proximaEtapa">
        <!-- OAB e UF -->
        <div v-for="(oab, index) in oabs" :key="index" class="oab-fields">
          <div class="oab-labels">
            <label class="oab-label">OAB<span class="campo-obrigatorio">*</span></label>
            <label class="uf-label">UF<span class="campo-obrigatorio">*</span></label>
          </div>
          
          <div class="oab-inputs">
            <div class="input-group oab-numero">
              <Input 
                :id="`oab-numero-${index}`"
                type="text"
                placeholder="Insira sua OAB"
                v-model="oab.numero"
                @update:modelValue="(valor) => atualizarOAB(valor, index)"
                @blur="handleOABBlur(index)"
                maxlength="8"
              >
                <template #icon>
                  <CreditCard size="20" />
                </template>
              </Input>
            </div>
            
            <div class="input-group oab-uf">
              <Dropdown
                :id="`oab-uf-${index}`"
                :options="ufOptions"
                @option-selected="(option) => handleUfSelected(option, index)"
                class="dropdown-uf"
              />
            </div>
          </div>
          
          <p v-if="index === 0" class="oab-info">Esta é a sua OAB principal, usaremos ela no plano Free.</p>
          
          <button 
            v-if="index > 0" 
            type="button" 
            class="btn-remover-oab" 
            @click="removerOAB(index)"
          >
            Remover
          </button>
        </div>

        <button type="button" class="btn-nova-oab" @click="adicionarOAB">
          <span class="icone-adicionar">+</span> Nova OAB
        </button>

        <div class="input-group">
          <label for="email">Seu melhor e-mail<span class="campo-obrigatorio">*</span></label>
          <Input 
            id="email"
            type="email"
            placeholder="Insira seu e-mail"
            v-model="email"
            @blur="verificarEmailDuplicado"
          />
        </div>
        
        <div class="input-group">
          <label for="nome-completo">Seu nome completo<span class="campo-obrigatorio">*</span></label>
          <Input 
            id="nome-completo"
            type="text"
            placeholder="Insira seu nome"
            v-model="nomeCompleto"
          >
            <template #icon>
              <User size="20" />
            </template>
          </Input>
        </div>
        
        <div class="input-group">
          <label for="cpf">Número do seu CPF<span class="campo-obrigatorio">*</span></label>
          <Input 
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            v-model="cpf"
            @keydown="bloquearNaoNumericoCPF"
            @input="validarEntradaCPF"
            @blur="verificarCPFDuplicado"
            maxlength="14"
          >
            <template #icon>
              <FileText size="20" />
            </template>
          </Input>
        </div>
        
        <div class="input-group">
          <label for="telefone">Número de telefone<span class="campo-obrigatorio">*</span></label>
          <Input 
            id="telefone"
            type="text"
            placeholder="(00) 00000-0000"
            v-model="telefone"
            @keydown="bloquearNaoNumericoTelefone"
            @input="validarEntradaTelefone"
            maxlength="15"
          >
            <template #icon>
              <Smartphone size="20" />
            </template>
          </Input>
        </div>
        
        <div class="botoes">
          <Button 
            type="outline" 
            label="Voltar" 
            @click="etapaAnterior"
            class="btn-voltar"
            :disabled="isLoading"
            buttonType="button"
          />
          <Button 
            type="primary" 
            :label="isVerificandoOAB ? 'Verificando OABs...' : 'Próximo'" 
            @click="proximaEtapa"
            class="btn-proximo"
            :disabled="isLoading || isVerificandoOAB"
          />
        </div>

        <p class="campos-obrigatorios">* São campos obrigatórios</p>
      </form>

      <!-- Etapa 2 do formulário -->
      <form v-if="etapaAtual === 2" class="formulario" @submit.prevent="concluirCadastro">
        <h2 class="subtitulo">Crie uma senha<span class="campo-obrigatorio">*</span></h2>
        
        <div class="input-group senha-group">
          <Input 
            id="senha"
            type="password"
            placeholder="Insira sua senha"
            v-model="senha"
          >
            <template #icon>
              <Lock size="20" />
            </template>
          </Input>

        </div>
        
        <h2 class="subtitulo">Confirme a senha<span class="campo-obrigatorio">*</span></h2>
        <div class="input-group senha-group">
          <Input 
            id="confirmar-senha"
            type="password"
            placeholder="Confirme sua senha"
            v-model="confirmarSenha"
          >
            <template #icon>
              <Lock size="20" />
            </template>
          </Input>

        </div>
        
        <!-- Requisitos de senha -->
        <div class="requisitos-senha">
          <div class="requisito" :class="{ 'requisito-atendido': senhasSaoIguais }">
            <span class="icone-requisito">
              <CheckCircle v-if="senhasSaoIguais" size="16" />
              <XCircle v-else size="16" />
            </span>
            <span class="texto-requisito">As senhas são iguais</span>
          </div>
          <div class="requisito" :class="{ 'requisito-atendido': temMinimo6Caracteres }">
            <span class="icone-requisito">
              <CheckCircle v-if="temMinimo6Caracteres" size="16" />
              <XCircle v-else size="16" />
            </span>
            <span class="texto-requisito">Contém no mínimo 6 caracteres</span>
          </div>
          <div class="requisito" :class="{ 'requisito-atendido': temNumero }">
            <span class="icone-requisito">
              <CheckCircle v-if="temNumero" size="16" />
              <XCircle v-else size="16" />
            </span>
            <span class="texto-requisito">Contém pelo menos 1 número</span>
          </div>
          <div class="requisito" :class="{ 'requisito-atendido': temLetraMaiuscula }">
            <span class="icone-requisito">
              <CheckCircle v-if="temLetraMaiuscula" size="16" />
              <XCircle v-else size="16" />
            </span>
            <span class="texto-requisito">Contém pelo menos uma letra maiúscula</span>
          </div>
          <div class="requisito" :class="{ 'requisito-atendido': temCaractereEspecial }">
            <span class="icone-requisito">
              <CheckCircle v-if="temCaractereEspecial" size="16" />
              <XCircle v-else size="16" />
            </span>
            <span class="texto-requisito">Contém pelo menos 1 caractere especial (#,%,~...)</span>
          </div>
        </div>
        
        <div class="termos-container">
          <label for="aceite-termos" class="termos-label-completa">
            <div class="custom-checkbox">
              <input 
                type="checkbox" 
                id="aceite-termos" 
                class="checkbox-input" 
                v-model="aceitouTermos"
              />
              <span class="checkbox-custom"></span>
            </div>
            <span class="checkbox-text">
              Declaro que li e aceito os 
              <a href="#" class="link-termos" @click.stop>termos de uso e política de privacidade</a>.
            </span>
          </label>
        </div>
        
        <div class="botoes">
          <Button 
            type="outline" 
            label="Voltar" 
            @click="etapaAnterior"
            class="btn-voltar"
            :disabled="isLoading"
            buttonType="button"
          />
          <Button 
            type="primary" 
            :label="isLoading ? 'Processando...' : 'Concluir'" 
            @click="concluirCadastro"
            class="btn-concluir"
            :disabled="!podeFinalizarCadastro"
          />
        </div>
        
        <!-- Mensagem sobre requisitos para habilitar o botão -->
        <div v-if="!podeFinalizarCadastro && !isLoading" class="requisitos-finalizacao">
          <p class="texto-requisitos">
            Para concluir o cadastro:
            <span v-if="!senhaValida" class="requisito-pendente">
              <CheckCircle size="16" class="icone-requisito-pendente" />
              Complete todos os requisitos de senha
            </span>
            <span v-if="!aceitouTermos" class="requisito-pendente">
              <CheckCircle size="16" class="icone-requisito-pendente" />
              Aceite os termos de uso
            </span>
          </p>
        </div>
        
        <p class="campos-obrigatorios">* São campos obrigatórios</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.lado-esq.formulario {
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.lado-esquerdo {
  width: 50%;
  background-color: #FFFFFF;
  padding: 40px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.logo-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
}

.logo {
  width: 214px;
  height: 64.28px;
  object-fit: contain;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 500px;
}

.header-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  width: 100%;
  max-width: 360px;
  height: 76px;
}

.titulo {
  font-size: 36px;
  font-weight: 700;
  color: #333333;
  margin: 0;
  padding-bottom: 4px;
  font-family: 'Inter', sans-serif;
  text-align: left;
  line-height: 1;
}

.etapas-indicador {
  width: 290px;
  margin-bottom: 0;
}

.etapa-texto {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 6px;
  display: block;
  line-height: 1.2;
}

.barra-progresso {
  height: 6px;
  background-color: #E4E7EC;
  border-radius: 3px;
  overflow: hidden;
}

.barra-progresso-preenchida {
  height: 100%;
  background-color: #0052FF;
  transition: width 0.3s ease;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Inter', sans-serif;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 360px;
  height: 76px;
}

.input-group label {
  font-size: 14px;
  color: #344054;
  font-family: 'Inter', sans-serif;
  text-align: left;
}

.oab-fields {
  width: 360px;
  margin-bottom: 16px;
}

.oab-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  width: 360px;
}

.oab-label, .uf-label, .input-group label {
  font-size: 14px;
  font-weight: 500;
  color: #344054;
  font-family: 'Inter', sans-serif;
}

.oab-label {
  margin-left: 2px;
}

.uf-label {
  margin-right: 8px;
}

.oab-inputs {
  display: flex;
  gap: 16px;
  width: 360px;
  height: 48px;
}

.oab-info {
  font-size: 12px;
  color: #667085;
  margin-top: 4px;
  margin-bottom: 0;
  margin-left: 2px;
  text-align: left;
}

.btn-remover-oab {
  background: none;
  border: none;
  color: #D92D20;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-top: 8px;
  text-align: left;
  font-family: 'Inter', sans-serif;
  display: block;
  width: 100%;
  margin-left: 0;
}

.oab-numero {
  flex: 3;
}

.oab-uf {
  flex: 1;
}

.dropdown-uf {
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.dropdown-uf :deep(.dropdown-container) {
  max-width: 100%;
  font-family: 'Inter', sans-serif;
}

.dropdown-uf :deep(.dropdown-header) {
  padding: 10px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 16px;
  color: #344054;
  background-color: white;
  font-family: 'Inter', sans-serif;
  height: 44px;
  cursor: pointer;
  font-weight: 500;
}

.btn-nova-oab {
  background: none;
  border: none;
  color: #0468FA;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  margin-bottom: 16px;
  width: fit-content;
  font-family: 'Inter', sans-serif;
}

.icone-adicionar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: white;
  color: #0052FF;
  border: 1px solid #0052FF;
  border-radius: 2px;
  margin-right: 8px;
  font-size: 12px;
  line-height: 1;
  font-weight: bold;
}

.campo-obrigatorio {
  color: #D92D20;
  font-family: 'Inter', sans-serif;
}

.botoes {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  width: 360px;
}

.btn-voltar, .btn-proximo, .btn-concluir {
  width: 176px;
  height: 44px;
  font-family: 'Inter', sans-serif;
}

.campos-obrigatorios {
  font-size: 12px;
  color: #667085;
  margin-top: 16px;
  font-family: 'Inter', sans-serif;
  text-align: left;
}

.subtitulo {
  font-size: 16px;
  font-weight: 600;
  color: #101828;
  margin-bottom: 8px;
  text-align: left;
}

.senha-group {
  position: relative;
}

.senha-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

.requisitos-senha {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.requisito {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #D92D20;
}

.requisito-atendido {
  color: #039855;
}

.icone-requisito {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.termos-container {
  margin-top: 16px;
}

.termos-label-completa {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-top: 3px;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 16px;
  width: 16px;
  z-index: 2;
  margin: 0;
}

.checkbox-custom {
  position: absolute;
  top: 0;
  left: 0;
  height: 16px;
  width: 16px;
  background-color: white;
  border: 1px solid #D0D5DD;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.checkbox-input:checked ~ .checkbox-custom {
  background-color: #0468FA;
  border-color: #0468FA;
}

.checkbox-input:hover ~ .checkbox-custom {
  border-color: #0468FA;
}

.checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-input:checked ~ .checkbox-custom:after {
  display: block;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-size: 14px;
  color: #475467;
  text-align: left;
  line-height: 1.4;
}

.link-termos {
  color: #0468FA;
  text-decoration: none;
}

.link-termos:hover {
  text-decoration: underline;
}

.requisitos-finalizacao {
  margin-top: 16px;
  text-align: left;
}

.texto-requisitos {
  font-size: 14px;
  color: #667085;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.requisito-pendente {
  color: #D92D20;
  font-size: 13px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icone-requisito-pendente {
  color: #D92D20;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .lado-esquerdo {
    width: 100%;
    padding: 16px;
    min-height: 100vh;
    height: auto;
    max-height: none;
    justify-content: flex-start;
    box-sizing: border-box;
    overflow-y: visible;
    overflow: visible;
  }
  
  .logo-container {
    margin-bottom: 20px;
    margin-top: 8px;
  }
  
  .logo {
    width: 160px;
    height: auto;
    max-height: 48px;
  }
  
  .form-container {
    max-width: 100%;
    width: 100%;
    height: auto;
    max-height: none;
    overflow: visible;
    flex: none;
  }
  
  .header-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    height: auto;
    margin-bottom: 20px;
    max-width: 100%;
  }
  
  .titulo {
    font-size: 28px;
    margin-bottom: 0;
  }
  
  .etapas-indicador {
    width: 100%;
    max-width: 100%;
  }
  
  .formulario {
    gap: 16px;
  }
  
  .input-group {
    width: 100%;
    max-width: 100%;
    height: auto;
    margin-bottom: 4px;
  }
  
  .oab-fields {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .oab-labels {
    width: 100%;
  }
  
  .oab-inputs {
    width: 100%;
  }
  
  .botoes {
    flex-direction: column-reverse;
    gap: 12px;
    width: 100%;
    margin-top: 20px;
  }
  
  .btn-voltar, .btn-proximo, .btn-concluir {
    width: 100%;
    max-width: 100%;
    height: 48px;
  }
  
  .campos-obrigatorios {
    text-align: center;
    margin-top: 12px;
  }
  
  .requisitos-senha {
    margin-top: 12px;
    gap: 6px;
  }
  
  .termos-container {
    margin-top: 12px;
    align-items: flex-start;
  }
  
  .checkbox-label {
    font-size: 13px;
    line-height: 1.4;
  }
  
  /* Garantir espaço no final para scroll completo */
  .formulario {
    padding-bottom: 60px;
  }
}
</style>
