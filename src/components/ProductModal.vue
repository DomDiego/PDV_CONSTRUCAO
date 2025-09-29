<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditing ? 'Editar Produto' : 'Novo Produto' }}
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nome *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="sku" class="block text-sm font-medium text-gray-700">SKU/Código</label>
            <input
              id="sku"
              v-model="form.sku"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="2"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <div>
            <label for="price" class="block text-sm font-medium text-gray-700">Preço *</label>
            <input
              id="price"
              v-model.number="form.price"
              type="number"
              step="0.01"
              min="0"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="stock_quantity" class="block text-sm font-medium text-gray-700">Quantidade em Estoque *</label>
            <input
              id="stock_quantity"
              v-model.number="form.stock_quantity"
              type="number"
              min="0"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div v-if="productsStore.error" class="text-red-600 text-sm">
            {{ productsStore.error }}
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="productsStore.loading"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ productsStore.loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProductsStore } from '@/stores/products'
import type { Product } from '@/lib/supabase'

interface Props {
  isOpen: boolean
  product?: Product | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const productsStore = useProductsStore()

const form = ref({
  name: '',
  sku: '',
  description: '',
  price: 0,
  stock_quantity: 0
})

const isEditing = ref(false)

watch(() => props.product, (product) => {
  if (product) {
    isEditing.value = true
    form.value = {
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity
    }
  } else {
    isEditing.value = false
    resetForm()
  }
}, { immediate: true })

const resetForm = () => {
  form.value = {
    name: '',
    sku: '',
    description: '',
    price: 0,
    stock_quantity: 0
  }
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  const productData = {
    name: form.value.name,
    sku: form.value.sku || undefined,
    description: form.value.description || undefined,
    price: form.value.price,
    stock_quantity: form.value.stock_quantity
  }

  let success = false

  if (isEditing.value && props.product) {
    success = !!(await productsStore.updateProduct(props.product.id, productData))
  } else {
    success = !!(await productsStore.createProduct(productData))
  }

  if (success) {
    emit('saved')
    closeModal()
  }
}
</script>
