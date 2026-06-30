export const REGISTRO_TIPO_KEY = 'orvalya_registro_tipo'

export type RegistroTipo = 'contratante' | 'prestador'

export function esRegistroContratante(): boolean {
  return sessionStorage.getItem(REGISTRO_TIPO_KEY) === 'contratante'
}

export function marcarRegistroContratante(): void {
  sessionStorage.setItem(REGISTRO_TIPO_KEY, 'contratante')
}

export function limpiarRegistroContratante(): void {
  sessionStorage.removeItem(REGISTRO_TIPO_KEY)
}
