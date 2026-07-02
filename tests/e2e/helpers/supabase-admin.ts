import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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
