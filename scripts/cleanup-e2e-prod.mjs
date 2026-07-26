#!/usr/bin/env node
/**
 * cleanup-e2e-prod.mjs
 *
 * Script ONE-SHOT para limpiar llamados E2E que quedaron en producción.
 * Busca llamados cuyo título empieza con 'E2E ' pertenecientes a la cuenta
 * lourdes.graciela.mendaro@gmail.com y los elimina SÓLO con confirmación explícita.
 *
 * Uso:
 *   E2E_SUPABASE_URL=https://xxx.supabase.co \
 *   E2E_SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/cleanup-e2e-prod.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { createInterface } from 'readline'

const TARGET_EMAIL = 'lourdes.graciela.mendaro@gmail.com'
const PREFIJO_E2E = 'E2E '

// ── Validar variables de entorno ──────────────────────────────────────────────

const SUPABASE_URL = process.env.E2E_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Faltan variables de entorno:')
  console.error('    E2E_SUPABASE_URL (o VITE_SUPABASE_URL)')
  console.error('    E2E_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function prompt(question) {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍  Buscando usuario:', TARGET_EMAIL)

  // 1. Buscar el usuario en auth.users
  const { data: authData, error: authError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (authError) throw authError

  const targetUser = authData.users.find(u => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase())
  if (!targetUser) {
    console.error(`❌  No se encontró ningún usuario con email ${TARGET_EMAIL}`)
    process.exit(1)
  }
  console.log(`✅  Usuario encontrado: ${targetUser.id}`)

  // 2. Buscar su contratante_id
  const { data: contratante, error: contError } = await admin
    .from('contratantes')
    .select('id')
    .eq('id', targetUser.id)
    .maybeSingle()

  if (contError) throw contError
  if (!contratante) {
    console.error(`❌  El usuario no tiene perfil de contratante`)
    process.exit(1)
  }
  const contratanteId = contratante.id

  // 3. Buscar llamados E2E de ese contratante
  const { data: llamados, error: fetchError } = await admin
    .from('llamados')
    .select('id, titulo, estado, created_at')
    .eq('contratante_id', contratanteId)
    .like('titulo', `${PREFIJO_E2E}%`)
    .order('created_at', { ascending: false })

  if (fetchError) throw fetchError

  if (!llamados || llamados.length === 0) {
    console.log(`\n✅  No se encontraron llamados E2E para ${TARGET_EMAIL}. Nada que limpiar.`)
    process.exit(0)
  }

  // 4. Mostrar lo que se va a borrar
  console.log(`\n⚠️   Se encontraron ${llamados.length} llamado(s) E2E para ${TARGET_EMAIL}:\n`)
  for (const l of llamados) {
    console.log(`   • [${l.id}]  "${l.titulo}"  (estado: ${l.estado}, creado: ${new Date(l.created_at).toLocaleString('es-UY')})`)
  }

  // 5. Pedir confirmación explícita
  console.log('\n⚠️   ATENCIÓN: Esto borrará permanentemente esos registros en PRODUCCIÓN.')
  const respuesta = await prompt('\n   Escribí exactamente "CONFIRMAR" para continuar, o cualquier otra cosa para cancelar: ')

  if (respuesta !== 'CONFIRMAR') {
    console.log('\n🚫  Operación cancelada. No se borró nada.')
    process.exit(0)
  }

  // 6. Borrar
  const ids = llamados.map(l => l.id)
  const { error: deleteError } = await admin
    .from('llamados')
    .delete()
    .in('id', ids)

  if (deleteError) throw deleteError

  console.log(`\n✅  ${ids.length} llamado(s) eliminado(s) correctamente.`)
}

main().catch(err => {
  console.error('\n❌  Error inesperado:', err instanceof Error ? err.message : err)
  process.exit(1)
})
