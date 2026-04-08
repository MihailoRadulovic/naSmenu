'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (stored) {
      document.documentElement.classList.toggle('light', stored === 'light')
    }
  }, [])

  return <>{children}</>
}
