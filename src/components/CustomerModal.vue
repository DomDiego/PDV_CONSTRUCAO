<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditing ? 'Editar Cliente' : 'Novo Cliente' }}
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
            <label for="phone" class="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-gray-700">Endereço</label>
            <textarea
              id="address"
              v-model="form.address"
              rows="3"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <div v-if="customersStore.error" class="text-red-600 text-sm">
            {{ customersStore.error }}
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
              :disabled="customersStore.loading"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ customersStore.loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import type { Customer } from '@/lib/supabase'

interface Props {
  isOpen: boolean
  customer?: Customer | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const customersStore = useCustomersStore()

const form = ref({
  name: '',
  phone: '',
  email: '',
  address: ''
})

const isEditing = ref(false)

watch(() => props.customer, (customer) => {
  if (customer) {
    isEditing.value = true
    form.value = {
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || ''
    }
  } else {
    isEditing.value = false
    resetForm()
  }
}, { immediate: true })

const resetForm = () => {
  form.value = {
    name: '',
    phone: '',
    email: '',
    address: ''
  }
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  const customerData = {
    name: form.value.name,
    phone: form.value.phone || undefined,
    email: form.value.email || undefined,
    address: form.value.address || undefined
  }

  let success = false

  if (isEditing.value && props.customer) {
    success = !!(await customersStore.updateCustomer(props.customer.id, customerData))
  } else {
    success = !!(await customersStore.createCustomer(customerData))
  }

  if (success) {
    emit('saved')
    closeModal()
  }
}
</script>
