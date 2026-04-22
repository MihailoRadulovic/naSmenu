import type { Metadata, Viewport } from 'next'
import { plusJakartaSans, outfit } from '@/lib/fonts'
import { BottomNav } from '@/components/layout/BottomNav'
import { UpdatePrompt } from '@/components/UpdatePrompt'
import { ToastProvider } from '@/contexts/ToastContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'
import { FeaturesProvider } from '@/components/providers/FeaturesProvider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'naSmenu',
    template: '%s | naSmenu',
  },
  description: 'Raspored smena za kafiće — brzo i jednostavno.',
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'https://nasmenu.app'),
  openGraph: {
    title: 'naSmenu',
    description: 'Raspored smena za kafiće — brzo i jednostavno.',
    siteName: 'naSmenu',
    locale: 'sr_RS',
    type: 'website',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'naSmenu' }],
  },
  twitter: {
    card: 'summary',
    title: 'naSmenu',
    description: 'Raspored smena za kafiće — brzo i jednostavno.',
    images: ['/icons/icon-512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'naSmenu',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sr" className={`${plusJakartaSans.variable} ${outfit.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-accent-green focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Preskoči na sadržaj
        </a>
        <NextAuthProvider>
          <FeaturesProvider>
          <ToastProvider>
            <ThemeProvider>
              <div className="app-container">
                <main id="main-content" className="px-4 pt-4 schedule-grid">{children}</main>
              </div>
              <BottomNav />
              <UpdatePrompt />
            </ThemeProvider>
          </ToastProvider>
          </FeaturesProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
