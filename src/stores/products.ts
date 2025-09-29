import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const lowStockProducts = computed(() => {
    return products.value.filter(product => product.stock_quantity <= 5)
  })

  const fetchProducts = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      products.value = data || []
    } catch (err) {
      error.value = 'Erro ao carregar produtos'
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .from('products')
        .insert([{
          ...productData,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (createError) {
        error.value = createError.message
        return null
      }

      products.value.unshift(data)
      return data
    } catch (err) {
      error.value = 'Erro ao criar produto'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = data
      }

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar produto'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (deleteError) {
        error.value = deleteError.message
        return false
      }

      products.value = products.value.filter(p => p.id !== id)
      return true
    } catch (err) {
      error.value = 'Erro ao excluir produto'
      return false
    } finally {
      loading.value = false
    }
  }

  const addStock = async (id: string, quantity: number) => {
    const product = products.value.find(p => p.id === id)
    if (!product) return false

    const newQuantity = product.stock_quantity + quantity
    return !!(await updateProduct(id, { stock_quantity: newQuantity }))
  }

  const removeStock = async (id: string, quantity: number) => {
    const product = products.value.find(p => p.id === id)
    if (!product || product.stock_quantity < quantity) return false

    const newQuantity = product.stock_quantity - quantity
    return !!(await updateProduct(id, { stock_quantity: newQuantity }))
  }

  const searchProducts = (query: string) => {
    if (!query.trim()) return products.value

    const searchTerm = query.toLowerCase().trim()
    return products.value.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    )
  }

  const getProductById = (id: string) => {
    return products.value.find(p => p.id === id)
  }

  return {
    products,
    loading,
    error,
    lowStockProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    addStock,
    removeStock,
    searchProducts,
    getProductById
  }
})
