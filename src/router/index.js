import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import Login from '../views/Login/Login.vue'

// Rotas da aplicação
const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard/Dashboard.vue'),
    meta: { requiresAuth: true }
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
    meta: { requiresAuth: true }
  },
  {
    path: '/primeiros-passos',
    name: 'primeiroPassos',
    component: () => import('../views/PrimeiroPassos/PrimeiroPassos.vue'),
    meta: { requiresAuth: true }
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
    meta: { requiresAuth: true }
  },
  // Novas rotas do sistema
  {
    path: '/intimacoes',
    name: 'intimacoes',
    component: () => import('../views/Intimacoes/Intimacoes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clientes',
    name: 'clientes',
    component: () => import('../views/Clientes/Clientes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/documentos',
    name: 'documentos',
    component: () => import('../views/Documentos/Documentos.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/processos',
    name: 'processos',
    component: () => import('../views/Processos/Processos.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/relatorios',
    name: 'relatorios',
    component: () => import('../views/Relatorios/Relatorios.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/agenda',
    name: 'agenda',
    component: () => import('../views/Agenda/Agenda.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/financeiro',
    name: 'financeiro',
    component: () => import('../views/Financeiro/Financeiro.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ajuda',
    name: 'ajuda',
    component: () => import('../views/Ajuda/Ajuda.vue'),
    meta: { requiresAuth: true }
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

// Middleware de autenticação
router.beforeEach(async (to, from, next) => {
  // Verifica se a rota requer autenticação
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // Verifica se o usuário está autenticado
  const { data } = await supabase.auth.getSession()
  const isAuthenticated = !!data.session
  
  // Redireciona para login se a rota requer autenticação e o usuário não está autenticado
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } 
  // Redireciona para dashboard se o usuário já está autenticado e tenta acessar login/cadastro
  else if (isAuthenticated && (to.name === 'login' || to.name === 'cadastro')) {
    next({ name: 'dashboard' })
  }
  // Caso contrário, permite a navegação
  else {
    next()
  }
})

export default router
