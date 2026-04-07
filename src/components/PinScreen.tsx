'use client'

import { useState, useCallback } from 'react'

const APP_PIN = process.env.NEXT_PUBLIC_APP_PIN ?? ''

interface PinScreenProps {
  onSuccess: () => void
}

export function PinScreen({ onSuccess }: PinScreenProps) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  const handleDigit = useCallback((d: string) => {
    if (pin.length >= 4) return
    const newPin = pin + d
    setPin(newPin)

    if (newPin.length === 4) {
      if (APP_PIN && newPin === APP_PIN) {
        sessionStorage.setItem('smena_authed', 'true')
        onSuccess()
      } else {
        setShake(true)
        setTimeout(() => {
          setShake(false)
          setPin('')
        }, 700)
      }
    }
  }, [pin, onSuccess])

  const handleBackspace = useCallback(() => {
    setPin(p => p.slice(0, -1))
  }, [])

  const numpadKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'] as const

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0A0A0A',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body, system-ui)',
      zIndex: 9999
    }}>
      {/* App branding */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px',
          background: 'rgba(45,212,160,0.12)',
          border: '1.5px solid rgba(45,212,160,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: '1.8rem'
        }}>
          📋
        </div>
        <h1 style={{
          color: '#FFFFFF', fontSize: '1.6rem', fontWeight: 700,
          margin: 0, fontFamily: 'var(--font-heading, system-ui)'
        }}>
          SmenaApp
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '6px' }}>
          Unesite PIN za pristup
        </p>
      </div>

      {/* PIN dots */}
      <div
        style={{
          display: 'flex', gap: '16px', marginBottom: '40px',
          animation: shake ? 'pinShake 0.6s ease' : 'none'
        }}
      >
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: i < pin.length ? '#2DD4A0' : 'rgba(45,212,160,0.15)',
              border: '1.5px solid rgba(45,212,160,0.3)',
              transition: 'background 150ms ease'
            }}
          />
        ))}
      </div>

      {/* Numpad */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 72px)',
        gap: '14px'
      }}>
        {numpadKeys.map((key, i) => (
          <button
            key={i}
            onClick={() => {
              if (key === '⌫') handleBackspace()
              else if (key !== '') handleDigit(String(key))
            }}
            disabled={key === ''}
            aria-hidden={key === '' ? true : undefined}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: key === '' ? 'transparent' : 'rgba(255,255,255,0.04)',
              border: key === '' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: key === '⌫' ? '#9CA3AF' : '#FFFFFF',
              fontSize: key === '⌫' ? '1.3rem' : '1.5rem',
              fontWeight: 400,
              cursor: key === '' ? 'default' : 'pointer',
              touchAction: 'manipulation',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms'
            }}
            onMouseDown={e => {
              if (key !== '') {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(45,212,160,0.12)'
              }
            }}
            onMouseUp={e => {
              if (key !== '') {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
              }
            }}
          >
            {key}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pinShake {
          0%,100%{transform:translateX(0)}
          15%{transform:translateX(-10px)}
          30%{transform:translateX(10px)}
          45%{transform:translateX(-8px)}
          60%{transform:translateX(8px)}
          75%{transform:translateX(-5px)}
          90%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  )
}
