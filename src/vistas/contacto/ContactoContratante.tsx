import { useNavigate } from 'react-router-dom'
import ContactoForm from './ContactoForm'
import { NAVY, TEAL } from './contactoStyles'

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_CONTRATANTE_URL as string

export default function ContactoContratante() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #E8EEF4',
      }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: NAVY,
            letterSpacing: '-0.02em',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Orvalya
        </button>
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

      <main style={{ padding: '32px 20px 48px', maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{
          margin: '0 0 12px',
          fontSize: 'clamp(24px, 5vw, 32px)',
          fontWeight: 700,
          color: NAVY,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
        }}>
          Conectamos empresas con los mejores prestadores de servicios
        </h1>
        <p style={{
          margin: '0 0 28px',
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#4A6078',
        }}>
          Contanos qué necesitás y te contactamos.
        </p>

        <ContactoForm
          formspreeEndpoint={FORMSPREE_ENDPOINT}
          successMessage="¡Gracias! Nos comunicamos pronto."
          hiddenFields={{ tipo: 'contratante' }}
        />
      </main>
    </div>
  )
}
