import { STYLES } from '../styles/onboarding.styles'

interface MobileStepFooterProps {
  label: string
  buttonText: string
  onAction: () => void
  disabled?: boolean
}

export function MobileStepFooter({ label, buttonText, onAction, disabled }: MobileStepFooterProps) {
  return (
    <div style={STYLES.botonFixedBottom()}>
      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>{label}</p>
      <button
        type="button"
        style={{
          ...STYLES.botonPrimario(true),
          ...(disabled ? STYLES.botonDeshabilitado() : {}),
        }}
        onClick={onAction}
        disabled={disabled}
        aria-label={buttonText}
      >
        {buttonText}
      </button>
    </div>
  )
}
