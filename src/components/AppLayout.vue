<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }">
      <div class="flex items-center justify-center h-16 bg-indigo-600">
        <h1 class="text-xl font-bold text-white">Sistema PDV</h1>
      </div>
      
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <router-link
            to="/dashboard"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            :class="{ 'bg-indigo-100 text-indigo-700': $route.path === '/dashboard' }"
          >
            <span class="mr-3">🏠</span>
            Dashboard
          </router-link>
          
          <router-link
            to="/vendas/nova"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            :class="{ 'bg-indigo-100 text-indigo-700': $route.path === '/vendas/nova' }"
          >
            <span class="mr-3">🛒</span>
            Nova Venda
          </router-link>
          
          <router-link
            to="/clientes"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            :class="{ 'bg-indigo-100 text-indigo-700': $route.path === '/clientes' }"
          >
            <span class="mr-3">👥</span>
            Clientes
          </router-link>
          
          <router-link
            to="/estoque"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            :class="{ 'bg-indigo-100 text-indigo-700': $route.path === '/estoque' }"
          >
            <span class="mr-3">📦</span>
            Estoque
          </router-link>
          
          <router-link
            to="/vendas/historico"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            :class="{ 'bg-indigo-100 text-indigo-700': $route.path === '/vendas/historico' }"
          >
            <span class="mr-3">📊</span>
            Histórico de Vendas
          </router-link>
        </div>
        
        <div class="absolute bottom-4 left-4 right-4">
          <button
            @click="logout"
            class="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
          >
            <span class="mr-3">🚪</span>
            Sair
          </button>
        </div>
      </nav>
    </div>

    <!-- Main content -->
    <div class="lg:ml-64">
      <!-- Top bar -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between px-4 py-4">
          <button
            @click="toggleSidebar"
            class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span class="sr-only">Abrir sidebar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500">
              Bem-vindo, {{ authStore.user?.email }}
            </div>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="flex-1">
        <slot />
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="closeSidebar"
    >
      <div class="absolute inset-0 bg-gray-600 opacity-75"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
