import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PublicShell } from '../_components/PublicShell'
import privacidadContent from '../../src/content/legal/privacidad.gen'
import { CURRENT_PRIVACY_VERSION } from '../../src/config/legalVersions'
import { absoluteUrl, OG_IMAGE_DEFAULT, OG_IMAGE_SIZE } from '../../src/lib/seo'

const TITULO = 'Política de Privacidad'

export const metadata: Metadata = {
  title: TITULO,
  description:
    'Cómo Orvalya trata tus datos personales y tu documentación, conforme a la ' +
    'Ley 18.331 de protección de datos personales de Uruguay.',
  alternates: { canonical: '/privacidad' },
  openGraph: {
    type: 'article',
    title: TITULO,
    url: absoluteUrl('/privacidad'),
    images: [{ url: OG_IMAGE_DEFAULT, ...OG_IMAGE_SIZE, alt: TITULO }],
  },
}

export default function Page() {
  return (
    <PublicShell>
      <article className="lp-legal">
        <div className="lp-inner--angosto">
          <h1>{TITULO}</h1>
          <p className="lp-legal-version">Versión vigente: {CURRENT_PRIVACY_VERSION}</p>

          <ReactMarkdown remarkPlugins={[remarkGfm]}>{privacidadContent}</ReactMarkdown>

          <p style={{ marginTop: 40 }}>
            <Link href="/">← Volver al inicio</Link>
          </p>
        </div>
      </article>
    </PublicShell>
  )
}
