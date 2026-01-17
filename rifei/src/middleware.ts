import { NextResponse, type NextRequest } from 'next/server'

// Middleware simplificado que não depende do Supabase para não quebrar o build
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas protegidas que precisam de autenticação
  const protectedRoutes = [
    '/main/feed',
    '/main/criar',
    '/main/dashboard',
    '/main/perfil',
    '/main/configuracoes',
    '/admin',
  ]

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtectedRoute) {
    // TODO: Quando Supabase estiver configurado, adicionar verificação de sessão
    // Por enquanto, apenas permite o acesso (para não quebrar o build)
    // const session = await getSession(request)
    // if (!session) {
    //   return NextResponse.redirect(new URL('/auth/login', request.url))
    // }
  }

  // Redirecionar rotas antigas para as novas
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (pathname === '/cadastro') {
    return NextResponse.redirect(new URL('/auth/cadastro', request.url))
  }

  if (pathname === '/marketplace') {
    return NextResponse.redirect(new URL('/main/marketplace', request.url))
  }

  if (pathname === '/feed') {
    return NextResponse.redirect(new URL('/main/feed', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
