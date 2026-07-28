import { DEPARTAMENTOS } from '../vistas/onboarding/data/zonas'
import { RUBROS } from '../vistas/onboarding/data/rubros'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://orvalya.com').replace(/\/$/, '')
export const SITE_NAME = 'Orvalya'
/** La genera app/opengraph-image.tsx. Se referencia explícita porque cuando una
 *  página define su propio openGraph, Next reemplaza el del layout en vez de fusionarlo. */
export const OG_IMAGE_DEFAULT = '/opengraph-image'
export const OG_IMAGE_SIZE = { width: 1200, height: 630 }

/** "Río Negro" → "rio-negro". Quita tildes y caracteres no alfanuméricos. */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

// ─── Departamentos ───

const DEPARTAMENTO_POR_SLUG = new Map(DEPARTAMENTOS.map(d => [slugify(d), d]))

export const DEPARTAMENTO_SLUGS = [...DEPARTAMENTO_POR_SLUG.keys()]

export function departamentoDesdeSlug(slug: string): string | null {
  return DEPARTAMENTO_POR_SLUG.get(slug.toLowerCase()) ?? null
}

export function slugDeDepartamento(departamento: string): string {
  return slugify(departamento)
}

// ─── Rubros ───

/** Los ids de rubro ya son slugs válidos ('limpieza', 'gastronomia'), menos 'otro'. */
const RUBROS_INDEXABLES = RUBROS.filter(r => r.id !== 'otro' && r.subrubros.length > 0)

export const RUBRO_SLUGS = RUBROS_INDEXABLES.map(r => r.id)

export function rubroDesdeSlug(slug: string): { id: string; label: string } | null {
  const encontrado = RUBROS_INDEXABLES.find(r => r.id === slug.toLowerCase())
  return encontrado ? { id: encontrado.id, label: encontrado.label } : null
}

// ─── Rutas del listado ───

/** Filtros → ruta indexable. Sin filtros: /prestadores */
export function rutaListado(opts: { rubro?: string | null; zona?: string | null }): string {
  const rubro = opts.rubro?.trim()
  const zona = opts.zona?.trim()
  if (rubro && zona) return `/prestadores/rubro/${rubro}/${slugify(zona)}`
  if (rubro) return `/prestadores/rubro/${rubro}`
  if (zona) return `/prestadores/zona/${slugify(zona)}`
  return '/prestadores'
}

// ─── Perfil del prestador ───

const UUID_AL_FINAL = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
const UUID_COMPLETO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function esUuid(valor: string): boolean {
  return UUID_COMPLETO.test(valor)
}

/**
 * Construye la URL con keywords manteniendo el id al final:
 * "federico-villagran-mascotas-artigas-4f61a091-...-f16b"
 * El id exacto al final evita búsquedas por prefijo y mantiene el lookup directo.
 */
export function prestadorSlug(p: {
  id: string
  nombre?: string | null
  categoria?: string | null
  zona?: string | null
}): string {
  const partes = [p.nombre, p.categoria, p.zona]
    .map(x => (x ? slugify(x) : ''))
    .filter(Boolean)
  return partes.length > 0 ? `${partes.join('-')}-${p.id}` : p.id
}

export function rutaPrestador(p: {
  id: string
  nombre?: string | null
  categoria?: string | null
  zona?: string | null
}): string {
  return `/prestadores/${prestadorSlug(p)}`
}

/** Extrae el id tanto de un slug largo como de un UUID pelado (URLs viejas). */
export function idDesdeSlug(slug: string): string | null {
  const match = UUID_AL_FINAL.exec(slug)
  return match ? match[1].toLowerCase() : null
}
