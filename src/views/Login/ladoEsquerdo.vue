<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Input from '../../components/UI/Input.vue';
import Button from '../../components/UI/Button.vue';
import AlertaErro from '../../components/UI/AlertaErro.vue';
import { supabase } from '../../lib/supabase';
import { translateError } from '../../utils/errorTranslator';
import { authService } from '../../services/authService';

const router = useRouter();
const email = ref('');
const senha = ref('');
const permanecerConectado = ref(false);
const errorTitulo = ref('Erro de autenticação');
const errorMessage = ref('');
const isLoading = ref(false);
const successMessage = ref('');
const mostrarErro = ref(false);

const emits = defineEmits(['login', 'cadastrar', 'esqueci-senha']);

// Garantir que nenhum erro seja exibido ao montar o componente
onMounted(() => {
  mostrarErro.value = false;
  errorTitulo.value = '';
  errorMessage.value = '';
});

async function handleLogin() {
  if (!email.value || !senha.value) {
    errorTitulo.value = 'Campos obrigatórios';
    errorMessage.value = 'Por favor, preencha todos os campos';
    mostrarErro.value = true;
    return;
  }
  
  try {
    isLoading.value = true;
    mostrarErro.value = false;
    
    // Login com Supabase usando o serviço de autenticação
    const { data, error } = await authService.signIn(
      email.value,
      senha.value,
      permanecerConectado.value // Passar a preferência do usuário para manter-se conectado
    );
    
    if (error) throw error;
    
    // Login bem-sucedido
    successMessage.value = 'Login realizado com sucesso!';
    console.log('Usuário autenticado:', data.user);
    
    // Emitir evento para componente pai
    emits('login', { 
      email: email.value, 
      senha: senha.value, 
      permanecerConectado: permanecerConectado.value,
      user: data.user
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    errorTitulo.value = 'Erro de autenticação';
    errorMessage.value = translateError(error.message) || 'Falha na autenticação. Verifique suas credenciais.';
    mostrarErro.value = true;
  } finally {
    isLoading.value = false;
  }
}

function handleCadastrar() {
  // Simplesmente navegar para a página de cadastro
  router.push({ name: 'cadastro' });
}

function handleEsqueciSenha() {
  // Apenas redirecionar para a página de recuperação de senha
  // Se o email estiver preenchido, passá-lo como query parameter
  if (email.value) {
    router.push({ name: 'esqueciSenha', query: { email: email.value } });
  } else {
    router.push({ name: 'esqueciSenha' });
  }
  
  // Emitir evento para componente pai (opcional)
  emits('esqueci-senha', { email: email.value });
}

// Função para fechar o alerta de erro
function fecharAlertaErro() {
  mostrarErro.value = false;
  errorTitulo.value = '';
  errorMessage.value = '';
}
</script>

<template>
  <div class="lado-esquerdo">
    <div class="logo-container">
      <img src="/images/logotipo.png" alt="Jusprod" class="logo" />
    </div>

    <div class="form-container">
      <div class="descricao">
        <p>
          <strong class="jusprod-highlight">Jusprod</strong> é uma plataforma feita por advogados para advogados.
          Nós entendemos as dores e necessidades do seu dia-a-dia e
          estamos prontos para ajudar a resolvê-las.
        </p>
      </div>
      
      <h1 class="titulo">Bem-vindo</h1>

      <form @submit.prevent="handleLogin" class="formulario">
        <div class="input-group">
          <Input 
            label="e-mail" 
            type="email" 
            v-model="email"
            placeholder=""
          />
        </div>

        <div class="input-group">
          <Input 
            label="Senha" 
            type="password" 
            v-model="senha"
            placeholder=""
          />
        </div>

        <div class="opcoes-login">
          <div class="checkbox-container">
            <input 
              type="checkbox" 
              id="permanecerConectado" 
              v-model="permanecerConectado"
              class="checkbox"
            />
            <label for="permanecerConectado" class="checkbox-label">Permanecer conectado</label>
          </div>

          <a href="#" class="esqueci-senha" @click.prevent="handleEsqueciSenha">Esqueci a senha</a>
        </div>
        
        <div v-if="mostrarErro">
          <AlertaErro 
            :titulo="errorTitulo" 
            :mensagem="errorMessage" 
            @click="fecharAlertaErro"
          />
        </div>
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div class="botoes">
          <Button 
            type="outline" 
            label="Cadastrar" 
            @click="handleCadastrar"
            class="btn-cadastrar"
            :fullWidth="true"
            :disabled="isLoading"
            buttonType="button"
          />
          <Button 
            type="primary" 
            :label="isLoading ? 'Entrando...' : 'Entrar'" 
            @click="handleLogin"
            class="btn-entrar"
            :fullWidth="true"
            :disabled="isLoading"
          />
        </div>
      </form>

      <div class="termos">
        <p>Consultar os <a href="#" class="link-termos">termos de uso</a> e <a href="#" class="link-termos">política de privacidade</a>.</p>
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
  
  .opcoes-login {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .checkbox-label {
    font-size: 13px;
  }
  
  .esqueci-senha {
    font-size: 13px;
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

.opcoes-login {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
}

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #0468FA;
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
  border: 1px solid #D0D5DD;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.checkbox:checked {
  background-color: #0468FA;
  border-color: #0468FA;
}

.checkbox:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 14px;
  color: #475467;
}

.esqueci-senha {
  font-size: 14px;
  color: #0468FA;
  text-decoration: none;
}

.esqueci-senha:hover {
  text-decoration: underline;
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
  
  .btn-entrar {
    margin-bottom: 8px;
  }
  
  .btn-cadastrar, .btn-entrar {
    width: 100%;
    max-width: 100%;
    flex: none;
  }
}

.btn-cadastrar, .btn-entrar {
  flex: 1;
}

@media (min-width: 769px) {
  .btn-cadastrar, .btn-entrar {
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

.link-termos {
  color: #0468FA;
  text-decoration: none;
}

.link-termos:hover {
  text-decoration: underline;
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
</style>
