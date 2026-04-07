'use client'

interface FilterEmployee {
  id: number
  name: string
}

interface EmployeeFilterProps {
  employees: FilterEmployee[]
  selectedIds: Set<number>
  onToggle: (id: number) => void
  onClear: () => void
}

export function EmployeeFilter({ employees, selectedIds, onToggle, onClear }: EmployeeFilterProps) {
  if (employees.length === 0) return null

  const allSelected = selectedIds.size === 0  // prazan set = svi prikazani

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {/* "Svi" chip */}
      <button
        onClick={onClear}
        className={`
          rounded-pill border px-3 py-1.5 text-sm font-medium
          whitespace-nowrap flex-shrink-0
          transition-all duration-150 active:scale-[0.97]
          ${allSelected
            ? 'bg-accent-green text-white border-accent-green'
            : 'border-border bg-bg-secondary text-text-secondary hover:border-accent-green/50'
          }
        `}
      >
        Svi
      </button>

      {employees.map((emp) => {
        const isSelected = selectedIds.has(emp.id)
        return (
          <button
            key={emp.id}
            onClick={() => onToggle(emp.id)}
            className={`
              rounded-pill border px-3 py-1.5 text-sm font-medium
              whitespace-nowrap flex-shrink-0
              transition-all duration-150 active:scale-[0.97]
              ${isSelected
                ? 'bg-accent-green text-white border-accent-green'
                : 'border-border bg-bg-secondary text-text-secondary hover:border-accent-green/50'
              }
            `}
          >
            {emp.name}
          </button>
        )
      })}
    </div>
  )
}
