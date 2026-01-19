'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  Info,
  Calendar,
  DollarSign,
  Hash,
  FileText,
  Award,
  Save,
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import Link from 'next/link'

export default function CriarRifaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [descricaoCompleta, setDescricaoCompleta] = useState('')
  const [precoNumero, setPrecoNumero] = useState('')
  const [totalNumeros, setTotalNumeros] = useState('1000')
  const [dataSorteio, setDataSorteio] = useState('')
  const [metodoSorteio, setMetodoSorteio] = useState('Loteria Federal')
  const [categoria, setCategoria] = useState('')
  const [imagens, setImagens] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implementar criação de rifa via API
      console.log('Criar rifa:', {
        titulo,
        descricao,
        descricaoCompleta,
        precoNumero: parseFloat(precoNumero),
        totalNumeros: parseInt(totalNumeros),
        dataSorteio,
        metodoSorteio,
        categoria,
        imagens,
      })

      // Simular criação
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirecionar para dashboard
      router.push('/main/dashboard?criada=true')
    } catch (error) {
      console.error('Erro ao criar rifa:', error)
      alert('Erro ao criar rifa. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implementar upload de imagens
    console.log('Upload de imagem:', e.target.files)
  }

  const totalArrecadacao = parseFloat(precoNumero || '0') * parseInt(totalNumeros || '0')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/main/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Criar Nova Rifa</h1>
              <p className="text-sm text-gray-500">Preencha as informações abaixo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Formulário principal */}
            <div className="lg:col-span-2">
              {/* Informações básicas */}
              <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-6 text-xl font-bold">Informações Básicas</h2>

                <div className="space-y-6">
                  {/* Título */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Título da Rifa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ex: iPhone 15 Pro Max 256GB"
                      required
                      maxLength={100}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {titulo.length}/100 caracteres
                    </p>
                  </div>

                  {/* Descrição curta */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Descrição Curta <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Resumo atrativo da sua rifa (aparece nos cards)"
                      required
                      maxLength={200}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {descricao.length}/200 caracteres
                    </p>
                  </div>

                  {/* Descrição completa */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Descrição Completa <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={descricaoCompleta}
                      onChange={(e) => setDescricaoCompleta(e.target.value)}
                      placeholder="Descreva detalhadamente o prêmio, regras, como funciona o sorteio, etc. Aceita Markdown."
                      required
                      rows={10}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Categoria <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="eletronicos">📱 Eletrônicos</option>
                      <option value="veiculos">🚗 Veículos</option>
                      <option value="imoveis">🏠 Imóveis</option>
                      <option value="viagens">✈️ Viagens</option>
                      <option value="dinheiro">💰 Dinheiro</option>
                      <option value="outros">🎁 Outros</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Imagens */}
              <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-6 text-xl font-bold">Imagens do Prêmio</h2>

                <div className="space-y-4">
                  {/* Upload área */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-emerald-900/20"
                    >
                      <Upload className="mb-4 h-12 w-12 text-gray-400" />
                      <p className="mb-2 font-medium">Clique para fazer upload</p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG ou WEBP (máx. 5MB por imagem)
                      </p>
                    </label>
                  </div>

                  {/* Preview de imagens */}
                  {imagens.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {imagens.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                        >
                          <img src={img} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImagens(imagens.filter((_, i) => i !== idx))}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {idx === 0 && (
                            <Badge className="absolute left-2 top-2 bg-emerald-500">
                              Principal
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Configurações do sorteio */}
              <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-6 text-xl font-bold">Configurações do Sorteio</h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Preço por número */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      <DollarSign className="mr-1 inline h-4 w-4" />
                      Preço por Número <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <input
                        type="number"
                        value={precoNumero}
                        onChange={(e) => setPrecoNumero(e.target.value)}
                        placeholder="0.00"
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  {/* Total de números */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      <Hash className="mr-1 inline h-4 w-4" />
                      Total de Números <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={totalNumeros}
                      onChange={(e) => setTotalNumeros(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <option value="100">100 números</option>
                      <option value="500">500 números</option>
                      <option value="1000">1.000 números</option>
                      <option value="5000">5.000 números</option>
                      <option value="10000">10.000 números</option>
                      <option value="50000">50.000 números</option>
                      <option value="100000">100.000 números</option>
                    </select>
                  </div>

                  {/* Data do sorteio */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      <Calendar className="mr-1 inline h-4 w-4" />
                      Data do Sorteio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={dataSorteio}
                      onChange={(e) => setDataSorteio(e.target.value)}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </div>

                  {/* Método de sorteio */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      <Award className="mr-1 inline h-4 w-4" />
                      Método de Sorteio <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={metodoSorteio}
                      onChange={(e) => setMetodoSorteio(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <option value="Loteria Federal">Loteria Federal</option>
                      <option value="Random.org">Random.org</option>
                      <option value="Ao Vivo">Sorteio ao Vivo</option>
                    </select>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 flex gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                  <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    <p className="mb-1 font-medium">Sobre o método de sorteio:</p>
                    <p>
                      A Loteria Federal é a forma mais confiável e transparente. O sorteio acontece
                      automaticamente no dia e horário da extração oficial.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar com resumo */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Preview */}
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-6 text-xl font-bold">Resumo</h2>

                  <div className="space-y-4">
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-violet-50 p-4 dark:from-emerald-900/20 dark:to-violet-900/20">
                      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        Arrecadação potencial
                      </div>
                      <div className="text-3xl font-black text-emerald-600">
                        R$ {totalArrecadacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total de números:</span>
                        <span className="font-medium">{parseInt(totalNumeros || '0').toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Preço por número:</span>
                        <span className="font-medium">
                          R$ {parseFloat(precoNumero || '0').toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Taxa da plataforma:</span>
                        <span className="font-medium text-orange-600">10%</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                        <span className="font-bold">Você recebe:</span>
                        <span className="font-bold text-emerald-600">
                          R$ {(totalArrecadacao * 0.9).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avisos */}
                <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-900/20">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-yellow-800 dark:text-yellow-500">
                    <Info className="h-5 w-5" />
                    Importante
                  </h3>
                  <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-400">
                    <li>• Certifique-se de ter o prêmio antes de criar a rifa</li>
                    <li>• Forneça fotos reais e claras do prêmio</li>
                    <li>• A taxa de 10% cobre custos operacionais</li>
                    <li>• Você pode editar a rifa antes do primeiro número vendido</li>
                  </ul>
                </div>

                {/* Botões de ação */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-violet-500 text-white shadow-lg"
                    size="lg"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    {isSubmitting ? 'Criando...' : 'Criar Rifa'}
                  </Button>
                  <Link href="/main/dashboard" className="block">
                    <Button type="button" variant="outline" className="w-full" size="lg">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
