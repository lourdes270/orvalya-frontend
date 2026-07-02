import type { User } from '@supabase/supabase-js'

export const REGISTRO_TIPO_KEY = 'orvalya_registro_tipo'
const METADATA_REGISTRO_TIPO = 'registro_tipo'

export type RegistroTipo = 'contratante' | 'prestador'

export function esRegistroContratante(): boolean {
  return esIntentoRegistroContratante()
}

/** Contratante: sessionStorage, localStorage, query ?registro=contratante o user_metadata. */
export function esIntentoRegistroContratante(user?: User | null): boolean {
  if (sessionStorage.getItem(REGISTRO_TIPO_KEY) === 'contratante') return true
  if (localStorage.getItem(REGISTRO_TIPO_KEY) === 'contratante') return true
  if (user?.user_metadata?.[METADATA_REGISTRO_TIPO] === 'contratante') return true
  return false
}

export function capturarRegistroDesdeUrl(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  if (params.get('registro') === 'contratante') {
    marcarRegistroContratante()
  }
}

export function marcarRegistroContratante(): void {
  sessionStorage.setItem(REGISTRO_TIPO_KEY, 'contratante')
  localStorage.setItem(REGISTRO_TIPO_KEY, 'contratante')
}

export function limpiarRegistroContratante(): void {
  sessionStorage.removeItem(REGISTRO_TIPO_KEY)
  localStorage.removeItem(REGISTRO_TIPO_KEY)
}

export function metadataRegistroContratante(): Record<string, string> {
  return { [METADATA_REGISTRO_TIPO]: 'contratante' }
}
