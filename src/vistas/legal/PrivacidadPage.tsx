import privacidadContent from '@/content/legal/privacidad.gen'
import { CURRENT_PRIVACY_VERSION } from '@/config/legalVersions'
import LegalPage from './LegalPage'

export default function PrivacidadPage() {
  return (
    <LegalPage
      markdownContent={privacidadContent}
      versionLabel={CURRENT_PRIVACY_VERSION}
    />
  )
}
