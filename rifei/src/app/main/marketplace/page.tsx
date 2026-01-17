'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Ticket, Users, Clock, TrendingUp } from 'lucide-react'

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // TODO: Buscar rifas do backend
  const rifas = [
    {
      id: 1,
      title: 'iPhone 15 Pro Max',
      category: 'Eletrônicos',
      price: 10,
      image: '/images/placeholder.jpg',
      participants: 120,
      totalNumbers: 1000,
      endDate: '2026-02-01',
      creator: 'João Silva'
    },
    // Adicionar mais rifas mockadas se necessário
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-violet-500 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-black md:text-5xl">
              Explore Rifas Incríveis
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/90">
              Descubra rifas verificadas com prêmios incríveis. Transparência e segurança garantidas.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar rifas..."
                className="w-full rounded-2xl bg-white px-12 py-4 text-gray-900 outline-none transition-all focus:ring-4 focus:ring-white/30"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gray-900 px-6 py-2 font-semibold text-white transition-all hover:bg-gray-800">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl px-4 py-2 font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              Todas
            </button>
            {['Eletrônicos', 'Veículos', 'Viagens', 'Games', 'Outros'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-xl px-4 py-2 font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
            <button className="ml-auto flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2 font-medium text-gray-700 transition-all hover:border-emerald-500 dark:border-gray-700 dark:text-gray-300">
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>
        </div>
      </section>

      {/* Rifas Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          {/* Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
                  <Ticket className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-black">234</div>
                  <div className="text-sm text-gray-500">Rifas Ativas</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
                  <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="text-2xl font-black">12.5K</div>
                  <div className="text-sm text-gray-500">Participantes</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-black">48h</div>
                  <div className="text-sm text-gray-500">Encerrando</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-yellow-100 p-3 dark:bg-yellow-900/30">
                  <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-black">R$ 2M</div>
                  <div className="text-sm text-gray-500">Em Prêmios</div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {rifas.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center dark:border-gray-700">
              <Ticket className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-xl font-bold">Nenhuma rifa encontrada</h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou buscar por algo diferente
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rifas.map((rifa) => (
                <Link
                  key={rifa.id}
                  href={`/main/marketplace/${rifa.id}`}
                  className="group rounded-3xl border border-gray-200/50 bg-white/80 overflow-hidden backdrop-blur-xl transition-all hover:-translate-y-2 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/80"
                >
                  {/* Image */}
                  <div className="aspect-card relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <div className="flex h-full items-center justify-center">
                      <Ticket className="h-16 w-16 text-gray-300" />
                    </div>
                    <div className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                      {rifa.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold line-clamp-1">{rifa.title}</h3>
                    <p className="mb-4 text-sm text-gray-500">Por {rifa.creator}</p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                        <span className="font-bold">
                          {((rifa.participants / rifa.totalNumbers) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-violet-500"
                          style={{
                            width: `${(rifa.participants / rifa.totalNumbers) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{rifa.participants} vendidos</span>
                        <span>{rifa.totalNumbers} números</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">A partir de</div>
                        <div className="text-2xl font-black text-emerald-600">
                          R$ {rifa.price}
                        </div>
                      </div>
                      <button className="rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 px-6 py-2 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105">
                        Ver Rifa
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
