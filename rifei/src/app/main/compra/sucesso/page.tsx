'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Download,
  Share2,
  Home,
  Ticket,
  Calendar,
  CreditCard,
  ArrowRight,
  Smartphone,
} from 'lucide-react'
import { formatarMoeda, formatarNumero, formatarData } from '@/lib/utils'
import { Button, Badge } from '@/components/ui'
import Confetti from 'react-confetti'

// Mock data - substituir por dados reais da compra
const getMockCompra = () => ({
  id: 'COMP-2026-001234',
  data: new Date().toISOString(),
  status: 'aprovado',
  metodoPagamento: 'pix',
  total: 25.0,
  itens: [
    {
      rifa: {
        titulo: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max',
        data_sorteio: '2026-01-30T20:00:00Z',
      },
      numeros: [1, 15, 42, 100, 256],
      subtotal: 25.0,
    },
  ],
})

export default function CompraSucessoPage() {
  const router = useRouter()
  const [compra] = useState(getMockCompra())
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Configurar tamanho da janela para confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })

    // Parar confetti após 5 segundos
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleCompartilhar = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meus números da sorte! 🍀',
          text: `Acabei de garantir meus números na rifa ${compra.itens[0].rifa.titulo}!`,
          url: window.location.origin,
        })
      } catch (error) {
        // User cancelled
      }
    }
  }

  const handleBaixarComprovante = () => {
    // TODO: Implementar download do PDF
    console.log('Download comprovante:', compra.id)
  }

  const totalNumeros = compra.itens.reduce((acc, item) => acc + item.numeros.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Ícone de sucesso */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-2xl shadow-emerald-500/50">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h1 className="mb-3 text-4xl font-black">Compra Confirmada! 🎉</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Seus números foram reservados com sucesso
            </p>
          </div>

          {/* Informações da compra */}
          <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-6 dark:border-gray-700">
              <div>
                <p className="mb-1 text-sm text-gray-500">Número do pedido</p>
                <p className="font-mono text-lg font-bold">{compra.id}</p>
              </div>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                {compra.status === 'aprovado' ? 'Aprovado' : 'Processando'}
              </Badge>
            </div>

            {/* Itens da compra */}
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-bold">Suas Rifas</h2>
              {compra.itens.map((item, idx) => (
                <div
                  key={idx}
                  className="mb-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-violet-50 p-6 dark:border-gray-700 dark:from-emerald-900/20 dark:to-violet-900/20"
                >
                  <Link
                    href={`/main/marketplace/${item.rifa.slug}`}
                    className="mb-4 block text-xl font-bold hover:text-emerald-600"
                  >
                    {item.rifa.titulo}
                  </Link>

                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium">Data do Sorteio</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatarData(item.rifa.data_sorteio)} às 20h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Ticket className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium">Seus Números</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatarNumero(item.numeros.length)} número
                          {item.numeros.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Números */}
                  <div className="rounded-xl bg-white/50 p-4 dark:bg-gray-800/50">
                    <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Números da sorte:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.numeros.map((numero) => (
                        <div
                          key={numero}
                          className="flex h-12 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-violet-500 font-mono text-sm font-bold text-white shadow-lg"
                        >
                          {numero.toString().padStart(4, '0')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo do pagamento */}
            <div className="space-y-2 border-t border-gray-200 pt-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CreditCard className="h-4 w-4" />
                  <span>Método de pagamento</span>
                </div>
                <span className="font-medium">
                  {compra.metodoPagamento === 'pix' && 'PIX'}
                  {compra.metodoPagamento === 'credito' && 'Cartão de Crédito'}
                  {compra.metodoPagamento === 'boleto' && 'Boleto Bancário'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total de números
                </span>
                <span className="font-medium">{formatarNumero(totalNumeros)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                <span className="text-lg font-bold">Total pago</span>
                <span className="text-2xl font-black text-emerald-600">
                  {formatarMoeda(compra.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <Button
              onClick={handleBaixarComprovante}
              variant="outline"
              size="lg"
              className="border-2"
            >
              <Download className="mr-2 h-5 w-5" />
              Baixar Comprovante
            </Button>
            <Button onClick={handleCompartilhar} variant="outline" size="lg" className="border-2">
              <Share2 className="mr-2 h-5 w-5" />
              Compartilhar
            </Button>
          </div>

          {/* Próximos passos */}
          <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-bold">Próximos Passos</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white">
                  1
                </div>
                <div>
                  <p className="mb-1 font-bold">Confirme seu e-mail</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enviamos um e-mail com os detalhes da sua compra e seus números.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-500 text-lg font-bold text-white">
                  2
                </div>
                <div>
                  <p className="mb-1 font-bold">Acompanhe o sorteio</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Você receberá uma notificação no dia do sorteio. A transmissão será ao vivo no
                    Instagram.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white">
                  3
                </div>
                <div>
                  <p className="mb-1 font-bold">Receba seu prêmio</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Se você ganhar, entraremos em contato imediatamente para combinar a entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              onClick={() => router.push('/main/dashboard')}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-violet-500"
              size="lg"
            >
              Ver Minhas Rifas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push('/main/marketplace')}
              variant="outline"
              size="lg"
              className="flex-1 border-2"
            >
              <Home className="mr-2 h-5 w-5" />
              Voltar ao Marketplace
            </Button>
          </div>

          {/* Notificação */}
          <div className="mt-6 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
            <Smartphone className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-600 dark:text-blue-400">
              <p className="mb-1 font-bold">Ative as notificações!</p>
              <p>
                Não perca nenhuma atualização sobre suas rifas. Ative as notificações push no seu
                navegador ou baixe nosso app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
