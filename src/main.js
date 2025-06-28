import { createApp } from 'vue'
import './index.css'
import './style.css'
import './assets/dropdown-fix.css'
import App from './App.vue'
import { supabase } from './lib/supabase'
import router from './router'

// Cria a instância do app Vue
const app = createApp(App)

// Adiciona o Supabase ao contexto global da aplicação
app.config.globalProperties.$supabase = supabase

// Adiciona o router à aplicação
app.use(router)

// Monta a aplicação
app.mount('#app')
