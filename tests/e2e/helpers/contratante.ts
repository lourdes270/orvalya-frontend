import type { Page } from '@playwright/test'

export async function fillContratanteNombre(page: Page, nombre: string): Promise<void> {
  await page.locator('div').filter({ hasText: 'Nombre de la empresa' }).locator('input').fill(nombre)
}

export async function fillContratanteRut(page: Page, rut: string): Promise<void> {
  await page.locator('input[placeholder="12345678"]').fill(rut)
}

export async function submitContratantePerfil(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Guardar y continuar' }).click()
}

export async function fillContratantePerfilMinimo(
  page: Page,
  opts: { nombre: string; rut: string; telefono?: string },
): Promise<void> {
  await fillContratanteNombre(page, opts.nombre)
  await fillContratanteRut(page, opts.rut)
  await page.locator('select').first().selectOption({ index: 1 })
  await page.locator('select').nth(1).selectOption({ label: 'Montevideo' })
  await page.getByPlaceholder('099123456').fill(opts.telefono ?? '099222333')
}
