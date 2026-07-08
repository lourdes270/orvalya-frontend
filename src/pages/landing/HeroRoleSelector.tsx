import { useNavigate } from 'react-router-dom'
import { Wrench } from '@phosphor-icons/react'
import { limpiarRegistroContratante } from '../../lib/registroConstants'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  NAVY,
  TEAL,
  TEXT_MUTED,
  touchButtonBase,
} from './landingStyles'

const ROLE_PATHS = [
  {
    id: 'contratante',
    intent: 'Necesito contratar',
    title: 'Quiero contratar con papeles al día',
    subtitle: 'Certificados y seguimiento de cada prestador, todo en un lugar',
    to: '/contacto/contratante',
    clearContratante: false,
  },
  {
    id: 'prestador',
    intent: 'Quiero conseguir trabajo',
    title: 'Ofrecé tus servicios · Gratis',
    subtitle: 'Limpieza, construcción, jardinería, cuidados y más',
    to: '/auth',
    clearContratante: true,
  },
] as const

export default function HeroRoleSelector() {
  const navigate = useNavigate()
  const isMobile = useIsMobile(768)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '14px' : '16px',
        width: '100%',
        alignItems: 'stretch',
      }}
    >
      {ROLE_PATHS.map((path) => {
        const isPrestador = path.id === 'prestador'

        return (
          <button
            key={path.intent}
            type="button"
            className={
              isPrestador
                ? 'landing-btn landing-btn-prestador-signup'
                : 'landing-benefit-card landing-btn'
            }
            onClick={() => {
              if (path.clearContratante) limpiarRegistroContratante()
              navigate(path.to)
            }}
            style={{
              ...touchButtonBase,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              width: '100%',
              minHeight: isPrestador
                ? (isMobile ? '136px' : '148px')
                : (isMobile ? '120px' : '132px'),
              padding: isPrestador
                ? (isMobile ? '22px 20px' : '24px 22px')
                : (isMobile ? '20px 18px' : '22px 20px'),
              background: isPrestador ? undefined : '#fff',
              border: isPrestador ? undefined : `2px solid ${TEAL}`,
              borderRadius: '16px',
              boxShadow: isPrestador ? undefined : '0 4px 20px rgba(15, 45, 82, 0.06)',
            }}
          >
            <span style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: isMobile ? '13px' : '12px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isPrestador ? 'rgba(255, 255, 255, 0.92)' : TEAL,
              lineHeight: 1.3,
            }}>
              {path.intent}
            </span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
              fontSize: isPrestador
                ? (isMobile ? '19px' : '18px')
                : (isMobile ? '18px' : '17px'),
              fontWeight: 800,
              color: isPrestador ? '#fff' : NAVY,
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}>
              {isPrestador && (
                <Wrench
                  size={isMobile ? 24 : 22}
                  weight="duotone"
                  color="#fff"
                  aria-hidden
                  style={{ flexShrink: 0 }}
                />
              )}
              {path.title}
            </span>
            <span style={{
              display: 'block',
              fontSize: isPrestador
                ? (isMobile ? '15px' : '14px')
                : (isMobile ? '15px' : '14px'),
              fontWeight: isPrestador ? 600 : 500,
              color: isPrestador ? 'rgba(255, 255, 255, 0.9)' : TEXT_MUTED,
              lineHeight: 1.45,
            }}>
              {path.subtitle}
            </span>
          </button>
        )
      })}
    </div>
  )
}
