import { useState } from 'react'
import { insertLegalAcceptance } from '../../lib/legalAcceptance'
import LegalAcceptanceSummary from './LegalAcceptanceSummary'
import { legalStyles } from './legalCopy'

interface LegalAcceptanceProps {
  userId: string
  onAccepted: () => void
}

export default function LegalAcceptance({ userId, onAccepted }: LegalAcceptanceProps) {
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = async () => {
    if (!checked) return
    setLoading(true)
    setError('')
    const { error: insertError } = await insertLegalAcceptance(userId)
    setLoading(false)
    if (insertError) {
      setError('No pudimos registrar tu aceptación. Intentá de nuevo.')
      return
    }
    onAccepted()
  }

  return (
    <div style={legalStyles.card}>
      <h1 style={legalStyles.title}>Antes de continuar</h1>
      <p style={legalStyles.subtitle}>
        Para usar Orvalya necesitás aceptar nuestros Términos y la Política de Privacidad.
      </p>

      <LegalAcceptanceSummary />

      <label style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '20px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#212529',
        lineHeight: 1.5,
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          style={{ marginTop: '3px', width: '18px', height: '18px', flexShrink: 0 }}
        />
        <span>
          He leído y acepto los Términos y Condiciones y la Política de Privacidad
        </span>
      </label>

      {error && <p style={{ color: '#dc2626', fontSize: '14px', margin: '0 0 12px' }}>{error}</p>}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!checked || loading}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: !checked || loading ? '#9ca3af' : '#1F3864',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: !checked || loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Registrando...' : 'Continuar'}
      </button>
    </div>
  )
}
