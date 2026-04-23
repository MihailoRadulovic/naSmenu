'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/contexts/ToastContext'
import { useOffline } from '@/hooks/useOffline'
import type { EmployeeStats } from '@/types'

interface EmployeeStatRowProps {
  stat: EmployeeStats
  maxTotalHours: number
  month?: number
  year?: number
}

function formatCount(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1)
}

function StatPill({
  value,
  label,
  colorClass,
}: {
  value: string
  label: string
  colorClass: string
}) {
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-pill px-2 py-0.5 text-xs ${colorClass}`}>
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </span>
  )
}

export function EmployeeStatRow({ stat, maxTotalHours, month, year }: EmployeeStatRowProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const isOffline = useOffline()
  const barWidth = maxTotalHours > 0 ? (stat.totalHours / maxTotalHours) * 100 : 0
  const href = month && year
    ? `/statistika/zaposleni/${stat.employee.id}?month=${month}&year=${year}`
    : `/statistika/zaposleni/${stat.employee.id}`

  function handleClick() {
    if (isOffline) {
      showToast('Detalji zaposlenog nisu dostupni bez interneta', 'error')
      return
    }
    router.push(href)
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full flex-col gap-2 rounded-card border border-border bg-bg-secondary p-4 text-left transition-all duration-200 hover:border-accent-green/40 hover:shadow-sm active:scale-[0.99]"
    >
      {/* Red 1: avatar + ime + strelica */}
      <div className="flex items-center gap-3">
        <Avatar
          name={stat.employee.name}
          size="sm"
        />

        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate text-sm">
            {stat.employee.name}
            {!stat.employee.isActive && (
              <span className="ml-1.5 text-xs text-text-muted font-normal">(neaktivan)</span>
            )}
          </p>
        </div>

        <ChevronRight size={16} className="text-text-muted shrink-0" />
      </div>

      {/* Red 2: stat badževi */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <StatPill
          value={formatCount(stat.firstShifts)}
          label="🌅"
          colorClass="bg-accent-green/15 text-accent-green-dark"
        />
        <StatPill
          value={formatCount(stat.secondShifts)}
          label="🌆"
          colorClass="bg-accent-blue/15 text-accent-blue-dark"
        />
        {stat.middleShifts > 0 && (
          <StatPill
            value={String(stat.middleShifts)}
            label="🕐"
            colorClass="bg-[#F59E0B]/15 text-[#B45309]"
          />
        )}
        <StatPill
          value={`${formatCount(stat.totalHours)}h`}
          label="Σ"
          colorClass="bg-bg-tertiary text-text-primary font-bold border border-border"
        />
        <StatPill
          value={String(stat.offDays)}
          label="💤"
          colorClass="bg-accent-red/10 text-accent-red"
        />
      </div>

      {/* Bar chart */}
      <div className="h-1.5 w-full rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent-green transition-all duration-500"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </button>
  )
}
