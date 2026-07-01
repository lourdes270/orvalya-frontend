import { supabase } from './supabase'
import { normalizarRutContratante } from './validaciones'

export const MENSAJE_RUT_DUPLICADO = 'Este RUT ya está registrado en Orvalya'

const RUT_SIMBOLICOS = new Set(['pendiente_verificacion', 'tramite', 'sin_rut'])

export function esRutSimbolico(rut: string): boolean {
  return RUT_SIMBOLICOS.has(rut.trim().toLowerCase())
}

export async function rutYaRegistrado(
  rut: string,
  excludeUserId?: string,
): Promise<boolean> {
  const normalizado = normalizarRutContratante(rut)
  if (normalizado.length < 8 || esRutSimbolico(rut)) return false

  const { data, error } = await supabase.rpc('rut_ya_registrado', {
    p_rut: rut,
    p_exclude_user_id: excludeUserId ?? null,
  })

  if (error) {
    console.error('rut_ya_registrado:', error.message)
    throw error
  }

  return data === true
}
