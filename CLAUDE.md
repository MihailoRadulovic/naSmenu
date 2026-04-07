# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekat

PWA za vlasnika kafića — raspoređivanje 6-10 zaposlenih po smenama (prva, druga, srednja, slobodan dan) za svaki dan u nedelji (pon–ned). Koristi je SAMO vlasnik sa telefona.

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

**Env varijable:** Svi API ključevi idu u `.env.local` (učitava `prisma.config.ts`). Obavezna varijabla: `DATABASE_URL` (Neon PostgreSQL connection string).

---

## Arhitektura

### Stack
- **Next.js 16** App Router, React 19, TypeScript, Tailwind CSS v4
- **Prisma 7** sa `@prisma/adapter-neon` (HTTP mode, serverless-compatible)
- **Neon PostgreSQL** (produkcija) — bez lokalnog fallback-a u runtime-u
- **PWA:** `@ducanh2912/next-pwa` (service worker onemogućen u dev modu)
- **Grafikoni:** Recharts
- **Ikonice:** Lucide React

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
  page.tsx                     # Raspored (home) — WeekView
  novi/page.tsx                # Kreiranje/izmena rasporeda — ScheduleEditor
  statistika/page.tsx          # Statistika — tabs: sedmični/mesečni/custom
  statistika/zaposleni/[id]/   # Statistika po zaposlenom
  zaposleni/page.tsx           # CRUD zaposlenih
  api/
    employees/                 # GET (samo aktivni), POST, PUT/PATCH [id]
    weeks/                     # GET lista, GET current, GET/PUT [id], GET by-date
    stats/weekly/              # ?month=&year=
    stats/monthly/             # ?month=&year=
    stats/custom/              # ?from=&to=&employeeId=
    settings/                  # GET/PUT — shift vremena (Settings model)
    salary/                    # Obračun plata
```

### Komponente po domenima

- `src/components/schedule/` — `WeekView`, `ScheduleEditor`, `DayCard`, `DayTabs`, `EmployeeChip`, `ShiftBadge`, `WeekPicker`, `WhatsAppShare`, `ShiftSettingsModal`
- `src/components/statistics/` — `WeeklyView`, `MonthlyView`, `CustomRangeView`, `WeekAccordion`, `EmployeeStatRow`, `EmployeeDailyView`, `MonthlyHoursChart`, `WeeklyTrendChart`
- `src/components/employees/` — `EmployeeCard`, `EmployeeList`, `EmployeeModal`, `EmployeeStatusBadge`
- `src/components/ui/` — `Button`, `Input`, `Modal`, `Avatar`, `Spinner`, `ErrorCard`, `PageHeader`
- `src/components/layout/` — `BottomNav`, `ThemeToggleButton`
- `src/components/` — `PinGate`, `PinScreen`, `ThemeProvider`, `PrintButton`

### Konteksti

- `ToastContext` — globalni toast sistem, omotava sve u `layout.tsx`
- `PinGate` — zaštita PIN-om pre prikazivanja sadržaja
- `ThemeProvider` — dark/light tema

### Pomoćne biblioteke (`src/lib/`)

- `dates.ts` — **UVEK koristi UTC metode** za izračunavanje nedelja (izbegava timezone shift između klijenta i servera). `getWeekBounds(date)`, `addWeeks()`, `formatDate()`, `toISODateString()`
- `shiftHours.ts` — `getShiftHours(entry, settings)` — hours po smeni (default 8h, middle smena se računa iz `middleStart`/`middleEnd` u minutama od ponoći)
- `shiftSettings.ts` — čitanje `Settings` modela (vremena smena)
- `statsUtils.ts` — logika za agregatne statistike
- `holidays.ts` — državni praznici (za highlight)
- `features.ts` — feature flags

---

## Model podataka (stvarno stanje u bazi)

```prisma
model Employee {
  id         Int    @id @default(autoincrement())
  name       String              # Puno ime (ne firstName/lastName)
  isActive   Boolean @default(true)
  hourlyRate Float?
  notes      String?
}

model Week {
  id        Int      @id
  startDate DateTime @unique   # Ponedeljak, UTC 00:00:00
  endDate   DateTime           # Nedelja, UTC 23:59:59
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
  id          Int    @id
  firstStart  String @default("07:15")
  firstEnd    String @default("15:23")
  secondStart String @default("15:23")
  secondEnd   String @default("23:00")
}
```

**Napomena:** `ScheduleEntry` unique constraint uključuje `shiftType` — jedan zaposleni može imati više različitih smena isti dan (npr. `first` i `middle`).

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
