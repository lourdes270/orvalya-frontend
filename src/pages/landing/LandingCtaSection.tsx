import { Link, useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { BORDER, NAVY, SURFACE, TEAL, TEXT_MUTED, touchButtonBase } from './landingStyles'

type LandingCtaSectionProps = {
  showBackLink?: boolean
}

export default function LandingCtaSection({ showBackLink = false }: LandingCtaSectionProps) {
  const navigate = useNavigate()
  const isMobile = useIsMobile(768)

  return (
    <section style={{
      padding: isMobile ? '32px 16px 40px' : '48px 24px 56px',
      background: SURFACE,
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h2 style={{
          margin: '0 0 12px',
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: 700,
          color: NAVY,
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
        }}>
          Empezá gratis hoy
        </h2>
        <p style={{
          margin: '0 0 24px',
          fontSize: '16px',
          lineHeight: 1.6,
          color: TEXT_MUTED,
        }}>
          Registrate en minutos y tené tu documentación lista para mostrar.
        </p>
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          style={{
            ...touchButtonBase,
            width: '100%',
            maxWidth: '320px',
            padding: '14px 20px',
            backgroundColor: TEAL,
            color: '#fff',
            border: 'none',
            fontSize: '17px',
            boxShadow: '0 2px 8px rgba(0, 180, 166, 0.25)',
          }}
        >
          Quiero registrarme
        </button>
        <p style={{
          margin: '10px 0 0',
          fontSize: '13px',
          lineHeight: 1.4,
          color: TEXT_MUTED,
        }}>
          Gratis · Sin tarjeta · 2 minutos
        </p>
        {showBackLink && (
          <p style={{ margin: '20px 0 0', fontSize: '14px' }}>
            <Link to="/" style={{ color: NAVY, fontWeight: 600, textDecoration: 'none' }}>
              ← Volver al inicio
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
