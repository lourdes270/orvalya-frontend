import { useNavigate } from 'react-router-dom'
import { Briefcase, Wrench } from '@phosphor-icons/react'
import { limpiarRegistroContratante } from '../../lib/registroConstants'
import { useIsMobile } from '../../hooks/useIsMobile'
import { touchButtonBase } from './landingStyles'

const ROLE_PATHS = [
  {
    id: 'contratante',
    intent: 'Necesito contratar',
    title: 'Quiero contratar con papeles al día',
    subtitle: 'Certificados y seguimiento de cada prestador, todo en un lugar',
    to: '/contacto/contratante',
    clearContratante: false,
    cardClass: 'landing-btn landing-btn-contratante-signup',
    Icon: Briefcase,
  },
  {
    id: 'prestador',
    intent: 'Quiero conseguir trabajo',
    title: 'Ofrecé tus servicios · Gratis',
    subtitle: 'Limpieza, construcción, jardinería, cuidados y más',
    to: '/auth',
    clearContratante: true,
    cardClass: 'landing-btn landing-btn-prestador-signup',
    Icon: Wrench,
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
        const Icon = path.Icon

        return (
          <button
            key={path.intent}
            type="button"
            className={path.cardClass}
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
              minHeight: isMobile ? '136px' : '148px',
              padding: isMobile ? '22px 20px' : '24px 22px',
              borderRadius: '16px',
            }}
          >
            <span style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: isMobile ? '13px' : '12px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.92)',
              lineHeight: 1.3,
            }}>
              {path.intent}
            </span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
              fontSize: isMobile ? '19px' : '18px',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}>
              <Icon
                size={isMobile ? 24 : 22}
                weight="duotone"
                color="#fff"
                aria-hidden
                style={{ flexShrink: 0 }}
              />
              {path.title}
            </span>
            <span style={{
              display: 'block',
              fontSize: isMobile ? '15px' : '14px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
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
