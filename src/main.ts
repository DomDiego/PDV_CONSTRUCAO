import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// DEBUG das variáveis de ambiente
console.log('ENV:', import.meta.env)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'OK' : 'MISSING')

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
