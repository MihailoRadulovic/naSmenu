import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-bg-secondary">
        <WifiOff size={36} className="text-text-secondary" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Nema konekcije</h1>
        <p className="max-w-xs text-sm leading-relaxed text-text-secondary">
          Ova stranica nije dostupna offline. Vrati se na prethodno posećene stranice ili se povezi na internet.
        </p>
      </div>

      <a
        href="/"
        className="rounded-pill bg-accent-green px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
      >
        Idi na početnu
      </a>
    </div>
  )
}
