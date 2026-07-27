import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicShell } from '../../../_components/PublicShell'
import { ListadoPrestadores } from '../../../_components/ListadoPrestadores'
import { cargarListado, leerPagina, metadataListado } from '../../../_lib/listado'
import { RUBRO_SLUGS, rubroDesdeSlug } from '../../../../src/lib/seo'

export const revalidate = 3600

type Props = {
  params: Promise<{ rubro: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function generateStaticParams() {
  return RUBRO_SLUGS.map(rubro => ({ rubro }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rubro } = await params
  if (!rubroDesdeSlug(rubro)) return { title: 'Servicio no encontrado', robots: { index: false } }
  return metadataListado(await cargarListado({ rubroSlug: rubro }))
}

export default async function Page({ params, searchParams }: Props) {
  const { rubro } = await params
  if (!rubroDesdeSlug(rubro)) notFound()

  const datos = await cargarListado({ rubroSlug: rubro })
  const pagina = leerPagina(await searchParams)

  return (
    <PublicShell>
      <ListadoPrestadores {...datos} pagina={pagina} />
    </PublicShell>
  )
}
