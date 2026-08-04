import type { Metadata } from 'next'
import { fetchPrestadoresPublico, type PrestadorLista } from '../../src/lib/prestadoresHelpers'
import { supabaseServer } from '../../src/lib/supabaseServer'
import { copyPrestadores, type SeoCopy } from '../../src/lib/seoCopy'
import {
  absoluteUrl,
  OG_IMAGE_DEFAULT,
  OG_IMAGE_SIZE,
  rubroDesdeSlug,
  rutaListado,
} from '../../src/lib/seo'

export type FiltroListado = {
  rubroSlug?: string | null
  zonaNombre?: string | null
}

export type DatosListado = {
  prestadores: PrestadorLista[]
  rubro: string | null
  rubroLabel: string | null
  zona: string | null
  titulo: string
  intro: string
  canonical: string
  seo: SeoCopy
}

export async function cargarListado(filtro: FiltroListado): Promise<DatosListado> {
  const rubro = filtro.rubroSlug ? rubroDesdeSlug(filtro.rubroSlug) : null
  const zona = filtro.zonaNombre ?? null

  const prestadores = await fetchPrestadoresPublico(
    zona ?? undefined,
    rubro?.id ?? undefined,
    supabaseServer,
  )

  const seo = copyPrestadores(rubro?.id ?? null, rubro?.label ?? null, zona)

  return {
    prestadores,
    rubro: rubro?.id ?? null,
    rubroLabel: rubro?.label ?? null,
    zona,
    titulo: seo.titulo,
    intro: seo.intro,
    canonical: rutaListado({ rubro: rubro?.id ?? null, zona }),
    seo,
  }
}

/**
 * Las combinaciones sin resultados se marcan noindex: son contenido vacío
 * y publicarlas en masa perjudica al dominio entero.
 */
export function metadataListado(datos: DatosListado): Metadata {
  const { seo } = datos
  const vacio = datos.prestadores.length === 0

  return {
    title: seo.metaTitle,
    description: seo.metaDesc,
    keywords: seo.keywords,
    alternates: { canonical: datos.canonical },
    robots: vacio ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      title: seo.metaTitle,
      description: seo.metaDesc,
      url: absoluteUrl(datos.canonical),
      images: [{ url: OG_IMAGE_DEFAULT, ...OG_IMAGE_SIZE, alt: seo.metaTitle }],
      locale: 'es_UY',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.metaTitle,
      description: seo.metaDesc,
      images: [OG_IMAGE_DEFAULT],
    },
  }
}

export function leerPagina(searchParams: Record<string, string | string[] | undefined>): number {
  const raw = searchParams.pagina
  const valor = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(valor ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}
