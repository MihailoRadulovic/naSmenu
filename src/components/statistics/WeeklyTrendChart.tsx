'use client'

import { useEffect, useState } from 'react'
import type { WeekStats } from '@/types'

interface WeeklyTrendChartProps {
  data: WeekStats[]
  filteredEmployeeIds: Set<number>
}

export function WeeklyTrendChart({ data, filteredEmployeeIds }: WeeklyTrendChartProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(false)
    const t = setTimeout(() => setAnimated(true), 60)
    return () => clearTimeout(t)
  }, [data, filteredEmployeeIds])

  if (data.length < 2) return null

  const weeks = data.map((w) => {
    const total = w.employees
      .filter((s) => filteredEmployeeIds.size === 0 || filteredEmployeeIds.has(s.employee.id))
      .reduce((sum, s) => sum + s.totalHours, 0)

    const d = new Date(w.startDate)
    const label = `${d.getUTCDate().toString().padStart(2, '0')}.${(d.getUTCMonth() + 1).toString().padStart(2, '0')}`

    return { weekId: w.weekId, total: Math.round(total), label }
  })

  const max = Math.max(...weeks.map((w) => w.total), 1)

  return (
    <div className="rounded-card border border-border bg-bg-secondary p-4">
      <p className="mb-4 text-xs text-text-muted">Ukupno sati po nedelji</p>

      <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
        {weeks.map((w) => {
          const pct = (w.total / max) * 100

          return (
            <div key={w.weekId} className="flex flex-1 flex-col items-center gap-1">
              {/* Hours label above bar */}
              <span className={`text-[11px] font-semibold text-accent-green transition-opacity duration-500 ${animated ? 'opacity-100' : 'opacity-0'}`}>
                {w.total}h
              </span>

              {/* Bar */}
              <div className="relative w-full overflow-hidden rounded-t-sm bg-bg-tertiary" style={{ height: 52 }}>
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-gradient-to-t from-[#1A9E78] to-[#2DD4A0] transition-all duration-700 ease-out"
                  style={{ height: animated ? `${pct}%` : '0%' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Week labels */}
      <div className="mt-1.5 flex justify-between gap-2">
        {weeks.map((w) => (
          <span key={w.weekId} className="flex-1 text-center text-[10px] text-text-muted">
            {w.label}
          </span>
        ))}
      </div>
    </div>
  )
}
