'use client'

import { useState, FormEvent, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('prefill_email')
    const savedPassword = sessionStorage.getItem('prefill_password')
    if (savedEmail) { setEmail(savedEmail); sessionStorage.removeItem('prefill_email') }
    if (savedPassword) { setPassword(savedPassword); sessionStorage.removeItem('prefill_password') }

    if (searchParams.get('verified') === '1') {
      setInfo('Email je potvrđen! Nalog čeka odobrenje — javiću ti se kad bude aktivan.')
    } else if (searchParams.get('error') === 'invalid-token') {
      setError('Link za verifikaciju nije validan ili je istekao.')
    }
  }, [searchParams])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error === 'EmailNotVerified') {
      setError('Email nije potvrđen. Proverite inbox i kliknite na link za aktivaciju.')
    } else if (result?.error === 'NotApproved') {
      setError('Nalog čeka odobrenje. Javićemo ti se čim bude aktivan.')
    } else if (result?.error) {
      setError('Pogrešan email ili lozinka.')
    } else {
      router.push('/')
      router.refresh()
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
      {/* Theme toggle — gore desno */}
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <ThemeToggleButton />
      </div>

      <div style={{ width: '100%', maxWidth: '380px' }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'rgba(45,212,160,0.12)',
            border: '1.5px solid rgba(45,212,160,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '1.8rem',
          }}>
            📋
          </div>
          <h1 style={{
            color: 'var(--color-text-primary)', fontSize: '1.6rem',
            fontWeight: 700, margin: 0,
            fontFamily: 'var(--font-heading, system-ui)',
          }}>
            SmenaApp
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Prijavite se na vaš nalog
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vasa@email.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Lozinka</label>
              <Link href="/forgot-password" style={{ color: '#2DD4A0', fontSize: '0.8rem', textDecoration: 'none' }}>
                Zaboravio si lozinku?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#2DD4A0', cursor: 'pointer' }}
            />
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Zapamti me
            </span>
          </label>

          {info && (
            <p style={{ color: '#2DD4A0', fontSize: '0.875rem', margin: 0 }}>{info}</p>
          )}
          {error && (
            <p style={{ color: '#EF4444', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px', padding: '14px',
              borderRadius: '999px',
              background: loading ? 'rgba(45,212,160,0.5)' : '#2DD4A0',
              color: '#0A0A0A', fontWeight: 700, fontSize: '1rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 150ms', fontFamily: 'inherit',
            }}
          >
            {loading ? 'Prijavljivanje...' : 'Prijavi se'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '24px' }}>
          Nemate nalog?{' '}
          <Link href="/register" style={{ color: '#2DD4A0', textDecoration: 'none', fontWeight: 600 }}>
            Registrujte se
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
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
