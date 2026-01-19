import { Header, Sidebar, MobileMenu, Footer } from '@/components/layout'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <MobileMenu />
      
      <main className="min-h-screen pt-20 lg:pl-64">
        <div className="mx-auto max-w-7xl p-4 md:p-6">
          {children}
        </div>
      </main>
      
      {/* FAB para criar rifa no mobile */}
      <div className="fab lg:hidden">
        <a href="/criar">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </a>
      </div>
    </div>
  )
}
