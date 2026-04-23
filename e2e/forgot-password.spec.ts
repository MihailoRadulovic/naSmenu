import { test, expect } from '@playwright/test'

test.describe('Forgot password flow', () => {
  test('prikazuje formu za reset lozinke', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByRole('heading', { name: /Zaboravljena lozinka/i })).toBeVisible()
    await expect(page.getByLabel(/Email adresa/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Pošalji link/i })).toBeVisible()
  })

  test('prikazuje potvrdu nakon slanja (za bilo koji email)', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByLabel(/Email adresa/i).fill('ma@koji.com')
    await page.getByRole('button', { name: /Pošalji link/i }).click()
    // API uvijek vraća OK (ne otkriva da li email postoji)
    await expect(page.getByText(/Email je poslat/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('link', { name: /Nazad na prijavu/i })).toBeVisible()
  })

  test('ne prihvata neispravan format emaila', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByLabel(/Email adresa/i).fill('nijemail')
    await page.getByRole('button', { name: /Pošalji link/i }).click()
    // HTML5 email validacija sprečava submit
    const emailInput = page.getByLabel(/Email adresa/i)
    await expect(emailInput).toBeFocused()
  })

  test('link "Nazad na prijavu" vodi na login', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByRole('link', { name: /Nazad na prijavu/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('reset-password stranica prikazuje grešku bez tokena', async ({ page }) => {
    await page.goto('/reset-password')
    await page.waitForLoadState('networkidle')
    // Bez ?token= u URL-u, prikazuje poruku o nevažećem linku
    await expect(page.getByText(/Nevažeći link/i)).toBeVisible({ timeout: 10_000 })
  })

  test('reset-password prikazuje formu sa ispravnim tokenom', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /Nova lozinka/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByLabel(/Nova lozinka/i)).toBeVisible()
    await expect(page.getByLabel(/Potvrda lozinke/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Sačuvaj novu lozinku/i })).toBeVisible()
  })

  test('reset-password prikazuje grešku za lozinku kraću od 8 karaktera', async ({ page }) => {
    await page.goto('/reset-password?token=test-token-123')
    await page.waitForLoadState('networkidle')
    await page.getByLabel(/Nova lozinka/i).fill('kratka')
    await page.getByLabel(/Potvrda lozinke/i).fill('kratka')
    await page.getByRole('button', { name: /Sačuvaj novu lozinku/i }).click()
    await expect(page.getByText(/najmanje 8 karaktera/i)).toBeVisible()
  })
})
