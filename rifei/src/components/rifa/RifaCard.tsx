'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Ticket, Clock, Users, TrendingUp, Heart, Share2 } from 'lucide-react'
import { formatarMoeda, formatarNumero, diasRestantes } from '@/lib/utils'
import { Card, Badge, Progress, Avatar } from '@/components/ui'
import type { Rifa, RifaComCriador } from '@/types/database'

interface RifaCardProps {
  rifa: RifaComCriador
  variant?: 'default' | 'compact' | 'featured'
  showCreator?: boolean
  showProgress?: boolean
}

export function RifaCard({
  rifa,
  variant = 'default',
  showCreator = true,
  showProgress = true,
}: RifaCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(rifa.total_likes)

  const progresso = (rifa.numeros_vendidos / rifa.total_numeros) * 100
  const diasFaltando = diasRestantes(rifa.data_fim)
  const isEncerrandoEmBreve = diasFaltando <= 3 && diasFaltando > 0
  const isEncerrada = rifa.status === 'encerrada' || rifa.status === 'sorteada'

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // TODO: Integrar com API de likes
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({
          title: rifa.titulo,
          text: rifa.descricao,
          url: `/main/marketplace/${rifa.slug}`,
        })
      } catch (error) {
        // User cancelled or error
      }
    }
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/main/marketplace/${rifa.slug}`}
        className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
          {rifa.imagem_principal ? (
            <Image
              src={rifa.imagem_principal}
              alt={rifa.titulo}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-violet-100 dark:from-emerald-900/20 dark:to-violet-900/20">
              <Ticket className="h-8 w-8 text-emerald-500" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="mb-1 font-bold line-clamp-1">{rifa.titulo}</h3>
          <p className="mb-2 text-sm text-gray-500 line-clamp-1">{rifa.descricao}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {formatarNumero(rifa.numeros_vendidos)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {diasFaltando}d
            </span>
            <span className="font-bold text-emerald-600">
              {formatarMoeda(rifa.preco_numero)}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/main/marketplace/${rifa.slug}`}
      className={`group relative overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-xl transition-all hover:-translate-y-2 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/80 ${
        variant === 'featured' ? 'md:col-span-2' : ''
      }`}
    >
      {/* Imagem */}
      <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${
        variant === 'featured' ? 'aspect-[21/9]' : 'aspect-card'
      }`}>
        {rifa.imagem_principal ? (
          <Image
            src={rifa.imagem_principal}
            alt={rifa.titulo}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-violet-100 dark:from-emerald-900/20 dark:to-violet-900/20">
            <Ticket className="h-16 w-16 text-emerald-500 opacity-50" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant="default" className="bg-emerald-500 text-white">
            {rifa.categoria.nome}
          </Badge>
          {isEncerrandoEmBreve && (
            <Badge variant="destructive" className="animate-pulse">
              Encerrando em {diasFaltando}d!
            </Badge>
          )}
          {isEncerrada && (
            <Badge variant="secondary">
              {rifa.status === 'sorteada' ? 'Sorteada' : 'Encerrada'}
            </Badge>
          )}
          {rifa.is_destaque && (
            <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
              ⭐ Destaque
            </Badge>
          )}
        </div>

        {/* Ações */}
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={handleLike}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:scale-110 dark:bg-gray-900/90"
          >
            <Heart
              className={`h-5 w-5 ${
                isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            />
          </button>
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:scale-110 dark:bg-gray-900/90"
          >
            <Share2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Título e Descrição */}
        <h3 className="mb-2 text-xl font-bold line-clamp-1">{rifa.titulo}</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {rifa.descricao}
        </p>

        {/* Criador */}
        {showCreator && (
          <div className="mb-4 flex items-center gap-3">
            <Avatar size="sm" user={rifa.criador} />
            <div className="flex-1">
              <p className="text-sm font-medium">{rifa.criador.nome}</p>
              <p className="text-xs text-gray-500">
                @{rifa.criador.nome_usuario}
                {rifa.criador.is_criador_verificado && (
                  <span className="ml-1">✓</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Progresso */}
        {showProgress && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progresso</span>
              <span className="font-bold">{progresso.toFixed(1)}%</span>
            </div>
            <Progress value={progresso} />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                <Users className="inline h-3 w-3" /> {formatarNumero(rifa.numeros_vendidos)}{' '}
                vendidos
              </span>
              <span>{formatarNumero(rifa.total_numeros)} números</span>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-xs text-gray-500">
              <Heart className="h-3 w-3" />
            </div>
            <div className="text-sm font-bold">{formatarNumero(likes)}</div>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3" />
            </div>
            <div className="text-sm font-bold">{formatarNumero(rifa.total_visualizacoes)}</div>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
            </div>
            <div className="text-sm font-bold">{diasFaltando}d</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">A partir de</div>
            <div className="text-2xl font-black text-emerald-600">
              {formatarMoeda(rifa.preco_numero)}
            </div>
          </div>
          <button className="rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-emerald-500/40">
            Ver Rifa
          </button>
        </div>
      </div>
    </Link>
  )
}
