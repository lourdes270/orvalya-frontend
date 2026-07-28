/**
 * Diagnóstico read-only: compara auth.users.email vs perfiles.email.
 * Equivale al SELECT comentado en 015_sync_perfiles_email.sql.
 * No modifica nada.
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.e2e' })

const url = process.env.E2E_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Faltan credenciales en .env.e2e')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

async function main() {
  const usuarios = new Map<string, string | null>()
  let page = 1
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    for (const u of data.users) usuarios.set(u.id, u.email ?? null)
    if (data.users.length < 1000) break
    page++
  }

  const { data: perfiles, error: perfilesError } = await admin
    .from('perfiles')
    .select('id, email, nombre, tipo')
  if (perfilesError) throw perfilesError

  console.log(`auth.users: ${usuarios.size} | perfiles: ${perfiles.length}`)
  console.log('--- Desincronizados (auth.email != perfiles.email) ---')
  let count = 0
  for (const p of perfiles) {
    if (!usuarios.has(p.id)) {
      console.log(`HUÉRFANO: perfil ${p.id} (${p.email}) sin usuario en auth.users`)
      continue
    }
    const authEmail = usuarios.get(p.id)
    if (authEmail && authEmail.toLowerCase() !== (p.email ?? '').toLowerCase()) {
      count++
      console.log(`id=${p.id} tipo=${p.tipo} nombre="${p.nombre}"`)
      console.log(`  auth.email   = ${authEmail}`)
      console.log(`  perfil.email = ${p.email}`)
    }
  }
  console.log(`--- Total desincronizados: ${count} ---`)
}

main().catch(err => { console.error(err); process.exit(1) })
