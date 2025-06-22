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
            >
              Encerrar
            </button>
          </div>
          
          <button class="btn-skip" @click="finishOnboarding">
            Pular tutorial
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTab = ref(0)

const tabs = [
  {
    name: 'Dashboard',
    title: 'Visualização centralizada e fácil',
    content: [
      'No cenário jurídico acelerado de hoje, manter-se à frente requer mais do que apenas conhecimento jurídico; exige uma gestão eficiente de informações e dados. Uma ferramenta poderosa que tem ganhado destaque em diversos setores, inclusive no jurídico, é o dashboard. Nesta tela você tem um resumo otimizado de tudo o que está acontecendo de importante no seu escritório em um único painel. Esse painel otimizado é fundamental na prática jurídica e auxilia os advogados e advogadas na tomada de decisão informada, agiliza operações e melhora o atendimento ao cliente. Desta tela principal você visualizar de forma rápida e fácil tudo o que requer a sua atenção imediata e navegar por todas as funcionalidades da plataforma Juscerto.'
    ],
    image: '/images/onDashboard.png',
    badge: null
  },
  {
    name: 'Intimações',
    title: 'Intimações e alertas',
    content: [
      'Nós monitoramos todos os processos associados à sua OAB de maneira automática e verificamos diariamente as atualizações e novas intimações para você não perder nada relevante dos seus processos. Receba todas as novas intimações dos andamentos dos seus processos e crie agendamentos e alertas personalizados dos seus compromissos com um clique. Com as integrações entre as intimações, calendário e lembretes a Juscerto te ajuda a não esquecer de nada pra você estar sempre em dia com as tarefas do seu escritório.'
    ],
    image: '/images/onIntimacoes.png',
    badge: '12'
  },
  {
    name: 'Clientes',
    title: 'Gestão de clientes',
    content: [
      'O sucesso do seu escritório depende de uma gestão eficiente dos seus clientes.',
      'Além da experiência jurídica, cultivar relacionamentos sólidos com os clientes é a base para alavancar os seus negócios. Nós da Juscerto pensamos nisso e colocamos a gestão dos seus clientes na palma da sua mão. Envie mensagens e relatórios personalizados. Programe o envio de notificações e mande mensagens em grupo para os seus clientes. Estreite o relacionamentos e mantenha seus clientes sempre bem informados com as automações da Juscerto.',
      'A importância da gestão de clientes não está apenas nos benefícios imediatos que traz, mas no efeito cascata que cria, moldando a reputação de um(a) advogado(a), fomentando a repetição de negócios e impulsionando sua carreira para novos horizontes.'
    ],
    image: '/images/onClientes.png',
    badge: null
  },
  {
    name: 'Documentos',
    title: 'Documentos e relatórios',
    content: [
      'O gerenciamento eficiente de documentos e relatórios é fundamental para você estar um passo a frente da sua concorrência.',
      'Crie, duplique, edite, organize e compartilhe seus documentos de forma eficiente nestas telas. Gere relatórios para seus clientes de forma automática e programe os envios periódicos. Crie documentos jurídicos de maneira automática que irão agilizar e facilitar o seu dia-a-dia.'
    ],
    image: '/images/onDoc.png',
    badge: null
  },
  {
    name: 'Processos',
    title: 'Processos',
    content: [
      'Gerencie todos os seus processos de forma centralizada e eficiente.',
      'Acompanhe o andamento dos processos, visualize intimações e mantenha tudo organizado em um só lugar.'
    ],
    image: '/images/onProcessos.png',
    badge: null
  },
  {
    name: 'Relatórios',
    title: 'Documentos e relatórios',
    content: [
      'O gerenciamento eficiente de documentos e relatórios é fundamental para você estar um passo a frente da sua concorrência.',
      'Crie, duplique, edite, organize e compartilhe seus documentos de forma eficiente nestas telas. Gere relatórios para seus clientes de forma automática e programe os envios periódicos. Crie documentos jurídicos de maneira automática que irão agilizar e facilitar o seu dia-a-dia.'
    ],
    image: '/images/onDoc.png',
    badge: null
  },
  {
    name: 'Minha agenda',
    title: 'Gestão inteligente do tempo',
    content: [
      'Nós somos advogados e sabemos que prazo é tudo na advocacia! Gerencie sua agenda de forma simples e eficiente com a agenda inteligente Juscerto. Aqui você pode adicionar compromissos, categorizar seus eventos e programar lembretes para não perder nada! No mundo dinâmico do direito, onde os prazos são constantes e as demandas são altas, o gerenciamento eficiente do tempo não é apenas uma habilidade; é uma vantagem estratégica.',
      'Explore as funcionalidades do calendário inteligente Juscerto, organize sua rotina e libere mais tempo para evoluir o seu negócio e atender os seus clientes.'
    ],
    image: '/images/onAgenda.png',
    badge: null
  },
  {
    name: 'Planejamento financeiro',
    title: 'Controle financeiro',
    content: [
      'Gerenciar as finanças do seu escritório nunca foi tão fácil!',
      'Com a plataforma Juscerto você tem o controle e a gestão de todos os gastos e recebíveis do seu negócio. É fácil de atualizar, criar recorrências para gastos e receitas periódicas e de visualizar.',
      'Tenha total visão da saúde financeira do seu escritório e auxílio na tomada de decisão estratégica baseada em dados.'
    ],
    image: '/images/onFinanceiro.png',
    badge: null
  },
  {
    name: 'Ajuda',
    title: 'Sessão de ajuda',
    content: [
      'Nesta sessão você irá encontrar as respostas para as perguntas mais frequentes sobre o uso da plataforma e como aproveitar ao máximo todos os recursos que a Juscerto tem a oferecer.',
      'Além deste tutorial inicial, você encontrará várias outras informações relevantes que reforçam o nosso compromisso e dedicação ao crescimento e sucesso dos nossos clientes.',
      'Explore essa sessão quando precisar e se tiver alguma dúvida é só entrar em contato que o nosso time estará à disposição para auxiliar na sua jornada.'
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

function finishOnboarding() {
  // Aqui você pode adicionar lógica para marcar o onboarding como concluído
  // Por exemplo, salvar no localStorage ou fazer uma chamada para a API
  router.push({ name: 'dashboard' })
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

@media (max-width: 768px) {
  .nav-tabs {
    gap: 16px;
  }
  
  .nav-tab {
    font-size: 14px;
  }
  
  .content-title {
    font-size: 24px;
  }
  
  .content-text {
    font-size: 14px;
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
  }
}
</style> 