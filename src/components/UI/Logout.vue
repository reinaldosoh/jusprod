<template>
  <div class="logout-modal-overlay" v-if="visible">
    <div class="logout-modal">
      <!-- Ícone e título -->
      <div class="logout-header">
        <div class="logout-icon">
          <LogOut color="#F04438" size="24" />
        </div>
        <div class="logout-title">
          <h2>Sair da plataforma?</h2>
          <p>Você está prestes da sair da plataforma, para entrar novamente deverá digitar e-mail e senha.</p>
        </div>
        <button class="close-button" @click="fechar">
          <X size="24" />
        </button>
      </div>

      <!-- Mensagem de confirmação -->
      <div class="logout-message">
        <p>Tem certeza que deseja fazer isso?</p>
      </div>

      <!-- Botões -->
      <div class="logout-buttons">
        <Button 
          label="Cancelar" 
          type="outline" 
          buttonType="button"
          :disabled="loading"
          @click="fechar"
        />
        <Button 
          :label="loading ? 'Saindo...' : 'Sair'"
          buttonType="button"
          :disabled="loading"
          :style="{ 
            backgroundColor: '#F04438', 
            borderColor: '#F04438',
            color: 'white'
          }"
          @click="confirmarSaida"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { LogOut, X } from 'lucide-vue-next';
import Button from './Button.vue';
import { logoutService } from '../../services/logoutService';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['fechar', 'confirmar']);
const router = useRouter();
const loading = ref(false);

const fechar = () => {
  if (!loading.value) {
    emit('fechar');
  }
};

const confirmarSaida = async () => {
  try {
    loading.value = true;
    
    // Fazer logout usando o serviço
    await logoutService.logout();
    
    // Fechar o modal
    emit('fechar');
    
    // Redirecionar para login
    router.push('/login');
    
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    alert('Erro ao fazer logout. Tente novamente.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.logout-modal {
  width: 544px;
  min-height: 213px;
  background-color: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

.logout-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
}

.logout-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(240, 68, 56, 0.1);
  border-radius: 50%;
  margin-right: 16px;
  flex-shrink: 0;
}

.logout-title {
  flex-grow: 1;
}

.logout-title h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.logout-title p {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
  line-height: 1.5;
}

.close-button {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  padding: 0;
}

.close-button:hover {
  color: #111827;
}

.logout-message {
  margin: 16px 0;
  text-align: left;
  margin-left: 64px; /* Alinha com o texto da descrição (48px do ícone + 16px do gap) */
}

.logout-message p {
  font-size: 14px;
  color: #6B7280;
  font-weight: 400;
  margin: 0;
  line-height: 1.5;
}

.logout-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
}

.logout-buttons > :deep(.button) {
  width: 176px;
  height: 44px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 0;
}

@media (max-width: 768px) {
  .logout-modal {
    width: calc(100vw - 32px);
    max-width: 500px;
    margin: 16px;
  }
  
  .logout-message {
    margin-left: 0; /* Remove o alinhamento no mobile */
    text-align: left;
  }
  
  .logout-buttons {
    justify-content: stretch;
    flex-direction: column;
  }
  
  .logout-buttons > :deep(.button) {
    width: 100%;
    height: 48px;
    font-size: 15px;
  }
}
</style>
