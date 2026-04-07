'use client'

import { ChevronDown } from 'lucide-react'

const MONTH_NAMES_SR = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
]

interface MonthYearPickerProps {
  month: number  // 1-12
  year: number
  onChange: (month: number, year: number) => void
}

const selectClass = `
  w-full appearance-none rounded-card border border-border
  bg-bg-secondary px-3 py-2.5 pr-8 text-sm text-text-primary
  cursor-pointer focus:outline-none focus:border-accent-green/50
  transition-colors duration-150
`

export function MonthYearPicker({ month, year, onChange }: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i)

  return (
    <div className="flex gap-2">
      {/* Mesec — širi */}
      <div className="relative flex-[3]">
        <select
          value={month}
          onChange={(e) => onChange(parseInt(e.target.value), year)}
          aria-label="Mesec"
          className={selectClass}
        >
          {MONTH_NAMES_SR.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>

      {/* Godina — uži */}
      <div className="relative flex-[2]">
        <select
          value={year}
          onChange={(e) => onChange(month, parseInt(e.target.value))}
          aria-label="Godina"
          className={selectClass}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}.</option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>
    </div>
  )
}
