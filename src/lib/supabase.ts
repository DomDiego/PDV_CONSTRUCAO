import { createClient } from '@supabase/supabase-js'

// Estas variáveis devem ser configuradas com suas credenciais do Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  sku?: string
  price: number
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  customer_id?: string
  total_amount: number
  payment_method?: string
  sale_date: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
}

// Tipos expandidos para consultas com joins
export interface SaleWithCustomer extends Sale {
  customers?: Customer
}

export interface SaleItemWithProduct extends SaleItem {
  products?: Product
}
