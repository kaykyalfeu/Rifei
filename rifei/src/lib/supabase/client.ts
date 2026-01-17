import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Cliente para uso no browser (Client Components)
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se as variáveis não estiverem configuradas, retorna um cliente fake
  // Isso evita que o build quebre na Vercel
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase não configurado. Usando cliente mock.')
    return null as any
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

// Exportar instância singleton para uso simples
let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}
