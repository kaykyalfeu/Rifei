import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

// Cliente para uso em Server Components
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se as variáveis não estiverem configuradas, retorna um cliente fake
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase não configurado. Usando cliente mock (server).')
    return null as any
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignorar erro em Server Components (read-only)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignorar erro em Server Components (read-only)
          }
        },
      },
    }
  )
}

// Cliente com service role para operações administrativas
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Se as variáveis não estiverem configuradas, retorna um cliente fake
  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase não configurado. Usando cliente mock (admin).')
    return null as any
  }

  return createServerClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        get() { return undefined },
        set() {},
        remove() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
