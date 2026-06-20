import { Link } from 'react-router-dom'
import { legalStyles } from './legalCopy'

export default function TerminosPage() {
  return (
    <div style={{ ...legalStyles.page, padding: '32px 20px' }}>
      <article style={{ maxWidth: '720px', margin: '0 auto', background: '#fff', padding: '32px', borderRadius: '12px' }}>
        <h1 style={legalStyles.title}>Términos y Condiciones</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Versión 2026-06-19</p>
        <section style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>
          <p>Orvalya conecta empresas contratantes con prestadores de servicios en Uruguay.</p>
          <h2 style={{ fontSize: '17px', color: '#1F3864' }}>4.2 Control de versiones</h2>
          <p>Conservamos el historial de documentos cargados para registrar qué versión estaba vigente en cada fecha.</p>
          <h2 style={{ fontSize: '17px', color: '#1F3864' }}>Documentos</h2>
          <p>El prestador declara que cada archivo es auténtico, vigente y no alterado. Orvalya no certifica cumplimiento legal.</p>
        </section>
        <p style={{ marginTop: '24px' }}>
          <Link to="/" style={legalStyles.link}>← Volver al inicio</Link>
        </p>
      </article>
    </div>
  )
}
