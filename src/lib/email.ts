import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'naSmenu <onboarding@resend.dev>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

// Retry wrapper — do 2 pokušaja sa 1s pauzom
async function sendWithRetry(
  fn: () => Promise<{ error: { message: string } | null }>,
  label: string,
  retries = 2
): Promise<void> {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const result = await fn()
    if (!result.error) return
    if (attempt <= retries) {
      await new Promise(r => setTimeout(r, 1000 * attempt))
    } else {
      throw new Error(`Resend greška (${label}): ${result.error.message}`)
    }
  }
}

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

  if (process.env.NODE_ENV === 'development') {
    console.log(`\n[EMAIL DEV] Aktivacioni link za ${to}:\n${url}\n`)
  }

  await sendWithRetry(
    () => resend.emails.send({
      from: FROM,
      to,
      subject: 'Verifikuj email — naSmenu',
      text: `Verifikuj email\n\nHvala što si se registrovao na naSmenu.\nKlikni na link da aktiviraš nalog:\n${url}\n\nLink važi 24 sata.\nAko nisi kreirao nalog, ignoriši ovaj email.`,
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
    }),
    'verifikacija'
  )
}

export async function sendAdminApprovalEmail(userId: number, cafeName: string, userEmail: string, approvalToken: string) {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'mihailoradulovic711@gmail.com'
  const approveUrl = `${BASE_URL}/api/admin/approve?token=${approvalToken}`

  await sendWithRetry(
    () => resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject: `Novi korisnik čeka odobrenje — ${cafeName}`,
      text: `Novi korisnik\n\nKorisnik "${cafeName}" (${userEmail}) se registrovao i čeka odobrenje.\n\nOdobri nalog:\n${approveUrl}`,
      html: emailWrapper(`
        <h1 style="margin:0 0 10px;font-size:2rem;font-weight:900;color:#111827;letter-spacing:-0.5px;text-align:center;">
          Novi korisnik
        </h1>
        <p style="margin:0 0 6px;font-size:0.8rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0D9E72;text-align:center;">
          Zahtev za registraciju
        </p>
        <div style="width:40px;height:3px;background:#0D9E72;border-radius:999px;margin:16px auto 28px;"></div>
        <p style="margin:0 0 8px;font-size:0.95rem;color:#6B7280;line-height:1.7;text-align:center;">
          Korisnik <strong style="color:#111827;">${cafeName}</strong> se registrovao i čeka tvoje odobrenje.
        </p>
        <p style="margin:0 0 32px;font-size:0.85rem;color:#9CA3AF;text-align:center;">${userEmail}</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px;">
          <a href="${approveUrl}" style="display:inline-block;padding:15px 40px;background:#0D9E72;color:#ffffff;font-weight:700;font-size:0.95rem;border-radius:999px;text-decoration:none;letter-spacing:0.3px;">
            Odobri nalog
          </a>
        </td></tr></table>
        <p style="margin:0;font-size:0.78rem;color:#B0B7C3;line-height:1.6;text-align:center;">
          Klikni dugme da odobriš pristup korisniku.
        </p>
      `),
    }),
    'admin approval'
  )
}

export async function sendUserApprovedEmail(to: string, cafeName: string) {
  await sendWithRetry(
    () => resend.emails.send({
      from: FROM,
      to,
      subject: 'Nalog odobren — naSmenu',
      text: `Nalog odobren!\n\nTvoj nalog za "${cafeName}" je odobren.\nPrijavi se na: ${BASE_URL}/login`,
      html: emailWrapper(`
        <h1 style="margin:0 0 10px;font-size:2rem;font-weight:900;color:#111827;letter-spacing:-0.5px;text-align:center;">
          Nalog odobren!
        </h1>
        <p style="margin:0 0 6px;font-size:0.8rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0D9E72;text-align:center;">
          Dobrodošli
        </p>
        <div style="width:40px;height:3px;background:#0D9E72;border-radius:999px;margin:16px auto 28px;"></div>
        <p style="margin:0 0 32px;font-size:0.95rem;color:#6B7280;line-height:1.7;text-align:center;">
          Tvoj nalog za <strong style="color:#111827;">${cafeName}</strong> je odobren.<br>
          Sada se možeš prijaviti na naSmenu.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px;">
          <a href="${BASE_URL}/login" style="display:inline-block;padding:15px 40px;background:#0D9E72;color:#ffffff;font-weight:700;font-size:0.95rem;border-radius:999px;text-decoration:none;letter-spacing:0.3px;">
            Prijavi se
          </a>
        </td></tr></table>
      `),
    }),
    'user approved'
  )
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${BASE_URL}/reset-password?token=${token}`

  if (process.env.NODE_ENV === 'development') {
    console.log(`\n[EMAIL DEV] Reset link za ${to}:\n${url}\n`)
  }

  await sendWithRetry(
    () => resend.emails.send({
      from: FROM,
      to,
      subject: 'Resetovanje lozinke — naSmenu',
      text: `Resetuj lozinku\n\nPrimili smo zahtev za resetovanje lozinke za tvoj naSmenu nalog.\n\nLink za reset:\n${url}\n\nLink važi 1 sat.\nAko nisi tražio reset, ignoriši ovaj email.`,
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
    }),
    'reset lozinke'
  )
}
