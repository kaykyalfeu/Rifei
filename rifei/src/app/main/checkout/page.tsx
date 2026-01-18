'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Info,
  Smartphone,
  Calendar,
} from 'lucide-react'
import { formatarMoeda, formatarNumero } from '@/lib/utils'
import { Button, Badge } from '@/components/ui'
import Link from 'next/link'

// Mock data - substituir por carrinho real
const getMockItensCarrinho = () => [
  {
    id: '1',
    rifa: {
      id: '1',
      titulo: 'iPhone 15 Pro Max 256GB',
      slug: 'iphone-15-pro-max',
      imagem_principal: 'https://images.unsplash.com/photo-1696446702061-cbd9bb6994ea?w=400',
      preco_numero: 5.0,
      criador: { nome: 'João Silva' },
    },
    numeros: [1, 15, 42, 100, 256],
  },
]

type MetodoPagamento = 'pix' | 'credito' | 'boleto'

export default function CheckoutPage() {
  const router = useRouter()
  const [itens] = useState(getMockItensCarrinho())
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>('pix')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [aceitouTermos, setAceitouTermos] = useState(false)

  const totalItens = itens.reduce((acc, item) => acc + item.numeros.length, 0)
  const subtotal = itens.reduce((acc, item) => acc + item.numeros.length * item.rifa.preco_numero, 0)
  const desconto = 0 // Pode implementar cupons depois
  const total = subtotal - desconto

  const handleFinalizarCompra = async () => {
    if (!aceitouTermos) {
      alert('Você precisa aceitar os termos de uso')
      return
    }

    if (!cpf || !telefone) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsProcessing(true)

    try {
      // TODO: Integrar com Mercado Pago API
      console.log('Processando pagamento:', {
        metodoPagamento,
        cpf,
        telefone,
        itens,
        total,
      })

      // Simular processamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirecionar para página de sucesso
      router.push('/main/compra/sucesso')
    } catch (error) {
      console.error('Erro no checkout:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return cpf
  }

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return telefone
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/main/marketplace"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Finalizar Compra</h1>
              <p className="text-sm text-gray-500">
                {totalItens} número{totalItens > 1 ? 's' : ''} selecionado{totalItens > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="lg:col-span-2">
            {/* Informações pessoais */}
            <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-6 text-xl font-bold">Seus Dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatarCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Método de pagamento */}
            <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-6 text-xl font-bold">Método de Pagamento</h2>

              <div className="space-y-3">
                {/* PIX */}
                <button
                  onClick={() => setMetodoPagamento('pix')}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    metodoPagamento === 'pix'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold">PIX</p>
                        <p className="text-sm text-gray-500">Aprovação instantânea</p>
                      </div>
                    </div>
                    {metodoPagamento === 'pix' && (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>
                </button>

                {/* Cartão de Crédito */}
                <button
                  onClick={() => setMetodoPagamento('credito')}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    metodoPagamento === 'credito'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold">Cartão de Crédito</p>
                        <p className="text-sm text-gray-500">Parcelamento disponível</p>
                      </div>
                    </div>
                    {metodoPagamento === 'credito' && (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>
                </button>

                {/* Boleto */}
                <button
                  onClick={() => setMetodoPagamento('boleto')}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    metodoPagamento === 'boleto'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold">Boleto Bancário</p>
                        <p className="text-sm text-gray-500">Vence em 3 dias úteis</p>
                      </div>
                    </div>
                    {metodoPagamento === 'boleto' && (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>
                </button>
              </div>

              {/* Info sobre o método selecionado */}
              <div className="mt-4 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {metodoPagamento === 'pix' && (
                      <p>
                        Após confirmar, você receberá um QR Code para pagamento. Os números serão
                        reservados por 15 minutos.
                      </p>
                    )}
                    {metodoPagamento === 'credito' && (
                      <p>Você será redirecionado para a página segura do Mercado Pago.</p>
                    )}
                    {metodoPagamento === 'boleto' && (
                      <p>
                        O boleto vence em 3 dias úteis. Após o pagamento, a confirmação pode levar
                        até 2 dias úteis.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Termos */}
            <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Eu li e aceito os{' '}
                  <Link href="/termos" className="font-medium text-emerald-600 hover:underline">
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link
                    href="/privacidade"
                    className="font-medium text-emerald-600 hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                  . Estou ciente de que a participação em rifas é permitida apenas para maiores de
                  18 anos.
                </span>
              </label>
            </div>
          </div>

          {/* Sidebar com resumo */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Resumo do pedido */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-6 text-xl font-bold">Resumo do Pedido</h2>

                {/* Itens */}
                <div className="mb-6 space-y-4">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
                    >
                      <div className="mb-3 flex gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                          {item.rifa.imagem_principal ? (
                            <Image
                              src={item.rifa.imagem_principal}
                              alt={item.rifa.titulo}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-violet-100 dark:from-emerald-900/20 dark:to-violet-900/20">
                              <Ticket className="h-5 w-5 text-emerald-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="mb-1 text-sm font-bold line-clamp-2">
                            {item.rifa.titulo}
                          </p>
                          <p className="text-xs text-gray-500">{item.rifa.criador.nome}</p>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.numeros.length} número{item.numeros.length > 1 ? 's' : ''}
                          </span>
                          <span className="font-medium">
                            {formatarMoeda(item.numeros.length * item.rifa.preco_numero)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.numeros.map((num) => (
                            <Badge key={num} variant="secondary" className="text-xs">
                              {num.toString().padStart(4, '0')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Valores */}
                <div className="mb-6 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">{formatarMoeda(subtotal)}</span>
                  </div>
                  {desconto > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Desconto</span>
                      <span className="font-medium text-green-600">
                        -{formatarMoeda(desconto)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-black text-emerald-600">
                      {formatarMoeda(total)}
                    </span>
                  </div>
                </div>

                {/* Botão de finalizar */}
                <Button
                  onClick={handleFinalizarCompra}
                  disabled={isProcessing || !aceitouTermos}
                  className="w-full bg-gradient-to-r from-emerald-500 to-violet-500 text-white shadow-lg shadow-emerald-500/25"
                  size="lg"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  {isProcessing ? 'Processando...' : `Pagar ${formatarMoeda(total)}`}
                </Button>

                {/* Avisos */}
                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    <span>Pagamento 100% seguro via Mercado Pago</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-emerald-600" />
                    <span>Números reservados por 15 minutos</span>
                  </div>
                </div>
              </div>

              {/* Selo de segurança */}
              <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-violet-50 p-6 text-center dark:border-gray-700 dark:from-emerald-900/20 dark:to-violet-900/20">
                <Lock className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
                <h3 className="mb-2 font-bold">Compra Segura</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Seus dados estão protegidos e criptografados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
