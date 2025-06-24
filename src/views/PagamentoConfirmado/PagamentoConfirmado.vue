<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); padding: 24px;">
    <div style="max-width: 400px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 32px; text-align: center;">
      
      <!-- Loading state -->
      <div v-if="isProcessingOnboarding" style="margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; animation: spin 1s linear infinite;">
          ⟳
        </div>
        <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin: 16px 0 8px 0;">
          Preparando sua conta...
        </h1>
        <p style="color: #6b7280; margin-bottom: 24px;">
          Estamos buscando seus processos. Isso pode levar alguns minutos.
        </p>
        <div style="background: #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #1e40af;">
            {{ onboardingStatus }}
          </p>
        </div>
      </div>

      <!-- Success state -->
      <div v-else>
        <!-- Ícone de sucesso -->
        <div style="margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
            ✓
          </div>
        </div>

        <!-- Título -->
        <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 8px;">
          {{ onboardingCompleted ? 'Conta configurada com sucesso!' : 'Pagamento Confirmado!' }}
        </h1>

        <!-- Mensagem -->
        <p style="color: #6b7280; margin-bottom: 24px;">
          {{ onboardingCompleted 
            ? `Encontramos ${processosEncontrados} processos em ${oabsProcessadas} OAB(s). Bem-vindo ao Jusprod!`
            : 'Seu pagamento foi processado com sucesso. Bem-vindo ao Jusprod!'
          }}
        </p>

        <!-- Informações adicionais -->
        <div style="background: #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #1e40af;">
            Você receberá um e-mail de confirmação em breve com os detalhes da sua assinatura.
          </p>
        </div>

        <!-- Botão para continuar -->
        <button 
          @click="irParaDashboard"
          style="width: 100%; background: #2563eb; color: white; padding: 12px 16px; border-radius: 8px; border: none; font-weight: 500; cursor: pointer; transition: background 0.2s;"
          onmouseover="this.style.background='#1d4ed8'"
          onmouseout="this.style.background='#2563eb'"
        >
          Ir para o Dashboard
        </button>

        <!-- Link para suporte -->
        <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
          Precisa de ajuda? 
          <a href="mailto:suporte@jusprod.com" style="color: #2563eb; text-decoration: none;">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const isProcessingOnboarding = ref(false)
const onboardingCompleted = ref(false)
const onboardingStatus = ref('Verificando dados da assinatura...')
const processosEncontrados = ref(0)
const oabsProcessadas = ref(0)

const irParaDashboard = () => {
  router.push('/dashboard')
}

const executarOnboarding = async () => {
  try {
    isProcessingOnboarding.value = true
    onboardingStatus.value = 'Buscando dados do usuário...'

    // Obter dados do usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Usuário não autenticado:', authError)
      onboardingStatus.value = 'Erro: usuário não autenticado'
      return
    }

    onboardingStatus.value = 'Buscando suas OABs registradas...'

    // Chamar a edge function para buscar processos (ela vai buscar todas as OABs do usuário)
    const { data, error } = await supabase.functions.invoke('cadastro_processos', {
      body: {
        userUuid: user.id
      }
    })

    if (error) {
      console.error('Erro na edge function:', error)
      onboardingStatus.value = `Erro: ${error.message}`
      return
    }

    console.log('Onboarding concluído:', data)
    processosEncontrados.value = data.processosInseridos || 0
    oabsProcessadas.value = data.oabsProcessadas || 0
    onboardingCompleted.value = true
    
  } catch (error) {
    console.error('Erro no onboarding:', error)
    onboardingStatus.value = `Erro: ${error.message}`
  } finally {
    isProcessingOnboarding.value = false
  }
}

onMounted(async () => {
  // Verificar se tem o parâmetro assinaturarealizadasucesso
  const assinaturaRealizada = route.query.assinaturarealizadasucesso
  
  if (assinaturaRealizada === 'true') {
    console.log('Iniciando processo de onboarding...')
    await executarOnboarding()
  }
})
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 