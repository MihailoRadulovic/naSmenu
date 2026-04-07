import type { ShiftType } from '@/types'

interface ShiftBadgeProps {
  name: string
  shiftType: ShiftType
  halfShift?: boolean
  timeLabel?: string // npr. "11:00–15:00" za međusmenu
}

const shiftStyles: Record<ShiftType, string> = {
  first: 'bg-accent-green/15 text-accent-green-dark border border-accent-green/30',
  second: 'bg-accent-blue/15 text-accent-blue-dark border border-accent-blue/30',
  middle: 'bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30',
  off: 'bg-text-muted/10 text-text-secondary border border-text-muted/25',
  sick_leave: 'bg-[#9B6DFF]/15 text-[#9B6DFF] border border-[#9B6DFF]/30',
  vacation: 'bg-accent-blue/10 text-accent-blue border border-accent-blue/25',
  late: 'bg-[#FF7B47]/15 text-[#FF7B47] border border-[#FF7B47]/30',
}

export function ShiftBadge({ name, shiftType, halfShift, timeLabel }: ShiftBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-medium ${shiftStyles[shiftType] ?? shiftStyles.off}`}
    >
      {halfShift && <span className="font-bold">½</span>}
      {name}
      {timeLabel && <span className="opacity-70">{timeLabel}</span>}
    </span>
  )
}
