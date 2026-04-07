const COLORS = [
  '#E07B39', '#F5A623', '#D94F3D', '#6B4A2A',
  '#C4652A', '#E87461', '#7A6040', '#6B8E6B',
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const parts = name.trim().split(/\s+/)
  const initials = parts.length >= 2
    ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
    : parts[0].charAt(0).toUpperCase()
  const color = COLORS[hashName(name) % COLORS.length]

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${sizeMap[size]}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}
