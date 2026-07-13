import { test, expect } from '@playwright/test'
import { loginWithEmail } from './helpers/auth'
import { ADMIN_EMAIL, ADMIN_PASSWORD, TEST_PASSWORD } from './helpers/env'
import {
  countLlamadosPendientes,
  deleteLlamadoByTitulo,
  ensureE2EModeracionContratante,
  insertLlamadoPendiente,
} from './helpers/supabase-admin'
import { skipWithoutAdmin } from './helpers/skip'

test.describe.serial('Admin — flujo completo', () => {
  const llamadoTitulo = `E2E Moderación ${Date.now()}`

  test.beforeEach(() => {
    skipWithoutAdmin()
  })

  test.beforeAll(async () => {
    if (!process.env.E2E_SUPABASE_SERVICE_ROLE_KEY || !ADMIN_EMAIL) return

    try {
      const contratanteId = await ensureE2EModeracionContratante()
      await insertLlamadoPendiente(contratanteId, llamadoTitulo)
    } catch (err) {
      console.warn('[e2e admin] beforeAll:', err instanceof Error ? err.message : err)
    }
  })

  test.afterAll(async () => {
    if (!process.env.E2E_SUPABASE_SERVICE_ROLE_KEY) return
    await deleteLlamadoByTitulo(llamadoTitulo).catch(err => {
      console.warn('[e2e admin] afterAll:', err instanceof Error ? err.message : err)
    })
  })

  test('login admin y ver cola de moderación', async ({ page }) => {
    await loginWithEmail(page, ADMIN_EMAIL, ADMIN_PASSWORD || TEST_PASSWORD)
    await page.goto('/admin/moderacion')

    await expect(page.getByRole('heading', { name: 'Moderación de llamados' })).toBeVisible()
    await expect(page.getByText(llamadoTitulo)).toBeVisible({ timeout: 20_000 })
  })

  test('aprobar llamado y actualizar contador', async ({ page }) => {
    const pendientesInicio = await countLlamadosPendientes()
    expect(pendientesInicio).toBeGreaterThan(0)

    await loginWithEmail(page, ADMIN_EMAIL, ADMIN_PASSWORD || TEST_PASSWORD)
    await page.goto('/admin/moderacion')

    const card = page.locator('article').filter({ hasText: llamadoTitulo })
    await expect(card).toBeVisible()
    await card.getByRole('button', { name: 'Aprobar' }).click()

    await expect(card).toHaveCount(0, { timeout: 20_000 })

    const pendientesFin = await countLlamadosPendientes()
    expect(pendientesFin).toBeLessThan(pendientesInicio)
  })
})
