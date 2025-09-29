// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// CORRIGIDO: Use DATABASE_URL para corresponder ao Netlify/Extensão Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ... (Resto do seu código)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
