import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'SmenaApp <onboarding@resend.dev>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${BASE_URL}/verify-email?token=${token}`

  console.log(`\n[EMAIL] Aktivacioni link za ${to}:\n${url}\n`)

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Aktivacija SmenaApp naloga',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:1.4rem">Aktivacija naloga 📋</h2>
        <p style="color:#555;margin:0 0 24px">Kliknite na dugme ispod da aktivirate vaš SmenaApp nalog.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#2DD4A0;color:#0a0a0a;font-weight:700;border-radius:999px;text-decoration:none">
          Aktiviraj nalog
        </a>
        <p style="color:#999;font-size:0.8rem;margin-top:24px">Link važi 24 sata. Ako niste kreirali nalog, ignorišite ovaj email.</p>
      </div>
    `,
  })

  if (result.error) {
    console.warn('[email] Resend greška:', result.error)
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${BASE_URL}/reset-password?token=${token}`

  console.log(`\n[EMAIL] Reset link za ${to}:\n${url}\n`)

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Resetovanje lozinke — SmenaApp',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:1.4rem">Resetovanje lozinke 🔑</h2>
        <p style="color:#555;margin:0 0 24px">Primili smo zahtev za resetovanje lozinke za vaš SmenaApp nalog.</p>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#2DD4A0;color:#0a0a0a;font-weight:700;border-radius:999px;text-decoration:none">
          Resetuj lozinku
        </a>
        <p style="color:#999;font-size:0.8rem;margin-top:24px">Link važi 1 sat. Ako niste tražili reset, ignorišite ovaj email.</p>
      </div>
    `,
  })

  if (result.error) {
    console.warn('[email] Resend greška, link za reset:', url)
  }
}
