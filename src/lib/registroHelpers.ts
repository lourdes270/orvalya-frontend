import { supabase } from './supabase'
import type { Perfil } from '../contexts/AuthContextType'

const TRIGGER_WAIT_MS = 1500

export async function esperarPerfilTrigger(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, TRIGGER_WAIT_MS))
}

export async function activarPerfilContratante(email: string): Promise<Perfil> {
  await esperarPerfilTrigger()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No autenticado')

  const { error: updateError } = await supabase
    .from('perfiles')
    .update({ tipo: 'contratante', email: email.trim() })
    .eq('id', user.id)

  if (updateError) throw updateError

  const { data, error: fetchError } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (fetchError || !data) throw fetchError ?? new Error('Perfil no encontrado')
  return data as Perfil
}

export async function refrescarPerfil(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Perfil
}
