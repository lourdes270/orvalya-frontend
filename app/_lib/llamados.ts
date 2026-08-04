import type { Metadata } from 'next'
import { fetchLlamadosPublico, type LlamadoPublico } from '../../src/lib/llamadosPublicos'
import { supabaseServer } from '../../src/lib/supabaseServer'
import { copyLlamados, type SeoCopy } from '../../src/lib/seoCopy'
import {
  absoluteUrl,
  OG_IMAGE_DEFAULT,
  OG_IMAGE_SIZE,
  rubroDesdeSlug,
} from '../../src/lib/seo'
import { rutaListadoLlamados } from '../../src/lib/llamadosPublicos'

export type DatosLlamados = {
  llamados: LlamadoPublico[]
  rubro: string | null
  rubroLabel: string | null
  zona: string | null
  titulo: string
  intro: string
  canonical: string
  seo: SeoCopy
}

export async function cargarLlamados(filtro: {
  rubroSlug?: string | null
  zonaNombre?: string | null
}): Promise<DatosLlamados> {
  const rubro = filtro.rubroSlug ? rubroDesdeSlug(filtro.rubroSlug) : null
  const zona = filtro.zonaNombre ?? null

  const llamados = await fetchLlamadosPublico(
    zona ?? undefined,
    rubro?.id ?? undefined,
    supabaseServer,
  )

  const seo = copyLlamados(rubro?.id ?? null, rubro?.label ?? null, zona)

  return {
    llamados,
    rubro: rubro?.id ?? null,
    rubroLabel: rubro?.label ?? null,
    zona,
    titulo: seo.titulo,
    intro: seo.intro,
    canonical: rutaListadoLlamados({ rubro: rubro?.id ?? null, zona }),
    seo,
  }
}

export function metadataLlamados(datos: DatosLlamados): Metadata {
  const { seo } = datos
  const vacio = datos.llamados.length === 0

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
