import type { Metadata, Viewport } from 'next'
import { plusJakartaSans, outfit } from '@/lib/fonts'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastProvider } from '@/contexts/ToastContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'
import { FeaturesProvider } from '@/components/providers/FeaturesProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'naSmenu',
  description: 'Raspored smena za kafiće',
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
      </head>
      <body>
        <NextAuthProvider>
          <FeaturesProvider>
          <ToastProvider>
            <ThemeProvider>
              <div className="app-container">
                <main className="px-4 pt-4 schedule-grid">{children}</main>
              </div>
              <BottomNav />
            </ThemeProvider>
          </ToastProvider>
          </FeaturesProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
