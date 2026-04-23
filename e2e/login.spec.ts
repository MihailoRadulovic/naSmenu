import { test, expect } from '@playwright/test'

// Next.js ubacuje vlastiti <div role="alert"> (__next-route-announcer__)
// pa koristimo .filter() da uhvatimo samo aplikacijske alert poruke
const appAlert = (page: import('@playwright/test').Page) =>
  page.getByRole('alert').filter({ hasNotText: '' }).filter({ hasText: /.+/ }).last()

test.describe('Login flow', () => {
  test('prikazuje formu za prijavu', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /Dobrodošli/i })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Lozinka/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Prijavi se/i })).toBeVisible()
  })

  test('prikazuje grešku za pogrešne kredencijale', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/Email/i).fill('ne@postoji.com')
    await page.getByLabel(/Lozinka/i).fill('pogresna123')
    await page.getByRole('button', { name: /Prijavi se/i }).click()
    await expect(page.getByText(/Pogrešan email ili lozinka/i)).toBeVisible()
  })

  test('"Zapamti me" checkbox je vidljiv i klikabilan', async ({ page }) => {
    await page.goto('/login')
    const checkbox = page.getByRole('checkbox', { name: /Zapamti me/i })
    await expect(checkbox).toBeVisible()
    await expect(checkbox).not.toBeChecked()
    await checkbox.check()
    await expect(checkbox).toBeChecked()
  })

  test('link za zaboravljenu lozinku vodi na ispravnu stranu', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /Zaboravio si lozinku/i }).click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('link za registraciju vodi na ispravnu stranu', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /Registrujte se/i }).click()
    await expect(page).toHaveURL(/\/register/)
  })

  test('neautorizovan pristup /zaposleni preusmjerava na login', async ({ page }) => {
    await page.goto('/zaposleni')
    await expect(page).toHaveURL(/\/login/)
  })

  test('uspešna prijava preusmjerava na raspored', async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL nije postavljen')
    await page.goto('/login')
    await page.getByLabel(/Email/i).fill(process.env.TEST_EMAIL!)
    await page.getByLabel(/Lozinka/i).fill(process.env.TEST_PASS!)
    await page.getByRole('button', { name: /Prijavi se/i }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })
})
