'use client'

import { useEffect } from 'react'
import { features } from '@/lib/features'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!features.darkMode) return
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (stored) {
      document.documentElement.classList.toggle('light', stored === 'light')
    }
  }, [])

  return <>{children}</>
}
