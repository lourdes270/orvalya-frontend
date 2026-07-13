import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { TEST_PASSWORD, uniqueEmail } from './env'

let adminClient: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient

  const url = process.env.E2E_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Faltan E2E_SUPABASE_URL y E2E_SUPABASE_SERVICE_ROLE_KEY para tests E2E.')
  }

  adminClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return adminClient
}

export async function findUserByEmail(email: string) {
  const admin = getAdminClient()
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw error
  return data.users.find(u => u.email?.toLowerCase() === email.toLowerCase()) ?? null
}

export async function confirmUserEmail(email: string): Promise<void> {
  const user = await findUserByEmail(email)
  if (!user) throw new Error(`Usuario no encontrado para confirmar: ${email}`)
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(user.id, { email_confirm: true })
  if (error) throw error
}

export async function deleteUserByEmail(email: string): Promise<void> {
  const user = await findUserByEmail(email)
  if (!user) return
  const admin = getAdminClient()
  await admin.from('contratantes').delete().eq('id', user.id)
  await admin.from('perfiles').delete().eq('id', user.id)
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw error
}

export async function getPerfilField(userId: string, field: string): Promise<unknown> {
  const admin = getAdminClient()
  const { data, error } = await admin.from('perfiles').select(field).eq('id', userId).single()
  if (error) throw error
  return (data as Record<string, unknown>)[field]
}

export async function ensureAdminFlag(email: string): Promise<void> {
  const user = await findUserByEmail(email)
  if (!user) return
  const admin = getAdminClient()
  await admin.from('perfiles').update({ es_admin: true }).eq('id', user.id)
}

export async function insertLlamadoPendiente(
  contratanteId: string,
  titulo: string,
): Promise<string> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('llamados')
    .insert({
      contratante_id: contratanteId,
      titulo,
      descripcion: 'Llamado de prueba E2E para moderación.',
      rubro: 'limpieza',
      zona: 'Montevideo',
      estado: 'pendiente_moderacion',
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function countLlamadosPendientes(): Promise<number> {
  const admin = getAdminClient()
  const { count, error } = await admin
    .from('llamados')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente_moderacion')
  if (error) throw error
  return count ?? 0
}

/** Garantiza un contratante con el RUT indicado para probar duplicados. */
export async function ensureContratanteWithRut(rut: string): Promise<void> {
  const admin = getAdminClient()
  const normalizado = rut.replace(/\D/g, '')

  const { data: existing } = await admin
    .from('contratantes')
    .select('id')
    .eq('rut', normalizado)
    .maybeSingle()
  if (existing) return

  const email = uniqueEmail('rut-seed')
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  })
  if (createError) throw createError

  const userId = created.user.id
  await new Promise(resolve => setTimeout(resolve, 1500))

  await admin.from('perfiles').update({ tipo: 'contratante', email }).eq('id', userId)

  const { error: insertError } = await admin.from('contratantes').insert({
    id: userId,
    nombre_empresa: 'Empresa Seed E2E',
    rut: normalizado,
    tipo_contratante: 'empresa',
    rubro_principal: 'limpieza',
    zona: 'Montevideo',
    email,
    telefono: '099111222',
  })
  if (insertError) throw insertError
}

export const E2E_MODERACION_CONTRATANTE_EMAIL = 'moderacion-fixture@e2e.orvalya.test'

/** Contratante dedicado para tests de moderación (no usa cuentas reales). */
export async function ensureE2EModeracionContratante(): Promise<string> {
  const admin = getAdminClient()
  const email = E2E_MODERACION_CONTRATANTE_EMAIL

  let user = await findUserByEmail(email)
  if (!user) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    })
    if (createError) throw createError
    user = created.user
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  const userId = user.id
  await admin.from('perfiles').update({ tipo: 'contratante', email }).eq('id', userId)

  const { data: contratante } = await admin
    .from('contratantes')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (!contratante?.id) {
    const rut = `9999${String(Date.now()).slice(-8)}`
    const { error: insertError } = await admin.from('contratantes').insert({
      id: userId,
      nombre_empresa: 'Fixture E2E Moderación',
      rut,
      tipo_contratante: 'empresa',
      rubro_principal: 'limpieza',
      zona: 'Montevideo',
      email,
      telefono: '099000111',
    })
    if (insertError) throw insertError
  }

  return userId
}

export async function deleteLlamadoByTitulo(titulo: string): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin.from('llamados').delete().eq('titulo', titulo)
  if (error) throw error
}

export async function deleteLlamadosE2ELegacy(): Promise<number> {
  const admin = getAdminClient()
  let total = 0

  for (const patron of ['E2E Moderación%', 'E2E Llamado%']) {
    const { data: rows, error: selectError } = await admin
      .from('llamados')
      .select('id')
      .like('titulo', patron)
    if (selectError) throw selectError
    if (!rows?.length) continue

    const ids = rows.map(r => r.id as string)
    const { error: deleteError } = await admin.from('llamados').delete().in('id', ids)
    if (deleteError) throw deleteError
    total += ids.length
  }

  return total
}
