<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Histórico de Vendas</h1>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="applyFilters"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>

    <!-- Resumo -->
    <div v-if="salesStore.sales.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="text-3xl text-blue-500 mr-4">📊</div>
          <div>
            <p class="text-sm text-gray-600">Total de Vendas</p>
            <p class="text-2xl font-bold">{{ salesStore.sales.length }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="text-3xl text-green-500 mr-4">💰</div>
          <div>
            <p class="text-sm text-gray-600">Valor Total</p>
            <p class="text-2xl font-bold text-green-600">R$ {{ totalSalesAmount.toFixed(2) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="text-3xl text-orange-500 mr-4">📈</div>
          <div>
            <p class="text-sm text-gray-600">Ticket Médio</p>
            <p class="text-2xl font-bold text-orange-600">R$ {{ averageTicket.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="salesStore.loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-gray-600">Carregando vendas...</p>
    </div>

    <!-- Error -->
    <div v-else-if="salesStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ salesStore.error }}
    </div>

    <!-- Lista de vendas -->
    <div v-else-if="salesStore.sales.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID da Venda
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pagamento
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor Total
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="sale in salesStore.sales" :key="sale.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              #{{ sale.id.substring(0, 8) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(sale.sale_date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ sale.customers?.name || 'Consumidor Final' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ sale.payment_method || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
              R$ {{ sale.total_amount.toFixed(2) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewSaleDetails(sale)"
                class="text-indigo-600 hover:text-indigo-900 transition duration-200"
              >
                Ver Detalhes
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">📋</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma venda encontrada</h3>
      <p class="text-gray-500 mb-4">
        Não há vendas registradas no período selecionado.
      </p>
    </div>

    <!-- Modal de detalhes da venda -->
    <div v-if="selectedSale && saleDetails" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Detalhes da Venda #{{ selectedSale.id.substring(0, 8) }}
            </h3>
            <button
              @click="closeSaleDetails"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <!-- Informações da venda -->
          <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm text-gray-600">Data da Venda</p>
              <p class="font-medium">{{ formatDate(selectedSale.sale_date) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Cliente</p>
              <p class="font-medium">{{ selectedSale.customers?.name || 'Consumidor Final' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Forma de Pagamento</p>
              <p class="font-medium">{{ selectedSale.payment_method || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Valor Total</p>
              <p class="font-medium text-green-600">R$ {{ selectedSale.total_amount.toFixed(2) }}</p>
            </div>
          </div>

          <!-- Itens da venda -->
          <div class="mb-6">
            <h4 class="text-md font-medium text-gray-900 mb-3">Itens da Venda</h4>
            <div class="border rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in saleDetails" :key="item.id">
                    <td class="px-4 py-2 text-sm text-gray-900">
                      {{ item.products?.name }}
                      <div class="text-xs text-gray-500">{{ item.products?.sku || 'Sem SKU' }}</div>
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-900">{{ item.quantity }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">R$ {{ item.unit_price.toFixed(2) }}</td>
                    <td class="px-4 py-2 text-sm font-medium text-gray-900">
                      R$ {{ (item.quantity * item.unit_price).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="closeSaleDetails"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import type { SaleWithCustomer, SaleItemWithProduct } from '@/lib/supabase'

const salesStore = useSalesStore()

const startDate = ref('')
const endDate = ref('')
const selectedSale = ref<SaleWithCustomer | null>(null)
const saleDetails = ref<SaleItemWithProduct[] | null>(null)

const totalSalesAmount = computed(() => {
  return salesStore.sales.reduce((total, sale) => total + sale.total_amount, 0)
})

const averageTicket = computed(() => {
  if (salesStore.sales.length === 0) return 0
  return totalSalesAmount.value / salesStore.sales.length
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const applyFilters = () => {
  salesStore.fetchSales(startDate.value || undefined, endDate.value || undefined)
}

const viewSaleDetails = async (sale: SaleWithCustomer) => {
  selectedSale.value = sale
  saleDetails.value = await salesStore.getSaleDetails(sale.id)
}

const closeSaleDetails = () => {
  selectedSale.value = null
  saleDetails.value = null
}

onMounted(() => {
  // Carregar vendas dos últimos 30 dias por padrão
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))
  
  startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
  
  applyFilters()
})
</script>
