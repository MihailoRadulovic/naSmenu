import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <MapPin size={48} className="text-text-muted" />
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">
          Stranica nije pronađena
        </h2>
        <p className="text-sm text-text-secondary">Ova stranica ne postoji.</p>
      </div>
      <Link
        href="/"
        className="rounded-pill bg-accent-green px-5 py-2.5 text-sm font-semibold text-white
          transition-all hover:bg-accent-green-dark active:scale-[0.97]"
      >
        ← Nazad na početnu
      </Link>
    </div>
  )
}
