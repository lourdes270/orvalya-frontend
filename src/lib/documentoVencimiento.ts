/** Umbrales de aviso (días antes del vencimiento). 0 = vence hoy. */
export const UMBRALES_AVISO_DIAS = [30, 15, 7, 0] as const

export type EstadoTemporalDoc =
  | 'faltante'
  | 'al_dia'
  | 'por_vencer'
  | 'vencido'

export type ResumenDocumentos = {
  totalRequeridos: number
  cargados: number
  alDia: number
  porVencer: number
  vencidos: number
  faltantes: number
  proximoVencimiento: string | null
  diasProximo: number | null
}

export function diasHastaVencimiento(fechaVencimiento: string | null | undefined, hoy = new Date()): number | null {
  if (!fechaVencimiento?.trim()) return null
  const raw = fechaVencimiento.slice(0, 10)
  const [y, m, d] = raw.split('-').map(Number)
  if (!y || !m || !d) return null
  const venc = new Date(y, m - 1, d)
  const start = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return Math.round((venc.getTime() - start.getTime()) / 86_400_000)
}

export function estadoTemporalDocumento(opts: {
  subido: boolean
  fechaVencimiento?: string | null
  umbralPorVencer?: number
}): EstadoTemporalDoc {
  if (!opts.subido) return 'faltante'
  const dias = diasHastaVencimiento(opts.fechaVencimiento)
  if (dias == null) return 'al_dia'
  if (dias < 0) return 'vencido'
  if (dias <= (opts.umbralPorVencer ?? 30)) return 'por_vencer'
  return 'al_dia'
}

export function labelEstadoTemporal(estado: EstadoTemporalDoc, dias: number | null): string {
  if (estado === 'faltante') return 'Pendiente'
  if (estado === 'vencido') return dias != null ? `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? '' : 's'}` : 'Vencido'
  if (estado === 'por_vencer') {
    if (dias === 0) return 'Vence hoy'
    if (dias === 1) return 'Vence mañana'
    return `Vence en ${dias} días`
  }
  return 'Al día'
}

export function colorEstadoTemporal(estado: EstadoTemporalDoc): { bg: string; color: string; accent: string } {
  if (estado === 'vencido') return { bg: '#FDECEC', color: '#B42318', accent: '#F04438' }
  if (estado === 'por_vencer') return { bg: '#FFFAEB', color: '#B54708', accent: '#F79009' }
  if (estado === 'al_dia') return { bg: '#ECFDF3', color: '#027A48', accent: '#12B76A' }
  return { bg: '#F2F4F7', color: '#475467', accent: '#98A2B3' }
}

export function resumenDocumentos(
  items: Array<{ subido: boolean; fechaVencimiento?: string | null }>,
  totalRequeridos: number,
): ResumenDocumentos {
  let alDia = 0
  let porVencer = 0
  let vencidos = 0
  let faltantes = 0
  let proximoVencimiento: string | null = null
  let diasProximo: number | null = null

  for (const item of items) {
    const estado = estadoTemporalDocumento(item)
    const dias = diasHastaVencimiento(item.fechaVencimiento)
    if (estado === 'faltante') faltantes += 1
    else if (estado === 'vencido') vencidos += 1
    else if (estado === 'por_vencer') porVencer += 1
    else alDia += 1

    if (item.subido && dias != null && dias >= 0) {
      if (diasProximo == null || dias < diasProximo) {
        diasProximo = dias
        proximoVencimiento = item.fechaVencimiento?.slice(0, 10) ?? null
      }
    }
  }

  return {
    totalRequeridos,
    cargados: totalRequeridos - faltantes,
    alDia,
    porVencer,
    vencidos,
    faltantes,
    proximoVencimiento,
    diasProximo,
  }
}

/** Semáforo comercial: prioriza vencidos y faltantes. */
export function semaforoDesdeResumen(r: ResumenDocumentos): 'verde' | 'amarillo' | 'rojo' {
  if (r.vencidos > 0 || r.cargados === 0) return 'rojo'
  if (r.faltantes > 0 || r.porVencer > 0) return 'amarillo'
  if (r.alDia >= r.totalRequeridos) return 'verde'
  return 'amarillo'
}

export function formatFechaUy(isoDate: string | null | undefined): string {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.slice(0, 10).split('-')
  if (!y || !m || !d) return isoDate
  return `${d}/${m}/${y}`
}
