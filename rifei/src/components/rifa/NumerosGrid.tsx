'use client'

import { useState, useMemo } from 'react'
import { Search, Check, X, AlertCircle } from 'lucide-react'
import { formatarNumero } from '@/lib/utils'
import { Button } from '@/components/ui'

interface NumerosGridProps {
  totalNumeros: number
  numerosVendidos: number[]
  numerosReservados: number[]
  onSelectNumero: (numero: number) => void
  onDeselectNumero: (numero: number) => void
  numerosSelecionados: number[]
  maxSelecao?: number
}

export function NumerosGrid({
  totalNumeros,
  numerosVendidos,
  numerosReservados,
  onSelectNumero,
  onDeselectNumero,
  numerosSelecionados,
  maxSelecao = 100,
}: NumerosGridProps) {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'disponiveis' | 'selecionados'>('todos')

  const numeros = useMemo(() => {
    return Array.from({ length: totalNumeros }, (_, i) => i + 1)
  }, [totalNumeros])

  const numerosFiltrados = useMemo(() => {
    let resultado = numeros

    // Aplicar busca
    if (busca) {
      const termoBusca = busca.toLowerCase()
      resultado = resultado.filter((num) =>
        num.toString().includes(termoBusca)
      )
    }

    // Aplicar filtro
    if (filtro === 'disponiveis') {
      resultado = resultado.filter(
        (num) =>
          !numerosVendidos.includes(num) &&
          !numerosReservados.includes(num) &&
          !numerosSelecionados.includes(num)
      )
    } else if (filtro === 'selecionados') {
      resultado = resultado.filter((num) => numerosSelecionados.includes(num))
    }

    return resultado
  }, [numeros, busca, filtro, numerosVendidos, numerosReservados, numerosSelecionados])

  const handleNumeroClick = (numero: number) => {
    if (numerosVendidos.includes(numero) || numerosReservados.includes(numero)) {
      return // Não permitir seleção de números vendidos ou reservados
    }

    if (numerosSelecionados.includes(numero)) {
      onDeselectNumero(numero)
    } else {
      if (numerosSelecionados.length >= maxSelecao) {
        // TODO: Mostrar toast de erro
        return
      }
      onSelectNumero(numero)
    }
  }

  const selecionarAleatorios = (quantidade: number) => {
    const disponíveis = numeros.filter(
      (num) =>
        !numerosVendidos.includes(num) &&
        !numerosReservados.includes(num) &&
        !numerosSelecionados.includes(num)
    )

    if (disponíveis.length === 0) return

    const quantidadeParaSelecionar = Math.min(
      quantidade,
      disponíveis.length,
      maxSelecao - numerosSelecionados.length
    )

    const aleatorios = [...disponíveis]
      .sort(() => Math.random() - 0.5)
      .slice(0, quantidadeParaSelecionar)

    aleatorios.forEach((num) => onSelectNumero(num))
  }

  const limparSelecao = () => {
    numerosSelecionados.forEach((num) => onDeselectNumero(num))
  }

  const getNumeroEstado = (numero: number) => {
    if (numerosVendidos.includes(numero)) return 'vendido'
    if (numerosReservados.includes(numero)) return 'reservado'
    if (numerosSelecionados.includes(numero)) return 'selecionado'
    return 'disponivel'
  }

  const getNumeroClasses = (numero: number) => {
    const estado = getNumeroEstado(numero)

    const baseClasses =
      'relative flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold transition-all'

    switch (estado) {
      case 'vendido':
        return `${baseClasses} cursor-not-allowed bg-gray-200 text-gray-400 line-through dark:bg-gray-700`
      case 'reservado':
        return `${baseClasses} cursor-not-allowed bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-500`
      case 'selecionado':
        return `${baseClasses} cursor-pointer bg-gradient-to-br from-emerald-500 to-violet-500 text-white shadow-lg scale-110`
      default:
        return `${baseClasses} cursor-pointer border-2 border-gray-200 bg-white hover:border-emerald-500 hover:scale-105 dark:border-gray-700 dark:bg-gray-800`
    }
  }

  const numerosDisponiveis = numeros.length - numerosVendidos.length - numerosReservados.length

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 dark:from-emerald-900/20 dark:to-emerald-800/20">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          <div className="text-2xl font-bold text-emerald-600">
            {formatarNumero(totalNumeros)}
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 p-4 dark:from-violet-900/20 dark:to-violet-800/20">
          <div className="text-sm text-gray-600 dark:text-gray-400">Disponíveis</div>
          <div className="text-2xl font-bold text-violet-600">
            {formatarNumero(numerosDisponiveis)}
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="text-sm text-gray-600 dark:text-gray-400">Selecionados</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatarNumero(numerosSelecionados.length)}
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-800/20 dark:to-gray-700/20">
          <div className="text-sm text-gray-600 dark:text-gray-400">Vendidos</div>
          <div className="text-2xl font-bold text-gray-600">
            {formatarNumero(numerosVendidos.length)}
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => selecionarAleatorios(1)}
          variant="outline"
          size="sm"
          disabled={numerosDisponiveis === 0}
        >
          +1 Aleatório
        </Button>
        <Button
          onClick={() => selecionarAleatorios(5)}
          variant="outline"
          size="sm"
          disabled={numerosDisponiveis < 5}
        >
          +5 Aleatórios
        </Button>
        <Button
          onClick={() => selecionarAleatorios(10)}
          variant="outline"
          size="sm"
          disabled={numerosDisponiveis < 10}
        >
          +10 Aleatórios
        </Button>
        <Button
          onClick={limparSelecao}
          variant="outline"
          size="sm"
          disabled={numerosSelecionados.length === 0}
        >
          <X className="mr-1 h-4 w-4" />
          Limpar
        </Button>
      </div>

      {/* Busca e filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar número..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filtro === 'todos'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('disponiveis')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filtro === 'disponiveis'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Disponíveis
          </button>
          <button
            onClick={() => setFiltro('selecionados')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filtro === 'selecionados'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Selecionados
          </button>
        </div>
      </div>

      {/* Aviso de limite */}
      {numerosSelecionados.length >= maxSelecao && (
        <div className="flex items-center gap-2 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-600 dark:text-yellow-500">
            Você atingiu o limite máximo de {maxSelecao} números selecionados.
          </p>
        </div>
      )}

      {/* Grid de números */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
        {numerosFiltrados.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Nenhum número encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 md:grid-cols-8 lg:grid-cols-10">
            {numerosFiltrados.map((numero) => (
              <button
                key={numero}
                onClick={() => handleNumeroClick(numero)}
                className={getNumeroClasses(numero)}
                disabled={
                  numerosVendidos.includes(numero) || numerosReservados.includes(numero)
                }
              >
                {numero.toString().padStart(4, '0')}
                {numerosSelecionados.includes(numero) && (
                  <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
          <span className="text-gray-600 dark:text-gray-400">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-emerald-500 to-violet-500" />
          <span className="text-gray-600 dark:text-gray-400">Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-yellow-100 dark:bg-yellow-900/20" />
          <span className="text-gray-600 dark:text-gray-400">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
          <span className="text-gray-600 dark:text-gray-400">Vendido</span>
        </div>
      </div>
    </div>
  )
}
