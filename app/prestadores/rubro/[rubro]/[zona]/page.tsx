import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicShell } from '../../../../_components/PublicShell'
import { ListadoPrestadores } from '../../../../_components/ListadoPrestadores'
import { cargarListado, leerPagina, metadataListado } from '../../../../_lib/listado'
import { departamentoDesdeSlug, rubroDesdeSlug } from '../../../../../src/lib/seo'

export const revalidate = 3600

type Props = {
  params: Promise<{ rubro: string; zona: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * No se pregeneran las ~200 combinaciones: se construyen on-demand y quedan
 * cacheadas. Las que no tienen prestadores salen noindex desde metadataListado.
 */
export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rubro, zona } = await params
  const departamento = departamentoDesdeSlug(zona)
  if (!rubroDesdeSlug(rubro) || !departamento) {
    return { title: 'Búsqueda no encontrada', robots: { index: false } }
  }
  return metadataListado(await cargarListado({ rubroSlug: rubro, zonaNombre: departamento }))
}

export default async function Page({ params, searchParams }: Props) {
  const { rubro, zona } = await params
  const departamento = departamentoDesdeSlug(zona)
  if (!rubroDesdeSlug(rubro) || !departamento) notFound()

  const datos = await cargarListado({ rubroSlug: rubro, zonaNombre: departamento })
  const pagina = leerPagina(await searchParams)

  return (
    <PublicShell>
      <ListadoPrestadores {...datos} pagina={pagina} />
    </PublicShell>
  )
}
