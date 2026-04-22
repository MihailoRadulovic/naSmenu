'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

export function UpdatePrompt() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    async function checkRegistration() {
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (!reg) return

        // New SW already waiting (e.g. user refreshed manually)
        if (reg.waiting) {
          setWaitingSW(reg.waiting)
          return
        }

        // Watch for future updates
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingSW(installing)
            }
          })
        })
      } catch {
        // SW not supported or blocked — silently ignore
      }
    }

    checkRegistration()
  }, [])

  function handleUpdate() {
    if (!waitingSW) return
    waitingSW.postMessage({ type: 'SKIP_WAITING' })
    setWaitingSW(null)
  }

  if (!waitingSW) return null

  return (
    <div className="fixed bottom-[calc(90px+env(safe-area-inset-bottom,0px)+12px)] left-1/2 z-[100] w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
      <div className="flex items-center justify-between gap-3 rounded-card border border-accent-green/30 bg-bg-secondary px-4 py-3 shadow-lg shadow-black/30">
        <p className="text-sm text-text-secondary leading-snug">
          Nova verzija je dostupna.
        </p>
        <button
          onClick={handleUpdate}
          className="flex shrink-0 items-center gap-1.5 rounded-pill bg-accent-green px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
        >
          <RefreshCw size={13} />
          Osveži
        </button>
      </div>
    </div>
  )
}
