import { useEffect, useRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { requireHcaptchaSiteKey } from '../../config/hcaptcha'

interface RegistrationCaptchaProps {
  onVerify: (token: string) => void
  onExpire: () => void
  resetKey?: number
}

export function RegistrationCaptcha({ onVerify, onExpire, resetKey = 0 }: RegistrationCaptchaProps) {
  const siteKey = requireHcaptchaSiteKey()
  const captchaRef = useRef<HCaptcha>(null)

  useEffect(() => {
    if (resetKey > 0) {
      captchaRef.current?.resetCaptcha()
    }
  }, [resetKey])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 8px' }}>
      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#495057', textAlign: 'center', fontWeight: 500 }}>
        Marcá la casilla antes de crear tu cuenta
      </p>
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        theme="light"
      />
    </div>
  )
}
