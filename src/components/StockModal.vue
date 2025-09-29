<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Adicionar ao Estoque
        </h3>
        
        <div v-if="product" class="mb-4 p-3 bg-gray-50 rounded-md">
          <p class="font-medium">{{ product.name }}</p>
          <p class="text-sm text-gray-600">Estoque atual: {{ product.stock_quantity }} unidades</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700">Quantidade a Adicionar *</label>
            <input
              id="quantity"
              v-model.number="quantity"
              type="number"
              min="1"
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
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {{ productsStore.loading ? 'Adicionando...' : 'Adicionar' }}
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
  (e: 'updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const productsStore = useProductsStore()

const quantity = ref(1)

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    quantity.value = 1
  }
})

const closeModal = () => {
  quantity.value = 1
  emit('close')
}

const handleSubmit = async () => {
  if (!props.product) return

  const success = await productsStore.addStock(props.product.id, quantity.value)

  if (success) {
    emit('updated')
    closeModal()
  }
}
</script>
