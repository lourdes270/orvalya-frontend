import { getAdminClient, deleteUserByEmail, findUserByEmail } from './supabase-admin'

export const E2E_ADMIN_TEST_EMAIL = 'admin-test-e2e@orvalya.com'
export const E2E_ADMIN_TEST_PASSWORD = 'AdminE2E2026!'

const TERMS_VERSION = '2026-06-19'
const PRIVACY_VERSION = '2026-06-19'
const TRIGGER_WAIT_MS = 2000

async function upsertAdminPerfil(userId: string, email: string): Promise<void> {
  const admin = getAdminClient()

  await admin.from('perfiles').delete().eq('id', userId)

  const { error: insertError } = await admin.from('perfiles').insert({
    id: userId,
    email,
    tipo: 'prestador',
    es_admin: true,
    declaracion_jurada_aceptada: false,
    suscripcion_activa: false,
  })

  if (insertError) throw insertError
}

async function seedLegalAcceptance(userId: string): Promise<void> {
  const admin = getAdminClient()
  const { data: existing } = await admin
    .from('aceptaciones_legales')
    .select('id')
    .eq('user_id', userId)
    .eq('version_terminos', TERMS_VERSION)
    .eq('version_privacidad', PRIVACY_VERSION)
    .maybeSingle()

  if (existing?.id) return

  const { error } = await admin.from('aceptaciones_legales').insert({
    user_id: userId,
    version_terminos: TERMS_VERSION,
    version_privacidad: PRIVACY_VERSION,
    ip_address: '127.0.0.1',
    user_agent: 'playwright-e2e',
  })

  if (error) throw error
}

export async function ensureE2EAdminUser(): Promise<void> {
  const admin = getAdminClient()

  await deleteUserByEmail(E2E_ADMIN_TEST_EMAIL).catch(() => {})

  const { data, error } = await admin.auth.admin.createUser({
    email: E2E_ADMIN_TEST_EMAIL,
    password: E2E_ADMIN_TEST_PASSWORD,
    email_confirm: true,
  })

  if (error) throw error
  const userId = data.user?.id
  if (!userId) throw new Error('No se pudo crear el usuario admin E2E')

  await new Promise(r => setTimeout(r, TRIGGER_WAIT_MS))
  await upsertAdminPerfil(userId, E2E_ADMIN_TEST_EMAIL)
  await seedLegalAcceptance(userId)

  const user = await findUserByEmail(E2E_ADMIN_TEST_EMAIL)
  if (!user) throw new Error('Usuario admin E2E no encontrado tras crearlo')

  const { data: perfil, error: perfilError } = await admin
    .from('perfiles')
    .select('es_admin')
    .eq('id', user.id)
    .single()

  if (perfilError) throw perfilError
  if (!perfil?.es_admin) {
    throw new Error('No se pudo marcar es_admin=true en el usuario admin E2E')
  }

  console.log(`[e2e] Admin temporal listo: ${E2E_ADMIN_TEST_EMAIL}`)
}

export async function removeE2EAdminUser(): Promise<void> {
  await deleteUserByEmail(E2E_ADMIN_TEST_EMAIL).catch(err => {
    console.warn('[e2e] teardown admin:', err instanceof Error ? err.message : err)
  })
  console.log(`[e2e] Admin temporal eliminado: ${E2E_ADMIN_TEST_EMAIL}`)
}
