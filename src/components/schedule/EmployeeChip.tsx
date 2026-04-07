'use client'

import type { Employee, ShiftType } from '@/types'

interface EmployeeChipProps {
  employee: Employee
  currentShifts: ShiftType[]
  halfShift: boolean
  targetShift: ShiftType
  onSelect: () => void
  onToggleHalf: () => void
}

const activeStyles: Record<ShiftType, string> = {
  first: 'bg-accent-green text-white border-accent-green',
  second: 'bg-accent-blue text-white border-accent-blue',
  middle: 'bg-[#F59E0B] text-white border-[#F59E0B]',
  off: 'bg-text-muted text-white border-text-muted',
  sick_leave: 'bg-[#9B6DFF] text-white border-[#9B6DFF]',
  vacation: 'bg-accent-blue text-white border-accent-blue',
  late: 'bg-[#FF7B47] text-white border-[#FF7B47]',
}

export function EmployeeChip({
  employee,
  currentShifts,
  halfShift,
  targetShift,
  onSelect,
  onToggleHalf,
}: EmployeeChipProps) {
  const isInThisShift = currentShifts.includes(targetShift)
  // Posivi samo: rad smene → off sekcija je siva, ili off → rad sekcije su sive
  const isAssignedElsewhere = currentShifts.length > 0 && !isInThisShift && (
    targetShift === 'off' || currentShifts.includes('off')
  )
  const name = employee.name

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onSelect}
        title={isAssignedElsewhere ? 'Već raspoređen' : undefined}
        className={`
          rounded-pill border px-3 py-1.5 text-sm font-medium
          transition-all duration-150 active:scale-[0.97]
          ${isInThisShift
            ? activeStyles[targetShift]
            : isAssignedElsewhere
            ? 'border-border bg-bg-tertiary text-text-muted line-through cursor-not-allowed'
            : 'border-border bg-bg-secondary text-text-secondary hover:border-accent-green/50 hover:text-text-primary'
          }
        `}
      >
        {name}
      </button>

      {isInThisShift && targetShift !== 'off' && targetShift !== 'middle' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleHalf()
          }}
          title="Polovična smena"
          className={`
            rounded-full w-7 h-7 text-xs font-bold border transition-all duration-150
            ${halfShift
              ? 'bg-accent-yellow text-amber-900 border-accent-yellow'
              : 'border-border bg-bg-secondary text-text-muted hover:border-accent-yellow hover:text-amber-700'
            }
          `}
        >
          ½
        </button>
      )}
    </div>
  )
}
