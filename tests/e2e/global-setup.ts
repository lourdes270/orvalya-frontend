import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureE2EAdminUser } from './helpers/admin-e2e'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

dotenv.config({ path: path.join(root, '.env.e2e') })
dotenv.config({ path: path.join(root, '.env') })

export default async function globalSetup(): Promise<void> {
  const missing: string[] = []

  if (!process.env.E2E_SUPABASE_SERVICE_ROLE_KEY && !process.env.VITE_SUPABASE_URL) {
    missing.push('E2E_SUPABASE_SERVICE_ROLE_KEY o VITE_SUPABASE_URL')
  }
  if (!process.env.VITE_SUPABASE_ANON_KEY) {
    missing.push('VITE_SUPABASE_ANON_KEY')
  }

  if (missing.length > 0) {
    console.warn(`[e2e] Variables faltantes: ${missing.join(', ')}`)
    console.warn('[e2e] Copiá .env.e2e.example → .env.e2e y completá las credenciales.')
  }

  if (!process.env.E2E_SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[e2e] Sin service role: tests de registro/admin se omitirán.')
    return
  }

  try {
    await ensureE2EAdminUser()
  } catch (err) {
    console.error('[e2e] No se pudo crear el admin temporal:', err instanceof Error ? err.message : err)
    throw err
  }
}
