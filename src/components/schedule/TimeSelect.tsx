'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

interface TimeSelectProps {
  value: string
  onChange: (val: string) => void
  minHour?: number
  large?: boolean
}

export function TimeSelect({ value, onChange, minHour, large = false }: TimeSelectProps) {
  const [open, setOpen] = useState(false)
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hoursRef = useRef<HTMLDivElement>(null)
  const minutesRef = useRef<HTMLDivElement>(null)

  const [h, m] = value ? value.split(':') : ['', '']
  const visibleHours = minHour !== undefined ? HOURS.filter((hr) => parseInt(hr) >= minHour) : HOURS

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node
      if (!triggerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      hoursRef.current?.querySelector<HTMLElement>('[data-sel="true"]')?.scrollIntoView({ block: 'center' })
      minutesRef.current?.querySelector<HTMLElement>('[data-sel="true"]')?.scrollIntoView({ block: 'center' })
    }, 0)
    return () => clearTimeout(timer)
  }, [open])

  function handleToggle() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 6, left: rect.left })
    }
    setOpen((o) => !o)
  }

  function pickHour(hr: string) {
    onChange(`${hr}:${m || '00'}`)
  }

  function pickMinute(min: string) {
    onChange(`${h || '00'}:${min}`)
    setOpen(false)
  }

  const colHeader: React.CSSProperties = {
    padding: '6px 0',
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    background: 'var(--color-bg-tertiary)',
    borderBottom: '1px solid var(--color-border)',
    zIndex: 1,
  }

  function itemStyle(selected: boolean): React.CSSProperties {
    return {
      display: 'block',
      width: '100%',
      padding: large ? '8px 0' : '7px 0',
      textAlign: 'center',
      fontSize: large ? '0.95rem' : '0.9rem',
      cursor: 'pointer',
      border: 'none',
      background: selected ? 'rgba(245,158,11,0.18)' : 'transparent',
      color: selected ? '#F59E0B' : 'var(--color-text-primary)',
      fontWeight: selected ? 700 : 400,
      transition: 'background 120ms',
    }
  }

  const colWidth = large ? 72 : 64
  const colHeight = large ? 230 : 220

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: large ? '5px' : '3px',
          background: 'var(--color-bg-tertiary)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: large ? '8px' : '6px',
          color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          fontSize: large ? '1rem' : '0.78rem',
          fontWeight: large ? 600 : 500,
          padding: large ? '7px 12px' : '3px 7px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          letterSpacing: large ? '0.03em' : 0,
        }}
      >
        {value || '--:--'}
        <ChevronDown
          size={large ? 13 : 11}
          color="#F59E0B"
          style={{ transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && dropPos && createPortal(
        <>
          <style>{`
            @keyframes timeDropIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.96); }
              to   { opacity: 1; transform: translateY(0)   scale(1);    }
            }
          `}</style>
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: dropPos.top,
              left: dropPos.left,
              zIndex: 9999,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              display: 'flex',
              animation: 'timeDropIn 180ms ease-out forwards',
              transformOrigin: 'top left',
            }}
          >
            {/* Sati */}
            <div
              ref={hoursRef}
              style={{
                width: colWidth,
                height: colHeight,
                overflowY: 'auto',
                borderRight: '1px solid var(--color-border)',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--color-border) transparent',
              }}
            >
              <div style={colHeader}>SAT</div>
              {visibleHours.map((hr) => (
                <button
                  key={hr}
                  data-sel={hr === h ? 'true' : undefined}
                  onClick={() => pickHour(hr)}
                  style={itemStyle(hr === h)}
                >
                  {hr}
                </button>
              ))}
            </div>

            {/* Minuti */}
            <div
              ref={minutesRef}
              style={{
                width: colWidth,
                height: colHeight,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--color-border) transparent',
              }}
            >
              <div style={colHeader}>MIN</div>
              {MINUTES.map((min) => (
                <button
                  key={min}
                  data-sel={min === m ? 'true' : undefined}
                  onClick={() => pickMinute(min)}
                  style={itemStyle(min === m)}
                >
                  {min}
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
