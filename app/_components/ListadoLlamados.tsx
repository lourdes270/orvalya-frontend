import Link from 'next/link'
import { RUBROS } from '../../src/vistas/onboarding/data/rubros'
import { DEPARTAMENTOS } from '../../src/vistas/onboarding/data/zonas'
import {
  diasRestantes,
  fechaLegible,
  llamadoRubroLabel,
  rutaLlamado,
  rutaListadoLlamados,
  LLAMADOS_POR_PAGINA,
  type LlamadoPublico,
} from '../../src/lib/llamadosPublicos'
import { absoluteUrl, rutaListado } from '../../src/lib/seo'
import { paginar, totalPaginas } from '../../src/lib/prestadoresHelpers'
import type { SeoCopy } from '../../src/lib/seoCopy'
import { SeoListadoBloque } from './SeoListadoBloque'

const RUBROS_FILTRO = RUBROS.filter(r => r.id !== 'otro' && r.subrubros.length > 0)

function truncar(texto: string, max: number): string {
  const t = texto.trim()
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`
}

function LlamadoCard({ l }: { l: LlamadoPublico }) {
  const dias = diasRestantes(l.expires_at)

  return (
    <Link className="ov-card" href={rutaLlamado(l)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <h2 style={{
          margin: 0,
          flex: 1,
          fontSize: 16,
          fontWeight: 700,
          color: '#0f2d52',
          lineHeight: 1.3,
        }}>
          {l.titulo}
        </h2>
        {dias !== null && dias <= 7 && dias >= 0 && (
          <span style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 700,
            color: '#a1650a',
            background: '#fff3cd',
            borderRadius: 999,
            padding: '3px 8px',
          }}>
            {dias === 0 ? 'Último día' : `${dias} d`}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#00b4a6',
          background: '#eaf9f8',
          borderRadius: 999,
          padding: '3px 10px',
        }}>
          {llamadoRubroLabel(l.rubro)}
        </span>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#0f2d52',
          background: '#f4f8fb',
          border: '1px solid #d8e3ed',
          borderRadius: 999,
          padding: '3px 10px',
        }}>
          {l.zona}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: 13, color: '#243b53', lineHeight: 1.55 }}>
        {truncar(l.descripcion, 140)}
      </p>

      <p style={{ margin: 0, fontSize: 12, color: '#4a6078' }}>
        {l.publicado_por} · {fechaLegible(l.created_at)}
      </p>
    </Link>
  )
}

function Filtros({ rubro, zona }: { rubro: string | null; zona: string | null }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#4a6078' }}>
        Filtrar por rubro
      </h2>
      <div className="ov-filtros">
        <Link className="ov-chip" aria-current={!rubro || undefined} href={rutaListadoLlamados({ zona })}>
          Todos
        </Link>
        {RUBROS_FILTRO.map(r => (
          <Link
            key={r.id}
            className="ov-chip"
            aria-current={rubro === r.id || undefined}
            href={rutaListadoLlamados({ rubro: r.id, zona })}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <h2 style={{ margin: '14px 0 8px', fontSize: 13, fontWeight: 700, color: '#4a6078' }}>
        Filtrar por departamento
      </h2>
      <div className="ov-filtros">
        <Link className="ov-chip" aria-current={!zona || undefined} href={rutaListadoLlamados({ rubro })}>
          Todo el país
        </Link>
        {DEPARTAMENTOS.map(d => (
          <Link
            key={d}
            className="ov-chip"
            aria-current={zona === d || undefined}
            href={rutaListadoLlamados({ rubro, zona: d })}
          >
            {d}
          </Link>
        ))}
      </div>
    </div>
  )
}

function Paginacion({ base, pagina, total }: { base: string; pagina: number; total: number }) {
  if (total <= 1) return null
  const href = (n: number) => (n <= 1 ? base : `${base}?pagina=${n}`)

  return (
    <nav className="ov-pag" aria-label="Paginación de llamados">
      {pagina > 1 ? <Link href={href(pagina - 1)} rel="prev">Anterior</Link> : <span>Anterior</span>}
      {Array.from({ length: total }, (_, i) => i + 1).map(n => (
        <Link key={n} href={href(n)} aria-current={n === pagina ? 'page' : undefined}>
          {n}
        </Link>
      ))}
      {pagina < total ? <Link href={href(pagina + 1)} rel="next">Siguiente</Link> : <span>Siguiente</span>}
    </nav>
  )
}

export type ListadoLlamadosProps = {
  llamados: LlamadoPublico[]
  pagina: number
  rubro: string | null
  rubroLabel: string | null
  zona: string | null
  titulo: string
  intro: string
  seo: SeoCopy
}

export function ListadoLlamados({
  llamados,
  pagina,
  rubro,
  rubroLabel,
  zona,
  titulo,
  intro,
  seo,
}: ListadoLlamadosProps) {
  const paginas = totalPaginas(llamados.length, LLAMADOS_POR_PAGINA)
  const paginaActual = Math.min(Math.max(pagina, 1), paginas)
  const visibles = paginar(llamados, paginaActual, LLAMADOS_POR_PAGINA)
  const base = rutaListadoLlamados({ rubro, zona })

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: titulo,
    numberOfItems: llamados.length,
    itemListElement: visibles.map((l, i) => ({
      '@type': 'ListItem',
      position: (paginaActual - 1) * LLAMADOS_POR_PAGINA + i + 1,
      url: absoluteUrl(rutaLlamado(l)),
      name: l.titulo,
    })),
  }

  return (
    <div className="ov-container">
      {llamados.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
        />
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 className="ov-h1">{titulo}</h1>
        <p className="ov-lead">{intro}</p>
      </div>

      <Filtros rubro={rubro} zona={zona} />

      {llamados.length === 0 ? (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: '#f4f8fb',
          border: '1px solid #d8e3ed',
          borderRadius: 14,
        }}>
          <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#0f2d52' }}>
            No hay llamados abiertos {zona ? `en ${zona}` : ''} para esta búsqueda
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: '#4a6078' }}>
            Probá con otro rubro o departamento.
          </p>
          <Link className="ov-chip" href={rutaListado({ rubro, zona })}>
            Ver prestadores disponibles
          </Link>
        </div>
      ) : (
        <>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#4a6078' }}>
            {llamados.length} llamado{llamados.length !== 1 ? 's' : ''} abierto
            {llamados.length !== 1 ? 's' : ''}
            {rubroLabel ? ` de ${rubroLabel.toLowerCase()}` : ''}
            {zona ? ` en ${zona}` : ' en Uruguay'}
            {paginas > 1 ? ` · página ${paginaActual} de ${paginas}` : ''}
          </p>

          <div className="ov-grid">
            {visibles.map(l => <LlamadoCard key={l.id} l={l} />)}
          </div>

          <Paginacion base={base} pagina={paginaActual} total={paginas} />
        </>
      )}

      <SeoListadoBloque seo={seo} rubro={rubro} zona={zona} variante="llamados" />
    </div>
  )
}
