<template>
  <AppLayout>
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Visão geral do seu negócio</p>
      </div>

      <!-- Cards de resumo -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total de Vendas Hoje -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center">
            <div class="text-3xl text-blue-500 mr-4">💰</div>
            <div>
              <p class="text-sm text-gray-600">Vendas Hoje</p>
              <p class="text-2xl font-bold text-blue-600">R$ {{ todaySales.toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <!-- Total de Clientes -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center">
            <div class="text-3xl text-green-500 mr-4">👥</div>
            <div>
              <p class="text-sm text-gray-600">Total de Clientes</p>
              <p class="text-2xl font-bold text-green-600">{{ customersStore.customers.length }}</p>
            </div>
          </div>
        </div>

        <!-- Total de Produtos -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div class="flex items-center">
            <div class="text-3xl text-purple-500 mr-4">📦</div>
            <div>
              <p class="text-sm text-gray-600">Total de Produtos</p>
              <p class="text-2xl font-bold text-purple-600">{{ productsStore.products.length }}</p>
            </div>
          </div>
        </div>

        <!-- Produtos com Estoque Baixo -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div class="flex items-center">
            <div class="text-3xl text-red-500 mr-4">⚠️</div>
            <div>
              <p class="text-sm text-gray-600">Estoque Baixo</p>
              <p class="text-2xl font-bold text-red-600">{{ productsStore.lowStockProducts.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Produtos com Estoque Baixo -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <span class="text-red-500 mr-2">⚠️</span>
            Produtos com Estoque Baixo
          </h2>
          
          <div v-if="productsStore.lowStockProducts.length === 0" class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">✅</div>
            <p>Todos os produtos têm estoque adequado!</p>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="product in productsStore.lowStockProducts.slice(0, 5)"
              :key="product.id"
              class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <div>
                <p class="font-medium text-gray-900">{{ product.name }}</p>
                <p class="text-sm text-gray-600">{{ product.sku || 'Sem SKU' }}</p>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {{ product.stock_quantity }} unidades
                </span>
              </div>
            </div>
            
            <div v-if="productsStore.lowStockProducts.length > 5" class="text-center pt-2">
              <router-link
                to="/estoque"
                class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Ver todos os {{ productsStore.lowStockProducts.length }} produtos
              </router-link>
            </div>
          </div>
        </div>

        <!-- Vendas Recentes -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <span class="text-green-500 mr-2">📊</span>
            Vendas Recentes
          </h2>
          
          <div v-if="salesStore.loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-gray-600 text-sm">Carregando vendas...</p>
          </div>
          
          <div v-else-if="recentSales.length === 0" class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">📋</div>
            <p>Nenhuma venda recente</p>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="sale in recentSales"
              :key="sale.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900">
                  {{ sale.customers?.name || 'Consumidor Final' }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ formatDate(sale.sale_date) }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium text-green-600">R$ {{ sale.total_amount.toFixed(2) }}</p>
                <p class="text-xs text-gray-500">{{ sale.payment_method || 'N/A' }}</p>
              </div>
            </div>
            
            <div class="text-center pt-2">
              <router-link
                to="/vendas/historico"
                class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Ver todas as vendas
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link
            to="/vendas/nova"
            class="flex items-center justify-center p-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <span class="text-2xl mr-3">🛒</span>
            <span class="font-medium">Nova Venda</span>
          </router-link>
          
          <router-link
            to="/clientes"
            class="flex items-center justify-center p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <span class="text-2xl mr-3">👥</span>
            <span class="font-medium">Gerenciar Clientes</span>
          </router-link>
          
          <router-link
            to="/estoque"
            class="flex items-center justify-center p-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
          >
            <span class="text-2xl mr-3">📦</span>
            <span class="font-medium">Gerenciar Estoque</span>
          </router-link>
          
          <router-link
            to="/vendas/historico"
            class="flex items-center justify-center p-6 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200"
          >
            <span class="text-2xl mr-3">📊</span>
            <span class="font-medium">Relatórios</span>
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useProductsStore } from '@/stores/products'
import { useSalesStore } from '@/stores/sales'
import AppLayout from '@/components/AppLayout.vue'

const customersStore = useCustomersStore()
const productsStore = useProductsStore()
const salesStore = useSalesStore()

const todaySales = computed(() => {
  const today = new Date().toDateString()
  return salesStore.sales
    .filter(sale => new Date(sale.sale_date).toDateString() === today)
    .reduce((total, sale) => total + sale.total_amount, 0)
})

const recentSales = computed(() => {
  return salesStore.sales.slice(0, 5)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

onMounted(async () => {
  // Carregar dados para o dashboard
  await Promise.all([
    customersStore.fetchCustomers(),
    productsStore.fetchProducts(),
    salesStore.fetchSales()
  ])
})
</script>
