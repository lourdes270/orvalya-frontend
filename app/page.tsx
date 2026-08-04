import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicShell } from './_components/PublicShell'
import { CierreCta, Pasos, PorQueOrvalya } from './_components/LandingBloques'
import { absoluteUrl, OG_IMAGE_DEFAULT, OG_IMAGE_SIZE, SITE_NAME, SITE_URL } from '../src/lib/seo'

const TITULO = 'Orvalya — Prestadores y servicios tercerizados en Uruguay'
const DESCRIPCION =
  'Prestadores de limpieza, cuidados, oficios y más en Uruguay. ' +
  'Empresas: seguimiento documental de tercerizados (BPS, BSE, DGI). ' +
  'Buscá por departamento y contratá con papeles al día.'

export const metadata: Metadata = {
  title: { absolute: TITULO },
  description: DESCRIPCION,
  keywords: [
    'prestadores Uruguay',
    'limpieza',
    'tercerizados',
    'servicios',
    'documentación',
    'BPS',
    'BSE',
    'trabajo',
    'Montevideo',
    'Orvalya',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: TITULO,
    description: DESCRIPCION,
    url: SITE_URL,
    locale: 'es_UY',
    images: [{ url: OG_IMAGE_DEFAULT, ...OG_IMAGE_SIZE, alt: SITE_NAME }],
  },
}

const SERVICIO_PASOS = [
  {
    title: 'Nos pasás tus prestadores',
    text: 'Una lista simple: quiénes trabajan con vos.',
  },
  {
    title: 'Armamos el legajo de cada uno',
    text: 'Certificados y documentación declarada, todo en un solo lugar con fecha y hora.',
  },
  {
    title: 'Te avisamos antes de cada vencimiento',
    text: 'Nunca más un certificado vencido sin que lo sepas.',
  },
] as const

const PLAN_FEATURES = [
  'Legajo digital por prestador',
  'Alertas de vencimiento',
  'Documentación declarada a la vista',
]

const PRESTADOR_BENEFICIOS = [
  { title: 'Aparecé en búsquedas', text: 'Te encuentran por rubro y zona' },
  { title: 'Papeles al día', text: 'DGI, BPS y BSE en un lugar' },
  { title: 'Más clientes', text: 'Sin llamar puerta por puerta' },
]

export default function Page() {
  const organizacion = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/logo512.png'),
    description: DESCRIPCION,
    areaServed: { '@type': 'Country', name: 'Uruguay' },
    knowsLanguage: 'es-UY',
  }

  const sitio = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'es-UY',
    description: DESCRIPCION,
    about: {
      '@type': 'Thing',
      name: 'Prestadores de servicios y seguimiento documental en Uruguay',
    },
  }

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizacion) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sitio) }}
      />

      <section className="lp-section lp-section--degradado">
        <div className="lp-inner lp-hero">
          <div className="lp-hero-texto">
            <p className="lp-badge">Empresas que tercerizan · Uruguay</p>

            <h1 className="lp-h1">
              ¿Tercerizás servicios? Nosotros te llevamos el seguimiento documental.
            </h1>

            <p className="lp-destacado">
              Certificados, vencimientos y legajo de cada prestador, ordenados y al día.
              Vos contratás con tranquilidad, nosotros perseguimos los papeles.
            </p>

            <p className="lp-cuerpo lp-cuerpo--apagado">
              Servicio para empresas de todo Uruguay.
            </p>

            <div className="lp-roles">
              <a
                className="lp-rol landing-btn landing-btn-contratante-signup"
                href="/contacto/contratante"
              >
                <span className="lp-rol-intencion">Necesito contratar</span>
                <span className="lp-rol-titulo">Quiero contratar con papeles al día</span>
                <span className="lp-rol-sub">
                  Certificados y seguimiento de cada prestador, todo en un lugar
                </span>
              </a>

              <a
                className="lp-rol landing-btn landing-btn-prestador-signup"
                href="/auth"
              >
                <span className="lp-rol-intencion">Quiero conseguir trabajo</span>
                <span className="lp-rol-titulo">Ofrecé tus servicios · Gratis</span>
                <span className="lp-rol-sub">
                  Limpieza, construcción, jardinería, cuidados y más
                </span>
              </a>
            </div>
          </div>

          <div className="lp-hero-img">
            <figure className="lp-figura" style={{ margin: 0 }}>
              <img
                src="/hero-servicios.jpg"
                alt="Prestador de servicios acordando trabajo con una empresa en Uruguay"
                width={840}
                height={630}
                fetchPriority="high"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--blanca">
        <div className="lp-inner">
          <Pasos pasos={SERVICIO_PASOS} />

          <div className="lp-plan">
            <h3>Plan Seguimiento</h3>
            <p className="lp-cuerpo lp-cuerpo--apagado" style={{ marginBottom: 8 }}>
              <span className="lp-plan-tachado">$U 1.490 /mes por empresa</span>
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#00b4a6' }}>
              Bonificado en esta etapa de lanzamiento
            </p>
            <p className="lp-cuerpo lp-cuerpo--apagado" style={{ fontSize: 14 }}>
              {PLAN_FEATURES.join(' · ')}
            </p>
            <a className="lp-btn lp-btn--teal lp-btn--bloque" href="/contacto/contratante">
              Quiero el servicio
            </a>
            <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.5, color: '#4a6078' }}>
              Sin permanencia. Sin tarjeta para empezar.
            </p>
          </div>
        </div>
      </section>

      {/* Empresas */}
      <section className="lp-section lp-section--surface">
        <div className="lp-inner lp-hero">
          <div className="lp-hero-texto">
            <p className="lp-badge">Para empresas</p>
            <h2 className="lp-h2">Contratá con la documentación a la vista</h2>
            <p className="lp-cuerpo">
              Cada prestador con su legajo y su documentación declarada, visible antes de
              contratar. Y si querés que lo llevemos por vos, ese es nuestro servicio.
            </p>
            <Link className="lp-btn lp-btn--teal" href="/prestadores">
              Ver prestadores disponibles
            </Link>
          </div>
          <div className="lp-hero-img">
            <figure className="lp-figura" style={{ margin: 0 }}>
              <img
                src="/hero-empresas.png"
                alt="Empresa contratante usando Orvalya en Uruguay"
                width={840}
                height={630}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* Prestadores */}
      <section className="lp-section lp-section--blanca">
        <div className="lp-inner">
          <p className="lp-badge lp-badge--suave">Para prestadores</p>
          <h2 className="lp-h2">Hacé que las empresas te encuentren a vos</h2>
          <p className="lp-cuerpo">
            Mostrá tus papeles al día. Aparecé cuando te buscan. Gratis.
          </p>

          <ul className="lp-tarjetas" style={{ marginBottom: 24 }}>
            {PRESTADOR_BENEFICIOS.map(b => (
              <li className="lp-tarjeta" key={b.title}>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a className="lp-btn lp-btn--teal" href="/auth">
              Quiero registrarme
            </a>
            <Link className="lp-btn lp-btn--navy" href="/llamados">
              Ver trabajos abiertos
            </Link>
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--surface">
        <div className="lp-inner">
          <h2 className="lp-h2">¿Por qué Orvalya?</h2>
          <PorQueOrvalya />
        </div>
      </section>

      <CierreCta />
    </PublicShell>
  )
}
