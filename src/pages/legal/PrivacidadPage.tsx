import { Link } from 'react-router-dom'
import { legalStyles } from './legalCopy'

export default function PrivacidadPage() {
  return (
    <div style={{ ...legalStyles.page, padding: '32px 20px' }}>
      <article style={{ maxWidth: '720px', margin: '0 auto', background: '#fff', padding: '32px', borderRadius: '12px' }}>
        <h1 style={legalStyles.title}>Política de Privacidad</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Versión 2026-06-19</p>
        <section style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>
          <p>Tratamos tus datos para operar la plataforma y gestionar vencimientos documentales.</p>
          <p>No vendemos ni compartimos tus datos personales con otras empresas con fines comerciales.</p>
          <p>Registramos aceptaciones legales (fecha, versión, user agent e IP cuando está disponible) como respaldo auditables.</p>
        </section>
        <p style={{ marginTop: '24px' }}>
          <Link to="/" style={legalStyles.link}>← Volver al inicio</Link>
        </p>
      </article>
    </div>
  )
}
