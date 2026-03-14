import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('../views/LoginView.vue')
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
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login' }
  }
})

export default router
