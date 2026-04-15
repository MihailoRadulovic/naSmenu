import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'SmenaApp <onboarding@resend.dev>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="sr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#ECEEF2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ECEEF2;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:28px;">
          <div style="display:inline-block;background:#0D9E72;border-radius:18px;width:68px;height:68px;text-align:center;line-height:68px;">
            <span style="color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-1px;">nS</span>
          </div>
          <p style="margin:10px 0 0;font-size:0.78rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9CA3AF;">naSmenu</p>
        </td></tr>

        <!-- Card -->
        <tr><td align="center" style="background:#ffffff;border-radius:20px;border:1px solid #DDE1E7;padding:44px 40px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:20px;">
          <p style="margin:0;font-size:0.72rem;color:#B0B7C3;letter-spacing:0.3px;">
            © ${new Date().getFullYear()} naSmenu &nbsp;·&nbsp; Aplikacija za raspoređivanje smena
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`

  console.log(`\n[EMAIL] Aktivacioni link za ${to}:\n${url}\n`)

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Verifikuj email — naSmenu',
    html: emailWrapper(`
      <h1 style="margin:0 0 10px;font-size:2rem;font-weight:900;color:#111827;letter-spacing:-0.5px;text-align:center;">
        Verifikuj email
      </h1>
      <p style="margin:0 0 6px;font-size:0.8rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0D9E72;text-align:center;">
        Aktivacija naloga
      </p>
      <div style="width:40px;height:3px;background:#0D9E72;border-radius:999px;margin:16px auto 28px;"></div>
      <p style="margin:0 0 32px;font-size:0.95rem;color:#6B7280;line-height:1.7;text-align:center;">
        Hvala što si se registrovao na <strong style="color:#111827;">naSmenu</strong>.<br>
        Klikni na dugme ispod da aktiviraš nalog.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px;">
        <a href="${url}" style="display:inline-block;padding:15px 40px;background:#0D9E72;color:#ffffff;font-weight:700;font-size:0.95rem;border-radius:999px;text-decoration:none;letter-spacing:0.3px;">
          Aktiviraj nalog
        </a>
      </td></tr></table>
      <p style="margin:0;font-size:0.78rem;color:#B0B7C3;line-height:1.6;text-align:center;">
        Link važi 24 sata.<br>
        Ako nisi kreirao nalog, ignoriši ovaj email.
      </p>
    `),
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
    subject: 'Resetovanje lozinke — naSmenu',
    html: emailWrapper(`
      <h1 style="margin:0 0 10px;font-size:2rem;font-weight:900;color:#111827;letter-spacing:-0.5px;text-align:center;">
        Resetuj lozinku
      </h1>
      <p style="margin:0 0 6px;font-size:0.8rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0D9E72;text-align:center;">
        Zahtev za reset
      </p>
      <div style="width:40px;height:3px;background:#0D9E72;border-radius:999px;margin:16px auto 28px;"></div>
      <p style="margin:0 0 32px;font-size:0.95rem;color:#6B7280;line-height:1.7;text-align:center;">
        Primili smo zahtev za resetovanje lozinke<br>za tvoj <strong style="color:#111827;">naSmenu</strong> nalog.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px;">
        <a href="${url}" style="display:inline-block;padding:15px 40px;background:#0D9E72;color:#ffffff;font-weight:700;font-size:0.95rem;border-radius:999px;text-decoration:none;letter-spacing:0.3px;">
          Resetuj lozinku
        </a>
      </td></tr></table>
      <p style="margin:0;font-size:0.78rem;color:#B0B7C3;line-height:1.6;text-align:center;">
        Link važi 1 sat.<br>
        Ako nisi tražio reset, ignoriši ovaj email.
      </p>
    `),
  })

  if (result.error) {
    throw new Error(`Resend greška (reset): ${result.error.message}`)
  }
}
