import { Button } from './Button'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'

interface PageHeaderProps {
  title: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-primary">
        {title}
      </h1>
      <div className="flex items-center gap-1">
        {action && (
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        <ThemeToggleButton />
      </div>
    </div>
  )
}
