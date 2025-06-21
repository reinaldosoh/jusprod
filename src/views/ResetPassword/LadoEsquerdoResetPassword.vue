<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Input from '../../components/UI/Input.vue';
import Button from '../../components/UI/Button.vue';
import AlertaErro from '../../components/UI/AlertaErro.vue';
import { supabase } from '../../lib/supabase';
import { translateError } from '../../utils/errorTranslator';
import { authService } from '../../services/authService';

const emit = defineEmits(['voltar']);

const route = useRoute();
const router = useRouter();
const senha = ref('');
const confirmarSenha = ref('');
const errorMessage = ref('');
const errorTitulo = ref('Erro na redefinição de senha');
const successMessage = ref('');
const isLoading = ref(false);
const mostrarErro = ref(false);
const email = ref('');
const token = ref('');
const isTokenSimulado = ref(false);

onMounted(() => {
  // Verificar se temos um token na URL (parâmetros de consulta ou hash)
  if (route.query.token) {
    token.value = route.query.token;
    email.value = route.query.email || '';
    
    // Verificar se é um token simulado
    isTokenSimulado.value = token.value.startsWith('simulado_');
    
    if (isTokenSimulado.value) {
      console.log('Modo de simulação de redefinição de senha ativado');
    }
  } else {
    // Verificar se há um hash na URL (formato antigo do Supabase)
    const url = new URL(window.location.href);
    if (url.hash) {
      token.value = url.hash;
    } else {
      // Se não houver token, redirecionar para a página de login
      errorTitulo.value = 'Link inválido';
      errorMessage.value = 'Link de redefinição de senha inválido ou expirado';
      mostrarErro.value = true;
      setTimeout(() => {
        handleVoltar();
      }, 3000);
    }
  }
});

async function handleResetPassword() {
  // Validações básicas
  if (!senha.value || !confirmarSenha.value) {
    errorTitulo.value = 'Campos obrigatórios';
    errorMessage.value = 'Por favor, preencha todos os campos';
    mostrarErro.value = true;
    return;
  }
  
  if (senha.value !== confirmarSenha.value) {
    errorTitulo.value = 'Senhas diferentes';
    errorMessage.value = 'As senhas não coincidem';
    mostrarErro.value = true;
    return;
  }
  
  if (senha.value.length < 6) {
    errorTitulo.value = 'Senha inválida';
    errorMessage.value = 'A senha deve ter pelo menos 6 caracteres';
    mostrarErro.value = true;
    return;
  }
  
  try {
    isLoading.value = true;
    mostrarErro.value = false;
    errorMessage.value = '';
    
    // Verificar se estamos no modo de simulação
    if (isTokenSimulado.value) {
      // Simular o processo de atualização de senha
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay de rede
      
      successMessage.value = 'Senha atualizada com sucesso! (Modo de simulação)';
      
      // Redirecionar para o login após alguns segundos
      setTimeout(() => {
        handleVoltar();
      }, 3000);
      
      return;
    }
    
    // Caso real: atualizar a senha usando o token da URL
    const { error } = await supabase.auth.updateUser({
      password: senha.value
    });
    
    if (error) throw error;
    
    successMessage.value = 'Senha atualizada com sucesso!';
    
    // Redirecionar para o login após alguns segundos
    setTimeout(() => {
      handleVoltar();
    }, 3000);
    
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    errorTitulo.value = 'Erro na redefinição de senha';
    errorMessage.value = translateError(error.message) || 'Falha ao redefinir senha. Tente novamente.';
    mostrarErro.value = true;
  } finally {
    isLoading.value = false;
  }
}

function handleVoltar() {
  emit('voltar');
}

function fecharAlertaErro() {
  mostrarErro.value = false;
}
</script>

<template>
  <div class="lado-esquerdo">
    <div class="form-container">
      <div class="logo-container">
        <img src="/images/logotipo.png" alt="Jusprod" class="logo" />
      </div>
      
      <h1 class="titulo">Redefinir senha</h1>
      <p class="subtitulo">Digite sua nova senha abaixo</p>
      
      <AlertaErro 
        v-if="mostrarErro" 
        :titulo="errorTitulo" 
        :mensagem="errorMessage" 
        @fechar="mostrarErro = false"
      />
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <div v-if="isTokenSimulado" class="simulacao-message">
        <strong>Modo de simulação:</strong> Você está usando um token simulado para testar o fluxo de redefinição de senha.
      </div>
      
      <form class="formulario" @submit.prevent="handleResetPassword">
        <div class="input-group">
          <label for="senha">Nova senha</label>
          <Input 
            id="senha"
            type="password"
            placeholder="Digite sua nova senha"
            v-model="senha"
          />
        </div>
        
        <div class="input-group">
          <label for="confirmarSenha">Confirmar senha</label>
          <Input 
            id="confirmarSenha"
            type="password"
            placeholder="Confirme sua nova senha"
            v-model="confirmarSenha"
          />
        </div>
        
        <div class="botoes">
          <Button 
            type="outline" 
            label="Voltar" 
            @click="handleVoltar"
            class="btn-voltar"
            :disabled="isLoading"
          />
          <Button 
            type="primary" 
            :label="isLoading ? 'Processando...' : 'Confirmar'" 
            @click="handleResetPassword"
            class="btn-confirmar"
            :disabled="isLoading"
          />
        </div>
      </form>
      
      <div class="voltar-container">
        <button class="btn-voltar-texto" @click="handleVoltar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8332 10H4.1665" stroke="#475467" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.99984 15.8334L4.1665 10.0001L9.99984 4.16675" stroke="#475467" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Voltar para o login
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lado-esquerdo {
  width: 50%;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px;
}

.lado-esquerdo p {
  font-size: 16px;
  font-family: 'Inter', sans-serif;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.logo-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
}

.logo {
  height: 48px;
}

.titulo {
  font-size: 24px;
  font-weight: 600;
  color: #101828;
  text-align: left;
  margin-bottom: 8px;
}

.subtitulo {
  font-size: 16px;
  color: #475467;
  text-align: left;
  margin-bottom: 32px;
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

.simulacao-message {
  color: #b45309;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  width: 100%;
  text-align: left;
}

.formulario {
  width: 100%;
}

.input-group {
  margin-bottom: 16px;
  width: 100%;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #344054;
  margin-bottom: 6px;
  text-align: left;
}

.botoes {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  width: 100%;
}

.btn-voltar, .btn-confirmar {
  flex: 1;
}

.voltar-container {
  display: flex;
  justify-content: flex-start;
  margin-top: 24px;
}

.btn-voltar-texto {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #475467;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.btn-voltar-texto:hover {
  background-color: #f9fafb;
}

@media (max-width: 768px) {
  .lado-esquerdo {
    width: 100%;
    padding: 24px 16px;
  }
  
  .botoes {
    flex-direction: column-reverse;
    gap: 12px;
  }
  
  .btn-voltar, .btn-confirmar {
    width: 100%;
    max-width: 100%;
  }
}
</style>
