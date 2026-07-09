import type { Page } from '@playwright/test'

export async function fillContratanteNombre(page: Page, nombre: string): Promise<void> {
  const form = page.locator('form').filter({ has: page.getByRole('button', { name: 'Guardar y continuar' }) })
  await form.locator('input[type="text"]').first().fill(nombre)
}

export async function fillContratanteRut(page: Page, rut: string): Promise<void> {
  await page.locator('input[placeholder="12345678"]').fill(rut)
}

export async function submitContratantePerfil(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Guardar y continuar' }).click()
}

/** Campos obligatorios excepto RUT — evita que la validación nativa del navegador bloquee el submit. */
export async function fillContratanteCamposRequeridos(
  page: Page,
  opts?: { nombre?: string; telefono?: string },
): Promise<void> {
  await fillContratanteNombre(page, opts?.nombre ?? 'Empresa Test E2E')
  await page.locator('select').first().selectOption({ index: 1 })
  await page.locator('select').nth(1).selectOption({ label: 'Montevideo' })
  await page.getByPlaceholder('099123456').fill(opts?.telefono ?? '099222333')
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
