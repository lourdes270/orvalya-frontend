import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicShell } from '../_components/PublicShell'
import { CierreCta, Pasos } from '../_components/LandingBloques'
import { COMO_FUNCIONA_PASOS } from '../../src/vistas/landing/landingContent'
import { absoluteUrl, OG_IMAGE_DEFAULT, OG_IMAGE_SIZE } from '../../src/lib/seo'

const TITULO = 'Cómo funciona'
const DESCRIPCION =
  'Tres pasos: registrate gratis y subí tus documentos, Orvalya organiza tus vencimientos ' +
  'y te avisa, y las empresas te encuentran. Todo digital y pensado para Uruguay.'

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: '/como-funciona' },
  openGraph: {
    type: 'website',
    title: TITULO,
    description: DESCRIPCION,
    url: absoluteUrl('/como-funciona'),
    images: [{ url: OG_IMAGE_DEFAULT, ...OG_IMAGE_SIZE, alt: TITULO }],
  },
}

export default function Page() {
  const pasos = COMO_FUNCIONA_PASOS.map(title => ({ title }))

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo funciona Orvalya',
    description: DESCRIPCION,
    step: COMO_FUNCIONA_PASOS.map((title, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: title,
    })),
  }

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />

      <section className="lp-section lp-section--degradado">
        <div className="lp-inner">
          <p className="lp-badge lp-badge--suave">Tres pasos</p>
          <h1 className="lp-h1" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}>
            Cómo funciona
          </h1>
          <p className="lp-cuerpo" style={{ maxWidth: 640, marginBottom: 32 }}>
            Orvalya conecta prestadores independientes con empresas que buscan contratar
            con tranquilidad. Todo el proceso es digital, simple y pensado para Uruguay.
          </p>

          <Pasos pasos={pasos} />
        </div>
      </section>

      <section className="lp-section lp-section--blanca">
        <div className="lp-inner">
          <h2 className="lp-h2">Empezá por acá</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="lp-btn lp-btn--teal" href="/prestadores">
              Buscar prestadores
            </Link>
            <Link className="lp-btn lp-btn--navy" href="/llamados">
              Ver trabajos abiertos
            </Link>
          </div>
        </div>
      </section>

      <CierreCta conVolver />
    </PublicShell>
  )
}
