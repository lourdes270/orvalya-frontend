import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Buildings, Check, Wrench } from '@phosphor-icons/react'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  BORDER,
  NAVY,
  SURFACE,
  TEAL,
  TEXT_BODY,
  TEXT_MUTED,
  touchButtonBase,
} from './landingStyles'

const PRESTADORES_IMAGE_SRC = '/hero-prestadores.png'
const EMPRESAS_IMAGE_SRC = '/hero-empresas.png'

type AudienceCardProps = {
  imageSrc?: string
  imageAlt: string
  imagePosition?: string
  placeholderIcon: typeof Wrench
  placeholderLabel: string
  label: string
  title: string
  support: string
  checks: string[]
  ctaLabel: string
  onCta: () => void
  ctaVariant: 'teal' | 'outline'
}

function AudienceCardImage({
  imageSrc,
  imageAlt,
  imagePosition = 'center',
  placeholderIcon: PlaceholderIcon,
  placeholderLabel,
}: Pick<AudienceCardProps, 'imageSrc' | 'imageAlt' | 'imagePosition' | 'placeholderIcon' | 'placeholderLabel'>) {
  const [failed, setFailed] = useState(!imageSrc)

  return (
    <div style={{
      width: '100%',
      aspectRatio: '16 / 10',
      overflow: 'hidden',
      background: SURFACE,
      borderBottom: `1px solid ${BORDER}`,
    }}>
      {!failed && imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt}
          width={520}
          height={325}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: imagePosition,
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
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: '#fff',
            border: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PlaceholderIcon size={26} color={TEAL} weight="duotone" aria-hidden />
          </div>
          <p style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: 1.45,
            color: TEXT_MUTED,
            textAlign: 'center',
            maxWidth: '220px',
          }}>
            {placeholderLabel}
          </p>
        </div>
      )}
    </div>
  )
}

function AudienceCard({
  imageSrc,
  imageAlt,
  imagePosition,
  placeholderIcon,
  placeholderLabel,
  label,
  title,
  support,
  checks,
  ctaLabel,
  onCta,
  ctaVariant,
}: AudienceCardProps) {
  const isMobile = useIsMobile(768)

  return (
    <article style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      borderRadius: '16px',
      border: `1px solid ${BORDER}`,
      boxShadow: '0 4px 24px rgba(15, 45, 82, 0.06)',
      overflow: 'hidden',
      height: '100%',
    }}>
      <AudienceCardImage
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        imagePosition={imagePosition}
        placeholderIcon={placeholderIcon}
        placeholderLabel={placeholderLabel}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: isMobile ? '20px' : '24px',
      }}>
        <p style={{
          margin: '0 0 10px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: TEAL,
        }}>
          {label}
        </p>

        <h2 style={{
          margin: '0 0 10px',
          fontSize: isMobile ? 'clamp(20px, 4.5vw, 24px)' : 'clamp(22px, 2.2vw, 26px)',
          fontWeight: 700,
          color: NAVY,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
        }}>
          {title}
        </h2>

        <p style={{
          margin: '0 0 18px',
          fontSize: '15px',
          lineHeight: 1.55,
          color: TEXT_BODY,
        }}>
          {support}
        </p>

        <ul style={{
          margin: '0 0 24px',
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flex: 1,
        }}>
          {checks.map(item => (
            <li
              key={item}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '14px',
                lineHeight: 1.45,
                color: TEXT_BODY,
              }}
            >
              <Check
                size={18}
                weight="bold"
                color={TEAL}
                aria-hidden
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onCta}
          style={{
            ...touchButtonBase,
            width: '100%',
            padding: '13px 18px',
            fontSize: '16px',
            ...(ctaVariant === 'teal'
              ? {
                  backgroundColor: TEAL,
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0, 180, 166, 0.25)',
                }
              : {
                  backgroundColor: '#fff',
                  color: NAVY,
                  border: `2px solid ${TEAL}`,
                }),
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </article>
  )
}

export default function AudienceSplitSection() {
  const navigate = useNavigate()
  const isMobile = useIsMobile(768)

  return (
    <section style={{
      padding: isMobile ? '32px 16px' : '48px 24px',
      background: SURFACE,
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '16px' : '20px',
          alignItems: 'stretch',
        }}>
          <AudienceCard
            imageSrc={PRESTADORES_IMAGE_SRC}
            imageAlt="Prestadora de servicios en Uruguay"
            imagePosition="left 62%"
            placeholderIcon={Wrench}
            placeholderLabel="Ilustración de prestador de servicios"
            label="Para prestadores · Uruguay"
            title="Hacé que las empresas te encuentren a vos"
            support="Mostrá tu documentación al día y aparecé cuando te buscan por rubro y zona. Gratis, sin intermediarios."
            checks={[
              'Aparecé en búsquedas por rubro y zona',
              'DGI, BPS y BSE organizados en un solo lugar',
              'Perfil listo para mostrar cuando te contactan',
              'Registro gratis, sin tarjeta ni llamadas',
            ]}
            ctaLabel="Quiero registrarme"
            onCta={() => navigate('/onboarding')}
            ctaVariant="teal"
          />

          <AudienceCard
            imageSrc={EMPRESAS_IMAGE_SRC}
            imageAlt="Contratante verificando prestadores en Uruguay"
            imagePosition="center 22%"
            placeholderIcon={Buildings}
            placeholderLabel="Ilustración de empresa contratante"
            label="Para empresas · Uruguay"
            title="Contratá servicios sin asumir riesgos legales"
            support="Encontrá prestadores con documentación visible antes de contratar y reducí la exposición de tu empresa."
            checks={[
              'Verificá documentación antes de contratar',
              'Reducí tu responsabilidad solidaria',
              'Encontrá prestadores por zona y rubro',
              'Todo organizado en un solo lugar',
            ]}
            ctaLabel="Quiero buscar prestadores"
            onCta={() => navigate('/contacto/contratante')}
            ctaVariant="outline"
          />
        </div>
      </div>
    </section>
  )
}
