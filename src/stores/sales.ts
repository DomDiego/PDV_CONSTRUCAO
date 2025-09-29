import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useProductsStore } from './products'
import type { Sale, SaleItem, Product, Customer, SaleWithCustomer, SaleItemWithProduct } from '@/lib/supabase'

export interface CartItem {
  product: Product
  quantity: number
  unit_price: number
  total_price: number
}

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<SaleWithCustomer[]>([])
  const cart = ref<CartItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.total_price, 0)
  })

  const cartItemsCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0)
  })

  const addToCart = (product: Product, quantity: number) => {
    // Verificar se há estoque suficiente
    if (product.stock_quantity < quantity) {
      error.value = `Estoque insuficiente. Disponível: ${product.stock_quantity} unidades`
      return false
    }

    // Verificar se o produto já está no carrinho
    const existingItemIndex = cart.value.findIndex(item => item.product.id === product.id)

    if (existingItemIndex !== -1) {
      // Atualizar quantidade do item existente
      const existingItem = cart.value[existingItemIndex]
      const newQuantity = existingItem.quantity + quantity

      if (product.stock_quantity < newQuantity) {
        error.value = `Estoque insuficiente. Disponível: ${product.stock_quantity} unidades`
        return false
      }

      existingItem.quantity = newQuantity
      existingItem.total_price = existingItem.unit_price * newQuantity
    } else {
      // Adicionar novo item ao carrinho
      cart.value.push({
        product,
        quantity,
        unit_price: product.price,
        total_price: product.price * quantity
      })
    }

    error.value = null
    return true
  }

  const removeFromCart = (productId: string) => {
    cart.value = cart.value.filter(item => item.product.id !== productId)
  }

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    const item = cart.value.find(item => item.product.id === productId)
    if (!item) return false

    if (quantity <= 0) {
      removeFromCart(productId)
      return true
    }

    if (item.product.stock_quantity < quantity) {
      error.value = `Estoque insuficiente. Disponível: ${item.product.stock_quantity} unidades`
      return false
    }

    item.quantity = quantity
    item.total_price = item.unit_price * quantity
    error.value = null
    return true
  }

  const clearCart = () => {
    cart.value = []
    error.value = null
  }

  const completeSale = async (customerId?: string, paymentMethod?: string) => {
    if (cart.value.length === 0) {
      error.value = 'Carrinho vazio'
      return null
    }

    loading.value = true
    error.value = null

    try {
      // Iniciar transação
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          customer_id: customerId || null,
          total_amount: cartTotal.value,
          payment_method: paymentMethod || null
        }])
        .select()
        .single()

      if (saleError) {
        error.value = saleError.message
        return null
      }

      // Inserir itens da venda
      const saleItems = cart.value.map(item => ({
        sale_id: saleData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) {
        error.value = itemsError.message
        return null
      }

      // Atualizar estoque dos produtos
      const productsStore = useProductsStore()
      for (const item of cart.value) {
        await productsStore.removeStock(item.product.id, item.quantity)
      }

      // Limpar carrinho
      clearCart()

      // Recarregar vendas
      await fetchSales()

      return saleData
    } catch (err) {
      error.value = 'Erro ao finalizar venda'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchSales = async (startDate?: string, endDate?: string) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('sales')
        .select(`
          *,
          customers (
            id,
            name,
            phone,
            email
          )
        `)
        .order('sale_date', { ascending: false })

      if (startDate) {
        query = query.gte('sale_date', startDate)
      }

      if (endDate) {
        query = query.lte('sale_date', endDate)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      sales.value = data || []
    } catch (err) {
      error.value = 'Erro ao carregar vendas'
    } finally {
      loading.value = false
    }
  }

  const getSaleDetails = async (saleId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('sale_items')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            price
          )
        `)
        .eq('sale_id', saleId)

      if (fetchError) {
        error.value = fetchError.message
        return null
      }

      return data as SaleItemWithProduct[]
    } catch (err) {
      error.value = 'Erro ao carregar detalhes da venda'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    sales,
    cart,
    loading,
    error,
    cartTotal,
    cartItemsCount,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    completeSale,
    fetchSales,
    getSaleDetails
  }
})
