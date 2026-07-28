import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { PublicShell } from '../../_components/PublicShell'
import { supabaseServer } from '../../../src/lib/supabaseServer'
import {
  fechaLegible,
  fetchLlamadoPublico,
  llamadoRubroLabel,
  llamadoSlug,
  rutaListadoLlamados,
  diasRestantes,
  type LlamadoPublico,
} from '../../../src/lib/llamadosPublicos'
import {
  absoluteUrl,
  idDesdeSlug,
  OG_IMAGE_DEFAULT,
  OG_IMAGE_SIZE,
  rutaListado,
} from '../../../src/lib/seo'

export const revalidate = 600

type Props = { params: Promise<{ slug: string }> }

async function cargar(slug: string): Promise<LlamadoPublico | null> {
  const id = idDesdeSlug(slug)
  if (!id) return null
  return fetchLlamadoPublico(id, supabaseServer)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const l = await cargar(slug)
  if (!l) return { title: 'Llamado no disponible', robots: { index: false, follow: false } }

  const rubroLabel = llamadoRubroLabel(l.rubro)
  const title = `${l.titulo} — ${l.zona}`
  const description = `${rubroLabel} en ${l.zona}. ${l.descripcion.trim().slice(0, 140)}`
  const canonical = `/llamados/${llamadoSlug(l)}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: absoluteUrl(canonical),
      publishedTime: l.created_at,
      images: [{ url: OG_IMAGE_DEFAULT, ...OG_IMAGE_SIZE, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE_DEFAULT],
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const l = await cargar(slug)
  if (!l) notFound()

  const canonico = llamadoSlug(l)
  if (slug !== canonico) permanentRedirect(`/llamados/${canonico}`)

  const rubroLabel = llamadoRubroLabel(l.rubro)
  const dias = diasRestantes(l.expires_at)

  /**
   * JobPosting es lo que habilita el recuadro de empleos de Google.
   * validThrough es clave: sin él Google mantiene la oferta indefinidamente.
   */
  const jobPosting = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    identifier: { '@type': 'PropertyValue', name: 'Orvalya', value: l.id },
    title: l.titulo,
    description: l.descripcion.trim(),
    datePosted: l.created_at,
    ...(l.expires_at ? { validThrough: l.expires_at } : {}),
    employmentType: 'CONTRACTOR',
    directApply: true,
    industry: rubroLabel,
    hiringOrganization: {
      '@type': 'Organization',
      name: l.publicado_por,
      ...(l.tipo_contratante === 'empresa' ? { url: absoluteUrl('/') } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressRegion: l.zona,
        addressCountry: 'UY',
      },
    },
    url: absoluteUrl(`/llamados/${canonico}`),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Llamados', item: absoluteUrl('/llamados') },
      {
        '@type': 'ListItem',
        position: 3,
        name: l.titulo,
        item: absoluteUrl(`/llamados/${canonico}`),
      },
    ],
  }

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPosting) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <article style={{ padding: '24px 16px 40px', background: '#f4f8fb' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <nav aria-label="Miga de pan" style={{ marginBottom: 16, fontSize: 13 }}>
            <Link href="/llamados" style={{ color: '#0f2d52', fontWeight: 600, textDecoration: 'none' }}>
              Llamados
            </Link>
            <span style={{ margin: '0 6px', color: '#4a6078' }}>›</span>
            <Link
              href={rutaListadoLlamados({ zona: l.zona })}
              style={{ color: '#0f2d52', fontWeight: 600, textDecoration: 'none' }}
            >
              {l.zona}
            </Link>
          </nav>

          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #d8e3ed',
            padding: '24px 22px',
            boxShadow: '0 4px 24px rgba(15,45,82,0.06)',
            marginBottom: 16,
          }}>
            <h1 style={{
              margin: '0 0 12px',
              fontSize: 24,
              fontWeight: 800,
              color: '#0f2d52',
              lineHeight: 1.25,
            }}>
              {l.titulo}
            </h1>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <Link
                className="ov-chip"
                href={rutaListadoLlamados({ rubro: l.rubro })}
                style={{ background: '#eaf9f8', borderColor: '#eaf9f8', color: '#00b4a6' }}
              >
                {rubroLabel}
              </Link>
              <Link className="ov-chip" href={rutaListadoLlamados({ zona: l.zona })}>
                {l.zona}
              </Link>
            </div>

            <p style={{
              margin: '0 0 20px',
              fontSize: 15,
              lineHeight: 1.7,
              color: '#243b53',
              whiteSpace: 'pre-wrap',
            }}>
              {l.descripcion.trim()}
            </p>

            <dl style={{
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '6px 14px',
              fontSize: 13,
              color: '#4a6078',
              borderTop: '1px solid #d8e3ed',
              paddingTop: 16,
            }}>
              <dt style={{ fontWeight: 600 }}>Publicado por</dt>
              <dd style={{ margin: 0 }}>{l.publicado_por}</dd>
              <dt style={{ fontWeight: 600 }}>Fecha</dt>
              <dd style={{ margin: 0 }}>{fechaLegible(l.created_at)}</dd>
              {l.expires_at && (
                <>
                  <dt style={{ fontWeight: 600 }}>Abierto hasta</dt>
                  <dd style={{ margin: 0 }}>
                    {fechaLegible(l.expires_at)}
                    {dias !== null && dias >= 0 && ` · ${dias === 0 ? 'último día' : `${dias} días`}`}
                  </dd>
                </>
              )}
            </dl>

            <div style={{ marginTop: 22 }}>
              <Link
                href="/auth"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 46,
                  padding: '12px 22px',
                  borderRadius: 10,
                  background: '#00b4a6',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Postularme a este llamado
              </Link>
              <p style={{ margin: '10px 0 0', fontSize: 12, color: '#4a6078' }}>
                Necesitás una cuenta de prestador con tu documentación cargada.
              </p>
            </div>
          </div>

          <section style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #d8e3ed',
            padding: 20,
          }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#0f2d52' }}>
              Seguí buscando
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link className="ov-chip" href={rutaListadoLlamados({ rubro: l.rubro, zona: l.zona })}>
                Más llamados de {rubroLabel.toLowerCase()} en {l.zona}
              </Link>
              <Link className="ov-chip" href={rutaListado({ rubro: l.rubro, zona: l.zona })}>
                Prestadores de {rubroLabel.toLowerCase()} en {l.zona}
              </Link>
            </div>
          </section>
        </div>
      </article>
    </PublicShell>
  )
}
