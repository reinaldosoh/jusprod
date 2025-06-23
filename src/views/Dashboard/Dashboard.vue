<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';


const authStore = useAuthStore();
const router = useRouter();
const user = ref(null);

onMounted(async () => {
  try {
    // Aguarda a inicialização da autenticação se necessário
    if (authStore.loading) {
      while (authStore.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (!authStore.isAuthenticated()) {
      router.push({ name: 'login' });
      return;
    }
    
    user.value = authStore.user;
    
    // Limpar qualquer parâmetro de URL (upgrade, plano, periodo)
    if (window.location.search) {
      router.replace({ name: 'dashboard' });
    }
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
});

async function handleLogout() {
  try {
    await authStore.logout();
    router.push({ name: 'login' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}


</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <div class="logo-container">
        <img src="/images/logotipo.png" alt="Jusprod" class="logo" />
      </div>
      <div class="user-menu">
        <span class="user-email" v-if="user">{{ user.email }}</span>
        <button class="logout-button" @click="handleLogout">Sair</button>
      </div>
    </header>
    
    <main class="dashboard-content">
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="welcome-message">Bem-vindo ao Jusprod!</p>
      

      
      <div class="dashboard-cards">
        <div class="dashboard-card">
          <h2>Processos</h2>
          <p>Gerencie seus processos jurídicos</p>
        </div>
        
        <div class="dashboard-card">
          <h2>Clientes</h2>
          <p>Administre seus clientes</p>
        </div>
        
        <div class="dashboard-card">
          <h2>Agenda</h2>
          <p>Organize seus compromissos</p>
        </div>
        
        <div class="dashboard-card">
          <h2>Documentos</h2>
          <p>Acesse seus documentos</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f9fafb;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-email {
  color: #475467;
  font-size: 14px;
}

.logout-button {
  background-color: transparent;
  color: #0468FA;
  border: 1px solid #0468FA;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background-color: #f5f9ff;
}

.dashboard-content {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  color: #101828;
  margin-bottom: 8px;
}

.welcome-message {
  color: #475467;
  font-size: 16px;
  margin-bottom: 32px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.dashboard-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dashboard-card h2 {
  font-size: 18px;
  font-weight: 600;
  color: #101828;
  margin-bottom: 8px;
}

.dashboard-card p {
  color: #475467;
  font-size: 14px;
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 16px;
  }
  
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
}
</style>
