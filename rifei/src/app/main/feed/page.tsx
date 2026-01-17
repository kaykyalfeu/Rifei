'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Heart, MessageCircle, Share2, Trophy, Award, Flame,
  Check, Sparkles, ChevronRight, Users, Ticket, Crown, Zap, Clock
} from 'lucide-react'
import { Button, Card, Avatar, Badge, Progress, Skeleton } from '@/components/ui'
import { cn, tempoRelativo, formatarMoeda } from '@/lib/utils'

// Dados mockados para demonstração
const rifasEmAlta = [
  { id: '1', imagem: '📱', criador: 'TechStore', titulo: 'iPhone 15 Pro Max' },
  { id: '2', imagem: '🏍️', criador: 'MotoShop', titulo: 'Honda CB 500F' },
  { id: '3', imagem: '🏝️', criador: 'ViagemDream', titulo: 'Cancún - Casal' },
  { id: '4', imagem: '🎮', criador: 'GameWorld', titulo: 'PS5 + 3 Jogos' },
]

const feedPosts = [
  {
    id: '1',
    tipo: 'ganhador',
    usuario: { nome: 'Maria Silva', username: 'mariasilva', avatar: null, nivel: 3, verificado: false },
    rifa: { titulo: 'iPhone 14 Pro', criador: 'TechStore' },
    tempo: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 234,
    comentarios: 45,
    conteudo: 'NÃO ACREDITO! 😭🎉 Ganhei meu primeiro sorteio! Obrigada @TechStore pela transparência!',
  },
  {
    id: '2',
    tipo: 'nova_rifa',
    usuario: { nome: 'GameWorld', username: 'gameworld', avatar: null, nivel: 4, verificado: true },
    rifa: { id: '2', titulo: 'PlayStation 5 + 3 Jogos', imagem: '🎮', preco: 3.00 },
    tempo: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 156,
    comentarios: 28,
    conteudo: '🚀 NOVA RIFA! PlayStation 5 + 3 jogos! Apenas R$3 o número!',
  },
  {
    id: '3',
    tipo: 'conquista',
    usuario: { nome: 'Pedro Santos', username: 'pedrosantos', avatar: null, nivel: 4, verificado: false },
    conquista: { nome: 'Sortudo Iniciante', icone: '🏆' },
    tempo: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 89,
    comentarios: 12,
    conteudo: 'Desbloqueei a conquista "Sortudo Iniciante" após ganhar 3 rifas! 🏆',
  },
  {
    id: '4',
    tipo: 'comentario',
    usuario: { nome: 'Ana Costa', username: 'anacosta', avatar: null, nivel: 2, verificado: false },
    rifaRef: { titulo: 'Viagem para Cancún' },
    tempo: new Date(Date.now() - 8 * 60 * 60 * 1000),
    likes: 45,
    comentarios: 8,
    conteudo: 'Alguém mais participando dessa? Tô com 10 números! 🤞',
  },
]

const minhasParticipacoes = [
  { id: '1', titulo: 'iPhone 15 Pro Max', imagem: '📱', numeros: 5 },
  { id: '2', titulo: 'PS5 + 3 Jogos', imagem: '🎮', numeros: 3 },
  { id: '3', titulo: 'Viagem Cancún', imagem: '🏝️', numeros: 10 },
]

const ranking = [
  { pos: 1, nome: 'Maria S.', avatar: '👩', vitorias: 3, cor: 'from-yellow-400 to-amber-500' },
  { pos: 2, nome: 'João P.', avatar: '👨', vitorias: 2, cor: 'from-gray-300 to-gray-400' },
  { pos: 3, nome: 'Ana C.', avatar: '👩‍🦰', vitorias: 2, cor: 'from-amber-600 to-amber-700' },
]

export default function FeedPage() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Feed Principal */}
      <div className="space-y-6 lg:col-span-2">
        {/* Rifas em Alta (Stories) */}
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Flame className="h-5 w-5 text-orange-500" />
            Rifas em Alta
          </h3>
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
            {rifasEmAlta.map((rifa) => (
              <Link
                key={rifa.id}
                href={`/rifa/${rifa.id}`}
                className="group flex-shrink-0"
              >
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 p-0.5 transition-transform group-hover:scale-105">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white text-4xl dark:bg-gray-900">
                    {rifa.imagem}
                  </div>
                </div>
                <p className="mt-2 max-w-[96px] truncate text-center text-xs font-medium">
                  {rifa.criador}
                </p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Criar Post */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar fallback="V" size="lg" />
            <input
              type="text"
              placeholder="Compartilhe sua sorte ou dê uma dica..."
              className="flex-1 rounded-xl border border-gray-200 bg-white/90 px-4 py-3 transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800/90"
            />
            <Button size="icon">
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Posts do Feed */}
        <div className="space-y-6">
          {feedPosts.map((post) => (
            <Card key={post.id} className="p-5">
              {/* Header do Post */}
              <div className="mb-4 flex items-start gap-3">
                <Avatar
                  fallback={post.usuario.nome.charAt(0)}
                  size="lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{post.usuario.nome}</span>
                    {post.usuario.verificado && (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <Badge variant="primary" className="text-[10px]">
                      Nv.{post.usuario.nivel}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {tempoRelativo(post.tempo)}
                  </span>
                </div>

                {/* Badge do tipo de post */}
                {post.tipo === 'ganhador' && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Trophy className="mr-1 h-3 w-3" /> Ganhador!
                  </Badge>
                )}
                {post.tipo === 'conquista' && (
                  <Badge className="bg-gradient-to-r from-violet-400 to-purple-500 text-white">
                    <Award className="mr-1 h-3 w-3" /> Conquista
                  </Badge>
                )}
              </div>

              {/* Conteúdo */}
              <p className="mb-4 text-lg leading-relaxed">{post.conteudo}</p>

              {/* Preview de Rifa (se for nova rifa) */}
              {post.tipo === 'nova_rifa' && post.rifa && (
                <div className="mb-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 text-3xl">
                      {post.rifa.imagem}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{post.rifa.titulo}</h4>
                      <p className="font-bold text-emerald-500">
                        {formatarMoeda(post.rifa.preco)} /número
                      </p>
                    </div>
                    <Button size="sm">Ver Rifa</Button>
                  </div>
                </div>
              )}

              {/* Preview de Conquista */}
              {post.tipo === 'conquista' && post.conquista && (
                <div className="mb-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 text-2xl shadow-lg">
                    {post.conquista.icone}
                  </div>
                  <div>
                    <h4 className="font-bold">{post.conquista.nome}</h4>
                    <p className="text-sm text-gray-500">Conquista desbloqueada!</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 border-t border-gray-200/50 pt-4 dark:border-gray-700/50">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={cn(
                    'group flex items-center gap-2 transition-colors',
                    likedPosts.has(post.id)
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-500'
                  )}
                >
                  <Heart
                    className={cn(
                      'h-5 w-5 transition-transform group-hover:scale-110',
                      likedPosts.has(post.id) && 'fill-current'
                    )}
                  />
                  <span className="font-medium">
                    {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                  </span>
                </button>
                <button className="group flex items-center gap-2 text-gray-500 transition-colors hover:text-emerald-500">
                  <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">{post.comentarios}</span>
                </button>
                <button className="group ml-auto flex items-center gap-2 text-gray-500 transition-colors hover:text-violet-500">
                  <Share2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Compartilhar</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sidebar Direita */}
      <div className="space-y-6">
        {/* Suas Participações */}
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Ticket className="h-5 w-5 text-emerald-500" />
            Suas Participações
          </h3>
          <div className="space-y-3">
            {minhasParticipacoes.map((rifa) => (
              <Link
                key={rifa.id}
                href={`/rifa/${rifa.id}`}
                className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-emerald-500/10 dark:bg-gray-800/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 text-2xl">
                  {rifa.imagem}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{rifa.titulo}</p>
                  <p className="text-sm text-gray-500">{rifa.numeros} números</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
          </div>
          <Button variant="outline" className="mt-4 w-full">
            Ver todas
          </Button>
        </Card>

        {/* Ranking */}
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Crown className="h-5 w-5 text-yellow-500" />
            Top Sortudos da Semana
          </h3>
          <div className="space-y-3">
            {ranking.map((user) => (
              <div key={user.pos} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br font-bold text-white',
                    user.cor
                  )}
                >
                  {user.pos}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-violet-400/20 text-xl">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.nome}</p>
                  <p className="text-sm text-gray-500">{user.vitorias} vitórias</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sorte Acumulada */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-violet-600 p-5 text-white">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="font-bold">Sua Sorte Acumulada</span>
          </div>
          <div className="mb-2 text-4xl font-black">+15%</div>
          <p className="mb-4 text-sm text-white/80">
            Participe de mais rifas para aumentar!
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-3/5 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
