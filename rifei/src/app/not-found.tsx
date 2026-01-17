import Link from 'next/link'
import { Ticket, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
      </div>

      <div className="text-center max-w-2xl">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-violet-500/20 backdrop-blur-xl">
              <Ticket className="h-16 w-16 text-emerald-500" />
            </div>
            <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg">
              <span className="text-2xl font-black text-gray-900 dark:text-white">404</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-black md:text-5xl">
          Página não encontrada
        </h1>

        {/* Description */}
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          Ops! Parece que esta rifa não existe ou foi movida para outro lugar.
          Que tal explorar outras rifas incríveis?
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-emerald-500/40"
          >
            <Home className="h-5 w-5" />
            Voltar ao Início
          </Link>

          <Link
            href="/main/marketplace"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 font-semibold text-gray-700 transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20"
          >
            <Search className="h-5 w-5" />
            Explorar Rifas
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 rounded-3xl border border-gray-200/50 bg-white/80 p-8 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80">
          <h2 className="mb-4 text-xl font-bold">Você pode estar procurando por:</h2>
          <nav className="grid gap-2 text-sm sm:grid-cols-2">
            <Link href="/auth/login" className="rounded-lg p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="font-semibold">Entrar na conta</div>
              <div className="text-gray-500">Acesse sua conta</div>
            </Link>
            <Link href="/auth/cadastro" className="rounded-lg p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="font-semibold">Criar conta</div>
              <div className="text-gray-500">Cadastre-se grátis</div>
            </Link>
            <Link href="/main/marketplace" className="rounded-lg p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="font-semibold">Marketplace</div>
              <div className="text-gray-500">Veja todas as rifas</div>
            </Link>
            <Link href="/main/feed" className="rounded-lg p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="font-semibold">Feed Social</div>
              <div className="text-gray-500">Últimas novidades</div>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
