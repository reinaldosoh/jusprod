<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Input from '../../components/UI/Input.vue';
import Button from '../../components/UI/Button.vue';
import AlertaErro from '../../components/UI/AlertaErro.vue';
import { supabase } from '../../lib/supabase';
import { translateError } from '../../utils/errorTranslator';
import { authService } from '../../services/authService';

const router = useRouter();
const route = useRoute();
const email = ref('');
const errorMessage = ref('');
const errorTitulo = ref('Erro na recuperação de senha');
const isLoading = ref(false);
const successMessage = ref('');
const mostrarErro = ref(false);
const contadorTempo = ref(0);
const mostrarContador = ref(false);
const mostrarAlternativa = ref(false);
const intervalo = ref(null);

// Verificar se há um email na URL e preencher o campo
onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email;
  }
});

const emits = defineEmits(['voltar', 'enviado']);

async function handleEnviarEmail() {
  if (!email.value) {
    errorTitulo.value = 'Campo obrigatório';
    errorMessage.value = 'Por favor, informe seu e-mail para recuperar a senha';
    mostrarErro.value = true;
    return;
  }
  
  try {
    isLoading.value = true;
    mostrarErro.value = false;
    
    // Usar o serviço de autenticação para enviar o email de redefinição de senha
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await authService.resetPassword(email.value, redirectUrl);
    
    if (error) throw error;
    
    // Mostrar mensagem de sucesso
    successMessage.value = 'Um e-mail de recuperação de senha foi enviado para ' + email.value;
    
    // Iniciar contador de 30 segundos
    contadorTempo.value = 30;
    mostrarContador.value = true;
    
    // Configurar intervalo para atualizar o contador a cada segundo
    intervalo.value = setInterval(() => {
      contadorTempo.value--;
      if (contadorTempo.value <= 0) {
        clearInterval(intervalo.value);
        mostrarContador.value = false;
      }
    }, 1000);
    
    // Emitir evento para o componente pai
    emits('enviado', { email: email.value });
    
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    
    // Verificar o tipo de erro retornado pelo serviço
    if (error.type === 'email_recovery') {
      errorTitulo.value = 'Falha no envio do email';
      errorMessage.value = error.message;
      
      // Mesmo com erro, mostrar uma mensagem alternativa
      successMessage.value = 'Tente novamente em alguns instantes ou use a opção alternativa abaixo.';
      
      // Mostrar a opção alternativa para ambiente de desenvolvimento
      mostrarAlternativa.value = true;
    } else {
      errorTitulo.value = 'Erro na recuperação de senha';
      errorMessage.value = error.message || 'Não foi possível enviar o e-mail de recuperação';
    }
    
    mostrarErro.value = true;
  } finally {
    isLoading.value = false;
  }
}

function handleReenviar() {
  if (contadorTempo.value <= 0) {
    handleEnviarEmail();
  }
}

function handleVoltar() {
  // Usar o Vue Router para navegar de volta para a página de login
  router.push({ name: 'login' });
}

// Limpar o intervalo quando o componente for desmontado
onBeforeUnmount(() => {
  if (intervalo.value) {
    clearInterval(intervalo.value);
  }
});

// Fechar alerta de erro
function fecharAlertaErro() {
  mostrarErro.value = false;
}

// Simular o redirecionamento para a página de redefinição de senha
function handleSimularResetSenha() {
  if (!email.value) {
    errorTitulo.value = 'Campo obrigatório';
    errorMessage.value = 'Por favor, informe seu e-mail para simular a recuperação de senha';
    mostrarErro.value = true;
    return;
  }
  
  // Redirecionar para a página de redefinição de senha com um token simulado
  const token = 'simulado_' + Math.random().toString(36).substring(2, 15);
  router.push({
    path: '/reset-password',
    query: {
      email: email.value,
      token: token
    }
  });
}
</script>

<template>
  <div class="lado-esquerdo">
    <div class="container">
      <div class="logo-container">
        <img src="/images/logotipo.png" alt="Logo Jusprod" class="logo" />
      </div>
      
      <div class="texto-intro">
        <p>Por favor, informe o e-mail cadastrado que nós iremos enviar um link para redefinição de senha.</p>
      </div>
      
      <h1 class="titulo">Esqueci a senha</h1>
      
      <div class="formulario">
        <div class="input-group">
          <label for="email">e-mail</label>
          <Input 
            id="email"
            v-model="email"
            type="email"
            placeholder="Digite seu e-mail"
            :disabled="isLoading || mostrarContador"
          />
        </div>
        
        <div v-if="mostrarErro">
                  <AlertaErro 
          :titulo="errorTitulo" 
          :mensagem="errorMessage" 
          @fechar="fecharAlertaErro"
        />
        </div>
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <div class="botoes">
          <div class="contador" v-if="mostrarContador">
            <div class="icone-email">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#0468FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 6L12 13L2 6" stroke="#0468FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p>Nós enviamos um e-mail para {{ email }}</p>
            <p class="texto-spam">Confira também a sua caixa de spam.</p>
            <p class="contador-texto">{{ contadorTempo }}s</p>
          </div>
          
          <Button 
            v-if="!mostrarContador"
            type="primary" 
            :label="isLoading ? 'Enviando...' : 'Enviar'" 
            @click="handleEnviarEmail"
            class="btn-enviar"
            :fullWidth="true"
            :disabled="isLoading"
          />
          
          <Button 
            v-else
            type="outline" 
            :label="contadorTempo > 0 ? `Reenviar (${contadorTempo}s)` : 'Reenviar e-mail'" 
            @click="handleReenviar"
            class="btn-reenviar"
            :fullWidth="true"
            :disabled="contadorTempo > 0"
          />
          
          <!-- Opção alternativa para ambiente de desenvolvimento -->
          <div v-if="mostrarAlternativa" class="alternativa-container">
            <div class="alternativa-box">
              <h3 class="alternativa-titulo">Problemas com o envio de email?</h3>
              <p class="alternativa-texto">Em ambiente de desenvolvimento, você pode simular o processo de recuperação de senha:</p>
              <button 
                @click="handleSimularResetSenha" 
                class="btn-alternativa"
              >
                Simular link de recuperação
              </button>
            </div>
          </div>
          
          <div class="voltar-container">
            <button class="btn-voltar" @click="handleVoltar">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8332 10H4.1665" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.99984 15.8334L4.1665 10.0001L9.99984 4.16675" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lado-esquerdo {
  width: 50%;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
}

.lado-esquerdo p {
  font-size: 16px;
  font-family: 'Inter', sans-serif;
}

.container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
}

.logo-container {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-start;
}

.logo {
  width: 214px;
  height: 64.28px;
}

.texto-intro {
  margin-bottom: 24px;
  color: #475467;
  line-height: 1.5;
  text-align: left;
}

.texto-intro p {
  font-size: 16px;
  font-family: 'Inter', sans-serif;
}

.titulo {
  font-size: 32px;
  font-weight: 600;
  color: #101828;
  margin-bottom: 32px;
  text-align: left;
  font-family: 'Inter', sans-serif;
}

.formulario {
  width: 100%;
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #344054;
  text-align: left;
  font-family: 'Inter', sans-serif;
}

.botoes {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
}

.btn-enviar, .btn-reenviar {
  height: 44px;
}

.voltar-container {
  display: flex;
  justify-content: flex-start;
  margin-top: 24px;
}

.btn-voltar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #475467;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-voltar:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.success-message {
  color: #2e7d32;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: rgba(46, 125, 50, 0.1);
  border-radius: 6px;
  width: 100%;
  text-align: left;
}

.contador {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background-color: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 16px;
}

.icone-email {
  width: 48px;
  height: 48px;
  background-color: rgba(4, 104, 250, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.texto-spam {
  font-size: 12px;
  color: #667085;
  text-align: left;
}

.contador-texto {
  font-size: 14px;
  font-weight: 600;
  color: #344054;
  text-align: left;
}

.alternativa-container {
  margin-top: 16px;
  margin-bottom: 16px;
}

.alternativa-box {
  padding: 16px;
  background-color: #FEF7E6;
  border: 1px solid #FEDF89;
  border-radius: 8px;
}

.alternativa-titulo {
  font-size: 16px;
  font-weight: 600;
  color: #B54708;
  margin-bottom: 8px;
  text-align: left;
}

.alternativa-texto {
  font-size: 14px;
  color: #93370D;
  margin-bottom: 16px;
  text-align: left;
}

.btn-alternativa {
  background-color: #F79009;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-alternativa:hover {
  background-color: #DC6803;
}

@media (max-width: 768px) {
  .lado-esquerdo {
    width: 100%;
  }
}
</style>
