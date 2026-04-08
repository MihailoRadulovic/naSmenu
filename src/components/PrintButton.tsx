'use client'

import { useFeatures } from '@/lib/features'

interface PrintButtonProps {
  label?: string
  className?: string
}

export function PrintButton({ label = 'Štampaj', className }: PrintButtonProps) {
  const features = useFeatures()
  if (!features.printSchedule) return null

  return (
    <button
      onClick={() => window.print()}
      className={`no-print ${className ?? ''}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(45,212,160,0.08)',
        border: '1px solid rgba(45,212,160,0.25)',
        borderRadius: '999px', padding: '8px 16px',
        color: '#2DD4A0', cursor: 'pointer',
        fontSize: '0.85rem', fontFamily: 'inherit',
        touchAction: 'manipulation', minHeight: '40px'
      }}
    >
      🖨 {label}
    </button>
  )
}
