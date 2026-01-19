'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores'
import type { Usuario, Rifa, RifaComCriador, FiltrosRifa, PaginacaoResponse } from '@/types'

// ===========================================
// useAuth - Hook de autenticação
// ===========================================

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout } = useAuthStore()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Buscar sessão inicial
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Buscar dados completos do usuário
          const { data: usuario } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUser(usuario)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erro ao buscar sessão:', error)
        setUser(null)
      }
    }

    getSession()

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: usuario } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUser(usuario)
        } else if (event === 'SIGNED_OUT') {
          logout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, setUser, setLoading, logout])

  const signOut = async () => {
    await supabase.auth.signOut()
    logout()
    router.push('/')
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    signOut,
  }
}

// ===========================================
// useRifas - Hook para listar rifas
// ===========================================

interface UseRifasOptions {
  filtros?: FiltrosRifa
  limite?: number
  pagina?: number
}

export function useRifas(options: UseRifasOptions = {}) {
  const [rifas, setRifas] = useState<RifaComCriador[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  
  const supabase = getSupabaseBrowserClient()
  const { filtros, limite = 12, pagina = 1 } = options

  const fetchRifas = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('rifas')
        .select(`
          *,
          criador:usuarios!criador_id(id, nome, nome_usuario, avatar_url, nivel, is_criador_verificado),
          categoria:categorias!categoria_id(*)
        `, { count: 'exact' })
        .eq('status', 'ativa')

      // Aplicar filtros
      if (filtros?.categoria) {
        query = query.eq('categoria_id', filtros.categoria)
      }
      
      if (filtros?.preco_min) {
        query = query.gte('preco_numero', filtros.preco_min)
      }
      
      if (filtros?.preco_max) {
        query = query.lte('preco_numero', filtros.preco_max)
      }
      
      if (filtros?.busca) {
        query = query.ilike('titulo', `%${filtros.busca}%`)
      }

      // Ordenação
      switch (filtros?.ordenar_por) {
        case 'populares':
          query = query.order('numeros_vendidos', { ascending: false })
          break
        case 'preco_asc':
          query = query.order('preco_numero', { ascending: true })
          break
        case 'preco_desc':
          query = query.order('preco_numero', { ascending: false })
          break
        case 'terminando':
          query = query.order('data_fim', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      // Paginação
      const from = (pagina - 1) * limite
      const to = from + limite - 1
      query = query.range(from, to)

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      setRifas(data as unknown as RifaComCriador[])
      setTotal(count || 0)
      setHasMore(count ? from + limite < count : false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar rifas')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, filtros, limite, pagina])

  useEffect(() => {
    fetchRifas()
  }, [fetchRifas])

  return {
    rifas,
    isLoading,
    error,
    hasMore,
    total,
    refetch: fetchRifas,
  }
}

// ===========================================
// useRifa - Hook para uma rifa específica
// ===========================================

export function useRifa(idOrSlug: string) {
  const [rifa, setRifa] = useState<RifaComCriador | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchRifa = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Tentar buscar por slug primeiro, depois por ID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
        
        const query = supabase
          .from('rifas')
          .select(`
            *,
            criador:usuarios!criador_id(id, nome, nome_usuario, avatar_url, nivel, is_criador_verificado),
            categoria:categorias!categoria_id(*)
          `)
        
        const { data, error: queryError } = isUUID
          ? await query.eq('id', idOrSlug).single()
          : await query.eq('slug', idOrSlug).single()

        if (queryError) throw queryError

        setRifa(data as unknown as RifaComCriador)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar rifa')
      } finally {
        setIsLoading(false)
      }
    }

    if (idOrSlug) {
      fetchRifa()
    }
  }, [supabase, idOrSlug])

  return { rifa, isLoading, error }
}

// ===========================================
// useNumerosRifa - Hook para números de uma rifa
// ===========================================

export function useNumerosRifa(rifaId: string) {
  const [numeros, setNumeros] = useState<{
    disponiveis: number[]
    vendidos: number[]
    reservados: number[]
  }>({ disponiveis: [], vendidos: [], reservados: [] })
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchNumeros = async () => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from('numeros_rifa')
          .select('numero, status')
          .eq('rifa_id', rifaId)
          .order('numero')

        if (error) throw error

        const disponiveis: number[] = []
        const vendidos: number[] = []
        const reservados: number[] = []

        data?.forEach(n => {
          switch (n.status) {
            case 'disponivel':
              disponiveis.push(n.numero)
              break
            case 'pago':
            case 'premiado':
              vendidos.push(n.numero)
              break
            case 'reservado':
              reservados.push(n.numero)
              break
          }
        })

        setNumeros({ disponiveis, vendidos, reservados })
      } catch (err) {
        console.error('Erro ao buscar números:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (rifaId) {
      fetchNumeros()

      // Subscription para updates em tempo real
      const channel = supabase
        .channel(`numeros-${rifaId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'numeros_rifa',
            filter: `rifa_id=eq.${rifaId}`,
          },
          () => {
            fetchNumeros()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, rifaId])

  return { numeros, isLoading }
}

// ===========================================
// useDebounce - Hook para debounce de valores
// ===========================================

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// ===========================================
// useLocalStorage - Hook para localStorage
// ===========================================

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Erro ao salvar localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

// ===========================================
// useMediaQuery - Hook para media queries
// ===========================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Helpers de media query
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')

// ===========================================
// useClickOutside - Hook para detectar clique fora
// ===========================================

export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [callback])

  return ref
}

// ===========================================
// useIntersectionObserver - Hook para lazy loading
// ===========================================

export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => observer.disconnect()
  }, [options])

  return [ref, isVisible]
}
