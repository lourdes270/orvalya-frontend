import { PROGRESS_BAR_STYLES } from '../styles/progress-bar.styles'

interface ProgressBarProps {
  pasoActual: 1 | 2 | 3
  isMobile: boolean
}

export default function ProgressBar({ pasoActual, isMobile }: ProgressBarProps) {
  if (isMobile) {
    const widths: Record<1 | 2 | 3, string> = { 1: '33%', 2: '66%', 3: '100%' }
    return (
      <>
        <div style={PROGRESS_BAR_STYLES.mobile()}>
          <div style={PROGRESS_BAR_STYLES.fill(widths[pasoActual])} />
        </div>
        <div style={PROGRESS_BAR_STYLES.labels()}>
          {['Servicios', 'Tus datos', 'Situación'].map((label, i) => (
            <span
              key={label}
              style={i + 1 === pasoActual ? PROGRESS_BAR_STYLES.labelActive() : {}}
            >
              {label}
            </span>
          ))}
        </div>
      </>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
      {[1, 2, 3].map((paso) => {
        const isCompleted = paso < pasoActual
        const isActive = paso === pasoActual
        return (
          <div key={paso} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
                background: isCompleted ? '#40C057' : isActive ? '#1F3864' : '#ffffff',
                color: isCompleted || isActive ? '#ffffff' : '#9ca3af',
                border: isCompleted || isActive ? 'none' : '2px solid #DEE2E6',
              }}
            >
              {isCompleted ? '✓' : paso}
            </div>
            <span style={{ fontSize: '11px', color: isActive ? '#1F3864' : '#9ca3af' }}>
              {paso === 1 ? 'Servicios' : paso === 2 ? 'Tus datos' : 'Situación'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
