<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import MenuFixo from '../../components/UI/MenuFixo.vue';

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
})
</script>

<template>
  <div>
    <MenuFixo />
  </div>
</template>


