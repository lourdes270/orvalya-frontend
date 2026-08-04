import type { Metadata } from 'next'
import { PublicShell } from '../_components/PublicShell'
import { CierreCta, PorQueOrvalya } from '../_components/LandingBloques'
import {
  QUIENES_SOMOS_TEXT,
  VISION_TEXT,
} from '../../src/vistas/landing/landingContent'
import { absoluteUrl, OG_IMAGE_DEFAULT, OG_IMAGE_SIZE } from '../../src/lib/seo'

const TITULO = 'Quiénes somos'
const DESCRIPCION =
  'Orvalya nace de más de una década de experiencia en el sector de servicios en Uruguay. ' +
  'Conocé por qué construimos la plataforma de seguimiento documental para prestadores independientes y empresas.'

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: '/quienes-somos' },
  openGraph: {
    type: 'website',
    title: TITULO,
    description: DESCRIPCION,
    url: absoluteUrl('/quienes-somos'),
    images: [{ url: OG_IMAGE_DEFAULT, ...OG_IMAGE_SIZE, alt: TITULO }],
  },
}

export default function Page() {
  return (
    <PublicShell>
      <section className="lp-section lp-section--degradado">
        <div className="lp-inner">
          <p className="lp-badge">Sobre Orvalya</p>
          <h1 className="lp-h1" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}>
            Quiénes somos
          </h1>
          <p className="lp-cuerpo" style={{ maxWidth: 720 }}>
            {QUIENES_SOMOS_TEXT}
          </p>
        </div>
      </section>

      <section className="lp-section lp-section--surface">
        <div className="lp-inner">
          <h2 className="lp-h2">Visión</h2>
          <p className="lp-cuerpo" style={{ maxWidth: 720 }}>
            {VISION_TEXT}
          </p>
        </div>
      </section>

      <section className="lp-section lp-section--blanca">
        <div className="lp-inner">
          <h2 className="lp-h2">Por qué Orvalya</h2>
          <PorQueOrvalya />
        </div>
      </section>

      <CierreCta conVolver />
    </PublicShell>
  )
}
