import { LEGAL_SUMMARY_BULLETS, legalStyles } from './legalCopy'

export default function LegalAcceptanceSummary() {
  return (
    <div>
      <div style={legalStyles.summaryBox}>
        <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: '#1F3864' }}>
          Resumen de lo que aceptás
        </p>
        <ul style={{ margin: 0, paddingLeft: '18px', color: '#495057', fontSize: '14px', lineHeight: 1.6 }}>
          {LEGAL_SUMMARY_BULLETS.map(b => (
            <li key={b} style={{ marginBottom: '6px' }}>{b}</li>
          ))}
        </ul>
      </div>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
        Podés leer el texto completo en{' '}
        <a href="/terminos" target="_blank" rel="noopener noreferrer" style={legalStyles.link}>
          Términos y Condiciones
        </a>{' '}
        y{' '}
        <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={legalStyles.link}>
          Política de Privacidad
        </a>.
      </p>
    </div>
  )
}
