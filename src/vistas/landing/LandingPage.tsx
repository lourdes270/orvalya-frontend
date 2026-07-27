import { useState, type CSSProperties } from 'react'
import { Image as ImageIcon } from '@phosphor-icons/react'
import { PageMeta } from '../../components/seo/PageMeta'
import { useIsMobile } from '../../hooks/useIsMobile'
import { revealStyle, useHeroFadeIn } from '../../hooks/useScrollReveal'
import './landing.css'
import LandingCtaSection from './LandingCtaSection'
import LandingLayout from './LandingLayout'
import AudienceSplitSection from './AudienceSplitSection'
import PorQueOrvalyaGrid from './PorQueOrvalyaGrid'
import ServicioSteps from './ServicioSteps'
import HeroRoleSelector from './HeroRoleSelector'
import {
  BORDER,
  SURFACE,
  TEAL,
  TEXT_MUTED,
  badgePillStyle,
  bodyTextStyle,
  heroTitleStyle,
  sectionPadding,
} from './landingStyles'

const HERO_IMAGE_SRC = '/hero-servicios.jpg'

const LANDING_TITLE = 'Orvalya — Seguimiento documental de prestadores tercerizados en Uruguay'
const LANDING_DESCRIPTION =
  'Legajos, certificados y alertas de vencimiento de tus prestadores tercerizados, en un solo lugar. Leyes 18.099 y 18.251. Servicio para empresas uruguayas.'

function heroRevealStyle(visible: boolean, delay = 0): CSSProperties {
  return revealStyle(visible, delay)
}

function HeroImage({ isMobile }: { isMobile: boolean }) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      style={{
        width: '100%',
        borderRadius: isMobile ? '16px' : '20px',
        overflow: 'hidden',
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        boxShadow: '0 12px 32px rgba(15, 45, 82, 0.1)',
        aspectRatio: isMobile ? '4 / 3' : '5 / 4',
        minHeight: isMobile ? '240px' : undefined,
        maxHeight: isMobile ? '340px' : '440px',
      }}
    >
      {!failed ? (
        <img
          src={HERO_IMAGE_SRC}
          alt="Prestador de servicios acordando trabajo con una empresa en Uruguay"
          width={840}
          height={630}
          decoding="async"
          fetchPriority="high"
          loading="eager"
          onError={() => setFailed(true)}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: isMobile ? '58% 42%' : '52% 38%',
          }}
        />
      ) : (
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '24px',
          background: SURFACE,
        }}>
          <ImageIcon size={32} color={TEAL} weight="duotone" aria-hidden />
          <p style={{ margin: 0, fontSize: '15px', color: TEXT_MUTED, textAlign: 'center' }}>
            Foto de prestador de servicios
          </p>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const isMobile = useIsMobile(768)
  const heroVisible = useHeroFadeIn()

  return (
    <LandingLayout>
      <PageMeta title={LANDING_TITLE} description={LANDING_DESCRIPTION} />

      <section style={{
        background: `linear-gradient(180deg, ${SURFACE} 0%, #fff 100%)`,
        ...sectionPadding,
        paddingBottom: isMobile ? '80px' : '100px',
      }}>
        <div style={{
          maxWidth: '1040px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '40px' : '56px',
        }}>
          <div style={{
            flex: isMobile ? 'none' : '0 0 44%',
            order: isMobile ? 0 : 1,
            ...heroRevealStyle(heroVisible, 120),
          }}>
            <HeroImage isMobile={isMobile} />
          </div>

          <div style={{
            flex: 1,
            textAlign: 'left',
            order: isMobile ? 1 : 0,
            ...heroRevealStyle(heroVisible),
          }}>
            <p style={badgePillStyle}>
              Empresas que tercerizan · Uruguay
            </p>

            <h1 style={heroTitleStyle(isMobile)}>
              ¿Tercerizás servicios? Nosotros te llevamos el seguimiento documental.
            </h1>

            <p style={{
              ...bodyTextStyle,
              marginBottom: '12px',
              fontWeight: 600,
              fontSize: '17px',
            }}>
              Certificados, vencimientos y legajo de cada prestador, ordenados y al día.
              Vos contratás con tranquilidad, nosotros perseguimos los papeles.
            </p>

            <p style={{
              margin: '0 0 24px',
              fontSize: '16px',
              lineHeight: 1.6,
              color: TEXT_MUTED,
            }}>
              Servicio para empresas de todo Uruguay.
            </p>

            <HeroRoleSelector />
          </div>
        </div>
      </section>

      <section style={{
        ...sectionPadding,
        paddingTop: isMobile ? '56px' : '72px',
        background: '#fff',
        borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <ServicioSteps />
        </div>
      </section>

      <AudienceSplitSection />

      <section style={{
        ...sectionPadding,
        background: '#fff',
      }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <PorQueOrvalyaGrid />
        </div>
      </section>

      <LandingCtaSection />
    </LandingLayout>
  )
}
