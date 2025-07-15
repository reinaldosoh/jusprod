<template>
  <div class="dados-container">
    <!-- Seção: Dados do Usuário -->
    <div class="section">
      <div class="section-header">
        <h2>{{ dadosUsuario.nome }}</h2>
        <div class="header-actions">
          <button class="edit-button" @click="editarUsuario('nome')">
            <img src="/images/iconEditar.svg" alt="Editar" />
          </button>
          <button class="copy-button" @click="copiarDados(dadosUsuario.nome)">
            Copiar dados
          </button>
        </div>
      </div>
      
      <div class="field-item">
        <span class="field-label">Data de nascimento:</span>
        <span class="field-value">{{ formatarData(dadosUsuario.data_nascimento) }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">CPF:</span>
        <span class="field-value">{{ dadosUsuario.cpf || '-' }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">OAB:</span>
                 <div class="oab-list">
           <span v-for="oab in dadosOAB" :key="oab.id" class="oab-item">
             {{ oab.OAB_num }} {{ oab.OAB_uf }}
           </span>
           <span v-if="dadosOAB.length === 0" class="field-value">-</span>
         </div>
      </div>
      
      <div class="field-item">
        <span class="field-label">Whatsapp:</span>
        <span class="field-value">{{ dadosUsuario.whatsapp || '-' }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">Email:</span>
        <span class="field-value">{{ dadosUsuario.email || '-' }}</span>
      </div>
    </div>

    <!-- Seção: Dados do Escritório -->
    <div class="section">
      <div class="section-header">
        <h2>{{ dadosEscritorio.nome_escritorio || 'Advocacia' }}</h2>
        <div class="header-actions">
          <button class="edit-button" @click="editarUsuario('escritorio')">
            <img src="/images/iconEditar.svg" alt="Editar" />
          </button>
          <button class="copy-button" @click="copiarDados(formatarDadosEscritorio())">
            Copiar dados
          </button>
        </div>
      </div>
      
      <div class="field-item">
        <span class="field-label">Criação da conta:</span>
        <span class="field-value">{{ formatarData(dadosUsuario.created_at) }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">{{ dadosEscritorio.site || 'https://jusprod.com.br' }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">Imagem:</span>
        <span class="field-value">png</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">Rua:</span>
        <span class="field-value">{{ dadosEscritorio.rua || '-' }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">Número:</span>
        <span class="field-value">{{ dadosEscritorio.numero || '-' }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">Bairro:</span>
        <span class="field-value">{{ dadosEscritorio.bairro || '-' }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">Cidade:</span>
        <span class="field-value">{{ dadosEscritorio.cidade || '-' }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">Estado:</span>
        <span class="field-value">{{ dadosEscritorio.estado || '-' }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">CEP:</span>
        <span class="field-value">{{ dadosEscritorio.cep || '-' }}</span>
      </div>
      
      <div class="field-item">
        <span class="field-label">Logotipo:</span>
        <div class="logotipo-actions">
          <button class="view-button" @click="debugEVisualizarLogotipo()">
            <img src="/images/iconvisualizar.svg" alt="Visualizar" />
            Visualizar
          </button>
        </div>
      </div>
    </div>

    <!-- Seção: Dados de Login e Pagamento -->
    <div class="section">
      <h2>Dados de login e pagamento</h2>
      
      <div class="field-item">
        <span class="field-label">e-mail:</span>
        <span class="field-value">{{ dadosUsuario.email || '-' }}</span>
        <button class="edit-button-inline" @click="editarUsuario('email')">
          <img src="/images/iconEditar.svg" alt="Editar" />
        </button>
      </div>
      
      <div class="field-item">
        <span class="field-label">Senha:</span>
        <span class="field-value">***********</span>
        <button class="edit-button-inline" @click="editarUsuario('senha')">
          <img src="/images/iconEditar.svg" alt="Editar" />
        </button>
      </div>
      
      <div class="account-actions">
        <button class="action-button excluir" @click="excluirConta">
          Excluir
        </button>
        <span class="action-separator">ou</span>
        <button class="action-button inativar" @click="inativarConta">
          Inativar conta
        </button>
      </div>
    </div>
  </div>
  
  <!-- Componente para edição de dados do usuário -->
  <EditarUsuario 
    :isVisible="mostrarEditarUsuario" 
    :dadosIniciais="{
      nome: dadosUsuario.nome,
      cpf: dadosUsuario.cpf,
      data_nascimento: dadosUsuario.data_nascimento,
      whatsapp: dadosUsuario.whatsapp
    }"
    @fechar="mostrarEditarUsuario = false"
    @atualizado="atualizarDadosUsuario"
  />
  
  <!-- Componente para edição de dados do escritório -->
  <CadastroEscritorio
    :isVisible="mostrarEditarEscritorio"
    :modoEdicao="true"
    :dadosEscritorio="dadosEscritorio"
    @fechar="mostrarEditarEscritorio = false"
    @escritorio-salvo="atualizarDadosEscritorio"
    @erro="handleErro"
  />
  
  <!-- Componente para visualização do logotipo -->
  <VisualizarLogotipo
    :isVisible="mostrarVisualizarLogotipo"
    :urlLogotipo="logotipoUrl"
    @fechar="mostrarVisualizarLogotipo = false"
  />
  
  <!-- Componente para atualização de email -->
  <AtualizarEmail
    :isVisible="mostrarAtualizarEmail"
    @fechar="mostrarAtualizarEmail = false"
    @salvar="atualizarEmail"
  />
  
  <!-- Componente para atualização de senha -->
  <AtualizarSenha
    :isVisible="mostrarAtualizarSenha"
    @fechar="mostrarAtualizarSenha = false"
    @salvar="atualizarSenha"
  />

  <!-- Alertas -->
  <AlertaSucesso 
    v-if="mostrarAlertaSucesso"
    :mensagem="mensagemAlerta"
    @fechar="fecharAlertaSucesso"
  />

  <AlertaErro 
    v-if="mostrarAlertaErro"
    :titulo="tituloErro"
    :mensagem="mensagemAlerta"
    @fechar="fecharAlertaErro"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../../lib/supabase'
import EditarUsuario from './editar_usuario.vue'
import CadastroEscritorio from './cadastro_escritorio.vue'
import VisualizarLogotipo from './visualizar_logotipo.vue'
import AtualizarEmail from './atualizar_email.vue'
import AtualizarSenha from './atualizar_senha.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'

const emit = defineEmits([
  'abrir-cadastro-escritorio',
  'visualizar-logotipo',
  'editar-usuario',
  'copiar-dados',
  'excluir-conta',
  'inativar-conta'
])

// Estados reativos
const dadosUsuario = ref({
  nome: '',
  data_nascimento: '',
  cpf: '',
  whatsapp: '',
  email: '',
  created_at: ''
})

const dadosEscritorio = ref({
  nome_escritorio: '',
  site: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  url_logotipo: ''
})

const dadosOAB = ref([])

// Função para buscar dados do usuário
const buscarDadosUsuario = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Buscar dados do usuário na tabela usuario
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuario')
      .select('*')
      .eq('uuid', user.id)
      .single()

    if (errorUsuario) throw errorUsuario

    dadosUsuario.value = {
      nome: usuario.nome || '',
      data_nascimento: usuario.data_nascimento || '',
      cpf: usuario.cpf || '',
      whatsapp: usuario.whatsapp || '',
      email: usuario.email || user.email || '',
      created_at: usuario.created_at || ''
    }

    // Verificar se há email pendente de confirmação
    await verificarStatusEmail()

    // Buscar dados do escritório
    const { data: escritorio, error: errorEscritorio } = await supabase
      .from('escritorio')
      .select('*')
      .eq('uuid', user.id)
      .single()

    if (!errorEscritorio && escritorio) {
      dadosEscritorio.value = {
        nome_escritorio: escritorio.nome_escritorio || '',
        site: escritorio.site || '',
        rua: escritorio.rua || '',
        numero: escritorio.numero || '',
        bairro: escritorio.bairro || '',
        cidade: escritorio.cidade || '',
        estado: escritorio.estado || '',
        cep: escritorio.cep || '',
        url_logotipo: escritorio.url_logotipo || ''
      }
    }

    // Buscar dados de OAB
    const { data: oabs, error: errorOAB } = await supabase
      .from('OAB')
      .select('*')
      .eq('uuid', user.id)

    if (!errorOAB && oabs) {
      dadosOAB.value = oabs
    }

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
  }
}

// Função para formatar data
const formatarData = (dataString) => {
  if (!dataString) return '-'
  
  const data = new Date(dataString)
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Função para formatar dados do escritório para cópia
const formatarDadosEscritorio = () => {
  const endereco = [
    dadosEscritorio.value.rua,
    dadosEscritorio.value.numero,
    dadosEscritorio.value.bairro,
    dadosEscritorio.value.cidade,
    dadosEscritorio.value.estado,
    dadosEscritorio.value.cep
  ].filter(item => item && item.trim()).join(', ')

  return `${dadosEscritorio.value.nome_escritorio}\n${dadosEscritorio.value.site}\n${endereco}`
}

// Estados dos modais
const mostrarEditarUsuario = ref(false)
const mostrarEditarEscritorio = ref(false)
const mostrarVisualizarLogotipo = ref(false)
const mostrarAtualizarEmail = ref(false)
const mostrarAtualizarSenha = ref(false)
const logotipoUrl = ref('')

// Estados dos alertas
const mostrarAlertaSucesso = ref(false)
const mostrarAlertaErro = ref(false)
const mensagemAlerta = ref('')
const tituloErro = ref('Erro')

// Funções de interação
const editarUsuario = (tipo) => {
  if (tipo === 'nome') {
    mostrarEditarUsuario.value = true
  } else if (tipo === 'escritorio') {
    console.log('Abrindo modal de edição do escritório com dados:', dadosEscritorio.value)
    // Primeiro garantir que temos os dados mais recentes
    buscarDadosUsuario().then(() => {
      // Após ter certeza que os dados foram carregados, abrir o modal
      setTimeout(() => {
        mostrarEditarEscritorio.value = true
      }, 100)
    })
  } else if (tipo === 'email') {
    mostrarAtualizarEmail.value = true
  } else if (tipo === 'senha') {
    mostrarAtualizarSenha.value = true
  }
}

const debugEVisualizarLogotipo = () => {
  // Mostrar todos os dados do escritório para debug
  console.log('Dados completos do escritório:', dadosEscritorio.value)
  console.log('URL do logotipo:', dadosEscritorio.value.url_logotipo)
  console.log('Tipo da URL do logotipo:', typeof dadosEscritorio.value.url_logotipo)
  
  // Teste direto com uma URL fictícia para verificar se o problema está na URL ou no componente
  const urlTeste = 'https://placekitten.com/200/100';
  
  console.log('Testando com URL fictícia:', urlTeste)
  console.log('URL teste tipo:', typeof urlTeste)
  
  // Forçar visualização do modal com URL de teste se não houver URL do logotipo
  const urlParaUsar = dadosEscritorio.value.url_logotipo || urlTeste;
  
  visualizarLogotipo(urlParaUsar);
}

const visualizarLogotipo = (url) => {
  console.log('Função visualizarLogotipo chamada com URL:', url)
  console.log('Estado atual de mostrarVisualizarLogotipo:', mostrarVisualizarLogotipo.value)
  
  // Forçar variável reativa a ser false antes de definir como true
  // Isso ajuda a garantir que o Vue detecte a mudança de estado
  mostrarVisualizarLogotipo.value = false
  
  // Usar setTimeout para garantir que a mudança de estado seja aplicada
  setTimeout(() => {
    if (url) {
      logotipoUrl.value = url
      mostrarVisualizarLogotipo.value = true
      console.log('mostrarVisualizarLogotipo definido como true, logotipoUrl:', logotipoUrl.value)
    } else {
      console.log('URL do logotipo não fornecida')
      handleErro('Não há logotipo disponível para visualização')
    }
  }, 50) // Pequeno delay para garantir que o DOM foi atualizado
}

const copiarDados = (dados) => {
  emit('copiar-dados', dados)
}

const excluirConta = () => {
  emit('excluir-conta')
}

const inativarConta = () => {
  emit('inativar-conta')
}

// Atualizar dados do usuário após edição
const atualizarDadosUsuario = (novosDados) => {
  dadosUsuario.value = {
    ...dadosUsuario.value,
    ...novosDados
  }
  
  // Recarregar todos os dados para garantir consistência
  buscarDadosUsuario()
}

// Atualizar dados do escritório após edição
const atualizarDadosEscritorio = (novosDados) => {
  dadosEscritorio.value = {
    ...dadosEscritorio.value,
    ...novosDados
  }
  
  // Recarregar todos os dados para garantir consistência
  buscarDadosUsuario()
}

// Lidar com erros
const handleErro = (mensagem) => {
  tituloErro.value = 'Erro'
  mensagemAlerta.value = mensagem
  mostrarAlertaErro.value = true
}

// Lidar com atualização de email
const atualizarEmail = async (dados) => {
  try {
    console.log('Iniciando atualização de email:', { 
      novoEmail: dados.novoEmail,
      confirmarEmail: dados.confirmarEmail 
    })
    
    // Importar o serviço de atualização de email
    const { emailUpdateService } = await import('../../services/emailUpdateService')
    
    // Chamar o serviço para atualizar o email
    const resultado = await emailUpdateService.atualizarEmail({
      novoEmail: dados.novoEmail,
      confirmarEmail: dados.confirmarEmail,
      senhaAtual: dados.senhaAtual
    })
    
    if (resultado.success) {
      // Fechar o modal
      mostrarAtualizarEmail.value = false
      
      // Mostrar mensagem de sucesso
      mensagemAlerta.value = resultado.message
      mostrarAlertaSucesso.value = true
      
      // Iniciar verificação periódica para sincronizar email após confirmação
      iniciarVerificacaoEmailConfirmado()
      
      console.log('✅ Solicitação de mudança de email enviada:', resultado.data)
    } else {
      // Mostrar mensagem de erro
      tituloErro.value = 'Erro na atualização'
      mensagemAlerta.value = resultado.message
      mostrarAlertaErro.value = true
      console.error('❌ Erro na atualização:', resultado.message)
    }
    
  } catch (error) {
    console.error('Erro ao atualizar email:', error)
    tituloErro.value = 'Erro interno'
    mensagemAlerta.value = 'Erro interno: ' + error.message
    mostrarAlertaErro.value = true
  }
}

// Verificação periódica para sincronizar email após confirmação
let intervalVerificacaoEmail = null

const iniciarVerificacaoEmailConfirmado = () => {
  // Limpar intervalo anterior se existir
  if (intervalVerificacaoEmail) {
    clearInterval(intervalVerificacaoEmail)
  }
  
  console.log('🔄 Iniciando verificação periódica de email confirmado...')
  
  // Verificar a cada 30 segundos por até 10 minutos
  let tentativas = 0
  const maxTentativas = 20 // 20 * 30s = 10 minutos
  
  intervalVerificacaoEmail = setInterval(async () => {
    tentativas++
    
    try {
      const { emailUpdateService } = await import('../../services/emailUpdateService')
      const resultado = await emailUpdateService.verificarEAtualizarEmail()
      
      if (resultado.success && resultado.data.emailAtualizado) {
        console.log('✅ Email confirmado e sincronizado automaticamente!')
        
        // Parar verificação
        clearInterval(intervalVerificacaoEmail)
        intervalVerificacaoEmail = null
        
        // Recarregar dados do usuário
        await buscarDadosUsuario()
        
        // Mostrar notificação de sucesso
        mensagemAlerta.value = 'Email confirmado e atualizado com sucesso!'
        mostrarAlertaSucesso.value = true
        
        return
      }
      
      if (tentativas >= maxTentativas) {
        console.log('⏱️ Timeout da verificação de email. Parando verificação automática.')
        clearInterval(intervalVerificacaoEmail)
        intervalVerificacaoEmail = null
      }
      
    } catch (error) {
      console.error('Erro na verificação periódica:', error)
    }
  }, 30000) // 30 segundos
}

const pararVerificacaoEmailConfirmado = () => {
  if (intervalVerificacaoEmail) {
    clearInterval(intervalVerificacaoEmail)
    intervalVerificacaoEmail = null
    console.log('🛑 Verificação periódica de email parada')
  }
}

// Função para verificar status do email na inicialização
const verificarStatusEmail = async () => {
  try {
    const { emailUpdateService } = await import('../../services/emailUpdateService')
    const resultado = await emailUpdateService.verificarStatusEmail()
    
    if (resultado.success && resultado.data.aguardandoConfirmacao) {
      console.log('📧 Email pendente de confirmação detectado')
      console.log('Email Auth:', resultado.data.emailAuth)
      console.log('Email Tabela:', resultado.data.emailTabela)
      
      // Iniciar verificação automática
      iniciarVerificacaoEmailConfirmado()
    }
  } catch (error) {
    console.error('Erro ao verificar status do email:', error)
  }
}

// Função para verificar manualmente se o email foi confirmado
const verificarEmailConfirmado = async () => {
  try {
    const { emailUpdateService } = await import('../../services/emailUpdateService')
    const resultado = await emailUpdateService.verificarEAtualizarEmail()
    
    if (resultado.success) {
      if (resultado.data.emailAtualizado) {
        // Email foi confirmado e atualizado
        await buscarDadosUsuario()
        mensagemAlerta.value = 'Email confirmado e atualizado com sucesso!'
        mostrarAlertaSucesso.value = true
        
        // Parar verificação automática
        pararVerificacaoEmailConfirmado()
      } else {
        // Email ainda não foi confirmado
        mensagemAlerta.value = 'Email ainda não foi confirmado. Verifique sua caixa de entrada.'
        mostrarAlertaErro.value = true
      }
    } else {
      mensagemAlerta.value = resultado.message
      mostrarAlertaErro.value = true
    }
  } catch (error) {
    console.error('Erro ao verificar email:', error)
    mensagemAlerta.value = 'Erro ao verificar status do email'
    mostrarAlertaErro.value = true
  }
}

// Lidar com atualização de senha
const atualizarSenha = async (dados) => {
  try {
    console.log('Iniciando atualização de senha:', { 
      senhaAtual: '***',
      novaSenha: '***',
      repetirNovaSenha: '***'
    })
    
    // Importar o serviço de atualização de senha
    const { passwordUpdateService } = await import('../../services/passwordUpdateService')
    
    // Chamar o serviço para atualizar a senha
    const resultado = await passwordUpdateService.atualizarSenha({
      senhaAtual: dados.senhaAtual,
      novaSenha: dados.novaSenha,
      repetirNovaSenha: dados.repetirNovaSenha
    })
    
    if (resultado.success) {
      // Fechar o modal
      mostrarAtualizarSenha.value = false
      
      // Mostrar mensagem de sucesso
      mensagemAlerta.value = resultado.message
      mostrarAlertaSucesso.value = true
      
      console.log('Senha atualizada com sucesso:', resultado.data)
    } else {
      // Mostrar mensagem de erro
      tituloErro.value = 'Erro na atualização'
      mensagemAlerta.value = resultado.message
      mostrarAlertaErro.value = true
      console.error('Erro na atualização:', resultado.message)
    }
    
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    tituloErro.value = 'Erro interno'
    mensagemAlerta.value = 'Erro interno: ' + error.message
    mostrarAlertaErro.value = true
  }
}

// Funções para controlar alertas
const fecharAlertaSucesso = () => {
  mostrarAlertaSucesso.value = false
}

const fecharAlertaErro = () => {
  mostrarAlertaErro.value = false
}

// Lifecycle
onMounted(() => {
  buscarDadosUsuario()
})

onUnmounted(() => {
  // Parar verificação periódica de email quando o componente for desmontado
  pararVerificacaoEmailConfirmado()
})
</script>

<style scoped>
.dados-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.section {
  background: #ffffff;
  border-radius: 8px;
  padding: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #101828;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.edit-button:hover {
  background: #f3f4f6;
}

.edit-button img {
  width: 16px;
  height: 16px;
}

.copy-button {
  background: none;
  border: none;
  color: #0468FA;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.copy-button:hover {
  background: #f0f7ff;
}

.field-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  color: #374151;
  min-width: 120px;
}

.field-value {
  font-size: 0.875rem;
  color: #101828;
  font-weight: 400;
}

.oab-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.oab-item {
  font-size: 0.875rem;
  color: #101828;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.edit-button-inline {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  margin-left: 0.5rem;
}

.edit-button-inline:hover {
  background: #f3f4f6;
}

.edit-button-inline img {
  width: 16px;
  height: 16px;
}

.logotipo-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-button {
  background: none;
  border: none;
  color: #0468FA;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-button:hover {
  background: #f0f7ff;
}

.view-button img {
  width: 16px;
  height: 16px;
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-button.excluir {
  color: #dc2626;
}

.action-button.excluir:hover {
  background: #fef2f2;
}

.action-button.inativar {
  color: #0468FA;
}

.action-button.inativar:hover {
  background: #f0f7ff;
}

.action-separator {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Responsividade */
@media (max-width: 768px) {
  .dados-container {
    gap: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .field-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .field-label {
    min-width: auto;
    font-weight: 500;
  }
  
  .account-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style> 