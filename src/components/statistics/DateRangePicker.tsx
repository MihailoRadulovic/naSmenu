'use client'

import { useRef } from 'react'
import { Calendar } from 'lucide-react'

interface DateRangePickerProps {
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

function toISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getMondayOf(d: Date): Date {
  const r = new Date(d)
  const dow = r.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  r.setDate(r.getDate() + diff)
  return r
}

const PRESETS = [
  {
    label: 'Ova sedmica',
    range: () => {
      const mon = getMondayOf(new Date())
      const sun = new Date(mon)
      sun.setDate(mon.getDate() + 6)
      return [toISO(mon), toISO(sun)] as const
    },
  },
  {
    label: 'Prošla sedmica',
    range: () => {
      const mon = getMondayOf(new Date())
      const prevMon = new Date(mon)
      prevMon.setDate(mon.getDate() - 7)
      const prevSun = new Date(prevMon)
      prevSun.setDate(prevMon.getDate() + 6)
      return [toISO(prevMon), toISO(prevSun)] as const
    },
  },
  {
    label: 'Ovaj mesec',
    range: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return [toISO(start), toISO(end)] as const
    },
  },
  {
    label: 'Prošli mesec',
    range: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return [toISO(start), toISO(end)] as const
    },
  },
]

function DateButton({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: string
  min?: string
  max?: string
  onChange: (v: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function openPicker() {
    try {
      inputRef.current?.showPicker()
    } catch {
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-1 min-w-0 flex-1">
      <label className="text-xs text-text-muted font-medium">{label}</label>
      <div className="relative flex flex-1 items-center rounded-card border border-border bg-bg-secondary px-3 py-2.5 focus-within:border-accent-green/50 transition-colors duration-150">
        <input
          ref={inputRef}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-sm text-text-primary focus:outline-none appearance-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
        />
        <button
          type="button"
          onClick={openPicker}
          className="ml-1 flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
          tabIndex={-1}
        >
          <Calendar size={16} />
        </button>
      </div>
    </div>
  )
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const hasError = Boolean(from && to && from > to)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {/* Left: date inputs */}
        <div className="flex flex-col gap-2 flex-1">
          <DateButton
            label="Od:"
            value={from}
            max={to || undefined}
            onChange={(v) => onChange(v, to)}
          />
          <DateButton
            label="Do:"
            value={to}
            min={from || undefined}
            onChange={(v) => onChange(from, v)}
          />
        </div>

        {/* Right: presets */}
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-xs text-text-muted font-medium">Brzi izbor:</span>
          <div className="flex flex-col gap-1">
            {PRESETS.map((p) => {
              const [f, t] = p.range()
              const isActive = from === f && to === t
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onChange(f, t)}
                  className={`text-xs px-2 py-1.5 rounded-lg border transition-colors duration-150 text-left ${
                    isActive
                      ? 'border-accent-green bg-accent-green/10 text-accent-green font-medium'
                      : 'border-border bg-bg-secondary text-text-secondary hover:border-accent-green/50 hover:text-text-primary'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {hasError && (
        <p className="text-xs text-accent-red">
          Datum &quot;od&quot; mora biti pre datuma &quot;do&quot;.
        </p>
      )}
    </div>
  )
}
