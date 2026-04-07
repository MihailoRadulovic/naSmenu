'use client'

import { useEffect, useState } from 'react'
import type { EmployeeStats } from '@/types'

interface MonthlyHoursChartProps {
  data: EmployeeStats[]
}

const RANK_STYLES: Record<number, { badge: string; bar: string; glow: boolean }> = {
  1: { badge: 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/40', bar: 'from-[#2DD4A0] to-[#1A9E78]', glow: true },
  2: { badge: 'bg-[#9CA3AF]/15 text-[#C8CDD4] border-[#9CA3AF]/30',            bar: 'from-[#2DD4A0] to-[#1A9E78]', glow: false },
  3: { badge: 'bg-[#CD9A6A]/15 text-[#D9A87A] border-[#CD9A6A]/30',            bar: 'from-[#2DD4A0] to-[#1A9E78]', glow: false },
}

const DEFAULT_RANK = { badge: 'bg-bg-tertiary text-text-muted border-border', bar: 'from-[#2DD4A0] to-[#1A9E78]', glow: false }

export function MonthlyHoursChart({ data }: MonthlyHoursChartProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(false)
    const t = setTimeout(() => setAnimated(true), 60)
    return () => clearTimeout(t)
  }, [data])

  const max = Math.max(...data.map((s) => s.totalHours), 1)

  return (
    <div className="rounded-card border border-border bg-bg-secondary p-4">
      <p className="mb-4 text-xs text-text-muted">Sati rada</p>

      <div className="flex flex-col gap-3">
        {data.map((s, i) => {
          const rank = i + 1
          const style = RANK_STYLES[rank] ?? DEFAULT_RANK
          const pct = (s.totalHours / max) * 100
          const hours = Math.round(s.totalHours)
          const firstName = s.employee.name.split(' ')[0]

          return (
            <div key={s.employee.id} className="flex items-center gap-2.5">

              {/* Rank badge */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${style.badge}`}
              >
                {rank}
              </div>

              {/* Name */}
              <span className="w-[72px] shrink-0 truncate text-sm text-text-secondary">
                {firstName}
              </span>

              {/* Bar track */}
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-bg-tertiary">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${style.bar} ${
                    style.glow ? 'shadow-[0_0_8px_rgba(45,212,160,0.5)]' : ''
                  }`}
                  style={{ width: animated ? `${pct}%` : '0%' }}
                />
              </div>

              {/* Hours pill */}
              <div className="w-[46px] shrink-0 rounded-full border border-accent-green/25 bg-accent-green/10 px-2 py-0.5 text-center text-xs font-semibold text-accent-green">
                {hours}h
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
