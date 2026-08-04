import Link from 'next/link'
import { DEPARTAMENTOS } from '../../src/vistas/onboarding/data/zonas'
import { RUBROS } from '../../src/vistas/onboarding/data/rubros'
import type { SeoCopy } from '../../src/lib/seoCopy'
import { rutaListado } from '../../src/lib/seo'
import { rutaListadoLlamados } from '../../src/lib/llamadosPublicos'

const RUBROS_SEO = RUBROS.filter(r => r.id !== 'otro' && r.subrubros.length > 0)

type Props = {
  seo: SeoCopy
  rubro: string | null
  zona: string | null
  variante: 'prestadores' | 'llamados'
}

/**
 * Bloque de texto + FAQ + enlaces internos para maximizar señales SEO
 * (keywords cortas, región y búsquedas colaterales) sin afectar la UX principal.
 */
export function SeoListadoBloque({ seo, rubro, zona, variante }: Props) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faqs.map(f => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  }

  const ruta = variante === 'prestadores' ? rutaListado : rutaListadoLlamados
  const cruzada = variante === 'prestadores' ? rutaListadoLlamados : rutaListado
  const labelCruzada = variante === 'prestadores'
    ? `Ver trabajos y llamados${zona ? ` en ${zona}` : ''}`
    : `Ver prestadores${zona ? ` en ${zona}` : ''}`

  const zonasRelacionadas = zona
    ? DEPARTAMENTOS.filter(d => d !== zona).slice(0, 8)
    : ['Montevideo', 'Canelones', 'Maldonado', 'Colonia', 'Salto', 'Paysandú', 'Rivera', 'Artigas']

  const rubrosRelacionados = rubro
    ? RUBROS_SEO.filter(r => r.id !== rubro).slice(0, 8)
    : RUBROS_SEO.slice(0, 8)

  return (
    <section
      style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid #d8e3ed' }}
      aria-label="Información sobre esta búsqueda"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <h2 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#0f2d52' }}>
        {zona
          ? `Servicios y zona: ${zona}, Uruguay`
          : 'Servicios en todo Uruguay'}
      </h2>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#4a6078', lineHeight: 1.65, maxWidth: 720 }}>
        {seo.cuerpo}
      </p>

      {seo.faqs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0f2d52' }}>
            Preguntas frecuentes
          </h3>
          <dl style={{ margin: 0 }}>
            {seo.faqs.map(f => (
              <div key={f.pregunta} style={{ marginBottom: 14 }}>
                <dt style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#0f2d52' }}>
                  {f.pregunta}
                </dt>
                <dd style={{ margin: 0, fontSize: 13, color: '#4a6078', lineHeight: 1.55 }}>
                  {f.respuesta}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#4a6078' }}>
          Explorar por departamento
        </h3>
        <div className="ov-filtros">
          {zonasRelacionadas.map(d => (
            <Link key={d} className="ov-chip" href={ruta({ rubro, zona: d })}>
              {d}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#4a6078' }}>
          Otros servicios
        </h3>
        <div className="ov-filtros">
          {rubrosRelacionados.map(r => (
            <Link key={r.id} className="ov-chip" href={ruta({ rubro: r.id, zona })}>
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <Link className="ov-chip" href={cruzada({ rubro, zona })}>
        {labelCruzada}
      </Link>
    </section>
  )
}
