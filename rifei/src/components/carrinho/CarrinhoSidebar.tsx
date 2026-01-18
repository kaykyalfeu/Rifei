'use client'

import { useState } from 'react'
import { X, ShoppingCart, Trash2, CreditCard, Ticket, AlertCircle } from 'lucide-react'
import { formatarMoeda, formatarNumero } from '@/lib/utils'
import { Button } from '@/components/ui'
import Image from 'next/image'
import Link from 'next/link'

interface ItemCarrinho {
  id: string
  rifa: {
    id: string
    titulo: string
    slug: string
    imagem_principal?: string
    preco_numero: number
    criador: {
      nome: string
    }
  }
  numeros: number[]
}

interface CarrinhoSidebarProps {
  isOpen: boolean
  onClose: () => void
  itens: ItemCarrinho[]
  onRemoverItem: (rifaId: string) => void
  onRemoverNumero: (rifaId: string, numero: number) => void
  onLimparCarrinho: () => void
}

export function CarrinhoSidebar({
  isOpen,
  onClose,
  itens,
  onRemoverItem,
  onRemoverNumero,
  onLimparCarrinho,
}: CarrinhoSidebarProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const totalItens = itens.reduce((acc, item) => acc + item.numeros.length, 0)
  const totalValor = itens.reduce(
    (acc, item) => acc + item.numeros.length * item.rifa.preco_numero,
    0
  )

  const handleCheckout = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implementar checkout com Mercado Pago
      console.log('Iniciando checkout...', { itens, totalValor })
      // Redirecionar para página de checkout
      window.location.href = '/main/checkout'
    } catch (error) {
      console.error('Erro no checkout:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform dark:bg-gray-900 sm:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold">Meu Carrinho</h2>
              <p className="text-sm text-gray-500">
                {totalItens} {totalItens === 1 ? 'número' : 'números'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {itens.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-bold">Carrinho vazio</h3>
              <p className="mb-6 text-sm text-gray-500">
                Adicione números de rifas para começar
              </p>
              <Button onClick={onClose} variant="outline">
                Explorar Rifas
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {itens.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Rifa Info */}
                  <div className="mb-4 flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      {item.rifa.imagem_principal ? (
                        <Image
                          src={item.rifa.imagem_principal}
                          alt={item.rifa.titulo}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-violet-100 dark:from-emerald-900/20 dark:to-violet-900/20">
                          <Ticket className="h-6 w-6 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/main/marketplace/${item.rifa.slug}`}
                        className="mb-1 font-bold line-clamp-1 hover:text-emerald-600"
                        onClick={onClose}
                      >
                        {item.rifa.titulo}
                      </Link>
                      <p className="text-xs text-gray-500">
                        por {item.rifa.criador.nome}
                      </p>
                      <p className="mt-1 text-sm font-bold text-emerald-600">
                        {formatarMoeda(item.rifa.preco_numero)} / número
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoverItem(item.rifa.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Números selecionados */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Números ({item.numeros.length})
                      </span>
                      <span className="font-bold">
                        {formatarMoeda(item.numeros.length * item.rifa.preco_numero)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.numeros.slice(0, 10).map((numero) => (
                        <button
                          key={numero}
                          onClick={() => onRemoverNumero(item.rifa.id, numero)}
                          className="group relative flex h-8 w-12 items-center justify-center rounded bg-gradient-to-br from-emerald-500 to-violet-500 text-xs font-bold text-white transition-all hover:scale-110"
                        >
                          {numero.toString().padStart(4, '0')}
                          <X className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      ))}
                      {item.numeros.length > 10 && (
                        <div className="flex h-8 items-center px-2 text-xs text-gray-500">
                          +{item.numeros.length - 10} mais
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Ação de limpar */}
              <button
                onClick={onLimparCarrinho}
                className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-900/20 dark:hover:bg-red-900/30"
              >
                <Trash2 className="mr-2 inline h-4 w-4" />
                Limpar Carrinho
              </button>
            </div>
          )}
        </div>

        {/* Footer com total e checkout */}
        {itens.length > 0 && (
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium">{formatarMoeda(totalValor)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Total de números
                </span>
                <span className="font-medium">{formatarNumero(totalItens)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black text-emerald-600">
                  {formatarMoeda(totalValor)}
                </span>
              </div>
            </div>

            {/* Aviso */}
            <div className="mb-4 flex gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Os números serão reservados por 15 minutos após iniciar o checkout.
              </p>
            </div>

            {/* Botão de checkout */}
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-emerald-500 to-violet-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              size="lg"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {isProcessing ? 'Processando...' : 'Finalizar Compra'}
            </Button>

            {/* Métodos de pagamento */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>Pagamento seguro via</span>
              <span className="font-bold text-blue-600">Mercado Pago</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
