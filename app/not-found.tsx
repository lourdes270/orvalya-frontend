import Link from 'next/link'
import { PublicShell } from './_components/PublicShell'
import { rutaListado } from '../src/lib/seo'
import { rutaListadoLlamados } from '../src/lib/llamadosPublicos'

export const metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <PublicShell>
      <div className="ov-container" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <h1 className="ov-h1">Esta página no existe</h1>
        <p className="ov-lead" style={{ maxWidth: 520 }}>
          Puede que el enlace esté mal escrito, o que el aviso que buscabas ya se
          haya cerrado. Probá desde acá:
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
          <Link className="ov-chip" href={rutaListado({})}>
            Ver prestadores
          </Link>
          <Link className="ov-chip" href={rutaListadoLlamados({})}>
            Ver llamados abiertos
          </Link>
          <Link className="ov-chip" href="/">
            Ir al inicio
          </Link>
        </div>
      </div>
    </PublicShell>
  )
}
