import Link from 'next/link'
import { RUBROS } from '../../src/vistas/onboarding/data/rubros'
import { DEPARTAMENTOS } from '../../src/vistas/onboarding/data/zonas'
import { categoriaPrincipal } from '../../src/lib/prestadorPublicoHelpers'
import { formatDescripcionServicio } from '../../src/lib/formatDescripcionServicio'
import { formatZonaDisplay } from '../../src/vistas/dashboard/formatZona'
import { colorSemaforo, labelSemaforo } from '../../src/lib/semaforo'
import {
  formatTarifa,
  paginar,
  totalPaginas,
  type PrestadorLista,
} from '../../src/lib/prestadoresHelpers'
import { absoluteUrl, rutaListado, rutaPrestador } from '../../src/lib/seo'
import type { SeoCopy } from '../../src/lib/seoCopy'
import { SeoListadoBloque } from './SeoListadoBloque'

const RUBROS_FILTRO = RUBROS.filter(r => r.id !== 'otro' && r.subrubros.length > 0)

function truncar(texto: string | null | undefined, max: number): string {
  if (!texto?.trim()) return ''
  const t = texto.trim()
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`
}

function PrestadorCard({ p }: { p: PrestadorLista }) {
  const categoria = categoriaPrincipal(p.descripcion)
  const zona = formatZonaDisplay(p.zona)
  const tarifa = formatTarifa(p.tarifa_hora, p.tarifa_modalidad)
  const preview = truncar(p.sobre_mi?.trim() || formatDescripcionServicio(p.descripcion), 120)

  return (
    <Link className="ov-card" href={rutaPrestador({ id: p.id, nombre: p.nombre, categoria, zona })}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#f4f8fb',
          border: '2px solid #d8e3ed',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {p.avatar_url && (
            <img
              src={p.avatar_url}
              alt={`Foto de ${p.nombre ?? 'prestador'}`}
              width={52}
              height={52}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            margin: '0 0 2px',
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f2d52',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {p.nombre ?? 'Prestador'}
          </h2>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#4a6078',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {truncar(zona, 48)}
          </p>
        </div>

        <span
          title={`Documentación: ${labelSemaforo(p.semaforo)}`}
          aria-label={`Documentación: ${labelSemaforo(p.semaforo)}`}
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: colorSemaforo(p.semaforo),
            flexShrink: 0,
            marginTop: 4,
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#00b4a6',
          background: '#eaf9f8',
          borderRadius: 999,
          padding: '3px 10px',
        }}>
          {categoria}
        </span>
        {tarifa && (
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#0f2d52',
            background: '#f4f8fb',
            border: '1px solid #d8e3ed',
            borderRadius: 999,
            padding: '3px 10px',
          }}>
            {tarifa}
          </span>
        )}
      </div>

      {preview && (
        <p style={{ margin: 0, fontSize: '13px', color: '#243b53', lineHeight: 1.55 }}>
          {preview}
        </p>
      )}
    </Link>
  )
}

function Filtros({ rubro, zona }: { rubro: string | null; zona: string | null }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#4a6078' }}>
        Filtrar por servicio
      </h2>
      <div className="ov-filtros">
        <Link className="ov-chip" aria-current={!rubro || undefined} href={rutaListado({ zona })}>
          Todos
        </Link>
        {RUBROS_FILTRO.map(r => (
          <Link
            key={r.id}
            className="ov-chip"
            aria-current={rubro === r.id || undefined}
            href={rutaListado({ rubro: r.id, zona })}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <h2 style={{ margin: '14px 0 8px', fontSize: 13, fontWeight: 700, color: '#4a6078' }}>
        Filtrar por departamento
      </h2>
      <div className="ov-filtros">
        <Link className="ov-chip" aria-current={!zona || undefined} href={rutaListado({ rubro })}>
          Todo el país
        </Link>
        {DEPARTAMENTOS.map(d => (
          <Link
            key={d}
            className="ov-chip"
            aria-current={zona === d || undefined}
            href={rutaListado({ rubro, zona: d })}
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
    <nav className="ov-pag" aria-label="Paginación de prestadores">
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

export type ListadoProps = {
  prestadores: PrestadorLista[]
  pagina: number
  rubro: string | null
  rubroLabel: string | null
  zona: string | null
  titulo: string
  intro: string
  seo: SeoCopy
}

export function ListadoPrestadores({
  prestadores,
  pagina,
  rubro,
  rubroLabel,
  zona,
  titulo,
  intro,
  seo,
}: ListadoProps) {
  const paginas = totalPaginas(prestadores.length)
  const paginaActual = Math.min(Math.max(pagina, 1), paginas)
  const visibles = paginar(prestadores, paginaActual)
  const base = rutaListado({ rubro, zona })

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: titulo,
    numberOfItems: prestadores.length,
    itemListElement: visibles.map((p, i) => ({
      '@type': 'ListItem',
      position: (paginaActual - 1) * 12 + i + 1,
      url: absoluteUrl(
        rutaPrestador({
          id: p.id,
          nombre: p.nombre,
          categoria: categoriaPrincipal(p.descripcion),
          zona: formatZonaDisplay(p.zona),
        }),
      ),
      name: p.nombre ?? 'Prestador',
    })),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Prestadores', item: absoluteUrl('/prestadores') },
      ...(rubroLabel
        ? [{
            '@type': 'ListItem',
            position: 3,
            name: rubroLabel,
            item: absoluteUrl(rutaListado({ rubro })),
          }]
        : []),
      ...(zona
        ? [{
            '@type': 'ListItem',
            position: rubroLabel ? 4 : 3,
            name: zona,
            item: absoluteUrl(base),
          }]
        : []),
    ],
  }

  return (
    <div className="ov-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {prestadores.length > 0 && (
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

      {prestadores.length === 0 ? (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: '#f4f8fb',
          border: '1px solid #d8e3ed',
          borderRadius: 14,
        }}>
          <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#0f2d52' }}>
            Todavía no hay prestadores {zona ? `en ${zona}` : ''} para esta búsqueda
          </p>
          <p style={{ margin: 0, fontSize: 14, color: '#4a6078' }}>
            Probá con otro departamento o servicio desde los filtros de arriba.
          </p>
        </div>
      ) : (
        <>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#4a6078' }}>
            {prestadores.length} prestador{prestadores.length !== 1 ? 'es' : ''}
            {rubroLabel ? ` de ${rubroLabel.toLowerCase()}` : ''}
            {zona ? ` en ${zona}` : ' en Uruguay'}
            {paginas > 1 ? ` · página ${paginaActual} de ${paginas}` : ''}
          </p>

          <div className="ov-grid">
            {visibles.map(p => <PrestadorCard key={p.id} p={p} />)}
          </div>

          <Paginacion base={base} pagina={paginaActual} total={paginas} />
        </>
      )}

      <SeoListadoBloque seo={seo} rubro={rubro} zona={zona} variante="prestadores" />
    </div>
  )
}
