<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Input from '../../components/UI/Input.vue'
import Button from '../../components/UI/Button.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'

const router = useRouter()
const route = useRoute()

// Estados do formulário
const codigo = ref('')
const codigoArray = ref(['', '', '', '', '', ''])
const codigoRefs = ref([])
const isLoading = ref(false)
const contador = ref(30)
const podeReenviar = ref(false)
const emailUsuario = ref('')

// Estados dos alertas
const mostrarErro = ref(false)
const errorTitulo = ref('')
const errorMessage = ref('')

// Controle do timer
let intervalTimer = null

// Computed para verificar se pode validar
const podeValidar = computed(() => {
  return codigo.value.length === 6 && !isLoading.value
})

// Iniciar countdown
function iniciarCountdown() {
  podeReenviar.value = false
  contador.value = 30
  
  if (intervalTimer) {
    clearInterval(intervalTimer)
  }
  
  intervalTimer = setInterval(() => {
    contador.value--
    if (contador.value <= 0) {
      clearInterval(intervalTimer)
      podeReenviar.value = true
    }
  }, 1000)
}

// Função para validar código
async function validarCodigo() {
  if (!podeValidar.value) return
  
  isLoading.value = true
  
  try {
    console.log('🔍 Validando código:', codigo.value)
    
    const { supabase } = await import('../../lib/supabase.js')
    
    // Chamar Edge Function para validar código
    const { data, error } = await supabase.functions.invoke('validar-codigo-email', {
      body: { 
        email: emailUsuario.value, 
        codigo: codigo.value 
      }
    })
    
    console.log('📥 Resposta da Edge Function:', { data, error })
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error)
      console.error('❌ Detalhes do erro:', error.context || error.details || error)
      throw new Error(error.message || 'Erro ao validar código')
    }
    
    if (!data || !data.success) {
      console.error('❌ Resposta inválida da Edge Function:', data)
      throw new Error(data?.error || 'Erro desconhecido na validação')
    }
    
    console.log('✅ Código validado com sucesso:', data)
    
    // Se chegou até aqui, código válido - redirecionar para dashboard
    router.push({ name: 'dashboard' })
    
  } catch (error) {
    console.error('❌ Erro ao validar código:', error)
    console.error('❌ Tipo do erro:', typeof error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
    
    errorTitulo.value = 'Código inválido'
    
    // Mapear erros específicos
    if (error.message) {
      if (error.message.includes('expirado')) {
        errorMessage.value = 'Código expirado. Solicite um novo código.'
      } else if (error.message.includes('incorreto')) {
        errorMessage.value = 'Código incorreto. Verifique e tente novamente.'
      } else if (error.message.includes('não encontrado')) {
        errorMessage.value = 'Usuário não encontrado.'
      } else if (error.message.includes('non-2xx status code')) {
        errorMessage.value = 'Erro no servidor. Tente novamente.'
      } else {
        errorMessage.value = error.message
      }
    } else {
      errorMessage.value = 'O código informado não confere. Verifique e tente novamente.'
    }
    
    mostrarErro.value = true
  } finally {
    isLoading.value = false
  }
}

// Função para reenviar código
async function reenviarCodigo() {
  if (!podeReenviar.value) return
  
  try {
    console.log('📤 Reenviando código...')
    
    const { supabase } = await import('../../lib/supabase.js')
    
    // Buscar usuário pelo email para pegar o UUID
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('uuid')
      .eq('email', emailUsuario.value)
      .single()
    
    if (userError || !userData) {
      throw new Error('Usuário não encontrado')
    }
    
    // Chamar Edge Function para verificar status e reenviar email
    const { data, error } = await supabase.functions.invoke('verificar-status-email', {
      body: { userUuid: userData.uuid }
    })
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error)
      throw new Error(error.message || 'Erro ao reenviar código')
    }
    
    console.log('✅ Código reenviado com sucesso')
    // Limpar formulário
    codigo.value = ''
    codigoArray.value = ['', '', '', '', '', '']
    
    // Limpar os inputs visuais também
    for (let i = 0; i < 6; i++) {
      if (codigoRefs.value[i]) {
        codigoRefs.value[i].value = ''
      }
    }
    
    iniciarCountdown()
    
  } catch (error) {
    console.error('❌ Erro ao reenviar código:', error)
    errorTitulo.value = 'Erro no reenvio'
    errorMessage.value = error.message || 'Não foi possível reenviar o código. Tente novamente.'
    mostrarErro.value = true
  }
}

// Função para voltar
function voltar() {
  router.push({ name: 'login' })
}

// Funções para lidar com inputs de código separados
function handleDigitoInput(index, event) {
  const valor = event.target.value
  
  // Apenas números
  const numerico = valor.replace(/\D/g, '')
  
  // Permitir apenas 1 dígito por campo
  if (numerico.length > 1) {
    event.target.value = numerico.slice(-1) // Pega apenas o último dígito
    codigoArray.value[index] = numerico.slice(-1)
  } else {
    event.target.value = numerico
    codigoArray.value[index] = numerico
  }
  
  // Atualizar código completo
  codigo.value = codigoArray.value.join('')
  
  // Mover para próximo input se digitou algo
  if (numerico && index < 5) {
    codigoRefs.value[index + 1]?.focus()
  }
}

function handleKeyDown(index, event) {
  // Backspace - voltar para input anterior
  if (event.key === 'Backspace' && !codigoArray.value[index] && index > 0) {
    codigoRefs.value[index - 1]?.focus()
  }
  
  // Setas para navegar
  if (event.key === 'ArrowLeft' && index > 0) {
    codigoRefs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index < 5) {
    codigoRefs.value[index + 1]?.focus()
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text')
  const numerico = pastedData.replace(/\D/g, '').slice(0, 6)
  
  // Preencher os inputs
  for (let i = 0; i < 6; i++) {
    codigoArray.value[i] = numerico[i] || ''
    // Atualizar o valor visual do input também
    if (codigoRefs.value[i]) {
      codigoRefs.value[i].value = numerico[i] || ''
    }
  }
  
  codigo.value = numerico
  
  // Focar no próximo input vazio ou no último
  const nextEmpty = codigoArray.value.findIndex(d => !d)
  const focusIndex = nextEmpty !== -1 ? nextEmpty : 5
  codigoRefs.value[focusIndex]?.focus()
}

// Fechar alerta de erro
function fecharAlertaErro() {
  mostrarErro.value = false
}

onMounted(() => {
  // Pegar email da query string
  emailUsuario.value = route.query.email || '[Email]'
  iniciarCountdown()
  mostrarErro.value = false
  errorTitulo.value = ''
  errorMessage.value = ''
})

onUnmounted(() => {
  if (intervalTimer) {
    clearInterval(intervalTimer)
  }
})
</script>

<template>
  <div class="lado-esquerdo">
    <div class="logo-container">
      <img src="/images/logotipo.png" alt="Jusprod" class="logo" />
    </div>

    <div class="form-container">
      <div class="descricao">
        <p>
          Acabamos de enviar um email para <strong>{{ emailUsuario }}</strong>. Copie e cole abaixo o <strong>código que enviamos no seu email</strong> e ative o seu cadastro na <strong class="jusprod-highlight">Jusprod</strong>.
        </p>
        <p>Verifique também a sua caixa de spam.</p>
        <p>
          Você tem <strong>14 dias para aproveitar</strong> todos os benefícios da Plataforma <strong>totalmente grátis</strong>.
        </p>
        <p>
          A qualquer momento selecione o plano que melhor se adequa ao seu momento profissional.
        </p>
      </div>
      
      <h1 class="titulo">Código de verificação</h1>

      <form @submit.prevent="validarCodigo" class="formulario">
        <div class="input-group">
          <p class="codigo-instrucao">Insira o código de 6 dígitos</p>
          
          <div class="codigo-inputs">
            <input 
              v-for="(digito, index) in codigoArray" 
              :key="index"
              :ref="el => codigoRefs[index] = el"
              type="text"
              maxlength="1"
              class="codigo-input"
              :value="digito"
              @input="handleDigitoInput(index, $event)"
              @keydown="handleKeyDown(index, $event)"
              @paste="handlePaste($event)"
            />
          </div>
        </div>

        <div class="opcoes-codigo">
          <div class="timer-container">
            <span class="timer">{{ String(Math.floor(contador / 60)).padStart(2, '0') }}:{{ String(contador % 60).padStart(2, '0') }}</span>
            <p class="reenvio-texto" v-if="!podeReenviar">
              Seu código não confere, <button 
                type="button" 
                class="link-reenvio disabled" 
                disabled
              >verifique seu e-mail</button>.
            </p>
          </div>
        </div>
        
        <div v-if="mostrarErro">
          <AlertaErro 
            :titulo="errorTitulo" 
            :mensagem="errorMessage" 
            @fechar="fecharAlertaErro"
          />
        </div>

        <div class="botoes">
          <Button 
            v-if="podeReenviar"
            type="outline" 
            label="Reenviar código" 
            @click="reenviarCodigo"
            class="btn-reenviar"
            :fullWidth="true"
            :disabled="isLoading"
            buttonType="button"
          />
          <Button 
            type="primary" 
            :label="isLoading ? 'Validando...' : 'Validar'" 
            @click="validarCodigo"
            class="btn-validar"
            :fullWidth="true"
            :disabled="!podeValidar"
          />
        </div>
      </form>

      <div class="termos">
        <Button
          type="link"
          label="← Voltar"
          @click="voltar"
          class="btn-voltar"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lado-esquerdo {
  width: 50%;
  padding: 40px;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100vh;
  box-sizing: border-box;
  justify-content: center;
}

@media (max-width: 768px) {
  .lado-esquerdo {
    width: 100%;
    padding: 0;
    justify-content: flex-start;
    height: auto;
    min-height: 100vh;
    gap: 4px;
    align-items: stretch;
  }
  
  .form-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: none;
    margin-top: 0;
    padding: 0 16px;
    box-sizing: border-box;
  }
  
  .descricao {
    text-align: left;
    margin-bottom: 12px;
    max-width: 100%;
    padding: 0;
    font-size: 16px;
    line-height: 1.6;
  }
  
  .titulo {
    text-align: left;
    margin-bottom: 16px;
    font-size: 22px;
    width: 100%;
  }
  
  .logo-container {
    text-align: left;
    margin-bottom: 12px;
    margin-top: 0;
  }
  
  .logo {
    margin: 0;
    width: 160px;
    height: auto;
    max-height: 48px;
  }
  
  .termos {
    text-align: center;
    margin-top: 16px;
    width: 100%;
  }
  
  .opcoes-codigo {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}

.logo-container {
  margin-bottom: 16px;
  text-align: left;
}

.logo {
  width: 215px;
  height: 64.58px;
  display: block;
  object-fit: contain;
}

.descricao {
  margin-bottom: 16px;
  color: #475467;
  font-size: 14px;
  line-height: 1.5;
  max-width: 400px;
  text-align: left;
}

.jusprod-highlight {
  color: #0468FA;
  font-weight: 700;
}

.titulo {
  font-size: 24px;
  font-weight: 600;
  color: #101828;
  margin-bottom: 20px;
  text-align: left;
}

.formulario {
  width: 100%;
  max-width: 360px;
  margin-top: 0;
}

@media (max-width: 768px) {
  .formulario {
    max-width: 100%;
    width: 100%;
  }
  
  .input-group {
    margin-bottom: 16px;
    width: 100%;
  }
}

.input-group {
  margin-bottom: 16px;
}

.codigo-instrucao {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #475467;
  margin-bottom: 16px;
}

.codigo-inputs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 16px;
}

.codigo-input {
  width: 3rem;
  height: 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  background: white;
  color: #101828;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.codigo-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.codigo-input:hover {
  border-color: #9ca3af;
}

.opcoes-codigo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
}

.timer-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timer {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #475467;
}

.reenvio-texto {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #475467;
  margin: 0;
}

.link-reenvio {
  background: none;
  border: none;
  color: #F97316;
  text-decoration: underline;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
}

.link-reenvio.disabled {
  color: #9CA3AF;
  cursor: not-allowed;
}

.botoes {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  width: 100%;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .botoes {
    flex-direction: column-reverse;
    gap: 12px;
    width: 100%;
    align-items: stretch;
  }
  
  .btn-validar {
    margin-bottom: 8px;
  }
  
  .btn-reenviar, .btn-validar {
    width: 100%;
    max-width: 100%;
    flex: none;
  }
}

.btn-reenviar, .btn-validar {
  flex: 1;
}

@media (min-width: 769px) {
  .btn-reenviar, .btn-validar {
    max-width: 170px;
  }
}

.termos {
  margin-top: 40px;
  font-size: 12px;
  color: #667085;
  text-align: left;
  width: 100%;
}

.btn-voltar {
  color: #475467;
  font-size: 14px;
  padding: 0;
}

@media (max-width: 480px) {
  .codigo-inputs {
    gap: 0.25rem;
  }
  
  .codigo-input {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
}
</style> 