import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'SmenaApp <onboarding@resend.dev>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`

  console.log(`\n[EMAIL] Aktivacioni link za ${to}:\n${url}\n`)

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Verifikuj email — naSmenu',
    html: `
      <!DOCTYPE html>
      <html lang="sr">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background-color:#F0F2F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F5;padding:48px 16px;">
          <tr><td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

              <!-- Logo placeholder -->
              <tr><td align="center" style="padding-bottom:32px;">
                <div style="width:72px;height:72px;border-radius:20px;background:#0D9E72;display:inline-flex;align-items:center;justify-content:center;">
                  <span style="color:#ffffff;font-size:1.6rem;font-weight:800;letter-spacing:-1px;line-height:1;">nS</span>
                </div>
              </td></tr>

              <!-- Card -->
              <tr><td style="background:#ffffff;border-radius:20px;border:1px solid #E5E7EB;padding:40px 36px;text-align:center;">

                <h1 style="margin:0 0 12px;font-size:1.75rem;font-weight:800;color:#111827;letter-spacing:-0.5px;line-height:1.2;">
                  Verifikuj email
                </h1>

                <p style="margin:0 0 32px;font-size:1rem;color:#6B7280;line-height:1.6;">
                  Hvala što si se registrovao na <strong style="color:#111827;">naSmenu</strong>.<br>
                  Klikni na dugme ispod da aktiviraš nalog.
                </p>

                <a href="${url}"
                   style="display:inline-block;padding:14px 36px;background:#0D9E72;color:#ffffff;font-weight:700;font-size:1rem;border-radius:999px;text-decoration:none;letter-spacing:0.2px;">
                  Aktiviraj nalog
                </a>

                <p style="margin:32px 0 0;font-size:0.8rem;color:#9CA3AF;line-height:1.5;">
                  Link važi 24 sata.<br>
                  Ako nisi kreirao nalog, možeš ignorisati ovaj email.
                </p>

              </td></tr>

              <!-- Footer -->
              <tr><td align="center" style="padding-top:24px;">
                <p style="margin:0;font-size:0.78rem;color:#9CA3AF;">
                  © ${new Date().getFullYear()} naSmenu · Aplikacija za raspoređivanje smena
                </p>
              </td></tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })

  if (result.error) {
    throw new Error(`Resend greška (verifikacija): ${result.error.message}`)
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
    throw new Error(`Resend greška (reset): ${result.error.message}`)
  }
}
