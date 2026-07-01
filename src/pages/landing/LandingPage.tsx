import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image as ImageIcon } from '@phosphor-icons/react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { revealStyle, useHeroFadeIn } from '../../hooks/useScrollReveal'
import { limpiarRegistroContratante, marcarRegistroContratante } from '../../lib/registroConstants'
import './landing.css'
import LandingCtaSection from './LandingCtaSection'
import LandingLayout from './LandingLayout'
import AudienceSplitSection from './AudienceSplitSection'
import PorQueOrvalyaGrid from './PorQueOrvalyaGrid'
import {
  BORDER,
  NAVY,
  SURFACE,
  TEAL,
  TEXT_MUTED,
  badgePillStyle,
  bodyTextStyle,
  heroTitleStyle,
  sectionPadding,
  touchButtonBase,
} from './landingStyles'

const HERO_IMAGE_SRC = '/hero-servicios.jpg'

const rubros = ['Limpieza', 'Mantenimiento', 'Servicios']

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
  const navigate = useNavigate()
  const isMobile = useIsMobile(768)
  const heroVisible = useHeroFadeIn()

  return (
    <LandingLayout>
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
              Prestadores independientes · Uruguay
            </p>

            <h1 style={heroTitleStyle(isMobile)}>
              ¿Sos monotributista? Que las empresas te encuentren a vos.
            </h1>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '20px',
            }}>
              {rubros.map(r => (
                <span
                  key={r}
                  style={{
                    padding: '8px 14px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: NAVY,
                    background: '#fff',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '999px',
                  }}
                >
                  {r}
                </span>
              ))}
            </div>

            <p style={{
              ...bodyTextStyle,
              marginBottom: '12px',
              fontWeight: 600,
              fontSize: '17px',
            }}>
              Papeles al día. Aparecé cuando te buscan. Sin intermediarios.
            </p>

            <p style={{
              margin: '0 0 32px',
              fontSize: '16px',
              lineHeight: 1.6,
              color: TEXT_MUTED,
            }}>
              Gratis para prestadores en Uruguay.
            </p>

            <div style={{ width: '100%' }}>
              <button
                type="button"
                className="landing-btn"
                onClick={() => {
                  limpiarRegistroContratante()
                  navigate('/auth')
                }}
                style={{
                  ...touchButtonBase,
                  width: '100%',
                  padding: '18px 24px',
                  backgroundColor: TEAL,
                  color: '#fff',
                  border: 'none',
                  fontSize: '18px',
                  boxShadow: '0 4px 16px rgba(0, 180, 166, 0.3)',
                } as CSSProperties}
              >
                Quiero registrarme
              </button>
              <button
                type="button"
                className="landing-btn"
                onClick={() => {
                  marcarRegistroContratante()
                  navigate('/auth')
                }}
                style={{
                  ...touchButtonBase,
                  width: '100%',
                  marginTop: '14px',
                  padding: '16px 24px',
                  backgroundColor: 'transparent',
                  color: NAVY,
                  border: `2px solid ${BORDER}`,
                  fontSize: '16px',
                  fontWeight: 600,
                } as CSSProperties}
              >
                Soy empresa, busco prestadores
              </button>
            </div>
          </div>
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
