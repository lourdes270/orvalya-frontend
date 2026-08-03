import { useEffect, useRef, useState } from 'react'
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (resetKey > 0) {
      try {
        captchaRef.current?.resetCaptcha()
      } catch {
        /* el iframe a veces ya no está en el DOM */
      }
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
        onVerify={(token) => {
          setErrorMsg(null)
          onVerify(token)
        }}
        onExpire={() => {
          setErrorMsg(null)
          onExpire()
        }}
        onError={() => {
          setErrorMsg('No pudimos cargar el captcha. Recargá la página e intentá de nuevo.')
          onExpire()
        }}
        theme="light"
      />
      {errorMsg && (
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#c0392b', textAlign: 'center' }}>
          {errorMsg}
        </p>
      )}
    </div>
  )
}
