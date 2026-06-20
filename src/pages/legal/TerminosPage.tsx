import terminosContent from '@/content/legal/terminos.md?raw'
import { CURRENT_TERMS_VERSION } from '@/config/legalVersions'
import LegalPage from './LegalPage'

export default function TerminosPage() {
  return (
    <LegalPage
      markdownContent={terminosContent}
      versionLabel={CURRENT_TERMS_VERSION}
    />
  )
}
