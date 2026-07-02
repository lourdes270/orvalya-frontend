import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { removeE2EAdminUser } from './helpers/admin-e2e'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

dotenv.config({ path: path.join(root, '.env.e2e') })
dotenv.config({ path: path.join(root, '.env') })

export default async function globalTeardown(): Promise<void> {
  if (!process.env.E2E_SUPABASE_SERVICE_ROLE_KEY) return
  await removeE2EAdminUser()
}
