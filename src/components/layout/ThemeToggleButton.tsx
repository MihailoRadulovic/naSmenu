'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggleButton() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (stored) setTheme(stored)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('light', next === 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Promeni temu"
      className="no-print flex items-center justify-center rounded-full p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary shrink-0"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
