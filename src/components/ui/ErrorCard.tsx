'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorCardProps {
  message: string
  onRetry?: () => void
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-accent-red/30 bg-accent-red/10 px-4 py-8 text-center">
      <AlertCircle size={32} className="text-accent-red" />
      <p className="text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-pill border border-accent-red/40 px-4 py-2 text-sm font-medium text-accent-red transition-colors hover:bg-accent-red/10 active:scale-[0.97]"
        >
          <RefreshCw size={14} />
          Pokušaj ponovo
        </button>
      )}
    </div>
  )
}
