import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Customer } from '@/lib/supabase'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCustomers = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      customers.value = data || []
    } catch (err) {
      error.value = 'Erro ao carregar clientes'
    } finally {
      loading.value = false
    }
  }

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (createError) {
        error.value = createError.message
        return null
      }

      customers.value.unshift(data)
      return data
    } catch (err) {
      error.value = 'Erro ao criar cliente'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = data
      }

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar cliente'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteCustomer = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (deleteError) {
        error.value = deleteError.message
        return false
      }

      customers.value = customers.value.filter(c => c.id !== id)
      return true
    } catch (err) {
      error.value = 'Erro ao excluir cliente'
      return false
    } finally {
      loading.value = false
    }
  }

  const searchCustomers = (query: string) => {
    if (!query.trim()) return customers.value

    const searchTerm = query.toLowerCase().trim()
    return customers.value.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.phone?.toLowerCase().includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm)
    )
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers
  }
})
