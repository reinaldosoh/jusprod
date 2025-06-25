<script setup>
import { ref, onMounted } from 'vue'
import Button from './Button.vue'
import { supabase } from '../../lib/supabase'

// Props para controlar a visibilidade do modal
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits para comunicação com componente pai
const emit = defineEmits(['close', 'upgrade', 'not-now'])

// Estado para dados do plano
const limitePlano = ref(60) // valor padrão

// Carregar limite do plano do usuário
const carregarLimitePlano = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return
    }

    // Buscar plano do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('role_atual')
      .eq('uuid', user.id)
      .single()

    if (userError) {
      return
    }

    // Definir limites por plano
    const limitesPorPlano = {
      free: 5,
      silver: 45,
      gold: 150,
      platinum: 350
    }

    const plano = userData.role_atual || 'free'
    limitePlano.value = limitesPorPlano[plano] || 5
  } catch (error) {
    console.error('Erro ao carregar limite do plano:', error)
  }
}

const handleClose = () => {
  emit('close')
}

const handleUpgrade = () => {
  emit('upgrade')
}

const handleNotNow = () => {
  emit('not-now')
}

// Carregar dados quando o componente montar
onMounted(() => {
  carregarLimitePlano()
})
</script>

<template>
  <div v-if="show" class="upgrade-overlay">
    <div class="upgrade-container">
      <!-- Tarja azul superior -->
      <div class="upgrade-header">
        <h2 class="upgrade-title">Upgrade</h2>
      </div>
      
      <!-- Conteúdo principal -->
      <div class="upgrade-content">
        <!-- Imagem -->
        <div class="upgrade-image">
          <img src="/images/upgrade.png" alt="Upgrade" />
        </div>
        
        <!-- Texto principal -->
        <div class="upgrade-text">
          <h3 class="upgrade-main-title">Parabéns! Você chegou no limite do plano atual.</h3>
          <p class="upgrade-subtitle">O seu plano atual tem limite para monitorar até {{ limitePlano }} processos.</p>
          
          <p class="upgrade-description">
            Ficamos felizes em saber que o seu escritório está crescendo,<br>
            selecione o plano que atende o seu momento atual.
          </p>
        </div>
        
        <!-- Botões -->
        <div class="upgrade-buttons">
          <Button 
            label="Agora não" 
            type="outline" 
            :full-width="false"
            @click="handleNotNow"
          />
          <Button 
            label="Ver planos" 
            type="primary" 
            :full-width="false"
            @click="handleUpgrade"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upgrade-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.upgrade-container {
  width: 647px;
  height: 550px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.upgrade-header {
  width: 647px;
  height: 35px;
  background: #0468FA;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upgrade-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.upgrade-content {
  padding: 30px 40px 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: calc(550px - 35px);
  box-sizing: border-box;
  justify-content: space-between;
}

.upgrade-image {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.upgrade-image img {
  width: 300px;
  height: auto;
  max-width: 100%;
}

.upgrade-text {
  margin-bottom: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
}

.upgrade-main-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.upgrade-subtitle {
  font-size: 16px;
  font-weight: 400;
  color: #374151;
  margin: 0 0 20px 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.upgrade-description {
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  margin: 0;
  line-height: 1.5;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.upgrade-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-shrink: 0;
  margin-top: auto;
}

.upgrade-buttons :deep(.button) {
  width: 176px;
  height: 44px;
}

/* Responsivo para telas menores */
@media (max-width: 768px) {
  .upgrade-container {
    width: 90vw;
    height: auto;
    max-width: 647px;
    margin: 20px;
  }
  
  .upgrade-header {
    width: 100%;
  }
  
  .upgrade-content {
    padding: 30px 20px;
    height: auto;
  }
  
  .upgrade-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .upgrade-buttons :deep(.button) {
    width: 100%;
  }
}
</style> 