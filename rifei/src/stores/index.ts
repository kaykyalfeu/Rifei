import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Usuario } from '@/types/database'

// ===========================================
// AUTH STORE
// ===========================================

interface AuthState {
  user: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: Usuario | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false,
    isLoading: false 
  }),
}))

// ===========================================
// CARRINHO STORE
// ===========================================

interface CarrinhoItem {
  rifaId: string
  rifaTitulo: string
  rifaSlug: string
  numeros: number[]
  precoUnitario: number
}

interface CarrinhoState {
  items: CarrinhoItem[]
  
  // Actions
  addItem: (item: CarrinhoItem) => void
  removeItem: (rifaId: string) => void
  updateNumeros: (rifaId: string, numeros: number[]) => void
  clearCart: () => void
  
  // Computed
  getTotalItens: () => number
  getTotalValor: () => number
  getItemByRifa: (rifaId: string) => CarrinhoItem | undefined
}

export const useCarrinhoStore = create<CarrinhoState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existingIndex = state.items.findIndex(i => i.rifaId === item.rifaId)
        
        if (existingIndex >= 0) {
          // Atualiza item existente
          const newItems = [...state.items]
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            numeros: [...new Set([...newItems[existingIndex].numeros, ...item.numeros])],
          }
          return { items: newItems }
        }
        
        // Adiciona novo item
        return { items: [...state.items, item] }
      }),
      
      removeItem: (rifaId) => set((state) => ({
        items: state.items.filter(i => i.rifaId !== rifaId)
      })),
      
      updateNumeros: (rifaId, numeros) => set((state) => ({
        items: state.items.map(i => 
          i.rifaId === rifaId ? { ...i, numeros } : i
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotalItens: () => {
        return get().items.reduce((acc, item) => acc + item.numeros.length, 0)
      },
      
      getTotalValor: () => {
        return get().items.reduce(
          (acc, item) => acc + (item.numeros.length * item.precoUnitario), 
          0
        )
      },
      
      getItemByRifa: (rifaId) => {
        return get().items.find(i => i.rifaId === rifaId)
      },
    }),
    {
      name: 'rifei-carrinho',
    }
  )
)

// ===========================================
// UI STORE
// ===========================================

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  
  // Actions
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: true,
      mobileMenuOpen: false,
      
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      closeMobileMenu: () => set({ mobileMenuOpen: false }),
    }),
    {
      name: 'rifei-ui',
    }
  )
)

// ===========================================
// NOTIFICAÇÕES STORE
// ===========================================

interface Notificacao {
  id: string
  tipo: 'success' | 'error' | 'warning' | 'info'
  titulo: string
  mensagem?: string
  duracao?: number
}

interface NotificacoesState {
  notificacoes: Notificacao[]
  naoLidas: number
  
  // Actions
  addNotificacao: (notificacao: Omit<Notificacao, 'id'>) => void
  removeNotificacao: (id: string) => void
  clearAll: () => void
  setNaoLidas: (count: number) => void
}

export const useNotificacoesStore = create<NotificacoesState>()((set) => ({
  notificacoes: [],
  naoLidas: 0,
  
  addNotificacao: (notificacao) => set((state) => ({
    notificacoes: [
      ...state.notificacoes,
      { 
        ...notificacao, 
        id: Math.random().toString(36).substring(7),
        duracao: notificacao.duracao || 5000,
      }
    ]
  })),
  
  removeNotificacao: (id) => set((state) => ({
    notificacoes: state.notificacoes.filter(n => n.id !== id)
  })),
  
  clearAll: () => set({ notificacoes: [] }),
  
  setNaoLidas: (naoLidas) => set({ naoLidas }),
}))

// ===========================================
// FILTROS STORE (para marketplace)
// ===========================================

interface FiltrosState {
  categoria: string | null
  precoMin: number | null
  precoMax: number | null
  ordenacao: 'recentes' | 'populares' | 'preco_asc' | 'preco_desc' | 'terminando'
  busca: string
  
  // Actions
  setCategoria: (categoria: string | null) => void
  setPrecoRange: (min: number | null, max: number | null) => void
  setOrdenacao: (ordenacao: FiltrosState['ordenacao']) => void
  setBusca: (busca: string) => void
  resetFiltros: () => void
}

export const useFiltrosStore = create<FiltrosState>()((set) => ({
  categoria: null,
  precoMin: null,
  precoMax: null,
  ordenacao: 'recentes',
  busca: '',
  
  setCategoria: (categoria) => set({ categoria }),
  setPrecoRange: (precoMin, precoMax) => set({ precoMin, precoMax }),
  setOrdenacao: (ordenacao) => set({ ordenacao }),
  setBusca: (busca) => set({ busca }),
  resetFiltros: () => set({
    categoria: null,
    precoMin: null,
    precoMax: null,
    ordenacao: 'recentes',
    busca: '',
  }),
}))
