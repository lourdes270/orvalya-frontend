import type { MetadataRoute } from 'next'
import { fetchPrestadoresPublico, type PrestadorLista } from '../src/lib/prestadoresHelpers'
import { supabaseServer } from '../src/lib/supabaseServer'
import { categoriaPrincipal } from '../src/lib/prestadorPublicoHelpers'
import { formatZonaDisplay } from '../src/vistas/dashboard/formatZona'
import { DEPARTAMENTOS } from '../src/vistas/onboarding/data/zonas'
import { absoluteUrl, prestadorSlug, RUBRO_SLUGS, rutaListado } from '../src/lib/seo'
import {
  fetchLlamadosPublico,
  llamadoSlug,
  rutaListadoLlamados,
  type LlamadoPublico,
} from '../src/lib/llamadosPublicos'

export const revalidate = 3600

/** Mínimo de prestadores para publicar una combinación rubro+zona y no generar páginas vacías. */
const MIN_PARA_INDEXAR = 1

function departamentosDe(zonaRaw: string | null): string[] {
  if (!zonaRaw) return []
  try {
    const j = JSON.parse(zonaRaw) as { todoUruguay?: boolean; departamentos?: string[] }
    if (j.todoUruguay) return [...DEPARTAMENTOS]
    return Array.isArray(j.departamentos) ? j.departamentos : []
  } catch {
    return (DEPARTAMENTOS as readonly string[]).includes(zonaRaw) ? [zonaRaw] : []
  }
}

function rubrosDe(descripcion: string | null): string[] {
  if (!descripcion) return []
  try {
    const j = JSON.parse(descripcion) as Record<string, unknown>
    if (typeof j !== 'object' || j === null || Array.isArray(j)) return []
    return Object.keys(j).filter(k => RUBRO_SLUGS.includes(k))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Si la base falla, el sitemap sale con las páginas estáticas en vez de romperse.
  let prestadores: PrestadorLista[]
  try {
    prestadores = await fetchPrestadoresPublico(undefined, undefined, supabaseServer)
  } catch {
    prestadores = []
  }

  let llamados: LlamadoPublico[]
  try {
    llamados = await fetchLlamadosPublico(undefined, undefined, supabaseServer)
  } catch {
    llamados = []
  }

  const ahora = new Date()

  const estaticas: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/prestadores'), lastModified: ahora, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/llamados'), lastModified: ahora, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/quienes-somos'), lastModified: ahora, changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/como-funciona'), lastModified: ahora, changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/terminos'), lastModified: ahora, changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/privacidad'), lastModified: ahora, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Conteo local de inventario para no publicar combinaciones vacías.
  const porRubro = new Map<string, number>()
  const porZona = new Map<string, number>()
  const porCombo = new Map<string, number>()

  for (const p of prestadores) {
    const rubros = rubrosDe(p.descripcion)
    const deptos = departamentosDe(p.zona)
    for (const r of rubros) porRubro.set(r, (porRubro.get(r) ?? 0) + 1)
    for (const d of deptos) porZona.set(d, (porZona.get(d) ?? 0) + 1)
    for (const r of rubros) {
      for (const d of deptos) {
        const k = `${r}|${d}`
        porCombo.set(k, (porCombo.get(k) ?? 0) + 1)
      }
    }
  }

  const rubroUrls: MetadataRoute.Sitemap = [...porRubro.entries()]
    .filter(([, n]) => n >= MIN_PARA_INDEXAR)
    .map(([rubro]) => ({
      url: absoluteUrl(rutaListado({ rubro })),
      lastModified: ahora,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  const zonaUrls: MetadataRoute.Sitemap = [...porZona.entries()]
    .filter(([, n]) => n >= MIN_PARA_INDEXAR)
    .map(([zona]) => ({
      url: absoluteUrl(rutaListado({ zona })),
      lastModified: ahora,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  const comboUrls: MetadataRoute.Sitemap = [...porCombo.entries()]
    .filter(([, n]) => n >= MIN_PARA_INDEXAR)
    .map(([k]) => {
      const [rubro, zona] = k.split('|')
      return {
        url: absoluteUrl(rutaListado({ rubro, zona })),
        lastModified: ahora,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })

  const perfilUrls: MetadataRoute.Sitemap = prestadores.map(p => ({
    url: absoluteUrl(
      `/prestadores/${prestadorSlug({
        id: p.id,
        nombre: p.nombre,
        categoria: categoriaPrincipal(p.descripcion),
        zona: formatZonaDisplay(p.zona),
      })}`,
    ),
    lastModified: ahora,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Llamados: solo los abiertos. Al cerrarse desaparecen del sitemap y la página da 404,
  // que es justo lo que Google Jobs espera de una oferta vencida.
  const llamadoUrls: MetadataRoute.Sitemap = llamados.map(l => ({
    url: absoluteUrl(`/llamados/${llamadoSlug(l)}`),
    lastModified: new Date(l.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const llamadosRubro = new Set(llamados.map(l => l.rubro))
  const llamadosZona = new Set(llamados.map(l => l.zona))

  const llamadoFiltroUrls: MetadataRoute.Sitemap = [
    ...[...llamadosRubro]
      .filter(r => RUBRO_SLUGS.includes(r))
      .map(rubro => ({
        url: absoluteUrl(rutaListadoLlamados({ rubro })),
        lastModified: ahora,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      })),
    ...[...llamadosZona].map(zona => ({
      url: absoluteUrl(rutaListadoLlamados({ zona })),
      lastModified: ahora,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ]

  return [
    ...estaticas,
    ...rubroUrls,
    ...zonaUrls,
    ...comboUrls,
    ...perfilUrls,
    ...llamadoFiltroUrls,
    ...llamadoUrls,
  ]
}
