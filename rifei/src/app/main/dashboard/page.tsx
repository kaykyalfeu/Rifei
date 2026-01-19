'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Ticket,
  TrendingUp,
  Heart,
  Plus,
  Calendar,
  Award,
  Settings,
  Users,
  ChevronRight,
  Trophy,
  Clock,
} from 'lucide-react'
import { formatarMoeda, formatarNumero, formatarData } from '@/lib/utils'
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Avatar } from '@/components/ui'
import { RifaCard } from '@/components/rifa/RifaCard'
import type { RifaComCriador } from '@/types/database'

// Mock data - substituir por dados reais do usuário
const getMockUserData = () => ({
  user: {
    id: '1',
    nome: 'João Silva',
    nome_usuario: 'joaosilva',
    email: 'joao@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    is_criador_verificado: true,
    biografia: 'Criador de rifas apaixonado por tecnologia',
    total_seguidores: 1234,
    total_seguindo: 567,
    criado_em: '2020-01-01T00:00:00Z',
  },
  stats: {
    rifasParticipando: 12,
    rifasCriadas: 5,
    totalGasto: 450.0,
    totalArrecadado: 15000.0,
  },
  participacoes: [
    {
      id: '1',
      rifa: {
        id: '1',
        titulo: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max',
        imagem_principal: 'https://images.unsplash.com/photo-1696446702061-cbd9bb6994ea?w=400',
        preco_numero: 5.0,
        total_numeros: 10000,
        numeros_vendidos: 6543,
        status: 'ativa' as const,
        data_sorteio: '2026-01-30T20:00:00Z',
        categoria: { id: '1', nome: 'Eletrônicos', slug: 'eletronicos', descricao: '', icone: '📱', cor: '#10b981' },
        criador: {
          id: '2',
          nome: 'Maria Santos',
          nome_usuario: 'mariasantos',
          email: 'maria@example.com',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
          is_criador_verificado: true,
          total_seguidores: 500,
          total_seguindo: 200,
          criado_em: '2021-01-01T00:00:00Z',
        },
      },
      numeros: [1, 15, 42, 100, 256],
      total_pago: 25.0,
      data_compra: '2026-01-15T10:30:00Z',
    },
  ],
})

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('participando')
  const mockData = getMockUserData()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Perfil do usuário */}
            <div className="flex items-center gap-4">
              <Avatar size="lg" user={mockData.user} />
              <div>
                <h1 className="text-2xl font-bold">{mockData.user.nome}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  @{mockData.user.nome_usuario}
                  {mockData.user.is_criador_verificado && (
                    <span className="ml-1">✓</span>
                  )}
                </p>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    <strong>{formatarNumero(mockData.user.total_seguidores)}</strong> seguidores
                  </span>
                  <span>
                    <strong>{formatarNumero(mockData.user.total_seguindo)}</strong> seguindo
                  </span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <Link href="/main/criar">
                <Button className="bg-gradient-to-r from-emerald-500 to-violet-500">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Rifa
                </Button>
              </Link>
              <Link href="/main/perfil/configuracoes">
                <Button variant="outline">
                  <Settings className="mr-2 h-5 w-5" />
                  Configurações
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 dark:from-emerald-900/20 dark:to-emerald-800/20">
              <div className="mb-2 flex items-center gap-2 text-sm text-emerald-600">
                <Ticket className="h-4 w-4" />
                <span>Participando</span>
              </div>
              <div className="text-3xl font-black text-emerald-600">
                {formatarNumero(mockData.stats.rifasParticipando)}
              </div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Total gasto: {formatarMoeda(mockData.stats.totalGasto)}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 p-6 dark:from-violet-900/20 dark:to-violet-800/20">
              <div className="mb-2 flex items-center gap-2 text-sm text-violet-600">
                <TrendingUp className="h-4 w-4" />
                <span>Criadas</span>
              </div>
              <div className="text-3xl font-black text-violet-600">
                {formatarNumero(mockData.stats.rifasCriadas)}
              </div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Arrecadado: {formatarMoeda(mockData.stats.totalArrecadado)}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="mb-2 flex items-center gap-2 text-sm text-blue-600">
                <Trophy className="h-4 w-4" />
                <span>Vitórias</span>
              </div>
              <div className="text-3xl font-black text-blue-600">0</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Nenhuma vitória ainda
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-6 dark:from-orange-900/20 dark:to-orange-800/20">
              <div className="mb-2 flex items-center gap-2 text-sm text-orange-600">
                <Heart className="h-4 w-4" />
                <span>Favoritas</span>
              </div>
              <div className="text-3xl font-black text-orange-600">0</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Nenhuma favoritada
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="participando">
              <Ticket className="mr-2 h-4 w-4" />
              Participando
            </TabsTrigger>
            <TabsTrigger value="criadas">
              <TrendingUp className="mr-2 h-4 w-4" />
              Minhas Rifas
            </TabsTrigger>
            <TabsTrigger value="historico">
              <Clock className="mr-2 h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="vitorias">
              <Trophy className="mr-2 h-4 w-4" />
              Vitórias
            </TabsTrigger>
          </TabsList>

          {/* Participando */}
          <TabsContent value="participando">
            {mockData.participacoes.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 inline-block rounded-full bg-gray-100 p-6 dark:bg-gray-700">
                  <Ticket className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Nenhuma participação ainda</h3>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Comece a participar de rifas e aumente suas chances de ganhar!
                </p>
                <Link href="/main/marketplace">
                  <Button className="bg-gradient-to-r from-emerald-500 to-violet-500">
                    Explorar Rifas
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {mockData.participacoes.map((participacao) => (
                  <div
                    key={participacao.id}
                    className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <Link
                          href={`/main/marketplace/${participacao.rifa.slug}`}
                          className="mb-2 block text-2xl font-bold hover:text-emerald-600"
                        >
                          {participacao.rifa.titulo}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Sorteio: {formatarData(participacao.rifa.data_sorteio)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ticket className="h-4 w-4" />
                            {formatarNumero(participacao.numeros.length)} número
                            {participacao.numeros.length > 1 ? 's' : ''}
                          </span>
                          <Badge variant="default" className="bg-emerald-500">
                            {participacao.rifa.categoria.nome}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-sm text-gray-500">Total pago</div>
                        <div className="text-2xl font-black text-emerald-600">
                          {formatarMoeda(participacao.total_pago)}
                        </div>
                      </div>
                    </div>

                    {/* Números */}
                    <div className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-violet-50 p-4 dark:from-emerald-900/20 dark:to-violet-900/20">
                      <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Seus números da sorte:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {participacao.numeros.map((numero) => (
                          <div
                            key={numero}
                            className="flex h-12 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-violet-500 font-mono text-sm font-bold text-white shadow-lg"
                          >
                            {numero.toString().padStart(4, '0')}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-3">
                      <Link
                        href={`/main/marketplace/${participacao.rifa.slug}`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          Ver Rifa
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline">
                        <Award className="mr-2 h-4 w-4" />
                        Comprovante
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Minhas Rifas Criadas */}
          <TabsContent value="criadas">
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 inline-block rounded-full bg-gray-100 p-6 dark:bg-gray-700">
                <TrendingUp className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Nenhuma rifa criada ainda</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Crie sua primeira rifa e comece a arrecadar fundos!
              </p>
              <Link href="/main/criar">
                <Button className="bg-gradient-to-r from-emerald-500 to-violet-500">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Minha Primeira Rifa
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="historico">
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 inline-block rounded-full bg-gray-100 p-6 dark:bg-gray-700">
                <Clock className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Sem histórico</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Rifas encerradas e finalizadas aparecerão aqui
              </p>
            </div>
          </TabsContent>

          {/* Vitórias */}
          <TabsContent value="vitorias">
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 inline-block rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 p-6 dark:from-yellow-900/20 dark:to-orange-900/20">
                <Trophy className="h-12 w-12 text-yellow-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Nenhuma vitória ainda</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Continue participando! Sua sorte pode estar na próxima rifa
              </p>
              <Link href="/main/marketplace">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500">
                  Participar de Rifas
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
