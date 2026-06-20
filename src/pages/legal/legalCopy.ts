export const LEGAL_SUMMARY_BULLETS = [
  'Los documentos que subís deben ser reales y tuyos.',
  'Guardamos historial de versiones de tus documentos.',
  'No compartimos tus datos con otras empresas.',
  'Orvalya no certifica cumplimiento legal; solo organiza vencimientos.',
]

export const legalStyles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as const,
  card: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '24px 20px 40px',
  } as const,
  title: {
    margin: '0 0 8px',
    fontSize: 'clamp(22px, 4vw, 28px)',
    fontWeight: 700,
    color: '#1F3864',
    lineHeight: 1.25,
  } as const,
  subtitle: {
    margin: '0 0 20px',
    fontSize: '15px',
    color: '#6b7280',
    lineHeight: 1.5,
  } as const,
  summaryBox: {
    maxHeight: '200px',
    overflowY: 'auto' as const,
    padding: '16px',
    backgroundColor: '#fff',
    border: '1px solid #DEE2E6',
    borderRadius: '10px',
    marginBottom: '16px',
  } as const,
  link: {
    color: '#1F3864',
    fontWeight: 600,
    textDecoration: 'underline',
  } as const,
}
