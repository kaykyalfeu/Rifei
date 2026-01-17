import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/verificar',
  '/marketplace',
  '/rifa',
  '/termos',
  '/privacidade',
  '/ajuda',
  '/contato',
  '/regulamento',
]

// Rotas que requerem autenticação
const protectedRoutes = [
  '/feed',
  '/criar',
  '/dashboard',
  '/perfil',
  '/configuracoes',
  '/admin',
]

export async function middleware(request: NextRequest) {
  // Atualizar sessão do Supabase
  const response = await updateSession(request)

  const { pathname } = request.nextUrl

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtectedRoute) {
    // Aqui você pode adicionar lógica adicional para verificar
    // se o usuário está autenticado e redirecionar se necessário
    // Por enquanto, apenas retorna a resposta atualizada
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
