import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, FileText, Buildings, Image as ImageIcon } from '@phosphor-icons/react'
import { useIsMobile } from '../../hooks/useIsMobile'
import LandingCtaSection from './LandingCtaSection'
import LandingLayout from './LandingLayout'
import AudienceSplitSection from './AudienceSplitSection'
import {
  BORDER,
  NAVY,
  SURFACE,
  TEAL,
  TEXT_BODY,
  TEXT_MUTED,
  touchButtonBase,
} from './landingStyles'

/** Colocar en public/hero-servicios.webp (WebP, máx. ~150 KB) */
const HERO_IMAGE_SRC = '/hero-servicios.webp'

const cards = [
  {
    icon: MagnifyingGlass,
    title: 'Aparecé en búsquedas',
    support: 'Las empresas te encuentran sin que vos hagas nada',
  },
  {
    icon: FileText,
    title: 'Subí tus papeles una vez y listo',
    support: 'DGI, BPS y BSE organizados en un solo lugar',
  },
  {
    icon: Buildings,
    title: 'Conseguí más clientes, sin llamar puerta por puerta',
    support: 'Empresas serias buscan prestadores como vos en Orvalya',
  },
]

const rubros = ['Limpieza', 'Mantenimiento', 'Servicios']

function HeroImage({ isMobile }: { isMobile: boolean }) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      style={{
        width: '100%',
        borderRadius: isMobile ? '12px' : '16px',
        overflow: 'hidden',
        background: '#fff',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 8px 32px rgba(15, 45, 82, 0.08)',
        aspectRatio: '4 / 3',
        position: 'relative',
      }}
    >
      {!failed ? (
        <img
          src={HERO_IMAGE_SRC}
          alt="Prestador de servicios en Uruguay"
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
          }}
        />
      ) : (
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '24px',
          background: `linear-gradient(160deg, ${SURFACE} 0%, #fff 55%, #EAF6F4 100%)`,
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: '#fff',
            border: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ImageIcon size={28} color={TEAL} weight="duotone" aria-hidden />
          </div>
          <p style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: 1.45,
            color: TEXT_MUTED,
            textAlign: 'center',
            maxWidth: '220px',
          }}>
            Espacio para foto de prestador de servicios
          </p>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile(768)

  return (
    <LandingLayout>
      <section style={{
        background: `linear-gradient(180deg, ${SURFACE} 0%, #fff 100%)`,
        padding: isMobile ? '28px 16px 32px' : '48px 24px 56px',
      }}>
        <div style={{
          maxWidth: '1040px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '28px' : '48px',
        }}>
          <div style={{
            flex: isMobile ? 'none' : '0 0 44%',
            order: isMobile ? 0 : 1,
          }}>
            <HeroImage isMobile={isMobile} />
          </div>

          <div style={{
            flex: 1,
            textAlign: 'left',
            order: isMobile ? 1 : 0,
          }}>
            <p style={{
              margin: '0 0 12px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: TEAL,
            }}>
              Prestadores independientes · Uruguay
            </p>

            <h1 style={{
              margin: '0 0 16px',
              fontSize: isMobile ? 'clamp(26px, 6.5vw, 32px)' : 'clamp(30px, 3.2vw, 38px)',
              fontWeight: 700,
              color: NAVY,
              lineHeight: 1.22,
              letterSpacing: '-0.025em',
            }}>
              ¿Sos monotributista o unipersonal? Hacé que las empresas te encuentren a vos.
            </h1>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
            }}>
              {rubros.map(r => (
                <span
                  key={r}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
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
              margin: '0 0 12px',
              fontSize: isMobile ? '16px' : '17px',
              lineHeight: 1.6,
              color: TEXT_BODY,
            }}>
              Orvalya te ayuda a mostrar tus papeles al día y aparecer cuando te buscan.
              Ideal si trabajás en limpieza, mantenimiento o servicios para empresas y hogares.
            </p>

            <p style={{
              margin: '0 0 24px',
              fontSize: '15px',
              lineHeight: 1.5,
              color: NAVY,
              fontWeight: 600,
            }}>
              Las empresas te buscan a vos — sin intermediarios, sin llamadas, gratis.
            </p>

            <div style={{ maxWidth: '360px' }}>
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                style={{
                  ...touchButtonBase,
                  width: '100%',
                  padding: '14px 20px',
                  backgroundColor: TEAL,
                  color: '#fff',
                  border: 'none',
                  fontSize: '17px',
                  boxShadow: '0 2px 8px rgba(0, 180, 166, 0.25)',
                } as CSSProperties}
              >
                Quiero registrarme
              </button>
              <p style={{
                margin: '10px 0 0',
                fontSize: '13px',
                lineHeight: 1.4,
                color: TEXT_MUTED,
                textAlign: 'center',
              }}>
                Gratis · Sin tarjeta · 2 minutos
              </p>
            </div>
          </div>
        </div>
      </section>

      <AudienceSplitSection />

      <section style={{
        padding: isMobile ? '32px 16px 40px' : '48px 24px 56px',
        background: '#fff',
      }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <h2 style={{
            margin: '0 0 20px',
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 700,
            color: NAVY,
            letterSpacing: '-0.01em',
          }}>
            ¿Por qué registrarte en Orvalya?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '12px' : '16px',
          }}>
            {cards.map(({ icon: Icon, title, support }) => (
              <article
                key={title}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 2px 12px rgba(15, 45, 82, 0.04)',
                }}
              >
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: SURFACE,
                  marginBottom: '14px',
                }}>
                  <Icon size={24} weight="duotone" color={TEAL} aria-hidden />
                </div>
                <h3 style={{
                  margin: '0 0 6px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: NAVY,
                  lineHeight: 1.35,
                }}>
                  {title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: 1.5,
                  color: TEXT_MUTED,
                }}>
                  {support}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LandingCtaSection />
    </LandingLayout>
  )
}
