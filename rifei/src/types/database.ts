// ===========================================
// RIFEI - Tipos do Banco de Dados
// ===========================================

// Tipos base do Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ===========================================
// ENUMS
// ===========================================

export type StatusRifa = 'rascunho' | 'ativa' | 'pausada' | 'encerrada' | 'cancelada' | 'sorteada'
export type StatusPagamento = 'pendente' | 'aprovado' | 'recusado' | 'reembolsado' | 'cancelado'
export type StatusNumero = 'disponivel' | 'reservado' | 'pago' | 'premiado'
export type TipoNotificacao = 'compra' | 'venda' | 'sorteio' | 'comentario' | 'seguidor' | 'conquista' | 'sistema'
export type TipoPost = 'ganhador' | 'nova_rifa' | 'conquista' | 'comentario' | 'dica' | 'geral'
export type NivelUsuario = 1 | 2 | 3 | 4 | 5

// ===========================================
// TABELA: usuarios
// ===========================================

export interface Usuario {
  id: string
  email: string
  nome: string
  nome_usuario: string // @username
  avatar_url: string | null
  bio: string | null
  telefone: string | null
  cpf: string | null // Criptografado
  data_nascimento: string | null
  
  // Verificação
  email_verificado: boolean
  telefone_verificado: boolean
  documento_verificado: boolean
  is_criador_verificado: boolean
  
  // Gamificação
  nivel: NivelUsuario
  xp: number
  sorte_acumulada: number // Porcentagem de sorte extra
  
  // Estatísticas
  total_participacoes: number
  total_vitorias: number
  total_rifas_criadas: number
  total_arrecadado: number
  
  // Configurações
  notificacoes_email: boolean
  notificacoes_push: boolean
  tema_preferido: 'light' | 'dark' | 'system'
  
  // Timestamps
  created_at: string
  updated_at: string
  ultimo_acesso: string | null
}

export interface UsuarioInsert extends Omit<Usuario, 'id' | 'created_at' | 'updated_at'> {
  id?: string
}

export interface UsuarioUpdate extends Partial<UsuarioInsert> {}

// ===========================================
// TABELA: rifas
// ===========================================

export interface Rifa {
  id: string
  criador_id: string
  
  // Informações básicas
  titulo: string
  descricao: string
  slug: string // URL amigável
  categoria_id: string
  
  // Imagens
  imagem_principal: string
  imagens_galeria: string[]
  
  // Configuração de números
  total_numeros: number
  preco_numero: number
  minimo_numeros_compra: number
  maximo_numeros_compra: number
  
  // Datas
  data_inicio: string
  data_fim: string
  data_sorteio: string | null
  
  // Status
  status: StatusRifa
  numeros_vendidos: number
  valor_arrecadado: number
  
  // Sorteio
  numero_sorteado: number | null
  ganhador_id: string | null
  metodo_sorteio: 'automatico' | 'loteria_federal' | 'manual'
  loteria_concurso: string | null // Número do concurso da Loteria Federal
  
  // Opções
  permite_escolher_numeros: boolean
  mostrar_participantes: boolean
  is_destaque: boolean
  is_premium: boolean
  
  // Estatísticas sociais
  total_likes: number
  total_comentarios: number
  total_compartilhamentos: number
  total_visualizacoes: number
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface RifaInsert extends Omit<Rifa, 'id' | 'created_at' | 'updated_at' | 'numeros_vendidos' | 'valor_arrecadado' | 'total_likes' | 'total_comentarios' | 'total_compartilhamentos' | 'total_visualizacoes'> {
  id?: string
}

export interface RifaUpdate extends Partial<RifaInsert> {}

// Rifa com dados do criador (para listagens)
export interface RifaComCriador extends Rifa {
  criador: Pick<Usuario, 'id' | 'nome' | 'nome_usuario' | 'avatar_url' | 'nivel' | 'is_criador_verificado'>
  categoria: Categoria
}

// ===========================================
// TABELA: categorias
// ===========================================

export interface Categoria {
  id: string
  nome: string
  slug: string
  icone: string
  cor: string
  descricao: string | null
  ordem: number
  ativa: boolean
  total_rifas: number
  created_at: string
}

// ===========================================
// TABELA: numeros_rifa
// ===========================================

export interface NumeroRifa {
  id: string
  rifa_id: string
  numero: number
  status: StatusNumero
  
  // Proprietário
  usuario_id: string | null
  pagamento_id: string | null
  
  // Reserva temporária
  reservado_ate: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

// ===========================================
// TABELA: pagamentos
// ===========================================

export interface Pagamento {
  id: string
  usuario_id: string
  rifa_id: string
  
  // Valores
  quantidade_numeros: number
  valor_unitario: number
  valor_total: number
  taxa_plataforma: number
  valor_liquido: number
  
  // Mercado Pago
  mp_payment_id: string | null
  mp_preference_id: string | null
  mp_merchant_order_id: string | null
  mp_status: string | null
  mp_status_detail: string | null
  metodo_pagamento: string | null
  
  // Status
  status: StatusPagamento
  
  // Números comprados
  numeros: number[]
  
  // Timestamps
  created_at: string
  updated_at: string
  pago_em: string | null
}

export interface PagamentoInsert extends Omit<Pagamento, 'id' | 'created_at' | 'updated_at'> {
  id?: string
}

// ===========================================
// TABELA: posts_feed
// ===========================================

export interface PostFeed {
  id: string
  usuario_id: string
  tipo: TipoPost
  conteudo: string
  
  // Referências opcionais
  rifa_id: string | null
  conquista_id: string | null
  
  // Mídia
  imagens: string[]
  
  // Estatísticas
  total_likes: number
  total_comentarios: number
  total_compartilhamentos: number
  
  // Visibilidade
  is_publico: boolean
  is_fixado: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

// Post com dados completos para exibição
export interface PostFeedCompleto extends PostFeed {
  usuario: Pick<Usuario, 'id' | 'nome' | 'nome_usuario' | 'avatar_url' | 'nivel' | 'is_criador_verificado'>
  rifa?: Pick<Rifa, 'id' | 'titulo' | 'slug' | 'imagem_principal' | 'preco_numero'>
  conquista?: Conquista
  liked_by_user?: boolean
}

// ===========================================
// TABELA: comentarios
// ===========================================

export interface Comentario {
  id: string
  usuario_id: string
  
  // Pode ser em rifa ou post
  rifa_id: string | null
  post_id: string | null
  
  // Resposta a outro comentário
  parent_id: string | null
  
  conteudo: string
  total_likes: number
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface ComentarioCompleto extends Comentario {
  usuario: Pick<Usuario, 'id' | 'nome' | 'nome_usuario' | 'avatar_url' | 'nivel'>
  respostas?: ComentarioCompleto[]
}

// ===========================================
// TABELA: likes
// ===========================================

export interface Like {
  id: string
  usuario_id: string
  rifa_id: string | null
  post_id: string | null
  comentario_id: string | null
  created_at: string
}

// ===========================================
// TABELA: conquistas
// ===========================================

export interface Conquista {
  id: string
  nome: string
  slug: string
  descricao: string
  icone: string
  cor: string
  xp_reward: number
  
  // Requisitos
  tipo_requisito: 'participacoes' | 'vitorias' | 'rifas_criadas' | 'comentarios' | 'seguidores' | 'nivel' | 'especial'
  valor_requisito: number
  
  // Raridade
  raridade: 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario'
  
  ativa: boolean
  created_at: string
}

// ===========================================
// TABELA: conquistas_usuarios
// ===========================================

export interface ConquistaUsuario {
  id: string
  usuario_id: string
  conquista_id: string
  conquistada_em: string
}

export interface ConquistaUsuarioCompleta extends ConquistaUsuario {
  conquista: Conquista
}

// ===========================================
// TABELA: seguidores
// ===========================================

export interface Seguidor {
  id: string
  seguidor_id: string
  seguindo_id: string
  created_at: string
}

// ===========================================
// TABELA: notificacoes
// ===========================================

export interface Notificacao {
  id: string
  usuario_id: string
  tipo: TipoNotificacao
  titulo: string
  mensagem: string
  
  // Referências
  rifa_id: string | null
  post_id: string | null
  usuario_origem_id: string | null
  
  // URL para redirecionar
  action_url: string | null
  
  lida: boolean
  lida_em: string | null
  
  created_at: string
}

// ===========================================
// TABELA: comunidades
// ===========================================

export interface Comunidade {
  id: string
  criador_id: string
  nome: string
  slug: string
  descricao: string
  avatar_url: string | null
  banner_url: string | null
  
  // Configurações
  is_publica: boolean
  requer_aprovacao: boolean
  
  // Estatísticas
  total_membros: number
  total_posts: number
  
  created_at: string
  updated_at: string
}

// ===========================================
// TABELA: membros_comunidade
// ===========================================

export interface MembroComunidade {
  id: string
  comunidade_id: string
  usuario_id: string
  role: 'admin' | 'moderador' | 'membro'
  status: 'ativo' | 'pendente' | 'banido'
  joined_at: string
}

// ===========================================
// TABELA: configuracoes_plataforma
// ===========================================

export interface ConfiguracaoPlataforma {
  id: string
  chave: string
  valor: Json
  descricao: string
  updated_at: string
}

// ===========================================
// TYPES AUXILIARES
// ===========================================

// Para paginação
export interface PaginacaoParams {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface PaginacaoResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

// Para filtros de rifas
export interface FiltrosRifa {
  categoria?: string
  status?: StatusRifa
  preco_min?: number
  preco_max?: number
  criador_id?: string
  busca?: string
  ordenar_por?: 'recentes' | 'populares' | 'preco_asc' | 'preco_desc' | 'terminando'
}

// Para estatísticas do dashboard
export interface EstatisticasDashboard {
  total_rifas_ativas: number
  total_vendido: number
  total_participantes: number
  total_ganhadores: number
  vendas_por_dia: { data: string; valor: number }[]
  rifas_mais_vendidas: Pick<Rifa, 'id' | 'titulo' | 'numeros_vendidos' | 'valor_arrecadado'>[]
}

// Para o feed
export interface FeedParams {
  tipo?: 'todos' | 'seguindo' | 'populares'
  usuario_id?: string
  comunidade_id?: string
}

// ===========================================
// DATABASE TYPES (Gerado pelo Supabase CLI)
// ===========================================

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario
        Insert: UsuarioInsert
        Update: UsuarioUpdate
      }
      rifas: {
        Row: Rifa
        Insert: RifaInsert
        Update: RifaUpdate
      }
      categorias: {
        Row: Categoria
        Insert: Omit<Categoria, 'id' | 'created_at' | 'total_rifas'>
        Update: Partial<Omit<Categoria, 'id' | 'created_at'>>
      }
      numeros_rifa: {
        Row: NumeroRifa
        Insert: Omit<NumeroRifa, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<NumeroRifa, 'id' | 'created_at'>>
      }
      pagamentos: {
        Row: Pagamento
        Insert: PagamentoInsert
        Update: Partial<PagamentoInsert>
      }
      posts_feed: {
        Row: PostFeed
        Insert: Omit<PostFeed, 'id' | 'created_at' | 'updated_at' | 'total_likes' | 'total_comentarios' | 'total_compartilhamentos'>
        Update: Partial<Omit<PostFeed, 'id' | 'created_at'>>
      }
      comentarios: {
        Row: Comentario
        Insert: Omit<Comentario, 'id' | 'created_at' | 'updated_at' | 'total_likes'>
        Update: Partial<Omit<Comentario, 'id' | 'created_at'>>
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'id' | 'created_at'>
        Update: never
      }
      conquistas: {
        Row: Conquista
        Insert: Omit<Conquista, 'id' | 'created_at'>
        Update: Partial<Omit<Conquista, 'id' | 'created_at'>>
      }
      conquistas_usuarios: {
        Row: ConquistaUsuario
        Insert: Omit<ConquistaUsuario, 'id'>
        Update: never
      }
      seguidores: {
        Row: Seguidor
        Insert: Omit<Seguidor, 'id' | 'created_at'>
        Update: never
      }
      notificacoes: {
        Row: Notificacao
        Insert: Omit<Notificacao, 'id' | 'created_at'>
        Update: Partial<Omit<Notificacao, 'id' | 'created_at'>>
      }
      comunidades: {
        Row: Comunidade
        Insert: Omit<Comunidade, 'id' | 'created_at' | 'updated_at' | 'total_membros' | 'total_posts'>
        Update: Partial<Omit<Comunidade, 'id' | 'created_at'>>
      }
      membros_comunidade: {
        Row: MembroComunidade
        Insert: Omit<MembroComunidade, 'id' | 'joined_at'>
        Update: Partial<Omit<MembroComunidade, 'id' | 'joined_at'>>
      }
      configuracoes_plataforma: {
        Row: ConfiguracaoPlataforma
        Insert: Omit<ConfiguracaoPlataforma, 'id' | 'updated_at'>
        Update: Partial<Omit<ConfiguracaoPlataforma, 'id'>>
      }
    }
    Views: {}
    Functions: {
      comprar_numeros: {
        Args: {
          p_rifa_id: string
          p_usuario_id: string
          p_numeros: number[]
        }
        Returns: { success: boolean; pagamento_id: string; message: string }
      }
      realizar_sorteio: {
        Args: {
          p_rifa_id: string
        }
        Returns: { success: boolean; numero_sorteado: number; ganhador_id: string }
      }
      atualizar_nivel_usuario: {
        Args: {
          p_usuario_id: string
        }
        Returns: { novo_nivel: number; xp_atual: number }
      }
    }
    Enums: {
      status_rifa: StatusRifa
      status_pagamento: StatusPagamento
      status_numero: StatusNumero
      tipo_notificacao: TipoNotificacao
      tipo_post: TipoPost
    }
  }
}
