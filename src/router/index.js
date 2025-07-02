import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import Login from '../views/Login/Login.vue'

// Rotas da aplicação
const routes = [
  {
    path: '/',
    name: 'home',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard/Dashboard.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: () => import('../views/Cadastro/Cadastro.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/esqueci-senha',
    name: 'esqueciSenha',
    component: () => import('../views/ResetPassword/EsquecerSenha.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: () => import('../views/ResetPassword/ResetPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/verificar-email',
    name: 'verificarEmail',
    component: () => import('../views/VerificarEmail/VerificarEmail.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('../views/Onboarding/Onboarding.vue'),
    meta: { requiresAuth: true, requiresEmailValidation: true }
  },
  {
    path: '/primeiros-passos',
    name: 'primeiroPassos',
    component: () => import('../views/PrimeiroPassos/PrimeiroPassos.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/planos',
    name: 'planos',
    component: () => import('../views/Planos/Planos.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/pagamento-confirmado',
    name: 'pagamentoConfirmado',
    component: () => import('../views/PagamentoConfirmado/PagamentoConfirmado.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  // Novas rotas do sistema
  {
    path: '/intimacoes',
    name: 'intimacoes',
    component: () => import('../views/Intimacoes/Intimacoes.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/clientes',
    name: 'clientes',
    component: () => import('../views/Clientes/Clientes.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/clientes/:id',
    name: 'detalhesCliente',
    component: () => import('../views/Clientes/DetalhesCliente/DetalhesCliente.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/documentos',
    name: 'documentos',
    component: () => import('../views/Documentos/Documentos.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/processos',
    name: 'processos',
    component: () => import('../views/Processos/Processos.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/relatorios',
    name: 'relatorios',
    component: () => import('../views/Relatorios/Relatorios.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/agenda',
    name: 'agenda',
    component: () => import('../views/Agenda/Agenda.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/financeiro',
    name: 'financeiro',
    component: () => import('../views/Financeiro/Financeiro.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/ajuda',
    name: 'ajuda',
    component: () => import('../views/Ajuda/Ajuda.vue'),
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  // Rota de fallback para páginas não encontradas
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('../views/NotFound.vue')
  }
]

// Cria o router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Função auxiliar para verificar status de email (só cache, sem consultas)
async function checkEmailStatus(userId) {
  try {
    // Verificar cache do localStorage primeiro
    const cached = localStorage.getItem(`email_status_${userId}`);
    
    if (cached) {
      const data = JSON.parse(cached);
      // Se é true, sempre usar cache permanente
      if (data.permanent && data.value === true) {
        return true;
      }
      // Se é false, verificar se ainda está válido (1 minuto)
      const now = Date.now();
      if ((now - data.timestamp) < 60000) {
        return data.value;
      }
    }

    // SE NÃO TEM CACHE, assumir que precisa verificar (será feito no login)
    return false;
  } catch (error) {
    console.error('❌ Erro ao verificar cache de email:', error);
    return false;
  }
}

// Função auxiliar para verificar status de onboarding (só cache, sem consultas)
async function checkOnboardingStatus(userId) {
  try {
    // Verificar cache do localStorage primeiro
    const cached = localStorage.getItem(`onboarding_status_${userId}`);
    
    if (cached) {
      const data = JSON.parse(cached);
      // Se é true, sempre usar cache permanente
      if (data.permanent && data.value === true) {
        return true;
      }
      // Se é false, verificar se ainda está válido (1 minuto)
      const now = Date.now();
      if ((now - data.timestamp) < 60000) {
        return data.value;
      }
    }

    // SE NÃO TEM CACHE, assumir que precisa verificar (será feito no login)
    return false;
  } catch (error) {
    console.error('❌ Erro ao verificar cache de onboarding:', error);
    return false;
  }
}

// Middleware de autenticação (otimizado)
router.beforeEach(async (to, from, next) => {
  // Verifica se a rota requer autenticação
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresEmailValidation = to.matched.some(record => record.meta.requiresEmailValidation)
  const requiresOnboarding = to.matched.some(record => record.meta.requiresOnboarding)
  
  // Verifica se o usuário está autenticado
  const { data } = await supabase.auth.getSession()
  const isAuthenticated = !!data.session
  const user = data.session?.user
  
  // Se não está autenticado e a rota requer autenticação
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return;
  }
  
  // Se está autenticado e tenta acessar login/cadastro, redirecionar conforme status
  if (isAuthenticated && (to.name === 'login' || to.name === 'cadastro')) {
    // Verificar email primeiro (só se tem cache explicit false)
    const emailCached = localStorage.getItem(`email_status_${user.id}`);
    if (emailCached) {
      const emailData = JSON.parse(emailCached);
      if (emailData.value === false) {
        next({ name: 'verificarEmail' });
        return;
      }
    }
    
    // Verificar onboarding (só se tem cache explicit false)
    const onboardingCached = localStorage.getItem(`onboarding_status_${user.id}`);
    if (onboardingCached) {
      const onboardingData = JSON.parse(onboardingCached);
      if (onboardingData.value === false) {
        next({ name: 'onboarding' });
        return;
      }
    }
    
    // Se não tem cache explicit false, vai para dashboard
    next({ name: 'dashboard' });
    return;
  }
  
  // Se está autenticado mas precisa validar email primeiro  
  if (isAuthenticated && requiresEmailValidation && to.name !== 'verificarEmail') {
    const emailValidated = await checkEmailStatus(user.id);
    // SÓ redireciona se tem cache EXPLICIT FALSE, não se não tem cache
    const cached = localStorage.getItem(`email_status_${user.id}`);
    if (cached) {
      const data = JSON.parse(cached);
      if (data.value === false) {
        next({ name: 'verificarEmail' });
        return;
      }
    }
  }
  
  // Se está autenticado mas precisa completar onboarding primeiro
  if (isAuthenticated && requiresOnboarding && to.name !== 'onboarding' && to.name !== 'verificarEmail') {
    // Primeiro verificar email
    const emailCached = localStorage.getItem(`email_status_${user.id}`);
    if (emailCached) {
      const emailData = JSON.parse(emailCached);
      if (emailData.value === false) {
        next({ name: 'verificarEmail' });
        return;
      }
    }
    
    // Depois verificar onboarding  
    const onboardingCached = localStorage.getItem(`onboarding_status_${user.id}`);
    if (onboardingCached) {
      const onboardingData = JSON.parse(onboardingCached);
      if (onboardingData.value === false) {
        next({ name: 'onboarding' });
        return;
      }
    }
  }
  
  // Caso contrário, permite a navegação
  next();
})

export default router
