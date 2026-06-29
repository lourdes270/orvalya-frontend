import terminosContent from '@/content/legal/terminos.md?raw'
import { CURRENT_TERMS_VERSION } from '@/config/legalVersions'
import { DISCLAIMER_PLATAFORMA, LEGAL_SUMMARY_BULLETS } from './legalCopy'
import LegalPage from './LegalPage'

const terminosPreContent = (
  <>
    <p style={{ margin: '0 0 20px', fontSize: '14px', lineHeight: 1.65, color: '#495057' }}>
      {DISCLAIMER_PLATAFORMA}
    </p>
    <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: '#1F3864' }}>
      Resumen de lo que aceptás
    </p>
    <ul style={{ margin: '0 0 24px', paddingLeft: '18px', color: '#495057', fontSize: '14px', lineHeight: 1.6 }}>
      {LEGAL_SUMMARY_BULLETS.map(b => (
        <li key={b} style={{ marginBottom: '6px' }}>{b}</li>
      ))}
    </ul>
    <hr style={{ border: 'none', borderTop: '1px solid #E0EAF2', margin: '0 0 24px' }} />
  </>
)

export default function TerminosPage() {
  return (
    <LegalPage
      markdownContent={terminosContent}
      versionLabel={CURRENT_TERMS_VERSION}
      preContent={terminosPreContent}
    />
  )
}
