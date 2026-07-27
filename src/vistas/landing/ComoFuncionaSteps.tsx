import { useIsMobile } from '../../hooks/useIsMobile'
import { COMO_FUNCIONA_PASOS } from './landingContent'
import { BORDER, NAVY, TEAL } from './landingStyles'

export default function ComoFuncionaSteps() {
  const isMobile = useIsMobile(768)

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '28px' : '24px',
      alignItems: isMobile ? 'stretch' : 'flex-start',
    }}>
      {COMO_FUNCIONA_PASOS.map((title, index) => (
        <div
          key={title}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: isMobile ? '16px' : '12px',
            alignItems: isMobile ? 'flex-start' : 'stretch',
            position: 'relative',
          }}
        >
          {!isMobile && index < COMO_FUNCIONA_PASOS.length - 1 && (
            <div style={{
              position: 'absolute',
              top: '28px',
              left: 'calc(50% + 28px)',
              right: '-12px',
              height: '2px',
              background: BORDER,
              zIndex: 0,
            }} aria-hidden />
          )}
          <div style={{
            flexShrink: 0,
            width: isMobile ? '52px' : '56px',
            height: isMobile ? '52px' : '56px',
            borderRadius: '14px',
            background: '#fff',
            border: `2px solid ${TEAL}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            <span style={{
              fontSize: isMobile ? '22px' : '24px',
              fontWeight: 800,
              color: TEAL,
              lineHeight: 1,
            }}>
              {index + 1}
            </span>
          </div>
          <div style={{ flex: 1, paddingTop: isMobile ? '4px' : 0 }}>
            <p style={{
              margin: 0,
              fontSize: isMobile ? '15px' : '16px',
              lineHeight: 1.55,
              color: NAVY,
              fontWeight: 600,
            }}>
              {title}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
