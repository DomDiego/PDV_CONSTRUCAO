import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Verificar se o usuário está autenticado
  await authStore.checkAuth()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirecionar para login se a rota requer autenticação
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Redirecionar para dashboard se já está logado e tenta acessar login
    next('/dashboard')
  } else {
    next()
  }
}
