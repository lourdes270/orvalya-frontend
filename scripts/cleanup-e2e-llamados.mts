/**
 * Elimina llamados E2E que quedaron en la BD (títulos "E2E Moderación..." / "E2E Llamado...").
 * Requiere E2E_SUPABASE_SERVICE_ROLE_KEY en .env.e2e o variables de entorno.
 */
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deleteLlamadosE2ELegacy } from '../tests/e2e/helpers/supabase-admin'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(root, '.env.e2e') })
dotenv.config({ path: path.join(root, '.env') })

async function main() {
  if (!process.env.E2E_SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Falta E2E_SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const eliminados = await deleteLlamadosE2ELegacy()
  console.log(`Llamados E2E eliminados: ${eliminados}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
