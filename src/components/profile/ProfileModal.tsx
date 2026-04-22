'use client'

import { useState, useEffect } from 'react'
import { X, LogOut, KeyRound, Trash2, Download } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useFeaturesContext } from '@/components/providers/FeaturesProvider'
import type { Features } from '@/components/providers/FeaturesProvider'

interface Props {
  onClose: () => void
}

const FEATURE_LIST: { key: keyof Features; label: string; description: string }[] = [
  { key: 'salaryCalc',    label: 'Obračun plata',        description: 'Stranica za praćenje satnica i zarada' },
  { key: 'printSchedule', label: 'Štampanje rasporeda',  description: 'Dugme za štampanje/PDF' },
  { key: 'holidays',      label: 'Državni praznici',     description: 'Highlight praznika u rasporedu' },
  { key: 'absenceTypes',  label: 'Odsustva',             description: 'Bolovanje, godišnji odmor, kašnjenje' },
  { key: 'employeeNotes', label: 'Napomene zaposlenih',  description: 'Polje za beleške na kartici zaposlenog' },
  { key: 'copyWeek',      label: 'Kopiranje sedmice',    description: 'Dugme za kopiranje rasporeda' },
  { key: 'charts',        label: 'Grafikoni',            description: 'Vizuelni prikaz u statistici' },
]

export function ProfileModal({ onClose }: Props) {
  const { features, updateFeature } = useFeaturesContext()
  const [visible, setVisible] = useState(false)
  const [cafeName, setCafeName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((json) => {
        setCafeName(json.data.cafeName)
        setEmail(json.data.email)
      })
      .finally(() => setLoading(false))
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  async function handleSave() {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cafeName, email }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Greška pri čuvanju.')
      } else {
        setSuccess('Podaci su sačuvani.')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch {
      setError('Greška pri povezivanju sa serverom.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSendReset() {
    if (!email) return
    setError('')
    setSuccess('')
    setSendingReset(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSuccess('Link za promenu lozinke je poslat na vaš email.')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError('Greška pri slanju emaila.')
      }
    } catch {
      setError('Greška pri povezivanju sa serverom.')
    } finally {
      setSendingReset(false)
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) { setDeleteError('Unesite lozinku.'); return }
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })
      const json = await res.json()
      if (!res.ok) {
        setDeleteError(json.error ?? 'Greška pri brisanju naloga.')
        setDeleting(false)
        return
      }
      // Account deleted — sign out and redirect
      await signOut({ callbackUrl: '/login' })
    } catch {
      setDeleteError('Greška pri povezivanju sa serverom.')
      setDeleting(false)
    }
  }

  // Map feature key → API field name
  const FEATURE_API_MAP: Record<keyof Features, string> = {
    salaryCalc:    'featureSalary',
    printSchedule: 'featurePrint',
    holidays:      'featureHolidays',
    absenceTypes:  'featureAbsence',
    employeeNotes: 'featureNotes',
    copyWeek:      'featureCopyWeek',
    charts:        'featureCharts',
  }

  async function toggleFeature(key: keyof Features, value: boolean) {
    updateFeature(key, value)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [FEATURE_API_MAP[key]]: value }),
      })
    } catch {
      updateFeature(key, !value)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className={`flex w-full max-w-[430px] flex-col rounded-b-2xl border-b border-x border-border bg-bg-secondary transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ maxHeight: '88vh' }}
      >

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-6 py-5">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-text-primary">
            Profil
          </h2>
          <button
            onClick={handleClose}
            aria-label="Zatvori"
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X size={22} />
          </button>
        </div>

        {/* Sadržaj */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-green border-t-transparent" />
            </div>
          ) : (
            <div className="flex flex-col gap-5 pb-2">

              {/* Naziv kafića */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">
                  Naziv kafića
                </label>
                <input
                  type="text"
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  className="w-full rounded-card border border-border bg-bg-tertiary px-4 py-3 text-base text-text-primary outline-none transition-colors focus:border-accent-green/50"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-card border border-border bg-bg-tertiary px-4 py-3 text-base text-text-primary outline-none transition-colors focus:border-accent-green/50"
                />
              </div>

              {/* Promena lozinke */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">
                  Lozinka
                </label>
                <button
                  type="button"
                  onClick={handleSendReset}
                  disabled={sendingReset}
                  className="flex items-center gap-2 rounded-card border border-border bg-bg-tertiary px-4 py-3 text-sm text-text-secondary transition-colors hover:border-accent-green/40 hover:text-text-primary disabled:opacity-50"
                >
                  <KeyRound size={16} className="text-accent-green" />
                  {sendingReset ? 'Slanje...' : 'Pošalji link za promenu lozinke'}
                </button>
              </div>

              {error && <p className="text-sm text-accent-red">{error}</p>}
              {success && <p className="text-sm text-accent-green">{success}</p>}

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Funkcionalnosti */}
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-text-secondary mb-2">Funkcionalnosti</p>
                {FEATURE_LIST.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-card border border-border bg-bg-tertiary px-4 py-3"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-sm font-medium text-text-primary">{label}</div>
                      <div className="text-xs text-text-muted mt-0.5">{description}</div>
                    </div>
                    <button
                      role="switch"
                      aria-checked={features[key]}
                      onClick={() => toggleFeature(key, !features[key])}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
                        features[key] ? 'bg-accent-green' : 'bg-bg-secondary border border-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          features[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Export podataka (GDPR) */}
              <div className="flex flex-col gap-2">
                <div className="border-t border-border" />
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide pt-1">Vaši podaci</p>
                <a
                  href="/api/account/export"
                  download
                  className="flex items-center gap-2 rounded-card border border-border bg-bg-tertiary px-4 py-3 text-sm text-text-secondary transition-colors hover:border-accent-green/40 hover:text-text-primary"
                >
                  <Download size={15} className="text-accent-green" />
                  Preuzmi sve moje podatke (JSON)
                </a>
              </div>

              {/* Danger zone */}
              <div className="flex flex-col gap-2">
                <div className="border-t border-border" />
                <p className="text-xs font-medium text-accent-red/70 uppercase tracking-wide pt-1">Opasna zona</p>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => { setShowDeleteConfirm(true); setDeleteError('') }}
                    className="flex items-center gap-2 rounded-card border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm text-accent-red transition-colors hover:bg-accent-red/10"
                  >
                    <Trash2 size={15} />
                    Obriši nalog i sve podatke
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 rounded-card border border-accent-red/40 bg-accent-red/5 p-4">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Ova akcija je <strong className="text-accent-red">nepovratna</strong>. Biće obrisani nalog, svi zaposleni i svi rasporedi. Unesite lozinku za potvrdu.
                    </p>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Vaša lozinka"
                      autoComplete="current-password"
                      className="w-full rounded-card border border-accent-red/30 bg-bg-primary px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-red/60"
                    />
                    {deleteError && <p className="text-xs text-accent-red">{deleteError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError('') }}
                        className="flex-1 rounded-pill border border-border py-2 text-xs text-text-secondary transition-colors hover:bg-bg-tertiary"
                      >
                        Otkaži
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="flex-1 rounded-pill bg-accent-red py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {deleting ? 'Brisanje...' : 'Obriši nalog'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex flex-col gap-3 px-6 py-5 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full rounded-pill bg-accent-green py-3 text-sm font-semibold text-white transition-all hover:bg-accent-green-dark active:scale-[0.97] disabled:opacity-50"
          >
            {saving ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center justify-center gap-2 rounded-pill border border-accent-red/30 py-3 text-sm font-semibold text-accent-red transition-all hover:bg-accent-red/10 active:scale-[0.97]"
          >
            <LogOut size={16} />
            Odjavi se
          </button>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link href="/privacy" onClick={handleClose} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              Privatnost
            </Link>
            <span className="text-xs text-border">·</span>
            <Link href="/terms" onClick={handleClose} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              Uslovi
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
