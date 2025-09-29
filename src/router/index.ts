import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './auth'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: () => import('../views/ClientesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/estoque',
      name: 'estoque',
      component: () => import('../views/EstoqueView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vendas/nova',
      name: 'nova-venda',
      component: () => import('../views/NovaVendaView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vendas/historico',
      name: 'historico-vendas',
      component: () => import('../views/HistoricoVendasView.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

// Aplicar o guard de autenticação
router.beforeEach(authGuard)

export default router
