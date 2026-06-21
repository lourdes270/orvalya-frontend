import HCaptcha from '@hcaptcha/react-hcaptcha'
import { requireHcaptchaSiteKey } from '../../config/hcaptcha'

interface RegistrationCaptchaProps {
  onVerify: (token: string) => void
  onExpire: () => void
}

export function RegistrationCaptcha({ onVerify, onExpire }: RegistrationCaptchaProps) {
  const siteKey = requireHcaptchaSiteKey()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px' }}>
      <HCaptcha
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        theme="light"
      />
    </div>
  )
}
