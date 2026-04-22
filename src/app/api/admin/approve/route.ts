import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendUserApprovedEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = parseInt(searchParams.get('userId') ?? '')
  const secret = searchParams.get('secret')

  if (!secret || !process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (isNaN(userId)) {
    return new NextResponse('Invalid userId', { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    return new NextResponse('Korisnik nije pronađen.', { status: 404 })
  }

  if (user.isApproved) {
    return new NextResponse(successHtml(user.cafeName, true), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  await prisma.user.update({ where: { id: userId }, data: { isApproved: true } })

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
  const message = alreadyApproved
    ? `Nalog za <strong>${cafeName}</strong> je već bio odobren.`
    : `Nalog za <strong>${cafeName}</strong> je uspešno odobren. Korisnik je obavešten putem emaila.`

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
