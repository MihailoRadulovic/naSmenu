'use client'

import { Share2 } from 'lucide-react'
import type { WeekWithEntries } from '@/types'
import { DAY_NAMES_SHORT } from '@/types'
import { formatDateShort, formatDate } from '@/lib/dates'
import { minutesToTime } from '@/lib/shiftHours'

interface WhatsAppShareProps {
  weekData: WeekWithEntries
}


const C = {
  bg:        '#0D0D0D',
  card:      '#1A1A1A',
  green:     '#2DD4A0',
  greenDim:  '#0F3028',
  yellow:    '#F5C842',
  yellowDim: '#3A2E08',
  amber:     '#F59E0B',
  amberDim:  '#3D2600',
  white:     '#FFFFFF',
  gray:      '#9CA3AF',
  muted:     '#6B7280',
  border:    '#2D2D2D',
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
  ctx.fill()
}

type Entry = WeekWithEntries['entries'][0]

function getCellShifts(entries: Entry[], empId: number, day: number) {
  return entries.filter((e) => e.employeeId === empId && e.day === day)
}

async function generateImage(weekData: WeekWithEntries): Promise<Blob> {
  const start = new Date(weekData.startDate)
  const end   = new Date(weekData.endDate)

  const SCALE = 2
  const W     = 1120
  const PAD   = 28
  const INNER = W - PAD * 2   // 1064
  const R     = 14

  // Collect employees sorted alphabetically
  const empMap = new Map<number, string>()
  for (const e of weekData.entries) {
    if (!empMap.has(e.employeeId)) empMap.set(e.employeeId, e.employee.name)
  }
  const employees = Array.from(empMap.entries()).sort((a, b) => a[1].localeCompare(b[1]))

  const COL_NAME  = 200
  const COL_DAY_W = (INNER - COL_NAME) / 7   // ~123.4

  const HEADER_H    = 104
  const COL_HDR_H   = 54
  const ROW_H       = 54
  const CARD_PAD_V  = 12

  const totalRowH = employees.length * ROW_H
  const TOTAL_H   = PAD + HEADER_H + CARD_PAD_V + COL_HDR_H + totalRowH + CARD_PAD_V + PAD

  const canvas  = document.createElement('canvas')
  canvas.width  = W * SCALE
  canvas.height = TOTAL_H * SCALE
  const ctx     = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  // ── Background ──
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, TOTAL_H)

  // ── HEADER card ──
  const hx = PAD, hy = PAD, hw = INNER, hh = HEADER_H
  ctx.fillStyle = C.card
  roundRect(ctx, hx, hy, hw, hh, R)

  // Green top accent bar
  ctx.fillStyle = C.green
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(hx + R, hy)
  ctx.lineTo(hx + hw - R, hy)
  ctx.arcTo(hx + hw, hy, hx + hw, hy + R, R)
  ctx.lineTo(hx + hw, hy + 6)
  ctx.lineTo(hx, hy + 6)
  ctx.arcTo(hx, hy, hx + R, hy, R)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.fillStyle = C.white
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText('RASPORED SMENA', W / 2, hy + 52)
  ctx.fillStyle = C.gray
  ctx.font = '15px system-ui, sans-serif'
  ctx.fillText(`${formatDateShort(start)} – ${formatDate(end)}`, W / 2, hy + 80)

  // ── TABLE card ──
  const cardX = PAD
  const cardY = hy + hh + CARD_PAD_V
  const cardW = INNER
  const cardH = COL_HDR_H + totalRowH + CARD_PAD_V

  ctx.fillStyle = C.card
  roundRect(ctx, cardX, cardY, cardW, cardH, R)

  // ── COLUMN HEADER ROW ──
  const chY = cardY

  // "ZAPOSLENI" label
  ctx.fillStyle = C.muted
  ctx.font = 'bold 10px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('ZAPOSLENI', cardX + 16, chY + COL_HDR_H / 2 + 4)

  // Separator after name column
  ctx.fillStyle = C.border
  ctx.fillRect(cardX + COL_NAME, chY + 6, 1, COL_HDR_H - 6)

  for (let d = 0; d < 7; d++) {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + d)
    const colX    = cardX + COL_NAME + d * COL_DAY_W
    const centerX = colX + COL_DAY_W / 2

    // Separator between day columns
    if (d > 0) {
      ctx.fillStyle = C.border
      ctx.fillRect(colX, chY + 6, 1, COL_HDR_H - 6)
    }

    ctx.textAlign = 'center'
    ctx.fillStyle = C.white
    ctx.font = 'bold 14px system-ui, sans-serif'
    ctx.fillText(DAY_NAMES_SHORT[d], centerX, chY + COL_HDR_H / 2 - 3)
    ctx.fillStyle = C.muted
    ctx.font = '10px system-ui, sans-serif'
    ctx.fillText(formatDateShort(date), centerX, chY + COL_HDR_H / 2 + 13)
  }

  // ── EMPLOYEE ROWS ──
  let rowY = cardY + COL_HDR_H

  for (let ri = 0; ri < employees.length; ri++) {
    const [empId, name] = employees[ri]
    const midY = rowY + ROW_H / 2

    // Alternating stripe
    if (ri % 2 === 1) {
      ctx.fillStyle = '#ffffff06'
      ctx.fillRect(cardX, rowY, cardW, ROW_H)
    }

    // Row separator
    ctx.fillStyle = C.border
    ctx.fillRect(cardX + 16, rowY, cardW - 32, 1)

    // Employee name (truncate if needed)
    ctx.font = '13px system-ui, sans-serif'
    const maxW = COL_NAME - 28
    let displayName = name
    while (ctx.measureText(displayName).width > maxW && displayName.length > 1) {
      displayName = displayName.slice(0, -1)
    }
    if (displayName !== name) displayName = displayName.slice(0, -1) + '…'
    ctx.fillStyle = C.white
    ctx.textAlign = 'left'
    ctx.fillText(displayName, cardX + 16, midY + 5)

    // Separator after name column
    ctx.fillStyle = C.border
    ctx.fillRect(cardX + COL_NAME, rowY, 1, ROW_H)

    // ── DAY CELLS ──
    for (let d = 0; d < 7; d++) {
      const colX    = cardX + COL_NAME + d * COL_DAY_W
      const centerX = colX + COL_DAY_W / 2

      if (d > 0) {
        ctx.fillStyle = C.border
        ctx.fillRect(colX, rowY + 4, 1, ROW_H - 8)
      }

      const shifts   = getCellShifts(weekData.entries, empId, d)
      const first    = shifts.find((e) => e.shiftType === 'first')
      const second   = shifts.find((e) => e.shiftType === 'second')
      const middle   = shifts.find((e) => e.shiftType === 'middle')
      const absence  = shifts.find((e) => ['sick_leave', 'vacation', 'late'].includes(e.shiftType))

      const pillW = COL_DAY_W - 20
      const pillH = 24
      const pillX = colX + 10

      if (first || second) {
        const isFirst = !!first
        const entry   = (first ?? second)!
        ctx.fillStyle = isFirst ? C.greenDim : C.yellowDim
        roundRect(ctx, pillX, midY - pillH / 2, pillW, pillH, 6)
        ctx.fillStyle = isFirst ? C.green : C.yellow
        ctx.font = 'bold 12px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(
          isFirst
            ? (entry.halfShift ? 'Prva ½' : 'Prva')
            : (entry.halfShift ? 'Druga ½' : 'Druga'),
          centerX,
          midY + 5,
        )
        // If also has middle, show time in small text below pill
        if (middle && middle.middleStart != null && middle.middleEnd != null) {
          ctx.fillStyle = C.amber
          ctx.font = '9px system-ui, sans-serif'
          ctx.fillText(
            `+ ${minutesToTime(middle.middleStart)}–${minutesToTime(middle.middleEnd)}`,
            centerX,
            midY + pillH / 2 + 11,
          )
        }
      } else if (middle) {
        const hasTime = middle.middleStart != null && middle.middleEnd != null
        const mPillH  = hasTime ? 36 : pillH
        ctx.fillStyle = C.amberDim
        roundRect(ctx, pillX, midY - mPillH / 2, pillW, mPillH, 6)
        ctx.fillStyle = C.amber
        ctx.font = 'bold 11px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Međ.', centerX, midY - (hasTime ? 5 : -5))
        if (hasTime) {
          ctx.font = '10px system-ui, sans-serif'
          ctx.fillText(
            `${minutesToTime(middle.middleStart!)}–${minutesToTime(middle.middleEnd!)}`,
            centerX,
            midY + 11,
          )
        }
      } else if (absence) {
        ctx.fillStyle = C.muted
        ctx.font = '11px system-ui, sans-serif'
        ctx.textAlign = 'center'
        const label = absence.shiftType === 'sick_leave' ? 'Bol.'
                    : absence.shiftType === 'vacation'   ? 'God.'
                    : 'Kas.'
        ctx.fillText(label, centerX, midY + 5)
      } else {
        ctx.fillStyle = C.border
        ctx.font = '18px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('—', centerX, midY + 7)
      }
    }

    rowY += ROW_H
  }

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
}

export function WhatsAppShare({ weekData }: WhatsAppShareProps) {
  async function handleShare() {
    const blob = await generateImage(weekData)
    const file = new File([blob], 'raspored.png', { type: 'image/png' })

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Raspored smena' })
        return
      } catch {
        // fallback
      }
    }

    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href     = url
    a.download = 'raspored.png'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleShare}
      className="flex w-full items-center justify-center gap-2 rounded-pill bg-accent-green-dark px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97] shadow-sm"
    >
      <Share2 size={18} />
      Pošalji u WhatsApp
    </button>
  )
}
