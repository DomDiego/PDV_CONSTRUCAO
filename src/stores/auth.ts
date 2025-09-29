import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        error.value = authError.message
        return false
      }

      user.value = data.user
      return true
    } catch (err) {
      error.value = 'Erro inesperado no login'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    
    try {
      await supabase.auth.signOut()
      user.value = null
    } catch (err) {
      console.error('Erro no logout:', err)
    } finally {
      loading.value = false
    }
  }

  const checkAuth = async () => {
    loading.value = true
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // Escutar mudanças no estado de autenticação
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null
  })

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})
