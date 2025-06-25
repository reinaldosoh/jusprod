<template>
  <div class="payment-container">
    <!-- Header moderno -->
    <header class="header">
      <div class="header-content">
        <img src="/images/logotipo.png" alt="Jusprod" class="logo" />
      </div>
    </header>

    <!-- Conteúdo principal -->
    <main class="main-content">
      
      <!-- Estado de Loading -->
      <div v-if="isProcessingOnboarding" class="loading-section">
        <!-- Animação de loading moderna -->
        <div class="loading-animation">
          <div class="spinner-container">
            <div class="spinner-outer"></div>
            <div class="spinner-inner">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Título elegante -->
        <h1 class="title">Configurando sua conta</h1>
        
        <!-- Status e progresso -->
        <div class="progress-section">
          <p class="status-text">{{ onboardingStatus }}</p>
          
          <!-- Barra de progresso moderna -->
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          
          <!-- Badge de progresso -->
          <div class="progress-badge">
            <div class="progress-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
            <span class="progress-text">{{ progressText }}</span>
          </div>
        </div>

        <!-- Card informativo -->
        <div class="info-card">
          <h3 class="info-title">O que estamos fazendo:</h3>
          <div class="info-list">
            <div class="info-item">
              <div class="info-dot"></div>
              <span>Verificando suas OABs cadastradas</span>
            </div>
            <div class="info-item">
              <div class="info-dot"></div>
              <span>Buscando processos na base do Escavador</span>
            </div>
            <div class="info-item">
              <div class="info-dot"></div>
              <span>Organizando e importando seus dados</span>
            </div>
          </div>
          <p class="info-note">
            Este processo pode levar alguns minutos dependendo da quantidade de processos encontrados.
          </p>
        </div>
      </div>

      <!-- Estado de Sucesso -->
      <div v-else class="success-section">
        <!-- Ícone de sucesso animado -->
        <div class="success-animation">
          <div class="success-circle">
            <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
        </div>

        <!-- Título de sucesso -->
        <h1 class="success-title">
          {{ onboardingCompleted ? 'Conta configurada com sucesso!' : 'Pagamento Confirmado!' }}
      </h1>

        <!-- Mensagem principal -->
        <p class="success-message">
          {{ onboardingCompleted 
            ? `Perfeito! Encontramos e importamos ${processosEncontrados} processos de ${oabsProcessadas} OAB(s). Sua conta está pronta para uso.`
            : 'Seu pagamento foi processado com sucesso. Bem-vindo ao Jusprod!'
          }}
      </p>

        <!-- Cards de estatísticas -->
        <div v-if="onboardingCompleted" class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-number">{{ processosEncontrados }}</div>
            <div class="stat-label">Processos importados</div>
          </div>
          <div class="stat-card green">
            <div class="stat-number">{{ oabsProcessadas }}</div>
            <div class="stat-label">OABs processadas</div>
          </div>
          <div class="stat-card purple">
            <div class="stat-number">100%</div>
            <div class="stat-label">Configuração completa</div>
          </div>
        </div>

        <!-- Card de próximos passos -->
        <div class="next-steps-card">
          <div class="next-steps-header">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <div>
              <p class="next-steps-title">Próximos passos:</p>
              <ul class="next-steps-list">
                <li>Você receberá um e-mail de confirmação em breve</li>
                <li>Seus processos já estão disponíveis no dashboard</li>
                <li>Configure alertas e notificações conforme necessário</li>
              </ul>
            </div>
          </div>
      </div>

        <!-- Botões de ação -->
        <div class="action-buttons">
          <button @click="irParaDashboard" class="btn-primary">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Acessar Dashboard
      </button>

          <button @click="irParaProcessos" class="btn-secondary">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Ver Meus Processos
          </button>
        </div>

        <!-- Suporte -->
        <div class="support-section">
          <p class="support-text">
        Precisa de ajuda? 
            <a href="mailto:suporte@jusprod.com" class="support-link">
              Entre em contato com nosso suporte
        </a>
      </p>
    </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const isProcessingOnboarding = ref(false)
const onboardingCompleted = ref(false)
const onboardingStatus = ref('Verificando dados da assinatura...')
const progressText = ref('Iniciando...')
const processosEncontrados = ref(0)
const oabsProcessadas = ref(0)
const currentStep = ref(0)

// Progresso calculado baseado no step atual
const progressPercentage = computed(() => {
  const steps = [
    { step: 0, progress: 10 },
    { step: 1, progress: 30 },
    { step: 2, progress: 60 },
    { step: 3, progress: 90 },
    { step: 4, progress: 100 }
  ]
  const current = steps.find(s => s.step === currentStep.value)
  return current ? current.progress : 0
})

const irParaDashboard = () => {
  router.push('/dashboard')
}

const irParaProcessos = () => {
  router.push('/processos')
}

const updateProgress = (step, status, progress) => {
  currentStep.value = step
  onboardingStatus.value = status
  progressText.value = progress
}

const executarOnboarding = async () => {
  try {
    isProcessingOnboarding.value = true
    
    updateProgress(0, 'Verificando dados da assinatura...', 'Conectando...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Obter dados do usuário autenticado
    updateProgress(1, 'Buscando dados do usuário...', 'Autenticando...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Usuário não autenticado:', authError)
      onboardingStatus.value = 'Erro: usuário não autenticado'
      return
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    updateProgress(2, 'Buscando suas OABs registradas...', 'Localizando OABs...')
    await new Promise(resolve => setTimeout(resolve, 1500))

    updateProgress(3, 'Importando processos do Escavador...', 'Processando dados...')

    // Chamar a edge function para buscar processos (ela fará a busca das OABs internamente)
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
    
    updateProgress(4, 'Finalizando configuração...', 'Quase pronto...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onboardingCompleted.value = true
    
  } catch (error) {
    console.error('Erro no onboarding:', error)
    onboardingStatus.value = `Erro: ${error.message}`
    progressText.value = 'Erro no processamento'
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
/* Reset e base */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.payment-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 3rem;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* Main content */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

/* Loading Section */
.loading-section {
  text-align: center;
}

.loading-animation {
  margin-bottom: 3rem;
}

.spinner-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.spinner-outer {
  position: absolute;
  inset: 0;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-inner {
  position: absolute;
  inset: 16px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

.search-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #3b82f6;
  stroke-width: 2;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #1e293b, #475569);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-section {
  margin-bottom: 3rem;
}

.status-text {
  font-size: 1.25rem;
  color: #64748b;
  margin-bottom: 2rem;
  font-weight: 500;
}

.progress-bar-container {
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 100px;
  margin: 0 auto 2rem;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 100px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.progress-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  color: #1e40af;
  font-weight: 600;
}

.progress-icon {
  width: 1.25rem;
  height: 1.25rem;
  animation: spin 1s linear infinite;
}

.progress-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 2;
}

.info-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.info-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #64748b;
  font-weight: 500;
}

.info-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.info-note {
  font-size: 0.875rem;
  color: #94a3b8;
  font-style: italic;
}

/* Success Section */
.success-section {
  text-align: center;
}

.success-animation {
  margin-bottom: 3rem;
}

.success-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
}

.success-icon {
  width: 3rem;
  height: 3rem;
  color: #16a34a;
  stroke-width: 3;
}

.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #1e293b, #475569);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.success-message {
  font-size: 1.25rem;
  color: #64748b;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.stat-card.blue {
  border-top: 4px solid #3b82f6;
}

.stat-card.green {
  border-top: 4px solid #10b981;
}

.stat-card.purple {
  border-top: 4px solid #8b5cf6;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.stat-card.blue .stat-number {
  color: #3b82f6;
}

.stat-card.green .stat-number {
  color: #10b981;
}

.stat-card.purple .stat-number {
  color: #8b5cf6;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-card.blue .stat-label {
  color: #1e40af;
}

.stat-card.green .stat-label {
  color: #059669;
}

.stat-card.purple .stat-label {
  color: #7c3aed;
}

.next-steps-card {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.next-steps-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  text-align: left;
}

.info-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
  stroke-width: 2;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.next-steps-title {
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 1rem;
}

.next-steps-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.next-steps-list li {
  color: #1e40af;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto 3rem;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
  background: linear-gradient(135deg, #2563eb, #1e40af);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #3b82f6;
  border: 2px solid #3b82f6;
  backdrop-filter: blur(20px);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}

.support-section {
  padding-top: 2rem;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.support-text {
  color: #94a3b8;
  font-size: 0.875rem;
}

.support-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.support-link:hover {
  color: #1d4ed8;
}

/* Animações */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.95); }
}

@keyframes successPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* Responsivo */
@media (max-width: 768px) {
  .main-content {
    padding: 2rem 1rem;
  }
  
  .title, .success-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .action-buttons {
    gap: 0.75rem;
  }
  
  .next-steps-header {
    flex-direction: column;
    text-align: center;
  }
  
  .spinner-container {
    width: 100px;
    height: 100px;
  }
  
  .success-circle {
    width: 100px;
    height: 100px;
  }
}
</style> 