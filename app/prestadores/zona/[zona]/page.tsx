import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicShell } from '../../../_components/PublicShell'
import { ListadoPrestadores } from '../../../_components/ListadoPrestadores'
import { cargarListado, leerPagina, metadataListado } from '../../../_lib/listado'
import { DEPARTAMENTO_SLUGS, departamentoDesdeSlug } from '../../../../src/lib/seo'

export const revalidate = 3600

type Props = {
  params: Promise<{ zona: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function generateStaticParams() {
  return DEPARTAMENTO_SLUGS.map(zona => ({ zona }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zona } = await params
  const departamento = departamentoDesdeSlug(zona)
  if (!departamento) return { title: 'Departamento no encontrado', robots: { index: false } }
  return metadataListado(await cargarListado({ zonaNombre: departamento }))
}

export default async function Page({ params, searchParams }: Props) {
  const { zona } = await params
  const departamento = departamentoDesdeSlug(zona)
  if (!departamento) notFound()

  const datos = await cargarListado({ zonaNombre: departamento })
  const pagina = leerPagina(await searchParams)

  return (
    <PublicShell>
      <ListadoPrestadores {...datos} pagina={pagina} />
    </PublicShell>
  )
}
