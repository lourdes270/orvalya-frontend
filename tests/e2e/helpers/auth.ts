import { expect, type Page } from '@playwright/test'
import { FAKE_REGISTRATION_SUCCESS_MSG } from './env'
import { confirmUserEmail } from './supabase-admin'
import { setupE2EMocks } from './mocks'

export async function openAuthRegister(page: Page): Promise<void> {
  await setupE2EMocks(page)
  await page.goto('/auth')
  await page.getByRole('button', { name: 'Registrarse' }).click()
}

export async function registerWithEmail(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await openAuthRegister(page)
  await page.getByPlaceholder('tu@email.com').fill(email)
  await page.getByPlaceholder('Mín. 8 caracteres, 1 mayúscula y 1 número').fill(password)
  await page.getByPlaceholder('Repetí tu contraseña').fill(password)

  await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled({ timeout: 20_000 })
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
}

export async function registerAndAuthenticate(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await registerWithEmail(page, email, password)

  const emailConfirmHeading = page.getByRole('heading', { name: 'Revisá tu email' })

  const outcome = await Promise.race([
    page.waitForURL(/\/(aceptar-terminos|onboarding|dashboard|contratante)/, { timeout: 25_000 }).then(() => 'navigated' as const),
    emailConfirmHeading.waitFor({ state: 'visible', timeout: 25_000 }).then(() => 'confirm' as const),
  ]).catch(() => 'timeout' as const)

  if (outcome === 'confirm' || (await emailConfirmHeading.isVisible().catch(() => false))) {
    await confirmUserEmail(email)
    await loginWithEmail(page, email, password)
    return
  }

  if (outcome === 'navigated') return

  const generalError = page.locator('form p').filter({ hasText: /demasiados intentos|ya está registrado|verificar el captcha|error/i })
  if (await generalError.first().isVisible({ timeout: 1_000 }).catch(() => false)) {
    throw new Error(`Registro falló: ${await generalError.first().innerText()}`)
  }

  throw new Error(`Registro no completó: URL actual ${page.url()}`)
}

export async function loginWithEmail(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/auth')
  await page.getByRole('button', { name: 'Ingresar' }).first().click()
  const loginForm = page.locator('form').filter({ has: page.getByPlaceholder('tu@email.com') })
  await loginForm.getByPlaceholder('tu@email.com').fill(email)
  await loginForm.getByPlaceholder('••••••••').fill(password)
  await loginForm.getByRole('button', { name: 'Ingresar' }).click()
  await page.waitForURL(/\/(dashboard|aceptar-terminos|onboarding|contratante)/, { timeout: 30_000 })
}

export async function acceptLegalTerms(page: Page): Promise<void> {
  if (!page.url().includes('/aceptar-terminos')) return
  await page.getByText('He leído y acepto', { exact: false }).click()
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled({ timeout: 5_000 })
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.waitForURL(/\/(dashboard|contratante\/perfil)/, { timeout: 30_000 })
}

export async function completeOnboardingPrestador(
  page: Page,
  email: string,
): Promise<void> {
  if (page.url().includes('/onboarding')) {
    const paso0 = page.getByRole('button', { name: /Ofrezco servicios/i })
    if (await paso0.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await paso0.click()
    }
  } else {
    await page.goto('/onboarding?paso=1')
  }

  await page.waitForURL('**/onboarding?paso=1**')

  await page.getByText('Limpieza y sanitización', { exact: true }).click()
  await page.getByText('Hogares', { exact: true }).click()
  await page.getByRole('button', { name: 'Siguiente' }).click()

  await page.waitForURL('**/onboarding?paso=2**')
  await page.getByPlaceholder('Ej: María').fill('María')
  await page.getByPlaceholder('Ej: García').fill('García')
  await page.getByPlaceholder('tu@email.com').fill(email)
  await page.locator('input[placeholder="099123456"]').first().fill('099111222')
  await page.locator('input[placeholder="Ej: 099123456"]').fill('099111222')
  await page.getByRole('button', { name: 'Todo Uruguay' }).click()
  await page.getByRole('button', { name: 'Siguiente' }).click()

  await page.waitForURL('**/onboarding?paso=3**')
  await page.getByText('Tengo RUT activo', { exact: true }).click()
  await page.getByRole('button', { name: 'Comenzar' }).click()

  await page.waitForURL('**/onboarding?paso=4**', { timeout: 20_000 })
  await page.waitForURL('**/aceptar-terminos**', { timeout: 60_000 })
}

export async function fillHoneypotRegister(page: Page, value: string): Promise<void> {
  await page.locator('#middle_name').fill(value, { force: true })
}

export async function expectHoneypotSilentRegister(page: Page): Promise<void> {
  await expect(page.getByText(FAKE_REGISTRATION_SUCCESS_MSG)).toBeVisible()
  await expect(page).toHaveURL(/\/auth/)
}

export async function logoutIfNeeded(page: Page): Promise<void> {
  if (page.url().includes('/dashboard')) {
    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await page.waitForURL('**/', { timeout: 15_000 })
  }
}
