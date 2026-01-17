'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Compass, PlusCircle, BarChart3, User, Bell, Search, 
  Menu, Moon, Sun, Ticket, Settings, LogOut, ChevronRight,
  Trophy, Star, Zap, X
} from 'lucide-react'
import { Button, Avatar, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth, useIsMobile } from '@/hooks'
import { useUIStore, useNotificacoesStore } from '@/stores'

// ===========================================
// HEADER
// ===========================================

export function Header() {
  const { user, isAuthenticated } = useAuth()
  const { theme, setTheme, toggleMobileMenu } = useUIStore()
  const { naoLidas } = useNotificacoesStore()
  const isMobile = useIsMobile()

  const isDark = theme === 'dark'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200/50 bg-white/70 backdrop-blur-2xl dark:border-gray-700/50 dark:bg-gray-900/90">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl p-2 hover:bg-emerald-500/10 lg:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 shadow-lg shadow-emerald-500/25">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              rif<span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">ei</span>
            </span>
          </Link>
        </div>

        {/* Search - Desktop */}
        {!isMobile && (
          <div className="mx-8 flex max-w-xl flex-1">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar rifas, criadores, categorias..."
                className="w-full rounded-2xl border border-gray-200 bg-white/90 py-3 pl-12 pr-4 transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800/90 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="rounded-xl border border-gray-200 bg-white/80 p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-700"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-violet-500" />
            )}
          </button>

          {/* Notifications */}
          {isAuthenticated && (
            <button className="relative rounded-xl border border-gray-200 bg-white/80 p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-700">
              <Bell className="h-5 w-5" />
              {naoLidas > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </button>
          )}

          {/* Create Button - Desktop */}
          {isAuthenticated && !isMobile && (
            <Link href="/criar">
              <Button>
                <PlusCircle className="h-5 w-5" />
                Criar Rifa
              </Button>
            </Link>
          )}

          {/* User Menu / Login */}
          {isAuthenticated ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              {!isMobile && (
                <Link href="/cadastro">
                  <Button>Criar Conta</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ===========================================
// USER MENU
// ===========================================

function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = React.useState(false)
  const { signOut } = useAuth()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 p-1.5 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-700"
      >
        <Avatar
          src={user?.avatar_url}
          alt={user?.nome}
          fallback={user?.nome?.charAt(0)}
          size="sm"
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {/* User Info */}
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
              <Avatar
                src={user?.avatar_url}
                alt={user?.nome}
                fallback={user?.nome?.charAt(0)}
              />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold">{user?.nome}</p>
                <p className="truncate text-sm text-gray-500">@{user?.nome_usuario}</p>
              </div>
              <Badge variant="primary" className="text-[10px]">
                Nv.{user?.nivel}
              </Badge>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1">
              <Link
                href="/perfil"
                className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpen(false)}
              >
                <User className="h-5 w-5 text-gray-500" />
                <span>Meu Perfil</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpen(false)}
              >
                <BarChart3 className="h-5 w-5 text-gray-500" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/configuracoes"
                className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpen(false)}
              >
                <Settings className="h-5 w-5 text-gray-500" />
                <span>Configurações</span>
              </Link>
              
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
              
              <button
                onClick={() => {
                  setOpen(false)
                  signOut()
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}

// ===========================================
// SIDEBAR
// ===========================================

const menuItems = [
  { id: 'feed', href: '/feed', icon: Home, label: 'Feed' },
  { id: 'marketplace', href: '/marketplace', icon: Compass, label: 'Explorar', badge: 'Novo' },
  { id: 'criar', href: '/criar', icon: PlusCircle, label: 'Criar Rifa' },
  { id: 'dashboard', href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'perfil', href: '/perfil', icon: User, label: 'Meu Perfil' },
]

const categorias = [
  { nome: 'Eletrônicos', icone: '📱', count: 45 },
  { nome: 'Veículos', icone: '🚗', count: 23 },
  { nome: 'Viagens', icone: '✈️', count: 18 },
  { nome: 'Games', icone: '🎮', count: 34 },
  { nome: 'Casa', icone: '🏠', count: 28 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  return (
    <aside className="fixed bottom-0 left-0 top-16 hidden w-64 overflow-y-auto border-r border-gray-200/50 bg-white/70 p-4 backdrop-blur-2xl dark:border-gray-700/50 dark:bg-gray-900/90 lg:block">
      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-gray-700 hover:bg-emerald-500/10 dark:text-gray-300 dark:hover:bg-emerald-500/10'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-violet-500 px-2 py-0.5 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Categories */}
      <div className="mt-8">
        <h3 className="mb-3 px-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Categorias
        </h3>
        <div className="space-y-1">
          {categorias.map((cat) => (
            <Link
              key={cat.nome}
              href={`/marketplace?categoria=${cat.nome.toLowerCase()}`}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-gray-700 transition-colors hover:bg-emerald-500/10 dark:text-gray-300"
            >
              <span className="text-lg">{cat.icone}</span>
              <span className="font-medium">{cat.nome}</span>
              <span className="ml-auto text-sm text-gray-500">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Achievements Preview */}
      {isAuthenticated && (
        <div className="mt-8 rounded-2xl border border-gray-200/50 bg-white/80 p-4 dark:border-gray-700/50 dark:bg-gray-800/80">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">Suas Conquistas</span>
          </div>
          <div className="flex gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-lg shadow-lg">
              🎯
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-lg shadow-lg">
              🍀
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 text-gray-500 dark:bg-gray-700">
              +2
            </div>
          </div>
        </div>
      )}

      {/* Luck Meter */}
      {isAuthenticated && user?.sorte_acumulada > 0 && (
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-600 p-4 text-white">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="font-bold">Sua Sorte</span>
          </div>
          <div className="mb-2 text-3xl font-black">+{user.sorte_acumulada}%</div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${Math.min(100, user.sorte_acumulada * 10)}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  )
}

// ===========================================
// MOBILE MENU
// ===========================================

export function MobileMenu() {
  const pathname = usePathname()
  const { mobileMenuOpen, closeMobileMenu } = useUIStore()

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden',
          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMobileMenu}
      />

      {/* Menu */}
      <aside
        className={cn(
          'fixed bottom-0 left-0 top-0 z-50 w-72 bg-white p-4 pt-20 shadow-xl transition-transform dark:bg-gray-900 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close Button */}
        <button
          onClick={closeMobileMenu}
          className="absolute right-4 top-4 rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-violet-500 text-white'
                    : 'text-gray-700 hover:bg-emerald-500/10 dark:text-gray-300'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Categories */}
        <div className="mt-8">
          <h3 className="mb-3 px-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Categorias
          </h3>
          <div className="space-y-1">
            {categorias.slice(0, 4).map((cat) => (
              <Link
                key={cat.nome}
                href={`/marketplace?categoria=${cat.nome.toLowerCase()}`}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-gray-700 transition-colors hover:bg-emerald-500/10 dark:text-gray-300"
              >
                <span className="text-lg">{cat.icone}</span>
                <span className="font-medium">{cat.nome}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}

// ===========================================
// FOOTER
// ===========================================

export function Footer() {
  return (
    <footer className="border-t border-gray-200/50 bg-white/70 py-8 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-emerald-500" />
            <span className="font-bold">Rifei</span>
            <span className="text-sm text-gray-500">© 2026</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/termos" className="hover:text-emerald-500">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-emerald-500">Privacidade</Link>
            <Link href="/ajuda" className="hover:text-emerald-500">Ajuda</Link>
            <Link href="/contato" className="hover:text-emerald-500">Contato</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
