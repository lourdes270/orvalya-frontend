import { test, expect } from '@playwright/test'
import {
  fillHoneypotRegister,
  expectHoneypotSilentRegister,
  openAuthRegister,
} from './helpers/auth'
import { clearRegistroTipo } from './helpers/mocks'
import { TEST_PASSWORD, uniqueEmail } from './helpers/env'
import { deleteUserByEmail } from './helpers/supabase-admin'
import { skipWithoutServiceRole } from './helpers/skip'

test.describe('Seguridad', () => {
  test('/admin/moderacion redirige a /dashboard si no sos admin', async ({ page }) => {
    skipWithoutServiceRole()
    const email = uniqueEmail('no-admin')
    const password = TEST_PASSWORD

    try {
      await clearRegistroTipo(page)
      const { registerAndAuthenticate, acceptLegalTerms, completeOnboardingPrestador } = await import('./helpers/auth')
      await registerAndAuthenticate(page, email, password)
      await completeOnboardingPrestador(page, email)
      await acceptLegalTerms(page)

      await page.goto('/admin/moderacion')
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    } finally {
      await deleteUserByEmail(email).catch(() => {})
    }
  })

  test('/dashboard redirige a /auth sin sesión', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth/, { timeout: 15_000 })
  })

  test('honeypot en registro rechaza silenciosamente', async ({ page }) => {
    skipWithoutServiceRole()
    const email = uniqueEmail('honeypot')
    const password = TEST_PASSWORD

    await clearRegistroTipo(page)
    await openAuthRegister(page)
    await page.getByPlaceholder('tu@email.com').fill(email)
    await page.getByPlaceholder('Mín. 8 caracteres, 1 mayúscula y 1 número').fill(password)
    await page.getByPlaceholder('Repetí tu contraseña').fill(password)
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled({ timeout: 20_000 })
    await fillHoneypotRegister(page, 'bot-detected')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expectHoneypotSilentRegister(page)

    const user = await import('./helpers/supabase-admin').then(m => m.findUserByEmail(email))
    expect(user).toBeNull()
  })
})
