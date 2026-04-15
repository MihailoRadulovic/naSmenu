'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null
    const theme = stored ?? 'light'
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [])

  return <>{children}</>
}
