<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Estoque</h1>
      <button
        @click="openProductModal()"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
      >
        Adicionar Produto
      </button>
    </div>

    <!-- Alertas de estoque baixo -->
    <div v-if="productsStore.lowStockProducts.length > 0" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-center">
        <div class="text-yellow-400 mr-3">⚠️</div>
        <div>
          <h3 class="text-sm font-medium text-yellow-800">Produtos com Estoque Baixo</h3>
          <p class="text-sm text-yellow-700 mt-1">
            {{ productsStore.lowStockProducts.length }} produto(s) com 5 unidades ou menos em estoque.
          </p>
        </div>
      </div>
    </div>

    <!-- Barra de busca -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nome, SKU ou descrição..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    <!-- Loading -->
    <div v-if="productsStore.loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-gray-600">Carregando produtos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="productsStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ productsStore.error }}
    </div>

    <!-- Lista de produtos -->
    <div v-else-if="filteredProducts.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preço
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estoque
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="hover:bg-gray-50"
            :class="{ 'bg-yellow-50': product.stock_quantity <= 5 }"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
              <div v-if="product.description" class="text-sm text-gray-500">{{ product.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ product.sku || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              R$ {{ product.price.toFixed(2) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="product.stock_quantity <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
              >
                {{ product.stock_quantity }} unidades
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="openStockModal(product)"
                class="text-green-600 hover:text-green-900 transition duration-200"
              >
                + Estoque
              </button>
              <button
                @click="openProductModal(product)"
                class="text-indigo-600 hover:text-indigo-900 transition duration-200"
              >
                Editar
              </button>
              <button
                @click="confirmDelete(product)"
                class="text-red-600 hover:text-red-900 transition duration-200"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">📦</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
      <p class="text-gray-500 mb-4">
        {{ searchQuery ? 'Nenhum produto corresponde à sua busca.' : 'Comece adicionando seu primeiro produto.' }}
      </p>
      <button
        v-if="!searchQuery"
        @click="openProductModal()"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
      >
        Adicionar Primeiro Produto
      </button>
    </div>

    <!-- Modal de produto -->
    <ProductModal
      :is-open="isProductModalOpen"
      :product="selectedProduct"
      @close="closeProductModal"
      @saved="handleProductSaved"
    />

    <!-- Modal de estoque -->
    <StockModal
      :is-open="isStockModalOpen"
      :product="selectedProduct"
      @close="closeStockModal"
      @updated="handleStockUpdated"
    />

    <!-- Modal de confirmação de exclusão -->
    <div v-if="productToDelete" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
          <p class="text-sm text-gray-500 mb-6">
            Tem certeza que deseja excluir o produto <strong>{{ productToDelete.name }}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div class="flex justify-center space-x-3">
            <button
              @click="productToDelete = null"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              @click="handleDelete"
              :disabled="productsStore.loading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {{ productsStore.loading ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import ProductModal from '@/components/ProductModal.vue'
import StockModal from '@/components/StockModal.vue'
import type { Product } from '@/lib/supabase'

const productsStore = useProductsStore()

const searchQuery = ref('')
const isProductModalOpen = ref(false)
const isStockModalOpen = ref(false)
const selectedProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)

const filteredProducts = computed(() => {
  return productsStore.searchProducts(searchQuery.value)
})

const openProductModal = (product?: Product) => {
  selectedProduct.value = product || null
  isProductModalOpen.value = true
}

const closeProductModal = () => {
  isProductModalOpen.value = false
  selectedProduct.value = null
}

const openStockModal = (product: Product) => {
  selectedProduct.value = product
  isStockModalOpen.value = true
}

const closeStockModal = () => {
  isStockModalOpen.value = false
  selectedProduct.value = null
}

const handleProductSaved = () => {
  // Modal será fechado automaticamente
}

const handleStockUpdated = () => {
  // Modal será fechado automaticamente
}

const confirmDelete = (product: Product) => {
  productToDelete.value = product
}

const handleDelete = async () => {
  if (productToDelete.value) {
    const success = await productsStore.deleteProduct(productToDelete.value.id)
    if (success) {
      productToDelete.value = null
    }
  }
}

onMounted(() => {
  productsStore.fetchProducts()
})
</script>
