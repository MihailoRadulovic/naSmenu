interface EmployeeStatusBadgeProps {
  isActive: boolean
}

export function EmployeeStatusBadge({ isActive }: EmployeeStatusBadgeProps) {
  return (
    <span
      className={`rounded-pill px-3 py-1 text-xs font-medium ${
        isActive
          ? 'bg-accent-green/20 text-accent-green'
          : 'bg-text-muted/20 text-text-muted'
      }`}
    >
      {isActive ? 'Aktivan' : 'Neaktivan'}
    </span>
  )
}
