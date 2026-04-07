'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { WeekBounds } from '@/types'
import { formatDateShort, getWeekNumber } from '@/lib/dates'

interface WeekPickerProps {
  bounds: WeekBounds
  onPrev: () => void
  onNext: () => void
}

export function WeekPicker({ bounds, onPrev, onNext }: WeekPickerProps) {
  const weekNum = getWeekNumber(bounds.startDate)
  const from = formatDateShort(bounds.startDate)
  const to = formatDateShort(bounds.endDate)
  const year = bounds.startDate.getFullYear()

  return (
    <div className="flex items-center justify-between gap-2 rounded-card bg-bg-secondary border border-border px-4 py-3">
      <button
        onClick={onPrev}
        aria-label="Prethodna sedmica"
        className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary active:scale-95"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="text-center">
        <p className="text-xs text-text-muted font-medium">Sedmica {weekNum}</p>
        <p className="font-[family-name:var(--font-heading)] font-bold text-text-primary">
          {from} – {to} {year}.
        </p>
      </div>

      <button
        onClick={onNext}
        aria-label="Sledeća sedmica"
        className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary active:scale-95"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
