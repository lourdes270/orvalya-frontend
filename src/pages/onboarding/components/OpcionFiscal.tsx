import { CARD_STYLES } from '../styles/card.styles'

interface OpcionFiscalProps {
  icono: React.ReactNode
  titulo: string
  descripcion: string
  seleccionado: boolean
  onSelect: () => void
}

// Card seleccionable de opción fiscal
export default function OpcionFiscal({
  icono,
  titulo,
  descripcion,
  seleccionado,
  onSelect,
}: OpcionFiscalProps) {
  return (
    <button
      type="button"
      style={{
        ...CARD_STYLES.opcionFiscal(seleccionado),
        border: 'none',
        background: 'transparent',
        textAlign: 'left',
        padding: '20px',
      }}
      onClick={onSelect}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {icono}
        <div>
          <div style={{ fontWeight: 600, color: '#212529', marginBottom: '4px', fontSize: '15px' }}>
            {titulo}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {descripcion}
          </div>
        </div>
      </div>
    </button>
  )
}
