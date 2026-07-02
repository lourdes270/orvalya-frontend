export const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'OrvalyaE2E2026!'

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? ''
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? TEST_PASSWORD

export const EXISTING_RUT = process.env.E2E_EXISTING_RUT ?? '123456789012'

export function uniqueEmail(prefix: string): string {
  const stamp = `${Date.now()}.${Math.random().toString(36).slice(2, 8)}`
  return `${prefix}.${stamp}@e2e.orvalya.test`
}

export function uniqueRut(): string {
  const base = String(Date.now()).slice(-8)
  return `${base}0012`.slice(0, 12)
}

export const UPLOAD_REJECTION_MESSAGE =
  'El archivo debe ser PDF, JPG, PNG o WEBP y no superar los 5 MB.'

export const RUT_DUPLICADO_MSG = 'Este RUT ya está registrado en Orvalya'

export const FAKE_REGISTRATION_SUCCESS_MSG =
  'Te enviamos un correo para confirmar tu cuenta. Revisá tu bandeja de entrada.'

export function hasServiceRole(): boolean {
  return Boolean(process.env.E2E_SUPABASE_SERVICE_ROLE_KEY)
}
