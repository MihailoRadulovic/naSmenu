import { test, expect } from '@playwright/test'

test.describe('Register flow', () => {
  test('prikazuje formu za registraciju', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /Registracija/i })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Naziv kafića/i)).toBeVisible()
    await expect(page.getByLabel(/^Lozinka/i)).toBeVisible()
    await expect(page.getByLabel(/Potvrda lozinke/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Registruj se/i })).toBeVisible()
  })

  test('prikazuje grešku ako se lozinke ne poklapaju', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel(/Email/i).fill('test@primer.com')
    await page.getByLabel(/Naziv kafića/i).fill('Test Kafić')
    await page.getByLabel(/^Lozinka/i).fill('lozinka123')
    await page.getByLabel(/Potvrda lozinke/i).fill('razlicita123')
    await page.getByRole('button', { name: /Registruj se/i }).click()
    await expect(page.getByText(/Lozinke se ne poklapaju/i)).toBeVisible()
  })

  test('HTML5 validacija blokira kratku lozinku pre submita', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel(/Email/i).fill('test@primer.com')
    await page.getByLabel(/Naziv kafića/i).fill('Test Kafić')
    await page.getByLabel(/^Lozinka/i).fill('kratka')
    await page.getByLabel(/Potvrda lozinke/i).fill('kratka')
    await page.getByRole('button', { name: /Registruj se/i }).click()
    // minLength={8} aktivira HTML5 built-in validaciju — forma ostaje na stranici
    await expect(page).toHaveURL(/\/register/)
    await expect(page.getByRole('button', { name: /Kreiranje|Registruj se/i })).toBeVisible()
  })

  test('link za prijavu vodi na login', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('link', { name: /Prijavite se/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('uspešna registracija prikazuje potvrdu o emailu', async ({ page }) => {
    test.skip(!process.env.TEST_REG_EMAIL, 'TEST_REG_EMAIL nije postavljen')
    await page.goto('/register')
    await page.getByLabel(/Email/i).fill(process.env.TEST_REG_EMAIL!)
    await page.getByLabel(/Naziv kafića/i).fill('Playwright Test Bar')
    await page.getByLabel(/^Lozinka/i).fill(process.env.TEST_REG_PASS!)
    await page.getByLabel(/Potvrda lozinke/i).fill(process.env.TEST_REG_PASS!)
    await page.getByRole('button', { name: /Registruj se/i }).click()
    await expect(page.getByText(/Proverite inbox/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('link', { name: /Idi na prijavu/i })).toBeVisible()
  })

  test('ne prihvata prazan naziv kafića', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel(/Email/i).fill('test@primer.com')
    // naziv kafića ostaje prazan
    await page.getByLabel(/^Lozinka/i).fill('lozinka123')
    await page.getByLabel(/Potvrda lozinke/i).fill('lozinka123')
    await page.getByRole('button', { name: /Registruj se/i }).click()
    // HTML5 required validacija sprečava submit — polje ostaje fokusirano
    const cafeInput = page.getByLabel(/Naziv kafića/i)
    await expect(cafeInput).toBeFocused()
  })
})
