import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { getRubroLabel } from '../vistas/onboarding/data/rubros'
import { slugify } from './seo'

export type LlamadoPublico = {
  id: string
  titulo: string
  descripcion: string
  rubro: string
  zona: string
  created_at: string
  expires_at: string | null
  publicado_por: string
  tipo_contratante: 'empresa' | 'persona_fisica'
}

export const LLAMADOS_POR_PAGINA = 12

export async function fetchLlamadosPublico(
  zona?: string,
  rubro?: string,
  client: SupabaseClient = supabase,
): Promise<LlamadoPublico[]> {
  const { data, error } = await client.rpc('fetch_llamados_publico', {
    p_zona: zona ?? null,
    p_rubro: rubro ?? null,
  })

  if (error) {
    if (error.message?.includes('rate_limit_exceeded')) {
      throw new Error('Demasiadas solicitudes. Intentá de nuevo en unos minutos.')
    }
    console.error('fetch_llamados_publico:', error)
    return []
  }
  return Array.isArray(data) ? (data as LlamadoPublico[]) : []
}

export async function fetchLlamadoPublico(
  id: string,
  client: SupabaseClient = supabase,
): Promise<LlamadoPublico | null> {
  const { data, error } = await client.rpc('fetch_llamado_publico', { p_id: id })
  if (error) {
    if (error.message?.includes('rate_limit_exceeded')) {
      throw new Error('Demasiadas solicitudes. Intentá de nuevo en unos minutos.')
    }
    console.error('fetch_llamado_publico:', error)
    return null
  }
  if (!data || typeof data !== 'object') return null
  return data as LlamadoPublico
}

export function llamadoRubroLabel(rubro: string): string {
  return getRubroLabel(rubro)
}

export function llamadoSlug(l: Pick<LlamadoPublico, 'id' | 'titulo' | 'zona'>): string {
  const base = [l.titulo, l.zona].map(x => slugify(x ?? '')).filter(Boolean).join('-')
  return base ? `${base}-${l.id}` : l.id
}

export function rutaLlamado(l: Pick<LlamadoPublico, 'id' | 'titulo' | 'zona'>): string {
  return `/llamados/${llamadoSlug(l)}`
}

/** Rutas indexables del listado de llamados. */
export function rutaListadoLlamados(opts: { rubro?: string | null; zona?: string | null }): string {
  const rubro = opts.rubro?.trim()
  const zona = opts.zona?.trim()
  if (rubro && zona) return `/llamados/rubro/${rubro}/${slugify(zona)}`
  if (rubro) return `/llamados/rubro/${rubro}`
  if (zona) return `/llamados/zona/${slugify(zona)}`
  return '/llamados'
}

export function diasRestantes(expiresAt: string | null, hoy = new Date()): number | null {
  if (!expiresAt) return null
  const fin = new Date(expiresAt)
  if (Number.isNaN(fin.getTime())) return null
  return Math.ceil((fin.getTime() - hoy.getTime()) / 86_400_000)
}

export function fechaLegible(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })
}
