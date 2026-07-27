import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PublicShell } from '../_components/PublicShell'
import terminosContent from '../../src/content/legal/terminos.gen'
import { CURRENT_TERMS_VERSION } from '../../src/config/legalVersions'
import {
  DISCLAIMER_PLATAFORMA,
  LEGAL_SUMMARY_BULLETS,
} from '../../src/vistas/legal/legalCopy'
import { absoluteUrl, OG_IMAGE_DEFAULT, OG_IMAGE_SIZE } from '../../src/lib/seo'

const TITULO = 'Términos y Condiciones'

export const metadata: Metadata = {
  title: TITULO,
  description:
    'Términos y condiciones de uso de Orvalya: qué hace la plataforma, qué no, ' +
    'y las responsabilidades de prestadores y empresas contratantes.',
  alternates: { canonical: '/terminos' },
  openGraph: {
    type: 'article',
    title: TITULO,
    url: absoluteUrl('/terminos'),
    images: [{ url: OG_IMAGE_DEFAULT, ...OG_IMAGE_SIZE, alt: TITULO }],
  },
}

export default function Page() {
  return (
    <PublicShell>
      <article className="lp-legal">
        <div className="lp-inner--angosto">
          <h1>{TITULO}</h1>
          <p className="lp-legal-version">Versión vigente: {CURRENT_TERMS_VERSION}</p>

          <p>{DISCLAIMER_PLATAFORMA}</p>

          <h2>Resumen de lo que aceptás</h2>
          <ul>
            {LEGAL_SUMMARY_BULLETS.map(b => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <hr style={{ border: 'none', borderTop: '1px solid #d8e3ed', margin: '28px 0' }} />

          <ReactMarkdown remarkPlugins={[remarkGfm]}>{terminosContent}</ReactMarkdown>

          <p style={{ marginTop: 40 }}>
            <Link href="/">← Volver al inicio</Link>
          </p>
        </div>
      </article>
    </PublicShell>
  )
}
