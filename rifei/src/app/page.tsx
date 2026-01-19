import Link from 'next/link'
import { 
  Ticket, ArrowRight, Shield, Zap, Users, Trophy, 
  Star, TrendingUp, CheckCircle, Sparkles 
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 bg-white/70 backdrop-blur-2xl dark:border-gray-700/50 dark:bg-gray-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 shadow-lg shadow-emerald-500/25">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              rif<span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">ei</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#como-funciona" className="text-gray-600 hover:text-emerald-500 dark:text-gray-300">
              Como Funciona
            </Link>
            <Link href="#recursos" className="text-gray-600 hover:text-emerald-500 dark:text-gray-300">
              Recursos
            </Link>
            <Link href="#depoimentos" className="text-gray-600 hover:text-emerald-500 dark:text-gray-300">
              Depoimentos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-xl px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Entrar
            </Link>
            <Link
              href="/auth/cadastro"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 px-5 py-2 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-emerald-500/40"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950" />
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
            Nova plataforma de rifas com feed social
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-black leading-tight md:text-6xl lg:text-7xl">
            A forma mais
            <span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">
              {' '}divertida{' '}
            </span>
            de<br />ganhar prêmios incríveis
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl">
            Participe de rifas, acompanhe sorteios ao vivo, conecte-se com a comunidade 
            e multiplique suas chances de ganhar com nosso sistema de sorte acumulada.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/cadastro"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-violet-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/40"
            >
              Começar Agora - É Grátis
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/main/marketplace"
              className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-bold text-gray-700 transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20"
            >
              Explorar Rifas
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: '50K+', label: 'Usuários Ativos' },
              { value: 'R$ 2M+', label: 'Em Prêmios' },
              { value: '10K+', label: 'Ganhadores' },
              { value: '4.9★', label: 'Avaliação' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-gray-900 dark:text-white md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black md:text-5xl">
              Por que escolher o{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">
                Rifei
              </span>
              ?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Muito mais que uma plataforma de rifas. Somos uma comunidade.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Feed Social',
                description: 'Veja quem ganhou, compartilhe sua sorte, siga criadores e conecte-se com a comunidade.',
                color: 'from-blue-400 to-blue-600',
              },
              {
                icon: Shield,
                title: 'Sorteios Transparentes',
                description: 'Vinculados à Loteria Federal ou com algoritmo auditável. 100% confiável.',
                color: 'from-emerald-400 to-emerald-600',
              },
              {
                icon: Zap,
                title: 'Sorte Acumulada',
                description: 'Quanto mais você participa, mais sorte acumula. Suas chances aumentam a cada rifa.',
                color: 'from-yellow-400 to-orange-500',
              },
              {
                icon: Trophy,
                title: 'Gamificação',
                description: 'Ganhe XP, suba de nível, desbloqueie conquistas e apareça nos rankings.',
                color: 'from-violet-400 to-purple-600',
              },
              {
                icon: Star,
                title: 'Criadores Verificados',
                description: 'Rifas apenas de criadores verificados. Sua segurança é nossa prioridade.',
                color: 'from-pink-400 to-rose-600',
              },
              {
                icon: TrendingUp,
                title: 'Dashboard Completo',
                description: 'Acompanhe suas rifas, vendas, participações e histórico em tempo real.',
                color: 'from-cyan-400 to-teal-600',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-gray-200/50 bg-white/80 p-8 backdrop-blur-xl transition-all hover:-translate-y-2 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/80"
              >
                <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="bg-gray-50 py-20 dark:bg-gray-900/50 md:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black md:text-5xl">
              Como funciona?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Em 3 passos simples você já está participando
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Crie sua conta',
                description: 'Cadastro rápido com email ou Google. Verifique seu perfil para mais benefícios.',
              },
              {
                step: '02',
                title: 'Escolha uma rifa',
                description: 'Explore o marketplace, filtre por categoria, preço ou popularidade.',
              },
              {
                step: '03',
                title: 'Compre e torça!',
                description: 'Pague com Pix ou cartão via Mercado Pago e aguarde o sorteio. Boa sorte!',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < 2 && (
                  <div className="absolute right-0 top-12 hidden h-0.5 w-full bg-gradient-to-r from-emerald-500 to-transparent md:block" />
                )}
                <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-violet-500 text-4xl font-black text-white shadow-xl shadow-emerald-500/30">
                  {item.step}
                </div>
                <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black md:text-5xl">
              O que dizem nossos{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">
                ganhadores
              </span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Maria Silva',
                avatar: '👩',
                role: 'Ganhadora de um iPhone 15',
                content: 'Nunca imaginei que ganharia! O processo foi super transparente e o prêmio chegou rápido. Recomendo demais!',
              },
              {
                name: 'João Pedro',
                avatar: '👨',
                role: 'Criador de Rifas',
                content: 'Como criador, a plataforma me dá todas as ferramentas. O suporte é incrível e a comunidade é muito engajada.',
              },
              {
                name: 'Ana Costa',
                avatar: '👩‍🦰',
                role: 'Ganhadora de uma PS5',
                content: 'Ganhei na terceira rifa que participei! A sorte acumulada realmente funciona. Agora estou viciada! 😂',
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-emerald-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">"{testimonial.content}"</p>
                <div className="mt-4 flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-4xl bg-gradient-to-r from-emerald-500 to-violet-600 p-12 text-white shadow-2xl md:p-16">
            <h2 className="mb-6 text-3xl font-black md:text-5xl">
              Pronto para tentar a sorte?
            </h2>
            <p className="mb-8 text-lg text-white/80">
              Crie sua conta grátis e comece a participar de rifas incríveis agora mesmo.
            </p>
            <Link
              href="/auth/cadastro"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-gray-900 shadow-xl transition-all hover:scale-105"
            >
              Criar Conta Grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/70 py-12 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500">
                  <Ticket className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black">rifei</span>
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                A maior plataforma de rifas do Brasil com feed social comunitário.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Plataforma</h4>
              <nav className="space-y-2 text-sm text-gray-500">
                <Link href="/main/marketplace" className="block hover:text-emerald-500">Explorar Rifas</Link>
                <Link href="/criar" className="block hover:text-emerald-500">Criar Rifa</Link>
                <Link href="/como-funciona" className="block hover:text-emerald-500">Como Funciona</Link>
                <Link href="/precos" className="block hover:text-emerald-500">Preços</Link>
              </nav>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Suporte</h4>
              <nav className="space-y-2 text-sm text-gray-500">
                <Link href="/ajuda" className="block hover:text-emerald-500">Central de Ajuda</Link>
                <Link href="/contato" className="block hover:text-emerald-500">Contato</Link>
                <Link href="/faq" className="block hover:text-emerald-500">FAQ</Link>
              </nav>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Legal</h4>
              <nav className="space-y-2 text-sm text-gray-500">
                <Link href="/termos" className="block hover:text-emerald-500">Termos de Uso</Link>
                <Link href="/privacidade" className="block hover:text-emerald-500">Privacidade</Link>
                <Link href="/regulamento" className="block hover:text-emerald-500">Regulamento</Link>
              </nav>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 dark:border-gray-700 md:flex-row">
            <p className="text-sm text-gray-500">
              © 2026 Rifei. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Plataforma segura com pagamentos via Mercado Pago
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
