import type { Metadata } from 'next'
import { fetchPrestadoresPublico, type PrestadorLista } from '../../src/lib/prestadoresHelpers'
import { supabaseServer } from '../../src/lib/supabaseServer'
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
}

function textos(rubroLabel: string | null, zona: string | null) {
  if (rubroLabel && zona) {
    return {
      titulo: `${rubroLabel} en ${zona}`,
      intro: `Prestadores de ${rubroLabel.toLowerCase()} en ${zona} con documentación verificada. Compará perfiles, tarifas y contactá directo.`,
      metaTitle: `${rubroLabel} en ${zona} — Prestadores verificados`,
      metaDesc: `Encontrá prestadores de ${rubroLabel.toLowerCase()} en ${zona}, Uruguay. Perfiles con documentación al día, tarifas y contacto directo.`,
    }
  }
  if (rubroLabel) {
    return {
      titulo: `${rubroLabel} en Uruguay`,
      intro: `Prestadores de ${rubroLabel.toLowerCase()} en todo Uruguay con documentación verificada. Filtrá por departamento para acotar la búsqueda.`,
      metaTitle: `${rubroLabel} en Uruguay — Prestadores verificados`,
      metaDesc: `Encontrá prestadores de ${rubroLabel.toLowerCase()} en Uruguay. Perfiles con documentación al día, tarifas y contacto directo.`,
    }
  }
  if (zona) {
    return {
      titulo: `Prestadores de servicios en ${zona}`,
      intro: `Profesionales y empresas que trabajan en ${zona}, con documentación verificada. Filtrá por tipo de servicio.`,
      metaTitle: `Prestadores de servicios en ${zona}`,
      metaDesc: `Encontrá prestadores de servicios en ${zona}, Uruguay: limpieza, cuidados, oficios, gastronomía y más. Documentación verificada.`,
    }
  }
  return {
    titulo: 'Prestadores de servicios en Uruguay',
    intro: 'Perfiles verificados con documentación actualizada. Encontrá al profesional que necesitás, en cualquier departamento del país.',
    metaTitle: 'Prestadores de servicios verificados en Uruguay',
    metaDesc: 'Directorio de prestadores de servicios en Uruguay con documentación verificada: limpieza, cuidados, oficios, gastronomía, logística y más.',
  }
}

export async function cargarListado(filtro: FiltroListado): Promise<DatosListado> {
  const rubro = filtro.rubroSlug ? rubroDesdeSlug(filtro.rubroSlug) : null
  const zona = filtro.zonaNombre ?? null

  const prestadores = await fetchPrestadoresPublico(
    zona ?? undefined,
    rubro?.id ?? undefined,
    supabaseServer,
  )

  const t = textos(rubro?.label ?? null, zona)

  return {
    prestadores,
    rubro: rubro?.id ?? null,
    rubroLabel: rubro?.label ?? null,
    zona,
    titulo: t.titulo,
    intro: t.intro,
    canonical: rutaListado({ rubro: rubro?.id ?? null, zona }),
  }
}

/**
 * Las combinaciones sin resultados se marcan noindex: son contenido vacío
 * y publicarlas en masa perjudica al dominio entero.
 */
export function metadataListado(datos: DatosListado): Metadata {
  const t = textos(datos.rubroLabel, datos.zona)
  const vacio = datos.prestadores.length === 0

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

export function leerPagina(searchParams: Record<string, string | string[] | undefined>): number {
  const raw = searchParams.pagina
  const valor = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(valor ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}
