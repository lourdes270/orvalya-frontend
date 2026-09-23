import type { CSSProperties } from 'react'

/** Rubros que conviene mostrar primero (volumen / demanda). */
export const RUBROS_DESTACADOS_IDS = ['limpieza', 'cuidados', 'oficios', 'gastronomia'] as const

export const NIVELES_FORMACION = [
  { value: '', label: 'Preferir no indicar' },
  { value: 'Primaria', label: 'Primaria' },
  { value: 'Secundaria / Bachillerato', label: 'Secundaria / Bachillerato' },
  { value: 'UTU / Técnico', label: 'UTU / Técnico-profesional' },
  { value: 'Terciaria / Universidad', label: 'Terciaria / Universidad' },
  { value: 'Cursos / Capacitaciones', label: 'Cursos / Capacitaciones' },
] as const

export const PAISES_TELEFONO = [
  { code: 'UY', dial: '598', label: 'UY +598', flag: '🇺🇾' },
  { code: 'AR', dial: '54', label: 'AR +54', flag: '🇦🇷' },
  { code: 'BR', dial: '55', label: 'BR +55', flag: '🇧🇷' },
  { code: 'PY', dial: '595', label: 'PY +595', flag: '🇵🇾' },
  { code: 'CL', dial: '56', label: 'CL +56', flag: '🇨🇱' },
] as const

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const

export function opcionesDia(): number[] {
  return Array.from({ length: 31 }, (_, i) => i + 1)
}

export function opcionesMes(): { value: number; label: string }[] {
  return MESES.map((label, i) => ({ value: i + 1, label }))
}

export function opcionesAnioNacimiento(desde = 1945): number[] {
  const hasta = new Date().getFullYear() - 14
  const years: number[] = []
  for (let y = hasta; y >= desde; y--) years.push(y)
  return years
}

/** Convierte fecha de nacimiento a los rangos que ya usa el perfil. */
export function rangoEdadDesdeFecha(dia: number, mes: number, anio: number): string {
  if (!dia || !mes || !anio) return ''
  const hoy = new Date()
  const nac = new Date(anio, mes - 1, dia)
  if (Number.isNaN(nac.getTime())) return ''
  let edad = hoy.getFullYear() - anio
  const m = hoy.getMonth() - (mes - 1)
  if (m < 0 || (m === 0 && hoy.getDate() < dia)) edad -= 1
  if (edad < 18) return '18-25'
  if (edad <= 25) return '18-25'
  if (edad <= 35) return '26-35'
  if (edad <= 45) return '36-45'
  if (edad <= 55) return '46-55'
  return '55+'
}

export const selectFacilStyle = (isMobile: boolean): CSSProperties => ({
  width: '100%',
  height: isMobile ? '52px' : '44px',
  padding: '0 12px',
  border: '1.5px solid #DEE2E6',
  borderRadius: '8px',
  fontSize: isMobile ? '16px' : '14px',
  color: '#212529',
  background: '#fff',
  boxSizing: 'border-box',
})
