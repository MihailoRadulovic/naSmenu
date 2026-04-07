'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { TimeSelect } from './TimeSelect'
import type { ShiftSettings } from '@/lib/shiftSettings'
import { saveShiftSettingsToApi } from '@/lib/shiftSettings'

interface Props {
  current: ShiftSettings
  onClose: () => void
  onSave: (s: ShiftSettings) => void
}

export function ShiftSettingsModal({ current, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<ShiftSettings>({ ...current })
  const [visible, setVisible] = useState(false)

  // Trigger slide-down odmah nakon mount-a
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  function set(key: keyof ShiftSettings, val: string) {
    setDraft((prev) => ({ ...prev, [key]: val }))
  }

  function handleSave() {
    saveShiftSettingsToApi(draft)
    onSave(draft)
    handleClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      {/* Panel — klizi odozgo */}
      <div
        className={`flex w-full max-w-[430px] flex-col rounded-b-2xl border-b border-x border-border bg-bg-secondary transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ maxHeight: '78vh' }}
      >

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-6 py-5">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-text-primary">
            Vreme smena
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X size={22} />
          </button>
        </div>

        {/* Sadržaj — scrollable, dropdown izlazi van (portal) */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          <div className="flex flex-col gap-6 pb-2">

            {/* Prva smena */}
            <div className="rounded-card border border-accent-green/25 bg-accent-green/5 p-5">
              <p className="mb-4 flex items-center gap-2 text-base font-semibold text-accent-green">
                <span className="text-xl">🌅</span> Prva smena
              </p>
              <div className="flex items-end gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-text-secondary">Početak</span>
                  <TimeSelect large value={draft.firstStart} onChange={(v) => set('firstStart', v)} />
                </div>
                <span className="pb-3 text-xl text-text-muted">–</span>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-text-secondary">Kraj</span>
                  <TimeSelect
                    large
                    value={draft.firstEnd}
                    minHour={draft.firstStart ? parseInt(draft.firstStart.split(':')[0]) + 1 : undefined}
                    onChange={(v) => set('firstEnd', v)}
                  />
                </div>
              </div>
            </div>

            {/* Druga smena */}
            <div className="rounded-card border border-accent-blue/25 bg-accent-blue/5 p-5">
              <p className="mb-4 flex items-center gap-2 text-base font-semibold text-accent-blue">
                <span className="text-xl">🌆</span> Druga smena
              </p>
              <div className="flex items-end gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-text-secondary">Početak</span>
                  <TimeSelect large value={draft.secondStart} onChange={(v) => set('secondStart', v)} />
                </div>
                <span className="pb-3 text-xl text-text-muted">–</span>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-text-secondary">Kraj</span>
                  <TimeSelect
                    large
                    value={draft.secondEnd}
                    minHour={draft.secondStart ? parseInt(draft.secondStart.split(':')[0]) + 1 : undefined}
                    onChange={(v) => set('secondEnd', v)}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-5">
          <button
            onClick={handleSave}
            className="w-full rounded-pill bg-accent-green py-3 text-sm font-semibold text-white transition-all hover:bg-accent-green-dark active:scale-[0.97]"
          >
            Sačuvaj
          </button>
        </div>

      </div>
    </div>
  )
}
