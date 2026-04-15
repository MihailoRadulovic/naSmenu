# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekat

PWA za vlasnike kafića — raspoređivanje 6-10 zaposlenih po smenama (prva, druga, srednja, slobodan dan) za svaki dan u nedelji (pon–ned). Aplikacija podržava više korisnika (svaki vlasnik ima sopstvene zaposlene i rasporede).

**Jezik interfejsa:** Srpski (latinica). Format datuma: DD.MM.YYYY. Nedelja počinje u PONEDELJAK (ISO week).

---

## Komande

```bash
npm run dev        # Pokretanje dev servera (Turbopack)
npm run build      # prisma db push + next build
npm run lint       # ESLint
```

**Prisma:**
```bash
npx prisma db push           # Sinhronizuj schema → bazu (bez migracija)
npx prisma migrate dev       # Generiši i primeni migraciju
npx prisma generate          # Regeneriši klijent (src/generated/prisma/)
npx prisma studio            # GUI za bazu
npx prisma db seed           # Popuni test podatke (prisma/seed.ts)
```

**Env varijable** (`.env.local`):
- `DATABASE_URL` — Neon PostgreSQL connection string (obavezno)
- `NEXTAUTH_SECRET` — tajni ključ za JWT (obavezno)
- `NEXTAUTH_URL` — base URL aplikacije
- Email varijable za verifikaciju/reset lozinke (via `src/lib/email.ts`)

---

## Arhitektura

### Stack
- **Next.js 16** App Router, React 19, TypeScript, Tailwind CSS v4
- **Prisma 7** sa `@prisma/adapter-neon` (HTTP mode, serverless-compatible)
- **Neon PostgreSQL** (produkcija) — bez lokalnog fallback-a u runtime-u
- **NextAuth.js** — autentikacija (Credentials provider, JWT sesija, email verifikacija)
- **PWA:** `@ducanh2912/next-pwa` (service worker onemogućen u dev modu)
- **Grafikoni:** Recharts
- **Ikonice:** Lucide React

### Autentikacija i multi-tenancy

Aplikacija koristi **NextAuth.js** sa email/password prijavom:
- Korisnik se registruje → dobija verifikacioni email → tek nakon verifikacije može da se prijavi
- Sesija je JWT, traje 30 dana; `session.user.id` je `userId` u bazi
- **Svi podaci su scopovani po `userId`** — `Employee`, `Week`, `Settings` imaju `userId` FK; svaki API route proverava sesiju i filtrira po `userId`
- Helper: `getServerSession()` iz `src/lib/auth.ts` (wrapper oko NextAuth `getServerSession`)

Auth stranice: `/login`, `/register`, `/forgot-password`, `/reset-password`

### Prisma klijent

Klijent se generiše u `src/generated/prisma/` (ne u `node_modules`). Uvek importuj iz `@/generated/prisma/client` ili preko `@/lib/prisma` (singleton).

### Tipovi (`src/types/index.ts`)

Svi Prisma tipovi se re-eksportuju odavde. Ključni custom tipovi:
- `ShiftType` — `'first' | 'second' | 'middle' | 'off' | 'sick_leave' | 'vacation' | 'late'`
- `WeekWithEntries` — `Week` + `entries` sa `employee` relacijom
- `DaySchedule` / `WeekSchedule` — mapa `employeeId → DayAssignment[]`
- `EmployeeStats` / `WeekStats` — odgovori statistika API-ja

### Struktura stranica

```
src/app/
  page.tsx                       # Raspored (home) — WeekView
  novi/page.tsx                  # Kreiranje/izmena rasporeda — ScheduleEditor
  statistika/page.tsx            # Statistika — tabs: sedmični/mesečni/custom
  statistika/zaposleni/[id]/     # Statistika po zaposlenom
  zaposleni/page.tsx             # CRUD zaposlenih
  salary/page.tsx                # Obračun plata
  login/page.tsx                 # Prijava
  register/page.tsx              # Registracija
  forgot-password/page.tsx       # Zaboravljena lozinka
  reset-password/page.tsx        # Reset lozinke (token iz emaila)
  api/
    auth/[...nextauth]/          # NextAuth handler
    auth/verify-email/           # Verifikacija emaila (token iz URL-a)
    auth/forgot-password/        # Slanje reset emaila
    auth/reset-password/         # Primena novog passworda
    register/                    # POST — kreiranje naloga
    profile/                     # GET/PUT — ime kafića, lozinka
    employees/                   # GET (samo aktivni), POST, PUT/PATCH [id]
    weeks/                       # GET lista, GET current, GET/PUT [id], GET by-date
    stats/weekly/                # ?month=&year=
    stats/monthly/               # ?month=&year=
    stats/custom/                # ?from=&to=&employeeId=
    stats/employee/[id]/         # Statistika po zaposlenom
    settings/                    # GET/PUT — shift vremena + feature flags
    salary/                      # Obračun plata
```

### Komponente po domenima

- `src/components/schedule/` — `WeekView`, `ScheduleEditor`, `DayCard`, `DayTabs`, `EmployeeChip`, `ShiftBadge`, `WeekPicker`, `WhatsAppShare`, `ShiftSettingsModal`
- `src/components/statistics/` — `WeeklyView`, `MonthlyView`, `CustomRangeView`, `WeekAccordion`, `EmployeeStatRow`, `EmployeeDailyView`, `MonthlyHoursChart`, `WeeklyTrendChart`
- `src/components/employees/` — `EmployeeCard`, `EmployeeList`, `EmployeeModal`, `EmployeeStatusBadge`
- `src/components/ui/` — `Button`, `Input`, `Modal`, `Avatar`, `Spinner`, `ErrorCard`, `PageHeader`
- `src/components/layout/` — `BottomNav`, `ThemeToggleButton`
- `src/components/providers/` — `NextAuthProvider`, `FeaturesProvider`
- `src/components/` — `PinGate`, `PinScreen`, `ThemeProvider`, `PrintButton`

### Konteksti i provajderi

- `ToastContext` — globalni toast sistem, omotava sve u `layout.tsx`
- `ThemeProvider` — dark/light tema
- `FeaturesProvider` (`src/components/providers/FeaturesProvider.tsx`) — učitava feature flags iz `Settings` modela u bazi (per-user); hook: `useFeatures()` za čitanje, `useFeaturesContext()` za ažuriranje. Feature flags: `salaryCalc`, `printSchedule`, `holidays`, `absenceTypes`, `employeeNotes`, `copyWeek`, `charts`
- `NextAuthProvider` — omotava NextAuth `SessionProvider`

### Pomoćne biblioteke (`src/lib/`)

- `auth.ts` — NextAuth config + `getServerSession()` helper
- `dates.ts` — **UVEK koristi UTC metode** za izračunavanje nedelja. `getWeekBounds(date)`, `addWeeks()`, `formatDate()`, `toISODateString()`
- `shiftHours.ts` — `getShiftHours(entry, settings)` — hours po smeni (default 8h, middle smena iz `middleStart`/`middleEnd` u minutima od ponoći)
- `shiftSettings.ts` — čitanje `Settings` modela (vremena smena)
- `statsUtils.ts` — logika za agregatne statistike
- `holidays.ts` — državni praznici (za highlight)
- `email.ts` — slanje emaila (verifikacija, reset lozinke)
- `features.ts` — re-eksport iz `FeaturesProvider`

---

## Model podataka (stvarno stanje u bazi)

```prisma
model User {
  id                Int       @id @default(autoincrement())
  email             String    @unique
  cafeName          String
  passwordHash      String
  emailVerified     Boolean   @default(false)
  verificationToken String?   @unique
  resetToken        String?   @unique
  resetTokenExpiry  DateTime?
  createdAt         DateTime  @default(now())
  employees         Employee[]
  weeks             Week[]
  settings          Settings?
}

model Employee {
  id         Int    @id @default(autoincrement())
  name       String              # Puno ime (ne firstName/lastName)
  isActive   Boolean @default(true)
  hourlyRate Float?
  notes      String?
  userId     Int     @default(1)
}

model Week {
  id        Int      @id @default(autoincrement())
  startDate DateTime             # Ponedeljak, UTC 00:00:00
  endDate   DateTime             # Nedelja
  userId    Int      @default(1)
  @@unique([startDate, userId])
}

model ScheduleEntry {
  weekId      Int
  day         Int              # 0=pon ... 6=ned
  shiftType   String           # ShiftType vrednosti
  halfShift   Boolean @default(false)
  employeeId  Int
  middleStart Int?             # minuti od ponoći
  middleEnd   Int?

  @@unique([weekId, day, employeeId, shiftType])  # dopušta više smena isti dan!
}

model Settings {
  id              Int     @id @default(autoincrement())
  userId          Int     @unique @default(1)
  firstStart      String  @default("07:15")
  firstEnd        String  @default("15:23")
  secondStart     String  @default("15:23")
  secondEnd       String  @default("23:00")
  # Feature flags (per-user, čuvaju se u bazi):
  featureSalary   Boolean @default(true)
  featurePrint    Boolean @default(true)
  featureHolidays Boolean @default(true)
  featureAbsence  Boolean @default(true)
  featureNotes    Boolean @default(true)
  featureCopyWeek Boolean @default(true)
  featureCharts   Boolean @default(true)
}
```

**Napomene:**
- `ScheduleEntry` unique constraint uključuje `shiftType` — jedan zaposleni može imati više različitih smena isti dan (npr. `first` i `middle`)
- Feature flags se menjaju kroz `api/settings` i prikazuju se u `ShiftSettingsModal`

---

## Dizajn sistem

### CSS varijable (globals.css)
```
--bg-primary: #0D0D0D     --accent-green: #2DD4A0
--bg-secondary: #1A1A1A   --accent-yellow: #F5C842
--bg-tertiary: #252525    --accent-red: #EF4444
--border: #2D2D2D         --text-primary: #FFFFFF
                          --text-secondary: #9CA3AF
```

### Pravila layouta
- Mobile-first, `max-width: 430px`, centriran na desktopu
- Bottom nav uvek vidljiv, `safe-area` padding
- Kartice: `border-radius: 16-20px`, `border` umesto box-shadow
- Pill-shaped badževi: zeleni=prva, žuti=druga, crveni=slobodan

### Fontovi
- Body: **Plus Jakarta Sans** (`--font-plus-jakarta-sans`)
- Headings: **Outfit** (`--font-outfit`)

---

## Važne napomene

- **Polovične smene:** `halfShift: true` → 0.5 dana u statistici; prikazati `½` badge
- **Srednja smena (`middle`):** Vremena se čuvaju kao minuti od ponoći (`middleStart`, `middleEnd`); trajanje se izračunava u `getShiftHours()`
- **Granične sedmice u statistici:** Sedmica se broji za mesec ako se njen pon–ned **preklapa** sa tim mesecom
- **Neaktivni zaposleni:** Ne prikazuju se u editoru rasporeda, ali ostaju u statistici
- **Datumi:** Uvek UTC u bazi i logici. `new Date()` na klijentu konvertovati sa UTC metodama pre slanja na API
- **Prisma generate:** Pokrenuti nakon svake izmene `schema.prisma` pre kompajliranja
- **API autorizacija:** Svaki route handler mora zvati `getServerSession()` i vraćati 401 ako sesija ne postoji; filtrirati sve upite po `userId`
