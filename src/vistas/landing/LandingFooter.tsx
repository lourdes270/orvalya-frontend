import { Link } from 'react-router-dom'
import { BORDER, NAVY, SURFACE, TEXT_MUTED } from './landingStyles'

export default function LandingFooter() {
  return (
    <footer style={{
      padding: '24px 16px',
      borderTop: `1px solid ${BORDER}`,
      background: SURFACE,
      textAlign: 'center',
      marginTop: 'auto',
    }}>
      <p style={{ margin: '0 0 6px', fontSize: '13px' }}>
        <Link to="/terminos" style={{ color: NAVY, fontWeight: 600, textDecoration: 'none' }}>
          Términos y Condiciones
        </Link>
        <span style={{ color: BORDER, margin: '0 8px' }}>|</span>
        <Link to="/privacidad" style={{ color: NAVY, fontWeight: 600, textDecoration: 'none' }}>
          Política de Privacidad
        </Link>
      </p>
      <p style={{ margin: 0, fontSize: '12px', color: TEXT_MUTED }}>
        Orvalya © 2026 · Uruguay
      </p>
    </footer>
  )
}
