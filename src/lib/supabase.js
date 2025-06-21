import { createClient } from '@supabase/supabase-js'

// Essas variáveis deveriam idealmente estar em variáveis de ambiente
// Em produção, use import.meta.env.VITE_SUPABASE_URL e import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseUrl = 'https://zdfrfzgnhdnhgmihmrfo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZnJmemduaGRuaGdtaWhtcmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTkzNjMsImV4cCI6MjA2NjAzNTM2M30.WA8_EB2fSKLU8YwOgbF08VqPsRvCnJZv-3u82DfB3B4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
