'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [showRestoredMsg, setShowRestoredMsg] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    function handleOffline() {
      setIsOffline(true)
      setShowRestoredMsg(false)
    }

    function handleOnline() {
      setIsOffline(false)
      setShowRestoredMsg(true)
      setTimeout(() => setShowRestoredMsg(false), 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline && !showRestoredMsg) return null

  return (
    <div className="fixed top-0 left-1/2 z-[200] w-full max-w-[430px] -translate-x-1/2 px-4" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div
        className={`mt-3 flex items-center gap-3 rounded-card border px-4 py-3 text-sm shadow-lg shadow-black/30 transition-all ${
          isOffline
            ? 'border-amber-500/30 bg-bg-secondary text-text-primary'
            : 'border-accent-green/30 bg-bg-secondary text-accent-green'
        }`}
      >
        {isOffline ? (
          <>
            <WifiOff size={16} className="shrink-0 text-amber-400" />
            <p className="leading-snug">
              <span className="font-semibold text-amber-400">Offline režim</span>
              {' — '}
              <span className="text-text-secondary">prikazuju se poslednji sačuvani podatci. Izmene nisu moguće.</span>
            </p>
          </>
        ) : (
          <p className="font-semibold">Konekcija obnovljena</p>
        )}
      </div>
    </div>
  )
}
