import { test, expect, type Page } from '@playwright/test'

// Helper — prijavi se sa test nalogom
async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/Email/i).fill(process.env.TEST_EMAIL!)
  await page.getByLabel(/Lozinka/i).fill(process.env.TEST_PASS!)
  await page.getByRole('button', { name: /Prijavi se/i }).click()
  await page.waitForURL('/')
}

test.describe('Brisanje naloga', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL nije postavljen')
    await login(page)
  })

  test('dugme za odjavu je vidljivo u profile modalu', async ({ page }) => {
    // Otvoriti profil modal (ikona korisnika u WeekView)
    await page.getByRole('button', { name: /profil|nalog|korisnik/i }).first().click()
    await expect(page.getByRole('button', { name: /Odjavi se/i })).toBeVisible()
  })

  test('odjava vraća korisnika na login', async ({ page }) => {
    await page.getByRole('button', { name: /profil|nalog|korisnik/i }).first().click()
    await page.getByRole('button', { name: /Odjavi se/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('nakon odjave pristup zaštićenoj ruti preusmjerava na login', async ({ page }) => {
    await page.getByRole('button', { name: /profil|nalog|korisnik/i }).first().click()
    await page.getByRole('button', { name: /Odjavi se/i }).click()
    await page.waitForURL(/\/login/)
    await page.goto('/zaposleni')
    await expect(page).toHaveURL(/\/login/)
  })

  test('DELETE /api/employees/[id] vraća 404 za tuđeg zaposlenog', async ({ page }) => {
    // Provjera da soft-delete API ne dozvoljava brisanje tuđih podataka
    const res = await page.request.delete('/api/employees/999999')
    expect([403, 404]).toContain(res.status())
  })
})

// Testovi koji ne zahtijevaju autentikaciju
test.describe('Brisanje naloga — neautorizovano', () => {
  test('DELETE /api/employees/[id] vraća 401 bez sesije', async ({ page }) => {
    const res = await page.request.delete('/api/employees/1')
    expect(res.status()).toBe(401)
  })

  test('PUT /api/weeks/[id] vraća 401 bez sesije', async ({ page }) => {
    const res = await page.request.put('/api/weeks/1', { data: {} })
    expect(res.status()).toBe(401)
  })
})
