<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Verificar autenticação ao iniciar a aplicação
  authStore.checkAuth()
})
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
