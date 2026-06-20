import { supabase } from './supabase'
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from '../config/legalVersions'
import { fetchClientIp, getUserAgent } from './clientMetadata'

export type AceptacionLegal = {
  version_terminos: string
  version_privacidad: string
  aceptado_en: string
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
  const row = await fetchLatestLegalAcceptance(userId)
  return isLegalAcceptanceCurrent(row)
}

export async function insertLegalAcceptance(userId: string): Promise<{ error: string | null }> {
  const [ipAddress] = await Promise.all([fetchClientIp()])
  const { error } = await supabase.from('aceptaciones_legales').insert({
    user_id: userId,
    version_terminos: CURRENT_TERMS_VERSION,
    version_privacidad: CURRENT_PRIVACY_VERSION,
    ip_address: ipAddress,
    user_agent: getUserAgent(),
  })

  if (error) {
    const msg = error.code === 'PGRST205'
      ? 'Tabla aceptaciones_legales no existe. Aplicá la migración 001 en Supabase.'
      : error.message
    return { error: msg }
  }
  return { error: null }
}
