# naSmenu

  Multi-tenant SaaS shift scheduling PWA for café operators.

  **Live:** [app.nasmenu.rs](https://app.nasmenu.rs) · [nasmenu.rs](https://www.nasmenu.rs)

  ---

  ## What it does

  Café owners spend time every week building shift schedules manually
  on paper, in WhatsApp messages, or in improvised spreadsheets.
  naSmenu is a purpose-built tool for that workflow: assign employees
  to shifts across a seven-day week, track hours, calculate salary
  estimates, and send the schedule to the team.

  Live in production with a real paying customer.

  ---

  ## Technical decisions

  **Serverless-compatible Prisma with Neon**
  Uses `@prisma/adapter-neon` in HTTP mode. Each query runs as an
  HTTP request rather than a persistent TCP connection, which is the
  correct approach for serverless Next.js on Vercel.

  **Canvas API schedule rendering**
  The weekly schedule renders onto an HTML Canvas at 2x pixel ratio,
  then converts to a PNG Blob passed to the Web Share API. Café owners
  send the schedule to staff directly via WhatsApp. Falls back to
  download on browsers without file sharing support.

  **Email-gated registration rollback**
  If the verification email cannot be sent after account creation,
  the account is deleted before returning an error. An account that
  cannot receive its verification email is permanently locked out —
  deleting it lets the user retry cleanly.

  **Offline-first schedule editor**
  Three-condition fallback chain on load failure: cached version
  available, device offline with no cache, or device online but
  request failed. Café owners can view their schedule on the floor
  without connectivity.

  **Feature flags**
  Seven features toggleable per account: salary calculation, schedule
  printing, holiday highlights, absence types, employee notes,
  copy-previous-week, and charts.

  ---

  ## Stack

  - **Framework:** Next.js 16 (App Router)
  - **Database:** Neon PostgreSQL via Prisma 7 (HTTP adapter)
  - **Auth:** NextAuth.js
  - **Cache:** Upstash Redis
  - **Email:** Resend
  - **Charts:** Recharts
  - **Styling:** Tailwind CSS v4
  - **Deployment:** Vercel

  ---

  ## Features

  - Weekly schedule builder with 7 shift types including half-shifts
    and custom middle shift times
  - Copy previous week with one tap
  - Serbian public holidays, religious holidays, and slava dates
    (2025-2027)
  - Statistics: weekly by month, monthly hours chart, custom date
    range with employee filter, per-employee breakdown
  - Salary calculation per employee
  - Schedule sharing as PNG image via Web Share API
  - Print-optimized schedule layout
  - Employee management with active/inactive status, notes, hourly rate
  - Registration with email verification and password reset
  - GDPR data export as downloadable JSON
  - PWA: installable, offline page, service worker
  - Dark mode
