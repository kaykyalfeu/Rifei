import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Rifei - Plataforma de Rifas e Sorteios',
    template: '%s | Rifei',
  },
  description: 'A maior plataforma de rifas do Brasil com feed social comunitário. Crie e participe de rifas de forma segura e transparente.',
  keywords: ['rifa', 'sorteio', 'prêmios', 'rifas online', 'sorteios online', 'ganhar prêmios'],
  authors: [{ name: 'Rifei' }],
  creator: 'Rifei',
  publisher: 'Rifei',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Rifei',
    title: 'Rifei - Plataforma de Rifas e Sorteios',
    description: 'A maior plataforma de rifas do Brasil com feed social comunitário.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rifei - Plataforma de Rifas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rifei - Plataforma de Rifas e Sorteios',
    description: 'A maior plataforma de rifas do Brasil com feed social comunitário.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
