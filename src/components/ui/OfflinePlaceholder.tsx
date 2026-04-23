import { WifiOff } from 'lucide-react'

interface OfflinePlaceholderProps {
  message?: string
}

export function OfflinePlaceholder({ message = 'Nije dostupno offline' }: OfflinePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-border py-12 text-center">
      <WifiOff size={28} className="text-text-muted" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  )
}
