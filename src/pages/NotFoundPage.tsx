import { useNavigate } from 'react-router-dom'
import { MapPin } from '@phosphor-icons/react'

const NAVY = '#0F2D52'
const TEAL = '#00B4A6'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: '#F4F8FB',
        marginBottom: '24px',
      }}>
        <MapPin size={32} weight="duotone" color={TEAL} />
      </div>
      <p style={{
        margin: '0 0 8px',
        fontSize: '13px',
        fontWeight: 600,
        color: TEAL,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        Error 404
      </p>
      <h1 style={{
        margin: '0 0 12px',
        fontSize: 'clamp(24px, 6vw, 32px)',
        fontWeight: 700,
        color: NAVY,
        lineHeight: 1.25,
      }}>
        Esta página no existe
      </h1>
      <p style={{
        margin: '0 0 32px',
        maxWidth: '320px',
        fontSize: '15px',
        lineHeight: 1.6,
        color: '#4A6078',
      }}>
        La dirección que buscás no está disponible o fue movida.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          width: '100%',
          maxWidth: '280px',
          padding: '14px 24px',
          backgroundColor: TEAL,
          color: '#ffffff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 180, 166, 0.35)',
        }}
      >
        Volver al inicio
      </button>
    </div>
  )
}
