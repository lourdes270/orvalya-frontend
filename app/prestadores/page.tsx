import type { Metadata } from 'next'
import { PublicShell } from '../_components/PublicShell'
import { ListadoPrestadores } from '../_components/ListadoPrestadores'
import { cargarListado, leerPagina, metadataListado } from '../_lib/listado'

// Next exige literal acá (no acepta una constante importada).
export const revalidate = 3600

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata(): Promise<Metadata> {
  return metadataListado(await cargarListado({}))
}

export default async function Page({ searchParams }: Props) {
  const datos = await cargarListado({})
  const pagina = leerPagina(await searchParams)

  return (
    <PublicShell>
      <ListadoPrestadores {...datos} pagina={pagina} />
    </PublicShell>
  )
}
