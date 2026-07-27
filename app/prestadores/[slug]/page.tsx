import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { PublicShell } from '../../_components/PublicShell'
import { supabaseServer } from '../../../src/lib/supabaseServer'
import {
  categoriaPrincipal,
  fetchPrestadorPublico,
  truncarMeta,
} from '../../../src/lib/prestadorPublicoHelpers'
import { formatDescripcionServicio } from '../../../src/lib/formatDescripcionServicio'
import { formatZonaDisplay } from '../../../src/vistas/dashboard/formatZona'
import { colorSemaforo, labelSemaforo } from '../../../src/lib/semaforo'
import {
  absoluteUrl,
  idDesdeSlug,
  OG_IMAGE_DEFAULT,
  prestadorSlug,
  rutaListado,
  rutaPrestador,
} from '../../../src/lib/seo'
import type { PrestadorPublico } from '../../../src/types/prestadorPublico'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

type Vista = {
  prestador: PrestadorPublico
  nombre: string
  categoria: string
  servicios: string
  zona: string
  slugCanonico: string
}

async function cargar(slug: string): Promise<Vista | null> {
  const id = idDesdeSlug(slug)
  if (!id) return null

  const prestador = await fetchPrestadorPublico(id, supabaseServer)
  if (!prestador) return null

  const nombre = prestador.nombre?.trim() || 'Prestador'
  const categoria = categoriaPrincipal(prestador.descripcion)
  const zona = formatZonaDisplay(prestador.zona) || 'Uruguay'

  return {
    prestador,
    nombre,
    categoria,
    zona,
    servicios: formatDescripcionServicio(prestador.descripcion),
    slugCanonico: prestadorSlug({ id, nombre: prestador.nombre, categoria, zona }),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const vista = await cargar(slug)
  if (!vista) return { title: 'Perfil no encontrado', robots: { index: false, follow: false } }

  const { prestador, nombre, categoria, zona } = vista
  const title = `${nombre} · ${categoria} en ${zona}`
  const description = prestador.sobre_mi?.trim()
    ? truncarMeta(prestador.sobre_mi)
    : `${nombre} ofrece servicios de ${categoria.toLowerCase()} en ${zona}, Uruguay. Perfil con documentación declarada en Orvalya.`
  const canonical = `/prestadores/${vista.slugCanonico}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'profile',
      title,
      description,
      url: absoluteUrl(canonical),
      images: [
        prestador.avatar_url
          ? { url: prestador.avatar_url, alt: nombre }
          : { url: OG_IMAGE_DEFAULT, width: 1200, height: 630, alt: nombre },
      ],
    },
    twitter: {
      card: prestador.avatar_url ? 'summary' : 'summary_large_image',
      title,
      description,
      images: [prestador.avatar_url ?? OG_IMAGE_DEFAULT],
    },
  }
}

function Seccion({ titulo, texto }: { titulo: string; texto: string | null | undefined }) {
  if (!texto?.trim()) return null
  return (
    <section style={{
      background: '#fff',
      borderRadius: 12,
      padding: 20,
      border: '1px solid #d8e3ed',
      marginBottom: 12,
    }}>
      <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#0f2d52' }}>
        {titulo}
      </h2>
      <p style={{
        margin: 0,
        fontSize: 14,
        lineHeight: 1.65,
        color: '#243b53',
        whiteSpace: 'pre-wrap',
      }}>
        {texto.trim()}
      </p>
    </section>
  )
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const vista = await cargar(slug)
  if (!vista) notFound()

  const { prestador, nombre, categoria, servicios, zona, slugCanonico } = vista

  // URLs viejas con UUID pelado, o slugs desactualizados, van 301 al canónico.
  if (slug !== slugCanonico) permanentRedirect(`/prestadores/${slugCanonico}`)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: nombre,
    ...(prestador.avatar_url ? { image: prestador.avatar_url } : {}),
    ...(prestador.sobre_mi?.trim() ? { description: prestador.sobre_mi.trim() } : {}),
    url: absoluteUrl(rutaPrestador({ id: prestador.id, nombre, categoria, zona })),
    jobTitle: categoria,
    address: { '@type': 'PostalAddress', addressRegion: zona, addressCountry: 'UY' },
    ...(servicios
      ? {
          knowsAbout: servicios.split(' · ').map(s => s.trim()).filter(Boolean),
        }
      : {}),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Prestadores', item: absoluteUrl('/prestadores') },
      {
        '@type': 'ListItem',
        position: 3,
        name: nombre,
        item: absoluteUrl(`/prestadores/${slugCanonico}`),
      },
    ],
  }

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <article style={{ padding: '24px 16px 40px', background: '#f4f8fb' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <nav aria-label="Miga de pan" style={{ marginBottom: 16, fontSize: 13, color: '#4a6078' }}>
            <Link href="/prestadores" style={{ color: '#0f2d52', fontWeight: 600, textDecoration: 'none' }}>
              Prestadores
            </Link>
            <span style={{ margin: '0 6px' }}>›</span>
            <Link
              href={rutaListado({ zona })}
              style={{ color: '#0f2d52', fontWeight: 600, textDecoration: 'none' }}
            >
              {zona}
            </Link>
          </nav>

          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #d8e3ed',
            padding: '24px 20px',
            boxShadow: '0 4px 24px rgba(15,45,82,0.06)',
            textAlign: 'center',
            marginBottom: 16,
          }}>
            <div style={{
              width: 104,
              height: 104,
              borderRadius: '50%',
              margin: '0 auto 16px',
              overflow: 'hidden',
              background: '#f4f8fb',
              border: '3px solid #fff',
              boxShadow: '0 2px 12px rgba(15,45,82,0.1)',
            }}>
              {prestador.avatar_url && (
                <img
                  src={prestador.avatar_url}
                  alt={`Foto de ${nombre}`}
                  width={104}
                  height={104}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>

            <h1 style={{
              margin: '0 0 8px',
              fontSize: 24,
              fontWeight: 700,
              color: '#0f2d52',
              lineHeight: 1.25,
            }}>
              {nombre}
            </h1>

            {servicios && (
              <p style={{ margin: '0 0 6px', fontSize: 15, color: '#243b53', lineHeight: 1.45 }}>
                {servicios}
              </p>
            )}

            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4a6078' }}>{zona}</p>

            {prestador.rango_edad && (
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#4a6078' }}>
                {prestador.rango_edad} años
              </p>
            )}

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: '#f8f9fa',
              border: '1px solid #d8e3ed',
            }}>
              <span style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: colorSemaforo(prestador.semaforo),
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: colorSemaforo(prestador.semaforo) }}>
                Documentación: {labelSemaforo(prestador.semaforo)}
              </span>
            </div>
          </div>

          <Seccion titulo="Sobre mí" texto={prestador.sobre_mi} />
          <Seccion titulo="Experiencia" texto={prestador.experiencia} />
          <Seccion titulo="Cursos y estudios" texto={prestador.cursos} />

          <p style={{
            margin: '16px 0 0',
            fontSize: 11,
            lineHeight: 1.5,
            color: '#4a6078',
            textAlign: 'center',
          }}>
            El semáforo indica el estado general de la documentación declarada.
            Orvalya no certifica cumplimiento legal.
          </p>
        </div>
      </article>
    </PublicShell>
  )
}
