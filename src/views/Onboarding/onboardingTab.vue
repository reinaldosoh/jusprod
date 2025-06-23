<template>
  <div class="onboarding-container">
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        <img src="/images/logotipo.png" alt="Jusprod" class="logo" />
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="nav-menu">
      <h2 class="nav-title">{{ currentTab === 0 ? 'Tutorial do menu de navegação do aplicativo' : 'Menu de navegação do aplicativo' }}</h2>
      
      <div class="nav-tabs">
        <div 
          v-for="(tab, index) in tabs" 
          :key="index"
          :class="[
            'nav-tab', 
            { 
              active: currentTab === index,
              'intimacoes-tab': index === 1 && currentTab === index
            }
          ]"
          @click="setCurrentTab(index)"
        >
          {{ tab.name }}
          <span v-if="tab.badge && index === 1" class="tab-badge">{{ tab.badge }}</span>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area">
      <!-- Left Content -->
      <div class="left-content">
        <h1 class="content-title">{{ tabs[currentTab].title }}</h1>
        
        <div class="content-text">
          <p v-for="(paragraph, index) in tabs[currentTab].content" :key="index">
            {{ paragraph }}
          </p>
        </div>
        
        <!-- Botões para mobile - SEMPRE VISÍVEIS -->
        <div class="mobile-actions">
          <div class="mobile-action-buttons">
            <!-- Dashboard (currentTab = 0) -->
            <button 
              v-show="currentTab === 0"
              class="mobile-btn btn-proximo" 
              @click="nextTab"
            >
              Próximo
            </button>
            
            <!-- Intimações (currentTab = 1) -->
            <button 
              v-show="currentTab === 1"
              class="mobile-btn btn-voltar" 
              @click="previousTab"
            >
              Voltar
            </button>
            <button 
              v-show="currentTab === 1"
              class="mobile-btn btn-proximo" 
              @click="nextTab"
            >
              Próximo
            </button>
            
            <!-- Outras tabs (2-7) -->
            <button 
              v-show="currentTab >= 2 && currentTab <= 7"
              class="mobile-btn btn-voltar" 
              @click="previousTab"
            >
              Voltar
            </button>
            <button 
              v-show="currentTab >= 2 && currentTab <= 7"
              class="mobile-btn btn-proximo" 
              @click="nextTab"
            >
              Próximo
            </button>
            
            <!-- Última tela (currentTab = 8) -->
            <button 
              v-show="currentTab === 8"
              class="mobile-btn btn-voltar" 
              @click="previousTab"
              :disabled="isLoading"
            >
              Voltar
            </button>
            <button 
              v-show="currentTab === 8"
              class="mobile-btn btn-encerrar" 
              @click="finishOnboarding"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Carregando...</span>
              <span v-else>Encerrar</span>
            </button>
          </div>
          
          <!-- Pular tutorial - SEMPRE VISÍVEL -->
          <button class="mobile-skip" @click="skipTutorial" :disabled="isLoading">
            <span v-if="isLoading">Carregando...</span>
            <span v-else>Pular tutorial</span>
          </button>
        </div>
      </div>

      <!-- Right Content -->
      <div class="right-content">
        <!-- Image -->
        <div class="right-image">
          <img :src="tabs[currentTab].image" :alt="tabs[currentTab].name" class="feature-image" />
        </div>
        
        <!-- Bottom Actions -->
        <div class="bottom-actions">
          <div class="action-buttons">
            <button 
              v-if="currentTab > 0" 
              class="btn-voltar"
              @click="previousTab"
            >
              Voltar
            </button>
            
            <button 
              v-if="currentTab < tabs.length - 1"
              class="btn-proximo"
              @click="nextTab"
            >
              Próximo
            </button>
            
            <button 
              v-if="currentTab === tabs.length - 1"
              class="btn-encerrar"
              @click="finishOnboarding"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Carregando...</span>
              <span v-else>Encerrar</span>
            </button>
          </div>
          
          <button class="btn-skip" @click="skipTutorial" :disabled="isLoading">
            <span v-if="isLoading">Carregando...</span>
            <span v-else>Pular tutorial</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Sidebar mobile com ícones -->
    <div class="mobile-sidebar">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="mobile-icon"
        :class="{ active: currentTab === index }"
        @click="navigateToTab(index)"
      >
        <component :is="getTabIcon(index)" :size="20" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  BarChart3, 
  AlertTriangle, 
  Users, 
  FileText, 
  Scale, 
  ClipboardList, 
  Calendar, 
  DollarSign, 
  HelpCircle 
} from 'lucide-vue-next'

const router = useRouter()
const currentTab = ref(0)
const isLoading = ref(false)

const tabs = [
  {
    name: 'Dashboard',
    title: 'Visualização centralizada e fácil',
    content: [
      'Manter-se à frente em um ambiente jurídico acelerado requer gerenciamento eficiente de informações e dados. Uma ferramenta poderosa que ganhou destaque em vários setores, incluindo o jurídico, é o dashboard.',
      'Um dashboard oferece um resumo otimizado dos acontecimentos importantes em um escritório de advocacia. A importância deste painel otimizado na prática jurídica não pode ser subestimada, pois auxilia os advogados na tomada de decisões informadas, agiliza as operações e melhora o atendimento ao cliente.',
      'A tela principal permite visualizar de forma rápida e fácil tudo que precisa de atenção imediata e navegar por todas as funcionalidades da plataforma Jusprod.'
    ],
    image: '/images/onDashboard.png',
    badge: null
  },
  {
    name: 'Intimações',
    title: 'Intimações e alertas',
    content: [
      'O serviço monitora automaticamente todos os processos associados à sua OAB e verifica diariamente as atualizações e novas intimações para garantir que você não perca nenhuma informação relevante sobre seus processos.',
      'Você pode receber novas intimações sobre o andamento de seus processos e criar cronogramas e alertas personalizados para seus compromissos com um único clique. A integração entre intimações, calendário e lembretes indica que o serviço (Jusprod) ajuda os usuários a se manterem organizados e não esquecerem de nenhuma tarefa relacionada ao trabalho do escritório.'
    ],
    image: '/images/onIntimacoes.png',
    badge: '12'
  },
  {
    name: 'Clientes',
    title: 'Gestão de clientes',
    content: [
      'O sucesso do seu escritório depende de uma gestão eficiente dos seus clientes.',
      'Além da experiência jurídica, cultivar relacionamentos sólidos com os clientes é a base para alavancar os seus negócios. Nós da Jusprod pensamos nisso e colocamos a gestão dos seus clientes na palma da sua mão. Envie mensagens e relatórios personalizados. Programe o envio de notificações e mande mensagens em grupo para os seus clientes. Estreite o relacionamentos e mantenha seus clientes sempre bem informados com as automações da Jusprod.',
      'A importância da gestão de clientes não está apenas nos benefícios imediatos que traz, mas no efeito cascata que cria, moldando a reputação de um(a) advogado(a), fomentando novos negócios e impulsionando sua carreira para novos horizontes.'
    ],
    image: '/images/onClientes.png',
    badge: null
  },
  {
    name: 'Documentos',
    title: 'Documentos',
    content: [
      'O gerenciamento eficiente de documentos e relatórios é fundamental para você estar um passo a frente da sua concorrência.',
      'Crie, duplique, edite, organize e compartilhe seus documentos de forma eficiente nestas telas. Gere relatórios para seus clientes de forma automática e programe os envios periódicos. Crie documentos jurídicos de forma automática com nossos modelos e programe os envios.'
    ],
    image: '/images/onDoc.png',
    badge: null
  },
  {
    name: 'Processos',
    title: 'Segurança e praticidade',
    content: [
      'Navegar pelo cenário jurídico pode ser complexo, especialmente quando se trata de acompanhar ações judiciais em nome de outra pessoa. Nossa plataforma foi projetada para simplificar esse processo, facilitando para os usuários se manterem informados sobre processos e ações judiciais associadas à sua OAB.',
      'Você pode encontrar todas as informações sobre seus processos e gerenciá-los de forma prática e segura.'
    ],
    image: '/images/onProcessos.png',
    badge: null
  },
  {
    name: 'Relatórios',
    title: 'Relatórios',
    content: [
      'A gestão eficiente de relatórios e documentos é essencial nas atividades jurídicas. Essa gestão é fundamental para o bom funcionamento de um escritório de advocacia e sua relação com os clientes.',
      'Gere relatórios para seus clientes de forma automática com os modelos fornecidos e programe os envios periódicos. Crie documentos jurídicos de forma automatizada para agilizar e facilitar as operações do dia a dia.'
    ],
    image: '/images/onDoc.png',
    badge: null
  },
  {
    name: 'Minha agenda',
    title: 'Gestão inteligente do tempo',
    content: [
      'Nós somos advogados e sabemos que prazo é tudo na advocacia! Gerencie sua agenda de forma simples e eficiente com a agenda inteligente Jusprod.',
      'Aqui você pode adicionar compromissos, categorizar seus eventos e programar lembretes para não perder nada! No mundo dinâmico do Direito, onde os prazos são constantes e as demandas são altas, o gerenciamento eficiente do tempo não é apenas uma habilidade, é uma vantagem estratégica.',
      'Explore as funcionalidades do calendário inteligente Jusprod, organize sua rotina e libere mais tempo para evoluir o seu negócio e atender os seus clientes.'
    ],
    image: '/images/onAgenda.png',
    badge: null
  },
  {
    name: 'Planejamento financeiro',
    title: 'Controle financeiro',
    content: [
      'Gerenciar as finanças do seu escritório nunca foi tão fácil!',
      'Com a plataforma Jusprod você tem o controle e a gestão de todos os gastos e recebíveis do seu negócio. É fácil de atualizar, visualizar e criar recorrências para gastos e receitas periódicas.',
      'Tenha total visão da saúde financeira do seu escritório e auxílio na tomada de decisão estratégica baseada em dados.'
    ],
    image: '/images/onFinanceiro.png',
    badge: null
  },
  {
    name: 'Ajuda',
    title: 'Sessão de ajuda',
    content: [
      'Sabemos que o tempo é precioso para advogados. Por isso, criamos a Sessão de Ajuda com um objetivo claro: facilitar a adaptação e esclarecer dúvidas de forma rápida e eficiente.',
      'Cada tela do sistema contém vídeos curtos e objetivos, cuidadosamente gravados para explicar todas as funcionalidades de forma direta e prática. Isso permite que você se concentre no que realmente importa: seus clientes e seu negócio.',
      'Priorizamos tornar sua experiência mais intuitiva e produtiva. Aproveite os recursos disponíveis e veja como nossa plataforma pode simplificar suas tarefas diárias.'
    ],
    image: '/images/onAjuda.png',
    badge: null
  }
]

function setCurrentTab(index) {
  currentTab.value = index
}

function nextTab() {
  if (currentTab.value < tabs.length - 1) {
    currentTab.value++
  }
}

function previousTab() {
  if (currentTab.value > 0) {
    currentTab.value--
  }
}

async function finishOnboarding() {
  if (isLoading.value) return; // Prevenir múltiplos cliques
  
  try {
    isLoading.value = true;
    console.log('🎯 Finalizando onboarding...');
    
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js');
    
    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Erro ao obter usuário:', userError);
      // Se não conseguiu obter usuário, redirecionar para login
      router.push({ name: 'login' });
      return;
    }
    
    console.log('👤 Finalizando onboarding para usuário:', user.id);
    
    // Chamar Edge Function para finalizar onboarding e primeiro acesso
    const { data, error } = await supabase.functions.invoke('finalizar-onboarding', {
      body: { 
        userUuid: user.id,
        tipo: 'completo' // Indica que completou o tutorial
      }
    });
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      throw new Error(error.message || 'Erro ao finalizar onboarding');
    }
    
    if (!data || !data.success) {
      console.error('❌ Resposta inválida da Edge Function:', data);
      throw new Error(data?.error || 'Erro desconhecido ao finalizar onboarding');
    }
    
    console.log('✅ Onboarding e primeiro acesso finalizados com sucesso!');
    
    // Redirecionar para primeiros passos
    router.push({ name: 'primeiroPassos' });
    
  } catch (error) {
    console.error('❌ Erro ao finalizar onboarding:', error);
    
    // Mesmo com erro, redirecionar para primeiros passos
    // O usuário pode tentar novamente mais tarde
    router.push({ name: 'primeiroPassos' });
  } finally {
    isLoading.value = false;
  }
}

function navigateToTab(index) {
  currentTab.value = index
}

async function skipTutorial() {
  if (isLoading.value) return; // Prevenir múltiplos cliques
  
  try {
    isLoading.value = true;
    console.log('⏭️ Pulando tutorial...');
    
    // Importar supabase
    const { supabase } = await import('../../lib/supabase.js');
    
    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Erro ao obter usuário:', userError);
      // Se não conseguiu obter usuário, redirecionar para login
      router.push({ name: 'login' });
      return;
    }
    
    console.log('👤 Pulando tutorial para usuário:', user.id);
    
    // Chamar Edge Function para finalizar onboarding e primeiro acesso
    const { data, error } = await supabase.functions.invoke('finalizar-onboarding', {
      body: { 
        userUuid: user.id,
        tipo: 'pulado' // Indica que pulou o tutorial
      }
    });
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      throw new Error(error.message || 'Erro ao pular tutorial');
    }
    
    if (!data || !data.success) {
      console.error('❌ Resposta inválida da Edge Function:', data);
      throw new Error(data?.error || 'Erro desconhecido ao pular tutorial');
    }
    
    console.log('✅ Tutorial pulado e registros atualizados com sucesso!');
    
    // Redirecionar para primeiros passos
    router.push({ name: 'primeiroPassos' });
    
  } catch (error) {
    console.error('❌ Erro ao pular tutorial:', error);
    
    // Mesmo com erro, redirecionar para primeiros passos
    // O usuário pode tentar novamente mais tarde
    router.push({ name: 'primeiroPassos' });
  } finally {
    isLoading.value = false;
  }
}

function getTabIcon(index) {
  const icons = [
    BarChart3,     // Dashboard
    AlertTriangle, // Intimações
    Users,         // Clientes
    FileText,      // Documentos
    Scale,         // Processos
    ClipboardList, // Relatórios
    Calendar,      // Minha agenda
    DollarSign,    // Planejamento financeiro
    HelpCircle     // Ajuda
  ]
  return icons[index] || FileText
}
</script>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 48px;
  border-bottom: 1px solid #E5E7EB;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  width: auto;
}



/* Navigation */
.nav-menu {
  padding: 32px 48px 0;
}

.nav-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 32px 0;
  text-align: left;
}

.nav-tabs {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid #E5E7EB;
  overflow-x: auto;
  padding-bottom: 0;
}

.nav-tab {
  background: none;
  border: none;
  padding: 12px 0;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #6B7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  color: #0169FA;
}

.nav-tab.active {
  color: #0169FA;
  border-bottom-color: #0169FA;
  font-weight: 500;
}

/* Estilo especial para tab Intimações ativa */
.nav-tab.active.intimacoes-tab {
  color: #EF4444;
  border-bottom-color: #EF4444;
}

.tab-badge {
  background-color: #EF4444;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Content Area */
.content-area {
  display: flex;
  flex: 1;
  padding: 48px 48px 48px 48px;
  padding-top: 32px;
  gap: 64px;
  align-items: flex-start;
}

.left-content {
  flex: 1;
  max-width: 600px;
}

.content-title {
  font-family: 'Inter', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #0169FA;
  margin: 0 0 24px 0;
  line-height: 1.1;
  text-align: left;
}

.content-text {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.6;
  color: #4B5563;
  text-align: left;
}

.content-text p {
  margin: 0 0 16px 0;
}

.content-text p:last-child {
  margin-bottom: 0;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  gap: 24px;
}

.right-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.feature-image {
  max-width: 100%;
  height: auto;
}

/* Bottom Actions */
.bottom-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-direction: column;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  align-self: flex-end;
}

.btn-voltar {
  background-color: white;
  color: #0468FA;
  border: 1px solid #0468FA;
  padding: 12px 32px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 44px;
}

.btn-voltar:hover {
  background-color: #f5f9ff;
  box-shadow: 0 0 0 2px rgba(4, 104, 250, 0.1);
}

.btn-voltar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #F3F4F6 !important;
  color: #9CA3AF !important;
  border-color: #D1D5DB !important;
}

.btn-proximo,
.btn-encerrar {
  background-color: #0468FA;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 44px;
}

.btn-proximo:hover,
.btn-encerrar:hover {
  background-color: #0354cc;
}

.btn-proximo:disabled,
.btn-encerrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #9CA3AF !important;
  color: #6B7280 !important;
}

.btn-skip {
  background: none;
  border: none;
  color: #0468FA;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
  padding: 0;
  height: auto;
  width: auto;
  align-self: flex-end;
}

.btn-skip:hover {
  text-decoration: underline;
}

.btn-skip:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: #9CA3AF !important;
  text-decoration: none !important;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-area {
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    padding-top: 16px;
  }
  
  .left-content {
    max-width: none;
  }
  
  .content-title {
    font-size: 28px;
  }
  
  .header {
    padding: 16px 24px;
  }
  
  .nav-menu {
    padding: 24px 24px 0;
  }
  
  .nav-title {
    font-size: 20px;
  }
  
  .bottom-actions {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
}

  /* Mobile Design */
@media (max-width: 768px) {
  .onboarding-container {
    padding: 8px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  .header {
    padding: 12px 0;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .nav-menu {
    display: none; /* Esconder tabs no mobile */
  }
  
  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0 12px 180px 12px; /* Adicionar padding-bottom para os botões fixos */
    text-align: center;
    overflow-y: auto;
  }
  
  .left-content {
    order: 1;
  }
  
  .content-title {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 16px;
    padding-top: 16px;
    color: #0468FA;
    font-family: 'Inter', sans-serif;
  }
  
  .content-text {
    font-size: 14px;
    font-weight: 400;
    text-align: center;
    line-height: 1.5;
    color: #374151;
    margin-bottom: 24px;
    font-family: 'Inter', sans-serif;
  }
  
  .right-content {
    display: none; /* Esconder imagem no mobile */
  }
  
  .bottom-actions {
    display: none; /* Esconder no mobile, usar mobile-actions */
  }
  
  /* Remover estilos conflitantes - usar apenas .mobile-btn e .mobile-skip */
  
  /* Sidebar mobile com ícones */
  .mobile-sidebar {
    position: fixed;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 10;
    max-height: calc(100vh - 200px); /* Evitar sobreposição com botões fixos */
    overflow-y: auto;
  }
  
  .mobile-icon {
    width: 40px;
    height: 40px;
    background-color: #E5E7EB;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6B7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .mobile-icon.active {
    background-color: #0468FA;
    color: white;
  }
  
  .mobile-icon:hover {
    background-color: #D1D5DB;
  }
  
  .mobile-icon.active:hover {
    background-color: #0468FA;
  }
  
  /* Estilos dos botões mobile */
  .mobile-action-buttons {
    display: flex !important;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    min-height: 48px;
  }
}

/* Esconder elementos mobile no desktop */
.mobile-sidebar {
  display: none;
}

.mobile-actions {
  display: none;
}

@media (max-width: 768px) {
  .mobile-sidebar {
    display: flex;
  }
  
  .mobile-actions {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    padding: 16px;
    background-color: white;
    border-top: 1px solid #E5E7EB;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    box-sizing: border-box;
  }
  
  .mobile-action-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    margin-bottom: 16px;
  }
  
  .mobile-btn {
    display: block;
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #0468FA;
    margin: 0;
  }
  
  .mobile-btn.btn-proximo,
  .mobile-btn.btn-encerrar {
    background-color: #0468FA;
    color: white;
    border: 1px solid #0468FA;
  }
  
  .mobile-btn.btn-voltar {
    background-color: white;
    color: #0468FA;
    border: 1px solid #0468FA;
  }
  
  .mobile-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #9CA3AF !important;
    color: #6B7280 !important;
    border-color: #9CA3AF !important;
  }
  
  .mobile-skip {
    display: block;
    width: 100%;
    background: none;
    border: none;
    color: #0468FA;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    padding: 8px;
    margin: 0;
  }
  
  .mobile-skip:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    color: #9CA3AF !important;
  }
}

/* Telas muito pequenas (iPhone SE, etc.) */
@media (max-width: 400px) and (max-height: 700px) {
  .onboarding-container {
    padding: 4px;
  }
  
  .header {
    padding: 8px 0;
  }
  
  .content-area {
    padding: 0 8px 160px 8px;
  }
  
  .content-title {
    font-size: 15px;
    margin-bottom: 12px;
    padding-top: 8px;
  }
  
  .content-text {
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 16px;
  }
  
  .mobile-actions {
    padding: 12px;
  }
  
  .mobile-action-buttons {
    gap: 12px;
  }
  
  .mobile-btn {
    height: 44px;
    font-size: 15px;
    padding: 10px 20px;
  }
  
  .mobile-skip {
    font-size: 14px;
    padding: 6px;
  }
  
  .mobile-sidebar {
    right: 8px;
    gap: 6px;
    top: 35%; /* Mover mais para cima em telas pequenas */
    transform: translateY(-35%);
    max-height: calc(100vh - 160px); /* Garantir que não sobreponha os botões */
    padding-bottom: 10px; /* Espaço extra na parte inferior */
  }
  
  .mobile-icon {
    width: 36px;
    height: 36px;
  }
}
</style> 