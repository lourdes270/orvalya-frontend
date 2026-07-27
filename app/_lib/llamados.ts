import type { Metadata } from 'next'
import { fetchLlamadosPublico, type LlamadoPublico } from '../../src/lib/llamadosPublicos'
import { supabaseServer } from '../../src/lib/supabaseServer'
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
}

function textos(rubroLabel: string | null, zona: string | null) {
  if (rubroLabel && zona) {
    return {
      titulo: `Trabajos de ${rubroLabel.toLowerCase()} en ${zona}`,
      intro: `Llamados abiertos de ${rubroLabel.toLowerCase()} en ${zona}. Publicados por empresas y particulares que buscan prestadores ahora.`,
      metaTitle: `Trabajos de ${rubroLabel.toLowerCase()} en ${zona} — Llamados abiertos`,
      metaDesc: `Ofertas de trabajo de ${rubroLabel.toLowerCase()} en ${zona}, Uruguay. Llamados abiertos publicados por empresas verificadas.`,
    }
  }
  if (rubroLabel) {
    return {
      titulo: `Trabajos de ${rubroLabel.toLowerCase()} en Uruguay`,
      intro: `Llamados abiertos de ${rubroLabel.toLowerCase()} en todo el país. Filtrá por departamento para ver los de tu zona.`,
      metaTitle: `Trabajos de ${rubroLabel.toLowerCase()} en Uruguay — Llamados abiertos`,
      metaDesc: `Ofertas de trabajo de ${rubroLabel.toLowerCase()} en Uruguay. Llamados abiertos publicados por empresas y particulares.`,
    }
  }
  if (zona) {
    return {
      titulo: `Trabajos en ${zona}`,
      intro: `Llamados abiertos en ${zona}: limpieza, cuidados, oficios, gastronomía y más. Publicados por quienes buscan prestadores hoy.`,
      metaTitle: `Trabajos en ${zona} — Llamados abiertos`,
      metaDesc: `Ofertas de trabajo en ${zona}, Uruguay: limpieza, cuidados, oficios y más. Llamados abiertos de empresas y particulares.`,
    }
  }
  return {
    titulo: 'Trabajos y llamados abiertos en Uruguay',
    intro: 'Empresas y particulares publican acá lo que necesitan. Mirá los llamados abiertos y postulate al que te sirva.',
    metaTitle: 'Trabajos y llamados abiertos en Uruguay',
    metaDesc: 'Ofertas de trabajo en Uruguay: limpieza, cuidados, oficios, gastronomía, logística y más. Llamados abiertos publicados por empresas.',
  }
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

  const t = textos(rubro?.label ?? null, zona)

  return {
    llamados,
    rubro: rubro?.id ?? null,
    rubroLabel: rubro?.label ?? null,
    zona,
    titulo: t.titulo,
    intro: t.intro,
    canonical: rutaListadoLlamados({ rubro: rubro?.id ?? null, zona }),
  }
}

export function metadataLlamados(datos: DatosLlamados): Metadata {
  const t = textos(datos.rubroLabel, datos.zona)
  const vacio = datos.llamados.length === 0

  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: { canonical: datos.canonical },
    robots: vacio ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      title: t.metaTitle,
      description: t.metaDesc,
      url: absoluteUrl(datos.canonical),
      images: [{ url: OG_IMAGE_DEFAULT, ...OG_IMAGE_SIZE, alt: t.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.metaTitle,
      description: t.metaDesc,
      images: [OG_IMAGE_DEFAULT],
    },
  }
}
