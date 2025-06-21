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
