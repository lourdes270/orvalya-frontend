import { test } from '@playwright/test'

export function skipWithoutServiceRole(): void {
  test.skip(
    !process.env.E2E_SUPABASE_SERVICE_ROLE_KEY,
    'Configurá E2E_SUPABASE_SERVICE_ROLE_KEY en .env.e2e',
  )
}

export function skipWithoutAdmin(): void {
  skipWithoutServiceRole()
  test.skip(!process.env.E2E_ADMIN_EMAIL, 'Configurá E2E_ADMIN_EMAIL en .env.e2e')
}
