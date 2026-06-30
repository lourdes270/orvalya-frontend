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

// Selección de tipo de perfil (prestador o contratante)
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

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) e.currentTarget.style.borderColor = '#3b5bdb'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = '#DEE2E6'
  }

  return (
    <div style={STYLES.card(isMobile)}>
      <h1 style={STYLES.titulo(isMobile)}>{COPY.paso0.titulo}</h1>
      <p style={STYLES.subtitulo()}>{COPY.paso0.subtitulo}</p>
      <button
        type="button"
        disabled={loading}
        style={{ ...CARD_STYLES.perfilCard(isMobile), cursor: loading ? 'not-allowed' : 'pointer' }}
        onClick={() => onElegir('prestador')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span style={{ fontSize: '28px' }}>🏢</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#212529', marginBottom: '4px' }}>
            {COPY.paso0.prestador.titulo}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {COPY.paso0.prestador.descripcion}
          </div>
        </div>
        <span style={{ fontSize: '20px', color: '#9ca3af' }}>→</span>
      </button>
      <button
        type="button"
        disabled={loading}
        style={{ ...CARD_STYLES.perfilCard(isMobile), cursor: loading ? 'not-allowed' : 'pointer' }}
        onClick={() => onElegir('contratante')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span style={{ fontSize: '28px' }}>📋</span>
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
