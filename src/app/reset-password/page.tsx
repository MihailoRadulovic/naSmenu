'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'

function ResetForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Lozinke se ne poklapaju.')
      return
    }
    if (password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Greška pri resetovanju lozinke.')
        setLoading(false)
        return
      }

      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Greška pri povezivanju sa serverom.')
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <p style={{ textAlign: 'center', color: '#EF4444' }}>
        Nevažeći link. <Link href="/forgot-password" style={{ color: '#2DD4A0' }}>Zatražite novi.</Link>
      </p>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '380px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px',
          background: 'rgba(45,212,160,0.12)',
          border: '1.5px solid rgba(45,212,160,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: '1.8rem',
        }}>
          🔒
        </div>
        <h1 style={{
          color: 'var(--color-text-primary)', fontSize: '1.5rem',
          fontWeight: 700, margin: 0,
          fontFamily: 'var(--font-heading, system-ui)',
        }}>
          Nova lozinka
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
          Unesite novu lozinku za vaš nalog
        </p>
      </div>

      {done ? (
        <div style={{
          textAlign: 'center', padding: '32px 24px',
          borderRadius: '16px',
          border: '1px solid rgba(45,212,160,0.3)',
          background: 'rgba(45,212,160,0.06)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px' }}>
            Lozinka je promenjena!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Preusmeravamo vas na prijavu...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nova lozinka</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 karaktera" required
              autoComplete="new-password" style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Potvrda lozinke</label>
            <input
              type="password" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Ponovite lozinku" required
              autoComplete="new-password" style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: '#EF4444', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: '4px', padding: '14px',
              borderRadius: '999px',
              background: loading ? 'rgba(45,212,160,0.5)' : '#2DD4A0',
              color: '#0A0A0A', fontWeight: 700, fontSize: '1rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Čuvanje...' : 'Sačuvaj novu lozinku'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--color-bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <ThemeToggleButton />
      </div>
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'var(--color-text-secondary)',
  fontSize: '0.875rem',
  marginBottom: '6px',
  fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-secondary)',
  color: 'var(--color-text-primary)',
  fontSize: '1rem', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}
