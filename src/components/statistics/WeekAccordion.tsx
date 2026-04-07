'use client'


import { ChevronDown } from 'lucide-react'
import type { WeekStats } from '@/types'
import { formatDateShort } from '@/lib/dates'
import { EmployeeStatRow } from './EmployeeStatRow'

interface WeekAccordionProps {
  weekStats: WeekStats
  filteredEmployeeIds: Set<number>
  isOpen: boolean
  onToggle: () => void
  selectedMonth: number
  selectedYear: number
}

export function WeekAccordion({ weekStats, filteredEmployeeIds, isOpen, onToggle, selectedMonth, selectedYear }: WeekAccordionProps) {
  const open = isOpen

  const startDate = new Date(weekStats.startDate)
  const endDate = new Date(weekStats.endDate)

  // Primeni employee filter
  const visibleEmployees =
    filteredEmployeeIds.size === 0
      ? weekStats.employees
      : weekStats.employees.filter((s) => filteredEmployeeIds.has(s.employee.id))

  // Max sati za skaliranje bara
  const maxTotalHours = Math.max(...visibleEmployees.map((s) => s.totalHours), 1)

  // Ukupno sati za header summary
  const totalHours = visibleEmployees.reduce((sum, s) => sum + s.totalHours, 0)
  const formattedTotal = totalHours % 1 === 0 ? String(totalHours) + 'h' : totalHours.toFixed(1) + 'h'

  return (
    <div className="rounded-card border border-border bg-bg-secondary overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-bg-tertiary active:bg-bg-tertiary"
      >
        <div>
          <p className="font-[family-name:var(--font-heading)] font-bold text-text-primary">
            {formatDateShort(startDate)} – {formatDateShort(endDate)} {endDate.getUTCFullYear()}.
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            Sedmica {weekStats.weekNumber} · {visibleEmployees.length} zaposlenih
          </p>
        </div>

        <ChevronDown
          size={18}
          className={`text-text-muted transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible body — CSS grid for smooth height animation */}
      <div className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-border px-4 py-3 flex flex-col gap-2">
            {visibleEmployees.length === 0 ? (
              <p className="py-4 text-center text-sm text-text-muted">
                Nema zaposlenih za prikaz.
              </p>
            ) : (
              visibleEmployees.map((stat) => (
                <EmployeeStatRow
                  key={stat.employee.id}
                  stat={stat}
                  maxTotalHours={maxTotalHours}
                  month={selectedMonth}
                  year={selectedYear}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
