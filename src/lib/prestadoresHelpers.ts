import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { SemaforoEstado } from '../types/prestadorPublico'

export type PrestadorLista = {
  id: string
  nombre: string | null
  zona: string | null
  descripcion: string | null
  avatar_url: string | null
  rango_edad: string | null
  sobre_mi: string | null
  tarifa_hora: number | null
  tarifa_modalidad: string | null
  semaforo: SemaforoEstado
}

export const PRESTADORES_POR_PAGINA = 12

const MODALIDAD_LABEL: Record<string, string> = {
  hora: 'hora',
  jornada: 'jornada',
  tarea: 'tarea',
}

/** "USD 5 / hora". Devuelve null si el prestador no publicó tarifa. */
export function formatTarifa(
  tarifaHora: number | null | undefined,
  modalidad: string | null | undefined,
): string | null {
  if (tarifaHora == null || Number.isNaN(tarifaHora) || tarifaHora <= 0) return null
  const monto = Number.isInteger(tarifaHora) ? String(tarifaHora) : tarifaHora.toFixed(2)
  const unidad = MODALIDAD_LABEL[modalidad ?? ''] ?? 'hora'
  return `USD ${monto} / ${unidad}`
}

export function totalPaginas(total: number, porPagina = PRESTADORES_POR_PAGINA): number {
  return Math.max(1, Math.ceil(total / porPagina))
}

export function paginar<T>(items: T[], pagina: number, porPagina = PRESTADORES_POR_PAGINA): T[] {
  const inicio = (pagina - 1) * porPagina
  return items.slice(inicio, inicio + porPagina)
}

/**
 * @param client permite pasar el cliente de servidor desde Server Components;
 *               por defecto usa el del navegador.
 */
export async function fetchPrestadoresPublico(
  zona?: string,
  rubro?: string,
  client: SupabaseClient = supabase,
): Promise<PrestadorLista[]> {
  const { data, error } = await client.rpc('fetch_prestadores_publico', {
    p_zona: zona ?? null,
    p_rubro: rubro ?? null,
  })

  if (error) {
    if (error.message?.includes('rate_limit_exceeded')) {
      throw new Error('Demasiadas solicitudes. Intentá de nuevo en unos minutos.')
    }
    console.error('fetch_prestadores_publico:', error)
    return []
  }

  if (!Array.isArray(data)) return []
  return data as PrestadorLista[]
}
