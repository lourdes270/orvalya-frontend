import { test, expect } from '@playwright/test'
import { loginWithEmail } from './helpers/auth'
import { ADMIN_EMAIL, ADMIN_PASSWORD, TEST_PASSWORD } from './helpers/env'
import {
  countLlamadosPendientes,
  findUserByEmail,
  insertLlamadoPendiente,
} from './helpers/supabase-admin'
import { skipWithoutAdmin } from './helpers/skip'

test.describe.serial('Admin — flujo completo', () => {
  const llamadoTitulo = `E2E Moderación ${Date.now()}`
  let pendientesAntes = 0

  test.beforeEach(() => {
    skipWithoutAdmin()
  })

  test.beforeAll(async () => {
    if (!process.env.E2E_SUPABASE_SERVICE_ROLE_KEY || !ADMIN_EMAIL) return

    try {
      pendientesAntes = await countLlamadosPendientes()

      const adminUser = await findUserByEmail(ADMIN_EMAIL)
      if (!adminUser) return

      const { getAdminClient } = await import('./helpers/supabase-admin')
      const admin = getAdminClient()
      const { data: contratante } = await admin
        .from('contratantes')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (contratante?.id) {
        await insertLlamadoPendiente(contratante.id as string, llamadoTitulo)
      }
    } catch (err) {
      console.warn('[e2e admin] beforeAll:', err instanceof Error ? err.message : err)
    }
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
