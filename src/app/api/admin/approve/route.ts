import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendUserApprovedEmail } from '@/lib/email'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { approvalToken: token } })

  if (!user) {
    return new NextResponse('Nevažeći ili iskorišćeni token.', { status: 400 })
  }

  if (user.isApproved) {
    // Poništi token i pri već odobrenim
    await prisma.user.update({ where: { id: user.id }, data: { approvalToken: null } })
    return new NextResponse(successHtml(user.cafeName, true), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isApproved: true, approvalToken: null },
  })

  try {
    await sendUserApprovedEmail(user.email, user.cafeName)
  } catch (err) {
    console.error('[admin/approve] Mejl korisniku nije poslat:', err)
  }

  return new NextResponse(successHtml(user.cafeName, false), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function successHtml(cafeName: string, alreadyApproved: boolean) {
  const safeName = escapeHtml(cafeName)
  const message = alreadyApproved
    ? `Nalog za <strong>${safeName}</strong> je već bio odobren.`
    : `Nalog za <strong>${safeName}</strong> je uspešno odobren. Korisnik je obavešten putem emaila.`

  return `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>naSmenu — Odobrenje naloga</title>
  <style>
    body { margin: 0; background: #0D0D0D; font-family: system-ui, sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #1A1A1A; border: 1px solid #2D2D2D; border-radius: 20px;
            padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; }
    .icon { width: 64px; height: 64px; background: rgba(45,212,160,0.12);
            border: 1.5px solid rgba(45,212,160,0.3); border-radius: 18px;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px; font-size: 28px; }
    h1 { color: #fff; font-size: 1.5rem; margin: 0 0 12px; }
    p { color: #9CA3AF; font-size: 0.95rem; line-height: 1.6; margin: 0; }
    strong { color: #2DD4A0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>${alreadyApproved ? 'Već odobreno' : 'Nalog odobren!'}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`
}
