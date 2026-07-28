import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicShell } from '../../../_components/PublicShell'
import { ListadoLlamados } from '../../../_components/ListadoLlamados'
import { cargarLlamados, metadataLlamados } from '../../../_lib/llamados'
import { leerPagina } from '../../../_lib/listado'
import { RUBRO_SLUGS, rubroDesdeSlug } from '../../../../src/lib/seo'

export const revalidate = 600

type Props = {
  params: Promise<{ rubro: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function generateStaticParams() {
  return RUBRO_SLUGS.map(rubro => ({ rubro }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rubro } = await params
  if (!rubroDesdeSlug(rubro)) return { title: 'Rubro no encontrado', robots: { index: false } }
  return metadataLlamados(await cargarLlamados({ rubroSlug: rubro }))
}

export default async function Page({ params, searchParams }: Props) {
  const { rubro } = await params
  if (!rubroDesdeSlug(rubro)) notFound()

  const datos = await cargarLlamados({ rubroSlug: rubro })
  const pagina = leerPagina(await searchParams)

  return (
    <PublicShell>
      <ListadoLlamados {...datos} pagina={pagina} />
    </PublicShell>
  )
}
