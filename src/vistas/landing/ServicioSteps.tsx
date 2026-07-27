import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  benefitCardStyle,
  BORDER,
  NAVY,
  TEAL,
  TEXT_MUTED,
  touchButtonBase,
} from './landingStyles'

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
] as const

export default function ServicioSteps() {
  const navigate = useNavigate()
  const isMobile = useIsMobile(768)

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '28px' : '24px',
        alignItems: isMobile ? 'stretch' : 'flex-start',
        marginBottom: isMobile ? '40px' : '48px',
      }}>
        {SERVICIO_PASOS.map((paso, index) => (
          <div
            key={paso.title}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              gap: isMobile ? '16px' : '12px',
              alignItems: isMobile ? 'flex-start' : 'stretch',
              position: 'relative',
            }}
          >
            {!isMobile && index < SERVICIO_PASOS.length - 1 && (
              <div style={{
                position: 'absolute',
                top: '28px',
                left: 'calc(50% + 28px)',
                right: '-12px',
                height: '2px',
                background: BORDER,
                zIndex: 0,
              }} aria-hidden />
            )}
            <div style={{
              flexShrink: 0,
              width: isMobile ? '52px' : '56px',
              height: isMobile ? '52px' : '56px',
              borderRadius: '14px',
              background: '#fff',
              border: `2px solid ${TEAL}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 1,
            }}>
              <span style={{
                fontSize: isMobile ? '22px' : '24px',
                fontWeight: 800,
                color: TEAL,
                lineHeight: 1,
              }}>
                {index + 1}
              </span>
            </div>
            <div style={{ flex: 1, paddingTop: isMobile ? '4px' : 0 }}>
              <p style={{
                margin: '0 0 6px',
                fontSize: isMobile ? '15px' : '16px',
                lineHeight: 1.55,
                color: NAVY,
                fontWeight: 700,
              }}>
                {paso.title}
              </p>
              <p style={{
                margin: 0,
                fontSize: isMobile ? '14px' : '15px',
                lineHeight: 1.55,
                color: TEXT_MUTED,
              }}>
                {paso.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        ...benefitCardStyle,
        textAlign: 'center',
        padding: isMobile ? '28px 20px' : '32px 28px',
      }}>
        <h3 style={{
          margin: '0 0 16px',
          fontSize: isMobile ? '1.35rem' : '1.5rem',
          fontWeight: 800,
          color: NAVY,
          letterSpacing: '-0.02em',
        }}>
          Plan Seguimiento
        </h3>

        <p style={{
          margin: '0 0 8px',
          fontSize: isMobile ? '15px' : '16px',
          lineHeight: 1.5,
          color: TEXT_MUTED,
        }}>
          <span style={{ textDecoration: 'line-through' }}>$U 1.490 /mes por empresa</span>
        </p>
        <p style={{
          margin: '0 0 20px',
          fontSize: isMobile ? '15px' : '16px',
          fontWeight: 700,
          lineHeight: 1.5,
          color: TEAL,
        }}>
          Bonificado en esta etapa de lanzamiento
        </p>

        <p style={{
          margin: '0 0 24px',
          fontSize: isMobile ? '14px' : '15px',
          lineHeight: 1.6,
          color: TEXT_MUTED,
        }}>
          {PLAN_FEATURES.join(' · ')}
        </p>

        <button
          type="button"
          className="landing-btn"
          onClick={() => navigate('/contacto/contratante')}
          style={{
            ...touchButtonBase,
            width: '100%',
            padding: '16px 24px',
            backgroundColor: TEAL,
            color: '#fff',
            border: 'none',
            fontSize: '17px',
            boxShadow: '0 4px 16px rgba(0, 180, 166, 0.3)',
          }}
        >
          Quiero el servicio
        </button>

        <p style={{
          margin: '14px 0 0',
          fontSize: '14px',
          lineHeight: 1.5,
          color: TEXT_MUTED,
        }}>
          Sin permanencia. Sin tarjeta para empezar.
        </p>
      </div>
    </div>
  )
}
