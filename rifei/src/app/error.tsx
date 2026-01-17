'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro para monitoramento (opcional)
    console.error('Erro capturado:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-400/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl" />
      </div>

      <div className="text-center max-w-2xl">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-400/20 to-orange-500/20 backdrop-blur-xl">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-black md:text-5xl">
          Algo deu errado
        </h1>

        {/* Description */}
        <p className="mb-2 text-lg text-gray-600 dark:text-gray-400">
          Ops! Encontramos um problema inesperado.
        </p>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-500">
          Não se preocupe, isso acontece às vezes. Tente novamente ou volte para a página inicial.
        </p>

        {/* Error details (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-900/20">
            <p className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">
              Detalhes do erro (apenas em desenvolvimento):
            </p>
            <p className="text-xs text-red-700 dark:text-red-400 font-mono">
              {error.message || 'Erro desconhecido'}
            </p>
            {error.digest && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-8 py-4 font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105 hover:shadow-red-500/40"
          >
            <RefreshCw className="h-5 w-5" />
            Tentar Novamente
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 font-semibold text-gray-700 transition-all hover:border-red-500 hover:bg-red-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-red-500 dark:hover:bg-red-900/20"
          >
            <Home className="h-5 w-5" />
            Voltar ao Início
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Se o problema persistir, entre em contato com nosso{' '}
          <Link href="/contato" className="text-red-500 hover:text-red-600 font-semibold">
            suporte
          </Link>
        </p>
      </div>
    </div>
  )
}
