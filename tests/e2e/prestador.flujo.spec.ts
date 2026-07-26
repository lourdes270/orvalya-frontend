import { test, expect } from '@playwright/test'
import {
  acceptLegalTerms,
  completeOnboardingPrestador,
  loginWithEmail,
  registerAndAuthenticate,
} from './helpers/auth'
import { clearRegistroTipo } from './helpers/mocks'
import { TEST_PASSWORD, uniqueEmail, UPLOAD_REJECTION_MESSAGE } from './helpers/env'
import { deleteUserByEmail, findUserByEmail } from './helpers/supabase-admin'
import { VALID_PDF, INVALID_EXE } from './helpers/fixtures'
import { skipWithoutServiceRole } from './helpers/skip'

test.describe.serial('Prestador — flujo completo', () => {
  const email = uniqueEmail('prestador')
  const password = TEST_PASSWORD

  test.beforeEach(() => {
    skipWithoutServiceRole()
  })

  test.afterAll(async () => {
    await deleteUserByEmail(email).catch(() => {})
  })

  test('registro, términos, onboarding y dashboard', async ({ page }) => {
    await clearRegistroTipo(page)
    await registerAndAuthenticate(page, email, password)
    await completeOnboardingPrestador(page, email)
    await acceptLegalTerms(page)

    await expect(page.getByText('Documentación incompleta')).toBeVisible()
    await expect(page.getByText('0/3 docs')).toBeVisible()
  })

  test('login al dashboard', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await expect(page.getByRole('button', { name: /Documentos/i })).toBeVisible()
    const user = await findUserByEmail(email)
    expect(user?.id).toBeTruthy()
  })

  test('sube documento PDF válido', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await page.getByRole('button', { name: /Documentos/i }).click()

    await expect(page.getByText('Legajo para tercerización')).toBeVisible()
    await expect(page.getByText('Faltan 3 de 3')).toBeVisible()

    const card = page.locator('article').filter({ hasText: 'Certificado DGI' })
    await card.locator('input[type="file"]').setInputFiles(VALID_PDF)

    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    await card.locator('input[type="date"]').fill(future.toISOString().slice(0, 10))
    await card.getByText('Declaro que este documento es auténtico', { exact: false }).click()
    await card.getByRole('button', { name: 'Guardar documento' }).click()

    await expect(card.getByText('Al día')).toBeVisible({ timeout: 30_000 })
    await expect(card.getByText(/v1/)).toBeVisible()
  })

  test('rechaza archivo inválido (exe)', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await page.getByRole('button', { name: /Documentos/i }).click()

    const card = page.locator('article').filter({ hasText: 'Certificado BPS' })
    // Si ya estaba cerrado (por upload previo), abrir
    const cargar = card.getByRole('button', { name: 'Cargar' })
    if (await cargar.isVisible().catch(() => false)) {
      await cargar.click()
    }
    await card.locator('input[type="file"]').setInputFiles(INVALID_EXE)

    await expect(page.getByText(UPLOAD_REJECTION_MESSAGE)).toBeVisible()
  })

  test('muestra enlace Ver perfil público', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await expect(page.getByRole('link', { name: 'Ver perfil público' })).toBeVisible()
  })

  test('perfil público sin teléfono ni email', async ({ page }) => {
    const user = await findUserByEmail(email)
    expect(user?.id).toBeTruthy()

    await page.goto(`/prestadores/${user!.id}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 })

    const body = await page.locator('body').innerText()
    expect(body.toLowerCase()).not.toMatch(/@/)
    expect(body).not.toMatch(/099\d{6}/)
    expect(body.toLowerCase()).not.toContain('teléfono')
    expect(body.toLowerCase()).not.toContain('email')
  })
})
