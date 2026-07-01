import { supabase } from './supabase'
import { RUBROS } from '../pages/onboarding/data/rubros'
import type { PrestadorPublico } from '../types/prestadorPublico'

export async function fetchPrestadorPublico(id: string): Promise<PrestadorPublico | null> {
  const { data, error } = await supabase.rpc('fetch_prestador_publico', { p_id: id })
  if (error) {
    if (error.message?.includes('rate_limit_exceeded')) {
      throw new Error('Demasiadas solicitudes. Intentá de nuevo en unos minutos.')
    }
    console.error('fetch_prestador_publico:', error)
    return null
  }
  if (!data || typeof data !== 'object') return null
  return data as PrestadorPublico
}

export function categoriaPrincipal(descripcion: string | null | undefined): string {
  if (!descripcion?.trim()) return 'servicios'
  try {
    const parsed = JSON.parse(descripcion) as Record<string, string[]>
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const firstKey = Object.keys(parsed)[0]
      if (firstKey) {
        const rubro = RUBROS.find(r => r.id === firstKey)
        if (rubro) return rubro.label
      }
    }
  } catch {
    // texto plano legacy
  }
  const partes = descripcion.split(' · ')
  return partes[0]?.trim() || 'servicios'
}

export function truncarMeta(texto: string | null | undefined, max = 160): string {
  if (!texto?.trim()) return 'Perfil de prestador de servicios en Uruguay.'
  const t = texto.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trimEnd()}…`
}

export function urlPerfilPublicoPrestador(prestadorId: string): string {
  return `${window.location.origin}/prestadores/${prestadorId}`
}
