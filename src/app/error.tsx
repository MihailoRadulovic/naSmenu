'use client'

import { AlertCircle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <AlertCircle size={48} className="text-accent-red" />
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">
          Došlo je do greške
        </h2>
        <p className="text-sm text-text-muted">
          Neočekivana greška. Pokušajte ponovo.
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-pill bg-accent-green px-5 py-2.5 text-sm font-semibold text-white
          transition-all hover:bg-accent-green-dark active:scale-[0.97]"
      >
        Pokušaj ponovo
      </button>
    </div>
  )
}
