import { supabase } from './supabase'
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from '../config/legalVersions'
import { fetchClientIp, getUserAgent } from './clientMetadata'

export type AceptacionLegal = {
  version_terminos: string
  version_privacidad: string
  aceptado_en: string
}

/** Evita que el gate legal rebote a /aceptar-terminos antes de que Supabase responda. */
const aceptacionOptimista = new Set<string>()

export function marcarAceptacionLegalOptimista(userId: string): void {
  aceptacionOptimista.add(userId)
}

export function limpiarAceptacionLegalOptimista(userId: string): void {
  aceptacionOptimista.delete(userId)
}

export function tieneAceptacionLegalOptimista(userId: string): boolean {
  return aceptacionOptimista.has(userId)
}

export async function fetchLatestLegalAcceptance(userId: string): Promise<AceptacionLegal | null> {
  const { data, error } = await supabase
    .from('aceptaciones_legales')
    .select('version_terminos, version_privacidad, aceptado_en')
    .eq('user_id', userId)
    .order('aceptado_en', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('fetchLatestLegalAcceptance:', error)
    return null
  }
  return data
}

export function isLegalAcceptanceCurrent(row: AceptacionLegal | null): boolean {
  if (!row) return false
  return row.version_terminos === CURRENT_TERMS_VERSION
    && row.version_privacidad === CURRENT_PRIVACY_VERSION
}

export async function hasCurrentLegalAcceptance(userId: string): Promise<boolean> {
  if (aceptacionOptimista.has(userId)) return true
  const row = await fetchLatestLegalAcceptance(userId)
  const ok = isLegalAcceptanceCurrent(row)
  if (ok) aceptacionOptimista.add(userId)
  return ok
}

export async function insertLegalAcceptance(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('aceptaciones_legales').insert({
    user_id: userId,
    version_terminos: CURRENT_TERMS_VERSION,
    version_privacidad: CURRENT_PRIVACY_VERSION,
    ip_address: await fetchClientIp(),
    user_agent: getUserAgent(),
  })

  if (error) {
    limpiarAceptacionLegalOptimista(userId)
    const msg = error.code === 'PGRST205'
      ? 'Tabla aceptaciones_legales no existe. Aplicá la migración 001 en Supabase.'
      : error.message
    return { error: msg }
  }
  marcarAceptacionLegalOptimista(userId)
  return { error: null }
}
