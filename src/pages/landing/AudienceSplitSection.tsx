import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  MagnifyingGlass,
  UsersThree,
  Wrench,
} from '@phosphor-icons/react'
import { marcarRegistroContratante } from '../../lib/registroConstants'
import { useIsMobile } from '../../hooks/useIsMobile'
import { revealStyle, useScrollReveal } from '../../hooks/useScrollReveal'
import {
  BORDER,
  NAVY,
  SURFACE,
  TEAL,
  TEXT_MUTED,
  badgePillStyle,
  bodyTextStyle,
  sectionPadding,
  sectionSubtitleStyle,
  sectionTitleStyle,
  touchButtonBase,
} from './landingStyles'

const PRESTADORES_IMAGE_SRC = '/hero-prestadores.png'
const EMPRESAS_IMAGE_SRC = '/hero-empresas.png'

const PRESTADOR_BENEFITS = [
  { icon: MagnifyingGlass, title: 'Aparecé en búsquedas', text: 'Te encuentran por rubro y zona' },
  { icon: FileText, title: 'Papeles al día', text: 'DGI, BPS y BSE en un lugar' },
  { icon: UsersThree, title: 'Más clientes', text: 'Sin llamar puerta por puerta' },
] as const

function SectionImage({
  src,
  alt,
  tall,
  position = '50% 38%',
}: {
  src: string
  alt: string
  tall?: boolean
  position?: string
}) {
  const [failed, setFailed] = useState(false)
  const isMobile = useIsMobile(768)

  return (
    <div
      style={{
        width: '100%',
        borderRadius: isMobile ? '16px' : '20px',
        overflow: 'hidden',
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        aspectRatio: tall ? (isMobile ? '4 / 3' : '5 / 4') : (isMobile ? '16 / 9' : '2 / 1'),
        minHeight: tall ? (isMobile ? '260px' : '320px') : (isMobile ? '180px' : '220px'),
        maxHeight: tall ? (isMobile ? '380px' : '480px') : (isMobile ? '240px' : '280px'),
      }}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: position,
          }}
        />
      ) : (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: SURFACE,
          }}
        >
          <Wrench size={40} color={TEAL} weight="duotone" aria-hidden />
        </div>
      )}
    </div>
  )
}

function BenefitMiniCard({
  icon: Icon,
  title,
  text,
  visible,
  staggerMs,
}: {
  icon: typeof MagnifyingGlass
  title: string
  text: string
  visible: boolean
  staggerMs: number
}) {
  return (
    <article
      style={{
        ...revealStyle(visible, staggerMs),
        background: '#fff',
        borderRadius: '14px',
        padding: '20px 18px',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 2px 12px rgba(15, 45, 82, 0.05)',
      }}
    >
      <Icon size={36} weight="duotone" color={TEAL} aria-hidden style={{ marginBottom: '12px' }} />
      <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: NAVY, lineHeight: 1.25 }}>
        {title}
      </h3>
      <p style={{ ...bodyTextStyle, fontSize: '15px', color: TEXT_MUTED }}>{text}</p>
    </article>
  )
}

export default function AudienceSplitSection() {
  const navigate = useNavigate()
  const isMobile = useIsMobile(768)
  const { ref: prestadoresRef, visible: prestadoresVisible } = useScrollReveal<HTMLElement>()
  const { ref: empresasRef, visible: empresasVisible } = useScrollReveal<HTMLElement>()

  return (
    <>
      {/* Prestadores — prioritaria */}
      <section
        ref={prestadoresRef}
        style={{
          ...sectionPadding,
          background: SURFACE,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '36px' : '56px',
            ...revealStyle(prestadoresVisible),
          }}
        >
          <div style={{ flex: isMobile ? 'none' : '0 0 48%' }}>
            <SectionImage
              src={PRESTADORES_IMAGE_SRC}
              alt="Prestadora de servicios usando Orvalya en Uruguay"
              tall
              position="52% 40%"
            />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ ...badgePillStyle, marginBottom: '16px' }}>Para prestadores</p>
            <h2 style={sectionTitleStyle}>
              Hacé que las empresas te encuentren a vos
            </h2>
            <p style={sectionSubtitleStyle}>
              Mostrá tus papeles al día. Aparecé cuando te buscan. Gratis.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '14px',
                marginBottom: '32px',
              }}
            >
              {PRESTADOR_BENEFITS.map((b, i) => (
                <BenefitMiniCard
                  key={b.title}
                  {...b}
                  visible={prestadoresVisible}
                  staggerMs={i * 100}
                />
              ))}
            </div>

            <button
              type="button"
              className="landing-btn"
              onClick={() => navigate('/onboarding')}
              style={{
                ...touchButtonBase,
                width: '100%',
                padding: '16px 24px',
                backgroundColor: TEAL,
                color: '#fff',
                border: 'none',
                fontSize: '18px',
                boxShadow: '0 4px 16px rgba(0, 180, 166, 0.3)',
              }}
            >
              Quiero registrarme
            </button>
          </div>
        </div>
      </section>

      {/* Empresas — secundaria, más compacta */}
      <section
        ref={empresasRef}
        style={{
          padding: isMobile ? '56px 20px' : '72px 24px',
          background: '#fff',
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            maxWidth: '880px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row-reverse',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '28px' : '40px',
            ...revealStyle(empresasVisible),
          }}
        >
          <div style={{ flex: isMobile ? 'none' : '0 0 42%' }}>
            <SectionImage
              src={EMPRESAS_IMAGE_SRC}
              alt="Empresa contratante usando Orvalya en Uruguay"
              position="55% 40%"
            />
          </div>

          <div style={{ flex: 1 }}>
            <p
              style={{
                ...badgePillStyle,
                marginBottom: '12px',
                fontSize: '11px',
                padding: '8px 14px',
                color: TEXT_MUTED,
                borderColor: BORDER,
              }}
            >
              Para empresas
            </p>
            <h2
              style={{
                ...sectionTitleStyle,
                fontSize: isMobile ? '1.5rem' : '1.75rem',
                marginBottom: '12px',
              }}
            >
              Contratá sin riesgos legales
            </h2>
            <p style={{ ...bodyTextStyle, marginBottom: '24px', maxWidth: '40ch' }}>
              Prestadores con documentación visible antes de contratar.
            </p>

            <button
              type="button"
              className="landing-btn"
              onClick={() => {
                marcarRegistroContratante()
                navigate('/auth')
              }}
              style={{
                ...touchButtonBase,
                width: isMobile ? '100%' : 'auto',
                minWidth: isMobile ? undefined : '280px',
                padding: '14px 24px',
                backgroundColor: '#fff',
                color: NAVY,
                border: `2px solid ${TEAL}`,
                fontSize: '16px',
              }}
            >
              Busco prestadores
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
