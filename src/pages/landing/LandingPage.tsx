import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, FileText, Buildings } from '@phosphor-icons/react'
import { OrvalyaLogo } from '../../components/OrvalyaLogo'

const NAVY = '#0F2D52'
const TEAL = '#00B4A6'

const cards = [
  {
    icon: MagnifyingGlass,
    title: 'Aparecé en búsquedas',
  },
  {
    icon: FileText,
    title: 'Gestioná tus documentos',
  },
  {
    icon: Buildings,
    title: 'Trabajá con empresas',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #E8EEF4',
      }}>
        <OrvalyaLogo height={28} />
        <button
          type="button"
          onClick={() => navigate('/auth')}
          style={{
            padding: '10px 18px',
            backgroundColor: TEAL,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Iniciar sesión
        </button>
      </header>

      {/* Hero */}
      <section style={{ padding: '40px 20px 32px', textAlign: 'center' }}>
        <h1 style={{
          margin: '0 0 16px',
          fontSize: 'clamp(26px, 6vw, 36px)',
          fontWeight: 700,
          color: NAVY,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
        }}>
          ¿Trabajás de forma independiente en Uruguay?
        </h1>
        <p style={{
          margin: '0 auto 12px',
          maxWidth: '480px',
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#4A6078',
        }}>
          Registrate gratis, aparecé en búsquedas y gestioná tu documentación laboral en un solo lugar.
        </p>
        <p style={{
          margin: '0 auto 28px',
          maxWidth: '480px',
          fontSize: '15px',
          lineHeight: 1.5,
          color: NAVY,
          fontWeight: 600,
        }}>
          Las empresas te buscan a vos — sin intermediarios, sin llamadas, gratis.
        </p>
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          style={{
            width: '100%',
            maxWidth: '360px',
            padding: '16px 24px',
            backgroundColor: TEAL,
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 180, 166, 0.35)',
          }}
        >
          Quiero registrarme
        </button>
      </section>

      {/* Cards */}
      <section style={{ padding: '8px 0 48px' }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          padding: '0 20px 8px',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}>
          {cards.map(({ icon: Icon, title }) => (
            <div
              key={title}
              style={{
                flex: '0 0 200px',
                scrollSnapAlign: 'start',
                backgroundColor: '#F4F8FB',
                borderRadius: '12px',
                padding: '20px 16px',
                textAlign: 'center',
                border: `1px solid #E0EAF2`,
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                marginBottom: '12px',
              }}>
                <Icon size={28} weight="duotone" color={TEAL} />
              </div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: NAVY, lineHeight: 1.4 }}>
                {title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 20px',
        borderTop: '1px solid #E8EEF4',
        textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: '13px' }}>
          <a href="/terminos" style={{ color: NAVY, fontWeight: 600, textDecoration: 'underline' }}>
            Términos y Condiciones
          </a>
          {' · '}
          <a href="/privacidad" style={{ color: NAVY, fontWeight: 600, textDecoration: 'underline' }}>
            Política de Privacidad
          </a>
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#8C96A3' }}>
          Orvalya © 2026 · Uruguay
        </p>
      </footer>
    </div>
  )
}
