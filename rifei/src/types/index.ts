// Exporta todos os tipos do banco de dados
export * from './database'

// Tipos adicionais para a aplicação

// Estado de autenticação
export interface AuthState {
  user: import('./database').Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Resposta padrão da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Props de componentes comuns
export interface WithClassName {
  className?: string
}

export interface WithChildren {
  children: React.ReactNode
}

// Tipo para parâmetros de rota do Next.js
export interface PageParams {
  params: { [key: string]: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Tipo para ações de formulário
export interface FormState {
  errors?: { [key: string]: string[] }
  message?: string
  success?: boolean
}

// Tipo para item do carrinho de compra de números
export interface CarrinhoItem {
  rifaId: string
  numeros: number[]
  precoUnitario: number
  total: number
}

// Tipo para preferência de checkout do Mercado Pago
export interface PreferenciaCheckout {
  id: string
  init_point: string
  sandbox_init_point: string
}

// Tipo para resultado de busca
export interface ResultadoBusca {
  rifas: import('./database').RifaComCriador[]
  usuarios: Pick<import('./database').Usuario, 'id' | 'nome' | 'nome_usuario' | 'avatar_url'>[]
  total: number
}

// Tipo para notificação em tempo real
export interface NotificacaoRealtime {
  id: string
  tipo: import('./database').TipoNotificacao
  titulo: string
  mensagem: string
  timestamp: number
}
