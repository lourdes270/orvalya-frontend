import { test, expect } from '@playwright/test'
import {
  acceptLegalTerms,
  loginWithEmail,
  registerAndAuthenticate,
} from './helpers/auth'
import { setRegistroContratante } from './helpers/mocks'
import {
  EXISTING_RUT,
  RUT_DUPLICADO_MSG,
  TEST_PASSWORD,
  uniqueEmail,
  uniqueRut,
} from './helpers/env'
import { deleteUserByEmail, ensureContratanteWithRut } from './helpers/supabase-admin'
import {
  fillContratanteCamposRequeridos,
  fillContratanteNombre,
  fillContratantePerfilMinimo,
  fillContratanteRut,
  submitContratantePerfil,
} from './helpers/contratante'
import { skipWithoutServiceRole } from './helpers/skip'

test.describe.serial('Contratante — flujo completo', () => {
  const email = uniqueEmail('contratante')
  const password = TEST_PASSWORD
  const rut = uniqueRut()
  const llamadoTitulo = `Llamado Test ${Date.now()}`

  test.beforeEach(() => {
    skipWithoutServiceRole()
  })

  test.afterAll(async () => {
    await deleteUserByEmail(email).catch(() => {})
  })

  test('registro como contratante en /auth', async ({ page }) => {
    await setRegistroContratante(page)
    await registerAndAuthenticate(page, email, password)
    await expect(page).toHaveURL(/\/aceptar-terminos/)
  })

  test('aceptación de términos y redirección a perfil', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await page.waitForURL(/\/(aceptar-terminos|contratante\/perfil)/, { timeout: 20_000 })
    if (page.url().includes('/aceptar-terminos')) {
      await acceptLegalTerms(page)
    }
    await expect(page).toHaveURL(/\/contratante\/perfil/, { timeout: 20_000 })
  })

  test('validación RUT solo números (letras filtradas)', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await page.goto('/contratante/perfil')
    await expect(page).toHaveURL(/\/contratante\/perfil/)

    await fillContratanteCamposRequeridos(page)
    await fillContratanteRut(page, '12ABC34')
    await expect(page.locator('input[placeholder="12345678"]')).toHaveValue('1234')
    await submitContratantePerfil(page)
    await expect(page.getByText('al menos 8 dígitos', { exact: false })).toBeVisible()
  })

  test('validación RUT menos de 8 dígitos', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await page.goto('/contratante/perfil')

    await fillContratanteCamposRequeridos(page)
    await fillContratanteRut(page, '1234567')
    await submitContratantePerfil(page)
    await expect(page.getByText('al menos 8 dígitos', { exact: false })).toBeVisible()
  })

  test('validación RUT duplicado', async ({ page }) => {
    await ensureContratanteWithRut(EXISTING_RUT)
    await loginWithEmail(page, email, password)
    await page.goto('/contratante/perfil')
    await expect(page).toHaveURL(/\/contratante\/perfil/)

    await fillContratanteNombre(page, 'Otra Empresa E2E')
    await fillContratanteRut(page, EXISTING_RUT)
    await page.locator('select').first().selectOption({ index: 1 })
    await page.locator('select').nth(1).selectOption({ label: 'Montevideo' })
    await page.getByPlaceholder('099123456').fill('099333444')
    await submitContratantePerfil(page)

    await expect(page.getByText(RUT_DUPLICADO_MSG)).toBeVisible()
  })

  test('completar perfil de empresa', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await page.goto('/contratante/perfil')

    await fillContratantePerfilMinimo(page, { nombre: 'Empresa E2E SA', rut })
    await submitContratantePerfil(page)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('publicar llamado y estado pendiente de moderación', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await expect(page).toHaveURL(/\/dashboard/)

    await page.getByPlaceholder('Ej: Limpieza de oficinas en Carrasco').fill(llamadoTitulo)
    await page.getByPlaceholder('Detalle del trabajo, frecuencia, requisitos...').fill(
      'Necesitamos limpieza semanal en oficinas.',
    )
    await page.locator('select').first().selectOption('limpieza')
    await page.locator('select').nth(1).selectOption('Montevideo')
    await page.getByRole('button', { name: 'Publicar llamado' }).click()

    await expect(page.getByText('Pendiente de moderación')).toBeVisible()
    await expect(page.getByText(llamadoTitulo)).toBeVisible()
  })

  test('editar llamado propio', async ({ page }) => {
    await loginWithEmail(page, email, password)
    await expect(page).toHaveURL(/\/dashboard/)

    const tituloEditado = `${llamadoTitulo} (editado)`

    // Encontrar la card por título visible y abrir modo edición
    const card = page.locator('article').filter({ hasText: llamadoTitulo })
    await expect(card).toBeVisible({ timeout: 20_000 })
    await card.getByRole('button', { name: 'Editar' }).click()

    // Tras el click, el título pasa a ser el value de un input (no texto visible),
    // así que la locator anterior deja de matchear. Usamos el heading "Editar llamado"
    // que sólo aparece cuando el formulario de edición está activo.
    const editCard = page.locator('article').filter({ hasText: 'Editar llamado' })
    await editCard.getByPlaceholder('Ej: Limpieza de oficinas en Carrasco').fill(tituloEditado)
    await editCard.getByRole('button', { name: 'Guardar cambios' }).click()

    // Verificar que el edit fue persistido: el artículo vuelve a modo lectura
    // con el título actualizado. No usamos el mensaje transitorio "Cambios guardados."
    // porque en React 18 puede perderse entre renders si el ciclo es rápido.
    const cardEditada = page.locator('article').filter({ hasText: tituloEditado })
    await expect(cardEditada).toBeVisible({ timeout: 20_000 })
    await expect(cardEditada.getByRole('button', { name: 'Editar' })).toBeVisible()
  })
})
