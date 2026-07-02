import { test, expect } from '@playwright/test'
import { loginWithEmail } from './helpers/auth'
import { setRegistroContratante, clearRegistroTipo } from './helpers/mocks'
import {
  EXISTING_RUT,
  RUT_DUPLICADO_MSG,
  TEST_PASSWORD,
  UPLOAD_REJECTION_MESSAGE,
  uniqueEmail,
} from './helpers/env'
import {
  deleteUserByEmail,
  findUserByEmail,
  getPerfilField,
} from './helpers/supabase-admin'
import { INVALID_EXE, OVERSIZE_PDF } from './helpers/fixtures'
import {
  fillContratanteNombre,
  fillContratantePerfilMinimo,
  fillContratanteRut,
  submitContratantePerfil,
} from './helpers/contratante'
import { skipWithoutServiceRole } from './helpers/skip'

test.describe.serial('Validaciones de formularios', () => {
  const prestadorEmail = uniqueEmail('validaciones-prestador')
  const contratanteEmail = uniqueEmail('validaciones-contratante')
  const password = TEST_PASSWORD

  test.beforeEach(() => {
    skipWithoutServiceRole()
  })

  test.afterAll(async () => {
    await deleteUserByEmail(prestadorEmail).catch(() => {})
    await deleteUserByEmail(contratanteEmail).catch(() => {})
  })

  test('setup prestador para validaciones de archivos y sanitización', async ({ page }) => {
    await clearRegistroTipo(page)
    const { registerAndAuthenticate, completeOnboardingPrestador, acceptLegalTerms } = await import('./helpers/auth')
    await registerAndAuthenticate(page, prestadorEmail, password)
    await completeOnboardingPrestador(page, prestadorEmail)
    await acceptLegalTerms(page)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('setup contratante para validaciones de RUT', async ({ page }) => {
    await setRegistroContratante(page)
    const { registerAndAuthenticate } = await import('./helpers/auth')
    await registerAndAuthenticate(page, contratanteEmail, password)
    await expect(page).toHaveURL(/\/contratante\/perfil/)
  })

  test('RUT contratante: letras rechazadas', async ({ page }) => {
    await page.goto('/contratante/perfil')
    if (!page.url().includes('/contratante/perfil')) {
      await setRegistroContratante(page)
      await loginWithEmail(page, contratanteEmail, password)
      await page.goto('/contratante/perfil')
    }
    test.skip(!page.url().includes('/contratante/perfil'), 'Perfil contratante no disponible')

    await fillContratanteRut(page, 'ABCD1234')
    await submitContratantePerfil(page)
    await expect(page.getByText('al menos 8 dígitos', { exact: false })).toBeVisible()
  })

  test('RUT contratante: menos de 8 dígitos', async ({ page }) => {
    await setRegistroContratante(page)
    await loginWithEmail(page, contratanteEmail, password)
    await page.goto('/contratante/perfil')
    test.skip(!page.url().includes('/contratante/perfil'), 'Perfil contratante no disponible')

    await fillContratanteRut(page, '1234567')
    await submitContratantePerfil(page)
    await expect(page.getByText('al menos 8 dígitos', { exact: false })).toBeVisible()
  })

  test('RUT duplicado muestra mensaje correcto', async ({ page }) => {
    await setRegistroContratante(page)
    await loginWithEmail(page, contratanteEmail, password)
    await page.goto('/contratante/perfil')
    test.skip(!page.url().includes('/contratante/perfil'), 'Perfil contratante no disponible')

    await fillContratanteNombre(page, 'Empresa Duplicada E2E')
    await fillContratanteRut(page, EXISTING_RUT)
    await page.locator('select').first().selectOption({ index: 1 })
    await page.locator('select').nth(1).selectOption({ label: 'Montevideo' })
    await page.getByPlaceholder('099123456').fill('099444555')
    await submitContratantePerfil(page)
    await expect(page.getByText(RUT_DUPLICADO_MSG)).toBeVisible()
  })

  test('archivo mayor a 5MB rechazado', async ({ page }) => {
    await loginWithEmail(page, prestadorEmail, password)
    await page.locator('input[type="file"]').first().setInputFiles(OVERSIZE_PDF)
    await expect(page.getByText(UPLOAD_REJECTION_MESSAGE)).toBeVisible()
  })

  test('archivo tipo incorrecto rechazado', async ({ page }) => {
    await loginWithEmail(page, prestadorEmail, password)
    const fileInputs = page.locator('input[type="file"]')
    const index = (await fileInputs.count()) > 1 ? 1 : 0
    await fileInputs.nth(index).setInputFiles(INVALID_EXE)
    await expect(page.getByText(UPLOAD_REJECTION_MESSAGE)).toBeVisible()
  })

  test('campos de texto con HTML sanitizados al guardar', async ({ page }) => {
    await loginWithEmail(page, prestadorEmail, password)

    const payload = '<b>Hola</b><script>alert(1)</script> mundo'
    await page.locator('textarea').first().fill(payload)
    await page.getByRole('button', { name: 'Guardar perfil' }).click()
    await expect(page.getByText('Guardado', { exact: false })).toBeVisible({ timeout: 15_000 })

    const user = await findUserByEmail(prestadorEmail)
    expect(user?.id).toBeTruthy()
    const sobreMi = await getPerfilField(user!.id, 'sobre_mi')
    expect(String(sobreMi)).not.toContain('<script>')
    expect(String(sobreMi)).not.toContain('<b>')
    expect(String(sobreMi)).toContain('Hola')
    expect(String(sobreMi)).toContain('mundo')
  })
})
