import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const isDev    = () => location.hostname === 'localhost' || location.hostname === '127.0.0.1'

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/pc',
    name: 'pc',
    component: () => import('../views/PcView.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/historico',
    name: 'historico',
    component: () => import('../views/HistoricoView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/anotar/inicial',
    name: 'anotacao-inicial',
    component: () => import('../views/anotacoes/AnotacaoInicialView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/anotar/sv',
    name: 'sinais-vitais',
    component: () => import('../views/anotacoes/SinaisVitaisView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  // PC → bloqueia (exceto localhost ou se o usuário escolheu continuar)
  const pcAllowed = sessionStorage.getItem('pc_allowed') === '1'
  if (to.name !== 'pc' && !isMobile() && !isDev() && !pcAllowed) {
    return { name: 'pc' }
  }

  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login' }
  }
})

export default router
