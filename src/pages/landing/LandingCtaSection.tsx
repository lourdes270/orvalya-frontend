import { Link, useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { NAVY, TEAL, touchButtonBase } from './landingStyles'

type LandingCtaSectionProps = {
  showBackLink?: boolean
}

export default function LandingCtaSection({ showBackLink = false }: LandingCtaSectionProps) {
  const navigate = useNavigate()
  const isMobile = useIsMobile(768)

  return (
    <section style={{
      padding: isMobile ? '80px 20px' : '100px 24px',
      background: NAVY,
    }}>
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: isMobile ? '2rem' : '2.25rem',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          Empezá gratis hoy
        </h2>
        <p style={{
          margin: '0 0 36px',
          fontSize: '17px',
          fontWeight: 600,
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.88)',
        }}>
          Tu perfil listo en minutos.
        </p>
        <button
          type="button"
          className="landing-btn"
          onClick={() => navigate('/onboarding')}
          style={{
            ...touchButtonBase,
            width: '100%',
            maxWidth: '360px',
            padding: '18px 28px',
            backgroundColor: TEAL,
            color: '#fff',
            border: 'none',
            fontSize: '18px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          Quiero registrarme
        </button>
        <p style={{
          margin: '16px 0 0',
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: 1.5,
          color: 'rgba(255, 255, 255, 0.75)',
        }}>
          Gratis · Sin tarjeta · 2 minutos
        </p>
        {showBackLink && (
          <p style={{ margin: '28px 0 0', fontSize: '15px' }}>
            <Link to="/" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>
              ← Volver al inicio
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
