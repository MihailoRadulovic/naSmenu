'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Printer } from 'lucide-react'
import type { WeekWithEntries } from '@/types'
import type { WeekBounds } from '@/types'
import { formatDateShort } from '@/lib/dates'
import { minutesToTime } from '@/lib/shiftHours'

interface Props {
  weekData: WeekWithEntries
  bounds: WeekBounds
}

const DAY_NAMES_SHORT = ['PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB', 'NED']

function shiftCell(entries: WeekWithEntries['entries'], empId: number, day: number) {
  const shifts = entries.filter((e) => e.day === day && e.employeeId === empId)
  if (shifts.length === 0) return { label: '—', cls: 'cell-off' }

  const results: { label: string; cls: string }[] = []

  for (const s of shifts) {
    if (s.shiftType === 'first')
      results.push({ label: s.halfShift ? 'Prva ½' : 'Prva', cls: 'cell-first' })
    else if (s.shiftType === 'second')
      results.push({ label: s.halfShift ? 'Druga ½' : 'Druga', cls: 'cell-second' })
    else if (s.shiftType === 'middle') {
      const time = s.middleStart != null && s.middleEnd != null
        ? `${minutesToTime(s.middleStart)}–${minutesToTime(s.middleEnd)}`
        : 'Međ.'
      results.push({ label: time, cls: 'cell-middle' })
    }
    else if (s.shiftType === 'sick_leave') results.push({ label: 'Bolovanje', cls: 'cell-absence' })
    else if (s.shiftType === 'vacation')  results.push({ label: 'Godišnji', cls: 'cell-absence' })
    else if (s.shiftType === 'late')      results.push({ label: 'Kasnio', cls: 'cell-absence' })
    else results.push({ label: '—', cls: 'cell-off' })
  }

  if (results.length === 1) return results[0]
  return { label: results.map((r) => r.label).join(' + '), cls: results[0].cls }
}

export function PrintScheduleButton({ weekData, bounds }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const startLabel = formatDateShort(bounds.startDate)
  const endLabel   = formatDateShort(bounds.endDate)
  const yearLabel  = bounds.endDate.getFullYear()

  // Unique employees sorted by name
  const employeeMap = new Map<number, string>()
  for (const e of weekData.entries) {
    if (!employeeMap.has(e.employeeId)) employeeMap.set(e.employeeId, e.employee.name)
  }
  const employees = Array.from(employeeMap.entries()).sort((a, b) => a[1].localeCompare(b[1]))

  // Day dates
  const dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(bounds.startDate)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <>
      <button
        onClick={() => window.print()}
        className="no-print flex w-full items-center justify-center gap-2 rounded-pill border border-border bg-bg-secondary px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent-green/40 hover:text-accent-green active:scale-[0.97]"
      >
        <Printer size={16} />
        Štampaj raspored
      </button>

      {mounted && createPortal(<div className="print-only">
        <h1 className="print-title">
          RASPORED — {startLabel} – {endLabel} {yearLabel}.
        </h1>

        <table className="print-table">
          <thead>
            <tr>
              <th className="print-th print-th-name">Zaposleni</th>
              {dayDates.map((date, i) => (
                <th key={i} className="print-th print-th-day">
                  <span className="print-day-short">{DAY_NAMES_SHORT[i]}</span>
                  <span className="print-day-date">{formatDateShort(date)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(([empId, name], rowIdx) => (
              <tr key={empId} className={rowIdx % 2 === 0 ? 'print-row-even' : 'print-row-odd'}>
                <td className="print-td print-td-name">{name}</td>
                {Array.from({ length: 7 }, (_, day) => {
                  const { label, cls } = shiftCell(weekData.entries, empId, day)
                  return (
                    <td key={day} className={`print-td print-td-shift ${cls}`}>
                      {label}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="print-legend">
          <span className="legend-item cell-first">Prva smena</span>
          <span className="legend-item cell-second">Druga smena</span>
          <span className="legend-item cell-middle">Međusmena</span>
          <span className="legend-item cell-off">Slobodan dan</span>
          <span className="legend-item cell-absence">Odsustvo</span>
        </div>
      </div>, document.body)}
    </>
  )
}
