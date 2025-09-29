<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Nova Venda</h1>
      <div class="text-right">
        <p class="text-sm text-gray-600">Itens no carrinho: {{ salesStore.cartItemsCount }}</p>
        <p class="text-lg font-bold text-gray-900">Total: R$ {{ salesStore.cartTotal.toFixed(2) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Seção de seleção de produtos -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Adicionar Produtos</h2>
        
        <!-- Seleção de cliente -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Cliente (opcional)</label>
          <select
            v-model="selectedCustomerId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Consumidor Final</option>
            <option v-for="customer in customersStore.customers" :key="customer.id" :value="customer.id">
              {{ customer.name }} - {{ customer.phone || customer.email }}
            </option>
          </select>
        </div>

        <!-- Busca de produtos -->
        <div class="mb-4">
          <input
            v-model="productSearchQuery"
            type="text"
            placeholder="Buscar produto por nome ou SKU..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <!-- Lista de produtos -->
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
            @click="selectProduct(product)"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-medium">{{ product.name }}</h3>
                <p class="text-sm text-gray-600">{{ product.sku || 'Sem SKU' }}</p>
                <p class="text-sm font-medium text-green-600">R$ {{ product.price.toFixed(2) }}</p>
              </div>
              <div class="text-right">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="product.stock_quantity <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                >
                  {{ product.stock_quantity }} em estoque
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Carrinho de compras -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Carrinho</h2>
        
        <div v-if="salesStore.cart.length === 0" class="text-center py-8 text-gray-500">
          <div class="text-4xl mb-2">🛒</div>
          <p>Carrinho vazio</p>
          <p class="text-sm">Selecione produtos para adicionar</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in salesStore.cart"
            :key="item.product.id"
            class="border rounded-lg p-3"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <h3 class="font-medium">{{ item.product.name }}</h3>
                <p class="text-sm text-gray-600">R$ {{ item.unit_price.toFixed(2) }} cada</p>
              </div>
              <button
                @click="salesStore.removeFromCart(item.product.id)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                Remover
              </button>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <button
                  @click="updateQuantity(item.product.id, item.quantity - 1)"
                  class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  -
                </button>
                <span class="w-12 text-center">{{ item.quantity }}</span>
                <button
                  @click="updateQuantity(item.product.id, item.quantity + 1)"
                  class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <div class="font-medium">
                R$ {{ item.total_price.toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Total e finalização -->
          <div class="border-t pt-4 mt-4">
            <div class="flex justify-between items-center mb-4">
              <span class="text-lg font-semibold">Total:</span>
              <span class="text-xl font-bold text-green-600">R$ {{ salesStore.cartTotal.toFixed(2) }}</span>
            </div>

            <!-- Forma de pagamento -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
              <select
                v-model="paymentMethod"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
              </select>
            </div>

            <button
              @click="finalizeSale"
              :disabled="salesStore.loading"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {{ salesStore.loading ? 'Finalizando...' : 'Finalizar Venda' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de adicionar produto -->
    <div v-if="selectedProduct" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Adicionar ao Carrinho</h3>
          
          <div class="mb-4 p-3 bg-gray-50 rounded-md">
            <p class="font-medium">{{ selectedProduct.name }}</p>
            <p class="text-sm text-gray-600">R$ {{ selectedProduct.price.toFixed(2) }}</p>
            <p class="text-sm text-gray-600">Estoque: {{ selectedProduct.stock_quantity }} unidades</p>
          </div>
          
          <div class="mb-4">
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
            <input
              id="quantity"
              v-model.number="quantityToAdd"
              type="number"
              min="1"
              :max="selectedProduct.stock_quantity"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div v-if="salesStore.error" class="text-red-600 text-sm mb-4">
            {{ salesStore.error }}
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeProductModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              @click="addProductToCart"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de sucesso -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="text-green-500 text-6xl mb-4">✅</div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Venda Finalizada!</h3>
          <p class="text-sm text-gray-600 mb-6">
            Venda realizada com sucesso no valor de R$ {{ lastSaleAmount.toFixed(2) }}
          </p>
          <button
            @click="closeSuccessModal"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
          >
            Nova Venda
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { useProductsStore } from '@/stores/products'
import { useCustomersStore } from '@/stores/customers'
import type { Product } from '@/lib/supabase'

const salesStore = useSalesStore()
const productsStore = useProductsStore()
const customersStore = useCustomersStore()

const productSearchQuery = ref('')
const selectedCustomerId = ref('')
const paymentMethod = ref('Dinheiro')
const selectedProduct = ref<Product | null>(null)
const quantityToAdd = ref(1)
const showSuccessModal = ref(false)
const lastSaleAmount = ref(0)

const filteredProducts = computed(() => {
  return productsStore.searchProducts(productSearchQuery.value)
    .filter(product => product.stock_quantity > 0)
})

const selectProduct = (product: Product) => {
  selectedProduct.value = product
  quantityToAdd.value = 1
}

const closeProductModal = () => {
  selectedProduct.value = null
  quantityToAdd.value = 1
  salesStore.error = null
}

const addProductToCart = () => {
  if (!selectedProduct.value) return

  const success = salesStore.addToCart(selectedProduct.value, quantityToAdd.value)
  if (success) {
    closeProductModal()
  }
}

const updateQuantity = (productId: string, newQuantity: number) => {
  salesStore.updateCartItemQuantity(productId, newQuantity)
}

const finalizeSale = async () => {
  const sale = await salesStore.completeSale(
    selectedCustomerId.value || undefined,
    paymentMethod.value
  )

  if (sale) {
    lastSaleAmount.value = sale.total_amount
    showSuccessModal.value = true
    selectedCustomerId.value = ''
    paymentMethod.value = 'Dinheiro'
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  lastSaleAmount.value = 0
}

onMounted(() => {
  productsStore.fetchProducts()
  customersStore.fetchCustomers()
})
</script>
