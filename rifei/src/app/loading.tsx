import { Ticket } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            {/* Spinner ring */}
            <div className="h-24 w-24 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute inset-0 h-24 w-24 animate-spin rounded-full border-4 border-transparent border-t-emerald-500 border-r-violet-500"></div>

            {/* Icon no centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Ticket className="h-10 w-10 text-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
          Carregando...
        </p>
      </div>
    </div>
  )
}
