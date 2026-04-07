export interface Holiday {
  date: string // YYYY-MM-DD
  name: string
  type: 'drzavni' | 'verski' | 'slava'
}

// ─────────────────────────────────────────────────────────
// Državni praznici — preuzeto sa date.nager.at/api/v3 (RS)
// Uključuje prenose kada praznik pada u nedelju → ponedeljak
//
// Slave i verski praznici — fiksni datumi po julijanskom
// kalendaru konvertovani u gregorijanski (+13 dana u XXI veku)
// ─────────────────────────────────────────────────────────

export const SERBIAN_HOLIDAYS: Holiday[] = [

  // ═══════════════════════════════════
  // 2025
  // ═══════════════════════════════════

  // Državni (izvor: nager.at)
  // Feb 16 pada u ned → prenosi se na Feb 17
  { date: '2025-01-01', name: 'Nova Godina',             type: 'drzavni' },
  { date: '2025-01-02', name: 'Nova Godina (2. dan)',    type: 'drzavni' },
  { date: '2025-01-07', name: 'Božić',                   type: 'drzavni' },
  { date: '2025-02-15', name: 'Dan državnosti',          type: 'drzavni' },
  { date: '2025-02-17', name: 'Dan državnosti (2. dan)', type: 'drzavni' },
  { date: '2025-04-18', name: 'Veliki petak',            type: 'drzavni' },
  { date: '2025-04-20', name: 'Vaskrs',                  type: 'drzavni' },
  { date: '2025-04-21', name: 'Vaskrs (2. dan)',         type: 'drzavni' },
  { date: '2025-05-01', name: 'Praznik rada',            type: 'drzavni' },
  { date: '2025-05-02', name: 'Praznik rada (2. dan)',   type: 'drzavni' },
  { date: '2025-11-11', name: 'Dan primirja',            type: 'drzavni' },

  // Verski (pravoslavni, nisu neradni ali su bitni)
  { date: '2025-01-08', name: 'Božić (2. dan)',          type: 'verski' },
  { date: '2025-01-19', name: 'Bogojavljenje',           type: 'verski' },
  { date: '2025-04-13', name: 'Cveti',                   type: 'verski' },
  { date: '2025-05-29', name: 'Spasovdan',               type: 'verski' },
  { date: '2025-06-08', name: 'Trojičin dan',            type: 'verski' },
  { date: '2025-08-28', name: 'Velika Gospojina',        type: 'verski' },

  // Slave (fiksni datumi, julijanski → gregorijanski)
  { date: '2025-01-09', name: 'Stefandan',               type: 'slava' },
  { date: '2025-01-14', name: 'Srpska Nova Godina',      type: 'slava' },
  { date: '2025-01-20', name: 'Jovanjdan',               type: 'slava' },
  { date: '2025-01-27', name: 'Sveti Sava',              type: 'slava' },
  { date: '2025-05-06', name: 'Đurđevdan',               type: 'slava' },
  { date: '2025-07-12', name: 'Petrovdan',               type: 'slava' },
  { date: '2025-08-02', name: 'Ilindan',                 type: 'slava' },
  { date: '2025-08-19', name: 'Preobraženje',            type: 'slava' },
  { date: '2025-09-21', name: 'Mala Gospojina',          type: 'slava' },
  { date: '2025-09-27', name: 'Krstovdan',               type: 'slava' },
  { date: '2025-11-08', name: 'Mitrovdan',               type: 'slava' },
  { date: '2025-11-21', name: 'Aranđelovdan',            type: 'slava' },
  { date: '2025-12-19', name: 'Nikoljedan',              type: 'slava' },

  // ═══════════════════════════════════
  // 2026
  // ═══════════════════════════════════

  // Državni (izvor: nager.at)
  // Feb 15 pada u ned → prenosi se na Feb 16; 2. dan → Feb 17
  { date: '2026-01-01', name: 'Nova Godina',             type: 'drzavni' },
  { date: '2026-01-02', name: 'Nova Godina (2. dan)',    type: 'drzavni' },
  { date: '2026-01-07', name: 'Božić',                   type: 'drzavni' },
  { date: '2026-02-16', name: 'Dan državnosti',          type: 'drzavni' },
  { date: '2026-02-17', name: 'Dan državnosti (2. dan)', type: 'drzavni' },
  { date: '2026-04-10', name: 'Veliki petak',            type: 'drzavni' },
  { date: '2026-04-12', name: 'Vaskrs',                  type: 'drzavni' },
  { date: '2026-04-13', name: 'Vaskrs (2. dan)',         type: 'drzavni' },
  { date: '2026-05-01', name: 'Praznik rada',            type: 'drzavni' },
  { date: '2026-05-02', name: 'Praznik rada (2. dan)',   type: 'drzavni' },
  { date: '2026-11-11', name: 'Dan primirja',            type: 'drzavni' },

  // Verski
  { date: '2026-01-08', name: 'Božić (2. dan)',          type: 'verski' },
  { date: '2026-01-19', name: 'Bogojavljenje',           type: 'verski' },
  { date: '2026-04-05', name: 'Cveti',                   type: 'verski' },
  { date: '2026-05-21', name: 'Spasovdan',               type: 'verski' },
  { date: '2026-05-31', name: 'Trojičin dan',            type: 'verski' },
  { date: '2026-08-28', name: 'Velika Gospojina',        type: 'verski' },

  // Slave
  { date: '2026-01-09', name: 'Stefandan',               type: 'slava' },
  { date: '2026-01-14', name: 'Srpska Nova Godina',      type: 'slava' },
  { date: '2026-01-20', name: 'Jovanjdan',               type: 'slava' },
  { date: '2026-01-27', name: 'Sveti Sava',              type: 'slava' },
  { date: '2026-05-06', name: 'Đurđevdan',               type: 'slava' },
  { date: '2026-07-12', name: 'Petrovdan',               type: 'slava' },
  { date: '2026-08-02', name: 'Ilindan',                 type: 'slava' },
  { date: '2026-08-19', name: 'Preobraženje',            type: 'slava' },
  { date: '2026-09-21', name: 'Mala Gospojina',          type: 'slava' },
  { date: '2026-09-27', name: 'Krstovdan',               type: 'slava' },
  { date: '2026-11-08', name: 'Mitrovdan',               type: 'slava' },
  { date: '2026-11-21', name: 'Aranđelovdan',            type: 'slava' },
  { date: '2026-12-19', name: 'Nikoljedan',              type: 'slava' },

  // ═══════════════════════════════════
  // 2027
  // ═══════════════════════════════════

  // Državni (izvor: nager.at)
  // Vaskrs pada kasno — April 30 Veliki petak, May 2 Vaskrs
  // Praznik rada May 1 se poklapa sa Velikom subotom
  { date: '2027-01-01', name: 'Nova Godina',             type: 'drzavni' },
  { date: '2027-01-02', name: 'Nova Godina (2. dan)',    type: 'drzavni' },
  { date: '2027-01-07', name: 'Božić',                   type: 'drzavni' },
  { date: '2027-02-15', name: 'Dan državnosti',          type: 'drzavni' },
  { date: '2027-02-16', name: 'Dan državnosti (2. dan)', type: 'drzavni' },
  { date: '2027-04-30', name: 'Veliki petak',            type: 'drzavni' },
  { date: '2027-05-01', name: 'Praznik rada',            type: 'drzavni' },
  { date: '2027-05-02', name: 'Vaskrs',                  type: 'drzavni' },
  { date: '2027-05-03', name: 'Vaskrs (2. dan)',         type: 'drzavni' },
  { date: '2027-11-11', name: 'Dan primirja',            type: 'drzavni' },

  // Verski
  { date: '2027-01-08', name: 'Božić (2. dan)',          type: 'verski' },
  { date: '2027-01-19', name: 'Bogojavljenje',           type: 'verski' },
  { date: '2027-04-25', name: 'Cveti',                   type: 'verski' },
  { date: '2027-06-10', name: 'Spasovdan',               type: 'verski' },
  { date: '2027-06-20', name: 'Trojičin dan',            type: 'verski' },
  { date: '2027-08-28', name: 'Velika Gospojina',        type: 'verski' },

  // Slave
  { date: '2027-01-09', name: 'Stefandan',               type: 'slava' },
  { date: '2027-01-14', name: 'Srpska Nova Godina',      type: 'slava' },
  { date: '2027-01-20', name: 'Jovanjdan',               type: 'slava' },
  { date: '2027-01-27', name: 'Sveti Sava',              type: 'slava' },
  { date: '2027-05-06', name: 'Đurđevdan',               type: 'slava' },
  { date: '2027-07-12', name: 'Petrovdan',               type: 'slava' },
  { date: '2027-08-02', name: 'Ilindan',                 type: 'slava' },
  { date: '2027-08-19', name: 'Preobraženje',            type: 'slava' },
  { date: '2027-09-21', name: 'Mala Gospojina',          type: 'slava' },
  { date: '2027-09-27', name: 'Krstovdan',               type: 'slava' },
  { date: '2027-11-08', name: 'Mitrovdan',               type: 'slava' },
  { date: '2027-11-21', name: 'Aranđelovdan',            type: 'slava' },
  { date: '2027-12-19', name: 'Nikoljedan',              type: 'slava' },
]

export function getHoliday(dateStr: string): Holiday | undefined {
  const matches = SERBIAN_HOLIDAYS.filter(h => h.date === dateStr)
  if (matches.length === 0) return undefined
  return (
    matches.find(h => h.type === 'drzavni') ??
    matches.find(h => h.type === 'verski') ??
    matches[0]
  )
}

export function isHoliday(dateStr: string): boolean {
  return SERBIAN_HOLIDAYS.some(h => h.date === dateStr)
}
