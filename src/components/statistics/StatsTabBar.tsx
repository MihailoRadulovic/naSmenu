'use client'

interface StatsTabBarProps {
  activeTab: 'sedmicno' | 'mesecno'
  onChange: (tab: 'sedmicno' | 'mesecno') => void
}

export function StatsTabBar({ activeTab, onChange }: StatsTabBarProps) {
  return (
    <div className="flex gap-1.5 rounded-card bg-bg-secondary border border-border p-1.5">
      {(['sedmicno', 'mesecno'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`
            flex-1 rounded-[10px] py-2 text-sm font-semibold
            transition-all duration-150 active:scale-[0.97]
            ${activeTab === tab
              ? 'bg-accent-green text-white shadow-sm'
              : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
            }
          `}
        >
          {tab === 'sedmicno' ? 'Sedmično' : 'Mesečno'}
        </button>
      ))}
    </div>
  )
}
