import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COPY } from '../copy'
import { STYLES } from '../styles/onboarding.styles'
import { CARD_STYLES } from '../styles/card.styles'
import { marcarRegistroContratante, limpiarRegistroContratante } from '../../../lib/registroConstants'
import type { TipoPerfil } from '../types'

interface Step0TipoPerfilProps {
  isMobile: boolean
}

export default function Step0TipoPerfil({ isMobile }: Step0TipoPerfilProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onElegir = async (tipo: TipoPerfil) => {
    setLoading(true)
    try {
      if (tipo === 'contratante') {
        marcarRegistroContratante()
        navigate('/auth')
      } else {
        limpiarRegistroContratante()
        navigate('/onboarding?paso=1')
      }
    } finally {
      setLoading(false)
    }
  }

  const cardBase = CARD_STYLES.perfilCard(isMobile)

  return (
    <div style={STYLES.card(isMobile)}>
      <h1 style={STYLES.titulo(isMobile)}>{COPY.paso0.titulo}</h1>
      <p style={STYLES.subtitulo()}>{COPY.paso0.subtitulo}</p>

      <button
        type="button"
        disabled={loading}
        style={{
          ...cardBase,
          cursor: loading ? 'not-allowed' : 'pointer',
          border: '2px solid #00B4A6',
          background: 'linear-gradient(135deg, #F0FFFD 0%, #ffffff 60%)',
          boxShadow: '0 6px 20px rgba(0, 180, 166, 0.18)',
        }}
        onClick={() => onElegir('prestador')}
      >
        <span style={{ fontSize: '28px' }}>🧑‍🔧</span>
        <div style={{ flex: 1 }}>
          <span style={{
            display: 'inline-block',
            marginBottom: '6px',
            padding: '3px 10px',
            borderRadius: '999px',
            background: '#00B4A6',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {COPY.paso0.prestador.badge}
          </span>
          <div style={{ fontWeight: 700, color: '#0F2D52', marginBottom: '4px', fontSize: '16px' }}>
            {COPY.paso0.prestador.titulo}
          </div>
          <div style={{ fontSize: '14px', color: '#4A6078', lineHeight: 1.45 }}>
            {COPY.paso0.prestador.descripcion}
          </div>
        </div>
        <span style={{ fontSize: '20px', color: '#00B4A6' }}>→</span>
      </button>

      <button
        type="button"
        disabled={loading}
        style={{
          ...cardBase,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
        onClick={() => onElegir('contratante')}
      >
        <span style={{ fontSize: '28px' }}>🏢</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#212529', marginBottom: '4px' }}>
            {COPY.paso0.contratante.titulo}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {COPY.paso0.contratante.descripcion}
          </div>
        </div>
        <span style={{ fontSize: '20px', color: '#9ca3af' }}>→</span>
      </button>
    </div>
  )
}
