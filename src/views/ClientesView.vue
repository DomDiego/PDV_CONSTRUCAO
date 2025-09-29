<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Clientes</h1>
      <button
        @click="openModal()"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
      >
        Adicionar Cliente
      </button>
    </div>

    <!-- Barra de busca -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nome, telefone ou email..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    <!-- Loading -->
    <div v-if="customersStore.loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-gray-600">Carregando clientes...</p>
    </div>

    <!-- Error -->
    <div v-else-if="customersStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ customersStore.error }}
    </div>

    <!-- Lista de clientes -->
    <div v-else-if="filteredCustomers.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Telefone
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="customer in filteredCustomers" :key="customer.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
              <div v-if="customer.address" class="text-sm text-gray-500">{{ customer.address }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ customer.phone || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ customer.email || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="openModal(customer)"
                class="text-indigo-600 hover:text-indigo-900 transition duration-200"
              >
                Editar
              </button>
              <button
                @click="confirmDelete(customer)"
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
      <div class="text-gray-400 text-6xl mb-4">👥</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
      <p class="text-gray-500 mb-4">
        {{ searchQuery ? 'Nenhum cliente corresponde à sua busca.' : 'Comece adicionando seu primeiro cliente.' }}
      </p>
      <button
        v-if="!searchQuery"
        @click="openModal()"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
      >
        Adicionar Primeiro Cliente
      </button>
    </div>

    <!-- Modal de cliente -->
    <CustomerModal
      :is-open="isModalOpen"
      :customer="selectedCustomer"
      @close="closeModal"
      @saved="handleCustomerSaved"
    />

    <!-- Modal de confirmação de exclusão -->
    <div v-if="customerToDelete" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
          <p class="text-sm text-gray-500 mb-6">
            Tem certeza que deseja excluir o cliente <strong>{{ customerToDelete.name }}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div class="flex justify-center space-x-3">
            <button
              @click="customerToDelete = null"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              @click="handleDelete"
              :disabled="customersStore.loading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {{ customersStore.loading ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import CustomerModal from '@/components/CustomerModal.vue'
import type { Customer } from '@/lib/supabase'

const customersStore = useCustomersStore()

const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedCustomer = ref<Customer | null>(null)
const customerToDelete = ref<Customer | null>(null)

const filteredCustomers = computed(() => {
  return customersStore.searchCustomers(searchQuery.value)
})

const openModal = (customer?: Customer) => {
  selectedCustomer.value = customer || null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCustomer.value = null
}

const handleCustomerSaved = () => {
  // Modal será fechado automaticamente
}

const confirmDelete = (customer: Customer) => {
  customerToDelete.value = customer
}

const handleDelete = async () => {
  if (customerToDelete.value) {
    const success = await customersStore.deleteCustomer(customerToDelete.value.id)
    if (success) {
      customerToDelete.value = null
    }
  }
}

onMounted(() => {
  customersStore.fetchCustomers()
})
</script>
