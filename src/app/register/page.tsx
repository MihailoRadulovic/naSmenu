'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [cafeName, setCafeName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

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
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cafeName, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Registracija nije uspela.')
        setLoading(false)
        return
      }

      sessionStorage.setItem('prefill_email', email)
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
      padding: '24px', overflowY: 'auto',
    }}>
      {/* Theme toggle — gore desno */}
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <ThemeToggleButton />
      </div>

      <div style={{ width: '100%', maxWidth: '380px', paddingBlock: '24px' }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Image
            src="/logo-icon.png"
            alt="naSmenu"
            width={90}
            height={90}
            style={{ margin: '-16px auto 8px', display: 'block' }}
            priority
            unoptimized
          />
          <h1 style={{
            color: 'var(--color-text-primary)', fontSize: '1.6rem',
            fontWeight: 500, margin: 0,
            fontFamily: 'var(--font-heading, system-ui)',
          }}>
            Registracija
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Kreiranje novog naloga
          </p>
        </div>

        {done ? (
          /* Uspešna registracija — proveri email */
          <div style={{
            textAlign: 'center',
            padding: '32px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(45,212,160,0.3)',
            background: 'rgba(45,212,160,0.06)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📬</div>
            <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px' }}>
              Proverite inbox!
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 24px', lineHeight: 1.5 }}>
              Poslali smo verifikacioni email na <strong style={{ color: 'var(--color-text-secondary)' }}>{email}</strong>.
              Kliknite na link u emailu da aktivirate nalog.
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
              Idi na prijavu
            </Link>
          </div>
        ) : (
          /* Forma */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="primer@gmail.com" required
                autoComplete="email" style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Naziv kafića / lokala</label>
              <input
                type="text" value={cafeName}
                onChange={e => setCafeName(e.target.value)}
                placeholder="Naziv Lokala" required style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Lozinka</label>
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
                transition: 'opacity 150ms', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Kreiranje naloga...' : 'Registruj se'}
            </button>
          </form>
        )}

        {!done && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '24px' }}>
            Već imate nalog?{' '}
            <Link href="/login" style={{ color: '#2DD4A0', textDecoration: 'none', fontWeight: 600 }}>
              Prijavite se
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
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-secondary)',
  color: 'var(--color-text-primary)',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}
