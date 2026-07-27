import { STYLES } from '../styles/onboarding.styles'
import { CARD_STYLES } from '../styles/card.styles'
import type { Rubro } from '../types'

interface RubroCardProps {
  rubro: Omit<Rubro, 'icono'>
  icono: React.ReactNode
  subrubrosSeleccionados: string[]
  estaAbierto: boolean
  onToggleAbierto: () => void
  onToggleSubrubro: (subrubroId: string) => void
  onTextoLibreChange: (texto: string) => void
  textoLibre: string
  isMobile: boolean
}

// Card de rubro con accordion para subrubros
export default function RubroCard({
  rubro,
  icono,
  subrubrosSeleccionados,
  estaAbierto,
  onToggleAbierto,
  onToggleSubrubro,
  onTextoLibreChange,
  textoLibre,
  isMobile,
}: RubroCardProps) {
  const count = subrubrosSeleccionados.length
  const tieneTexto = textoLibre.trim().length > 0

  return (
    <div
      style={{
        ...CARD_STYLES.rubroCard(isMobile),
        ...(estaAbierto ? CARD_STYLES.rubroCardExpanded() : {}),
      }}
      onClick={onToggleAbierto}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icono}
          <span style={{ fontSize: isMobile ? '15px' : '14px', fontWeight: 500, color: '#212529' }}>
            {rubro.label}
          </span>
        </div>
        {(count > 0 || tieneTexto) && (
          <span style={STYLES.badge()}>
            {count + (tieneTexto ? 1 : 0)}
          </span>
        )}
      </div>
      {estaAbierto && (
        <div style={STYLES.subrubrosContainer()}>
          {rubro.tieneTextoLibre ? (
            <textarea
              style={STYLES.textarea(isMobile)}
              placeholder="Describí qué hacés..."
              value={textoLibre}
              onChange={(e) => {
                e.stopPropagation()
                onTextoLibreChange(e.target.value)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            rubro.subrubros.map((sub) => (
              <button
                key={sub.id}
                type="button"
                style={STYLES.chip(subrubrosSeleccionados.includes(sub.id))}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSubrubro(sub.id)
                }}
              >
                {sub.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
