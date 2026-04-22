'use client'

import { useState, FormEvent, useEffect, useId } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorId = useId()
  const infoId = useId()

  useEffect(() => {
    // Prefill samo email (nikad lozinku) iz sessionStorage
    const savedEmail = sessionStorage.getItem('prefill_email')
    if (savedEmail) { setEmail(savedEmail); sessionStorage.removeItem('prefill_email') }

    if (searchParams.get('verified') === '1') {
      setInfo('Email je potvrđen! Nalog čeka odobrenje — javiću ti se kad bude aktivan.')
    } else if (searchParams.get('error') === 'invalid-token') {
      setError('Link za verifikaciju nije validan.')
    } else if (searchParams.get('error') === 'token-expired') {
      setError('Link za verifikaciju je istekao. Registrujte se ponovo.')
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
      rememberMe: String(rememberMe),
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
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <ThemeToggleButton />
      </div>

      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Image
            src="/logo-icon.png"
            alt="naSmenu logo"
            width={90}
            height={90}
            sizes="90px"
            style={{ margin: '-16px auto 8px', display: 'block' }}
            priority
          />
          <h1 style={{
            color: 'var(--color-text-primary)', fontSize: '1.6rem',
            fontWeight: 500, margin: 0,
            fontFamily: 'var(--font-heading, system-ui)',
          }}>
            Dobrodošli
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Prijavite se na vaš nalog
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          aria-describedby={error ? errorId : info ? infoId : undefined}
        >
          <div>
            <label htmlFor="login-email" style={labelStyle}>
              Email <span aria-hidden="true" style={{ color: 'var(--color-accent-red)' }}>*</span>
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="primer@gmail.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>
                Lozinka <span aria-hidden="true" style={{ color: 'var(--color-accent-red)' }}>*</span>
              </label>
              <Link href="/forgot-password" style={{ color: '#2DD4A0', fontSize: '0.8rem', textDecoration: 'none' }}>
                Zaboravio si lozinku?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#2DD4A0', cursor: 'pointer' }}
            />
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              Zapamti me (30 dana)
            </span>
          </label>

          {info && (
            <p id={infoId} role="status" aria-live="polite" style={{ color: '#2DD4A0', fontSize: '0.875rem', margin: 0 }}>
              {info}
            </p>
          )}
          {error && (
            <p id={errorId} role="alert" aria-live="assertive" style={{ color: '#EF4444', fontSize: '0.875rem', margin: 0 }}>
              {error}
            </p>
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
            aria-busy={loading}
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

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <Link href="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Privatnost</Link>
          {' · '}
          <Link href="/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Uslovi</Link>
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
