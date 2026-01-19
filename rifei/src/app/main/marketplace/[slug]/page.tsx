'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  Share2,
  Heart,
  Shield,
  Clock,
  Ticket,
  ShoppingCart,
  Award,
  MapPin,
  Info,
} from 'lucide-react'
import { formatarMoeda, formatarNumero, diasRestantes, formatarData } from '@/lib/utils'
import { Badge, Progress, Avatar, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { NumerosGrid } from '@/components/rifa/NumerosGrid'
import { CarrinhoSidebar } from '@/components/carrinho/CarrinhoSidebar'
import type { RifaComCriador } from '@/types/database'

// Mock data - substituir por chamada API real
const getMockRifa = (slug: string): RifaComCriador => ({
  id: '1',
  titulo: 'iPhone 15 Pro Max 256GB - Titânio Natural',
  slug: slug,
  descricao: 'Concorra a um iPhone 15 Pro Max novinho em folha! Chip A17 Pro, câmera de 48MP, tela Super Retina XDR.',
  descricao_completa: `
## Sobre o Prêmio

iPhone 15 Pro Max na cor Titânio Natural com 256GB de armazenamento. Aparelho novo, lacrado, com nota fiscal e garantia Apple de 1 ano.

### Características:
- Chip A17 Pro
- Câmera Principal de 48MP
- Tela Super Retina XDR de 6.7"
- 256GB de armazenamento
- 5G ultrarrápido
- Face ID
- Resistente a água e poeira (IP68)

### O que está incluído:
- iPhone 15 Pro Max 256GB
- Cabo de carregamento USB-C
- Documentação
- Nota Fiscal
- Garantia Apple de 1 ano

## Como Funciona

1. **Escolha seus números**: Selecione quantos números desejar
2. **Realize o pagamento**: Via Pix, cartão de crédito ou boleto
3. **Participe do sorteio**: No dia 30/01/2026 às 20h
4. **Ganhe o prêmio**: O ganhador será notificado imediatamente

## Regras

- O sorteio será realizado pela Loteria Federal
- Dezena sorteada no primeiro prêmio determina o ganhador
- Não há limite de números por participante
- Sorteio será transmitido ao vivo no Instagram
- Em caso de não atingir o mínimo de 80% de vendas, o sorteio pode ser adiado
  `,
  imagem_principal: 'https://images.unsplash.com/photo-1696446702061-cbd9bb6994ea?w=800',
  imagens_adicionais: [
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
    'https://images.unsplash.com/photo-1695048064370-5249be0dbbe7?w=800',
  ],
  preco_numero: 5.0,
  total_numeros: 10000,
  numeros_vendidos: 6543,
  status: 'ativa',
  data_inicio: '2026-01-10T00:00:00Z',
  data_fim: '2026-01-30T23:59:59Z',
  data_sorteio: '2026-01-30T20:00:00Z',
  metodo_sorteio: 'Loteria Federal',
  is_destaque: true,
  total_visualizacoes: 15234,
  total_likes: 892,
  criado_em: '2026-01-10T00:00:00Z',
  atualizado_em: '2026-01-15T00:00:00Z',
  criador_id: '1',
  categoria_id: '1',
  categoria: {
    id: '1',
    nome: 'Eletrônicos',
    slug: 'eletronicos',
    descricao: 'Smartphones, notebooks, TVs e mais',
    icone: '📱',
    cor: '#10b981',
  },
  criador: {
    id: '1',
    nome: 'João Silva',
    nome_usuario: 'joaosilva',
    email: 'joao@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    is_criador_verificado: true,
    biografia: 'Criador de rifas desde 2020',
    total_seguidores: 1234,
    total_seguindo: 567,
    criado_em: '2020-01-01T00:00:00Z',
  },
})

export default function RifaDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [rifa, setRifa] = useState<RifaComCriador | null>(null)
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([])
  const [isCarrinhoOpen, setIsCarrinhoOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    // TODO: Substituir por chamada API real
    const mockRifa = getMockRifa(slug)
    setRifa(mockRifa)
    setLikes(mockRifa.total_likes)
  }, [slug])

  if (!rifa) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const progresso = (rifa.numeros_vendidos / rifa.total_numeros) * 100
  const diasFaltando = diasRestantes(rifa.data_fim)
  const isEncerrandoEmBreve = diasFaltando <= 3 && diasFaltando > 0
  const totalSelecionado = numerosSelecionados.length * rifa.preco_numero

  const handleSelectNumero = (numero: number) => {
    setNumerosSelecionados([...numerosSelecionados, numero])
  }

  const handleDeselectNumero = (numero: number) => {
    setNumerosSelecionados(numerosSelecionados.filter((n) => n !== numero))
  }

  const handleAddToCart = () => {
    // TODO: Implementar adição ao carrinho
    console.log('Adicionar ao carrinho:', { rifaId: rifa.id, numeros: numerosSelecionados })
    setIsCarrinhoOpen(true)
  }

  const handleLike = async () => {
    // TODO: Integrar com API
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: rifa.titulo,
          text: rifa.descricao,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled
      }
    }
  }

  // Mock data para carrinho
  const itensCarrinho = numerosSelecionados.length > 0 ? [{
    id: '1',
    rifa: {
      id: rifa.id,
      titulo: rifa.titulo,
      slug: rifa.slug,
      imagem_principal: rifa.imagem_principal,
      preco_numero: rifa.preco_numero,
      criador: {
        nome: rifa.criador.nome,
      },
    },
    numeros: numerosSelecionados,
  }] : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header fixo */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/main/marketplace"
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:scale-110 dark:bg-gray-700"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all hover:scale-110 dark:bg-gray-700"
              >
                <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="lg:col-span-2">
            {/* Galeria de imagens */}
            <div className="mb-8">
              <div className="relative aspect-video overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800">
                {rifa.imagem_principal ? (
                  <Image
                    src={rifa.imagem_principal}
                    alt={rifa.titulo}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Ticket className="h-24 w-24 text-gray-400" />
                  </div>
                )}

                {/* Badges sobre a imagem */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <Badge variant="default" className="bg-emerald-500">
                    {rifa.categoria.nome}
                  </Badge>
                  {isEncerrandoEmBreve && (
                    <Badge variant="destructive" className="animate-pulse">
                      Encerrando em {diasFaltando}d!
                    </Badge>
                  )}
                  {rifa.is_destaque && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                      ⭐ Destaque
                    </Badge>
                  )}
                </div>
              </div>

              {/* Miniaturas */}
              {rifa.imagens_adicionais && rifa.imagens_adicionais.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {rifa.imagens_adicionais.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800"
                    >
                      <Image src={img} alt={`${rifa.titulo} - ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações principais */}
            <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
              <h1 className="mb-4 text-3xl font-black">{rifa.titulo}</h1>
              <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">{rifa.descricao}</p>

              {/* Criador */}
              <div className="mb-6 flex items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                <Avatar size="md" user={rifa.criador} />
                <div className="flex-1">
                  <p className="font-bold">{rifa.criador.nome}</p>
                  <p className="text-sm text-gray-500">
                    @{rifa.criador.nome_usuario}
                    {rifa.criador.is_criador_verificado && (
                      <span className="ml-1">✓</span>
                    )}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Seguir
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                  <div className="mb-1 flex items-center justify-center text-gray-500">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-bold">{formatarNumero(likes)}</div>
                  <div className="text-xs text-gray-500">Curtidas</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                  <div className="mb-1 flex items-center justify-center text-gray-500">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-bold">{formatarNumero(rifa.total_visualizacoes)}</div>
                  <div className="text-xs text-gray-500">Visualizações</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                  <div className="mb-1 flex items-center justify-center text-gray-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-bold">{formatarNumero(rifa.numeros_vendidos)}</div>
                  <div className="text-xs text-gray-500">Vendidos</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                  <div className="mb-1 flex items-center justify-center text-gray-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-bold">{diasFaltando}d</div>
                  <div className="text-xs text-gray-500">Restantes</div>
                </div>
              </div>
            </div>

            {/* Tabs com informações detalhadas */}
            <Tabs defaultValue="detalhes" className="mb-8">
              <TabsList className="w-full">
                <TabsTrigger value="detalhes" className="flex-1">
                  <Info className="mr-2 h-4 w-4" />
                  Detalhes
                </TabsTrigger>
                <TabsTrigger value="sorteio" className="flex-1">
                  <Award className="mr-2 h-4 w-4" />
                  Sorteio
                </TabsTrigger>
                <TabsTrigger value="regulamento" className="flex-1">
                  <Shield className="mr-2 h-4 w-4" />
                  Regulamento
                </TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes" className="mt-6">
                <div className="prose prose-gray max-w-none rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800 dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: rifa.descricao_completa || '' }} />
                </div>
              </TabsContent>

              <TabsContent value="sorteio" className="mt-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-6 text-xl font-bold">Informações do Sorteio</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium">Data do Sorteio</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatarData(rifa.data_sorteio)} às 20h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium">Método de Sorteio</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rifa.metodo_sorteio}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium">Transparência</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sorteio transmitido ao vivo no Instagram
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="regulamento" className="mt-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-6 text-xl font-bold">Regulamento</h3>
                  <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                    <p>1. O sorteio será realizado através da Loteria Federal</p>
                    <p>2. A dezena sorteada no primeiro prêmio determinará o ganhador</p>
                    <p>3. Não há limite de números por participante</p>
                    <p>4. O ganhador será notificado imediatamente após o sorteio</p>
                    <p>5. O prêmio será entregue em até 30 dias após o sorteio</p>
                    <p>6. Em caso de não atingir 80% de vendas, o sorteio pode ser adiado</p>
                    <p>7. O organizador se reserva o direito de cancelar a rifa em caso de irregularidades</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Seleção de números */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-6 text-2xl font-bold">Escolha seus números</h2>
              <NumerosGrid
                totalNumeros={rifa.total_numeros}
                numerosVendidos={[1, 15, 42, 100, 256]} // Mock - substituir por dados reais
                numerosReservados={[7, 23, 89]} // Mock - substituir por dados reais
                numerosSelecionados={numerosSelecionados}
                onSelectNumero={handleSelectNumero}
                onDeselectNumero={handleDeselectNumero}
              />
            </div>
          </div>

          {/* Sidebar lateral */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Card de compra */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-6">
                  <div className="mb-2 text-sm text-gray-500">Valor por número</div>
                  <div className="text-4xl font-black text-emerald-600">
                    {formatarMoeda(rifa.preco_numero)}
                  </div>
                </div>

                {/* Progresso */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                    <span className="font-bold">{progresso.toFixed(1)}%</span>
                  </div>
                  <Progress value={progresso} />
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{formatarNumero(rifa.numeros_vendidos)} vendidos</span>
                    <span>{formatarNumero(rifa.total_numeros)} total</span>
                  </div>
                </div>

                {/* Resumo da seleção */}
                {numerosSelecionados.length > 0 && (
                  <div className="mb-6 rounded-xl bg-gradient-to-br from-emerald-50 to-violet-50 p-4 dark:from-emerald-900/20 dark:to-violet-900/20">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {numerosSelecionados.length} número{numerosSelecionados.length > 1 ? 's' : ''} selecionado{numerosSelecionados.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-2xl font-black text-emerald-600">
                        {formatarMoeda(totalSelecionado)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddToCart}
                  disabled={numerosSelecionados.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-violet-500 text-white shadow-lg shadow-emerald-500/25"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {numerosSelecionados.length === 0 ? 'Selecione números' : 'Adicionar ao Carrinho'}
                </Button>

                {/* Info adicional */}
                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>Números reservados por 15min</span>
                  </div>
                </div>
              </div>

              {/* Info do sorteio */}
              <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-violet-50 p-6 dark:border-gray-700 dark:from-emerald-900/20 dark:to-violet-900/20">
                <h3 className="mb-4 font-bold">📅 Data do Sorteio</h3>
                <p className="mb-2 text-2xl font-black">{formatarData(rifa.data_sorteio)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Via {rifa.metodo_sorteio}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carrinho Sidebar */}
      <CarrinhoSidebar
        isOpen={isCarrinhoOpen}
        onClose={() => setIsCarrinhoOpen(false)}
        itens={itensCarrinho}
        onRemoverItem={() => setNumerosSelecionados([])}
        onRemoverNumero={(_, numero) => handleDeselectNumero(numero)}
        onLimparCarrinho={() => setNumerosSelecionados([])}
      />
    </div>
  )
}
