'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Greška pri slanju emaila.')
        setLoading(false)
        return
      }

      setDone(true)
    } catch {
      setError('Greška pri povezivanju sa serverom.')
      setLoading(false)
    }
  }

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

      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'rgba(45,212,160,0.12)',
            border: '1.5px solid rgba(45,212,160,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '1.8rem',
          }}>
            🔑
          </div>
          <h1 style={{
            color: 'var(--color-text-primary)', fontSize: '1.5rem',
            fontWeight: 700, margin: 0,
            fontFamily: 'var(--font-heading, system-ui)',
          }}>
            Zaboravljena lozinka
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Unesite email i poslaćemo vam link za reset
          </p>
        </div>

        {done ? (
          <div style={{
            textAlign: 'center', padding: '32px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(45,212,160,0.3)',
            background: 'rgba(45,212,160,0.06)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📬</div>
            <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px' }}>
              Email je poslat!
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 24px', lineHeight: 1.5 }}>
              Ako nalog postoji, dobićete link za resetovanje lozinke. Važi 1 sat.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-block', padding: '12px 28px',
                borderRadius: '999px', background: '#2DD4A0',
                color: '#0A0A0A', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              Nazad na prijavu
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="fp-email" style={labelStyle}>Email adresa</label>
              <input
                id="fp-email"
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vasa@email.com" required
                autoComplete="email" style={inputStyle}
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
              {loading ? 'Slanje...' : 'Pošalji link'}
            </button>
          </form>
        )}

        {!done && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '24px' }}>
            <Link href="/login" style={{ color: '#2DD4A0', textDecoration: 'none', fontWeight: 600 }}>
              Nazad na prijavu
            </Link>
          </p>
        )}
      </div>
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
