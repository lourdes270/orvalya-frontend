import type { Metadata } from 'next'
import { PublicShell } from '../_components/PublicShell'
import { ListadoLlamados } from '../_components/ListadoLlamados'
import { cargarLlamados, metadataLlamados } from '../_lib/llamados'
import { leerPagina } from '../_lib/listado'

// Más corto que prestadores: un llamado nuevo tiene que aparecer rápido.
export const revalidate = 600

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata(): Promise<Metadata> {
  return metadataLlamados(await cargarLlamados({}))
}

export default async function Page({ searchParams }: Props) {
  const datos = await cargarLlamados({})
  const pagina = leerPagina(await searchParams)

  return (
    <PublicShell>
      <ListadoLlamados {...datos} pagina={pagina} />
    </PublicShell>
  )
}
