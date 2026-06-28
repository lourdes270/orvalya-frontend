import { useState, useEffect } from 'react'
import { Eye, EyeSlash, CheckCircle } from '@phosphor-icons/react'
import { HoneypotField } from '../../../components/botProtection/HoneypotField'
import { RegistrationCaptcha } from '../../../components/botProtection/RegistrationCaptcha'
import { GoogleAuthButton } from '../../../components/auth/GoogleAuthButton'
import type { RegistrationBotPayload } from '../../../lib/botProtection/types'
import { validarContrasena, validarEmail, esMensajeEmailDuplicado, esMensajeConfirmacionEmail } from '../../../lib/validaciones'
import { ConfirmacionEmailPanel } from '../components/ConfirmacionEmailPanel'

interface Step4RegistroProps {
  isMobile: boolean
  onRegistrar: (email: string, password: string, bot: RegistrationBotPayload) => Promise<void>
  loading: boolean
  error: string
  fakeSuccess: string
  email: string
}

export default function Step4Registro({
  isMobile,
  onRegistrar,
  loading,
  error,
  fakeSuccess,
  email: initialEmail,
}: Step4RegistroProps) {
  const prefilledEmail = initialEmail.trim()
  const [email, setEmail] = useState(prefilledEmail)

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail)
  }, [prefilledEmail])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaResetKey, setCaptchaResetKey] = useState(0)
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false })
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', confirm: '' })

  useEffect(() => {
    if (!error) return
    setCaptchaToken(null)
    setCaptchaResetKey(k => k + 1)
  }, [error])

  if (fakeSuccess && esMensajeConfirmacionEmail(fakeSuccess)) {
    return <ConfirmacionEmailPanel email={email} isMobile={isMobile} />
  }

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'email':
        return validarEmail(value) ?? ''
      case 'password':
        return validarContrasena(value) ?? ''
      case 'confirm':
        return value === password ? '' : 'Las contraseñas no coinciden.'
      default:
        return ''
    }
  }

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }))
  }

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value.toLowerCase())
        break
      case 'password':
        setPassword(value)
        if (touched.confirm) {
          setFieldErrors(prev => ({ ...prev, confirm: validateField('confirm', confirmPassword) }))
        }
        break
      case 'confirm':
        setConfirmPassword(value)
        break
    }
    if (touched[field as keyof typeof touched]) {
      setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }))
    }
  }

  const hasErrors = Object.values(fieldErrors).some(err => err !== '')
  const isFormValid = email && password && confirmPassword && !hasErrors && !!captchaToken

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = {
      email: validateField('email', email),
      password: validateField('password', password),
      confirm: validateField('confirm', confirmPassword),
    }
    setTouched({ email: true, password: true, confirm: true })
    setFieldErrors(nextErrors)
    if (Object.values(nextErrors).some(err => err !== '') || !captchaToken) return
    await onRegistrar(email, password, { captchaToken, honeypot })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '0' : '16px',
        boxShadow: isMobile ? 'none' : '0 4px 24px rgba(0, 0, 0, 0.08)',
        padding: isMobile ? '24px 20px' : '40px',
      }}>
        {/* Checkmark icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#40C057',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle size={40} weight="bold" color="#ffffff" />
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1F3864',
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          ¡Tu perfil está listo!
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          Guardalo gratis para aparecer en búsquedas
        </p>

        <GoogleAuthButton fromOnboarding />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <span style={{ flex: 1, height: '1px', background: '#E9ECEF' }} />
          <span style={{ fontSize: '12px', color: '#8C96A3' }}>o</span>
          <span style={{ flex: 1, height: '1px', background: '#E9ECEF' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
          <HoneypotField value={honeypot} onChange={setHoneypot} />
          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@email.com"
              readOnly={!!prefilledEmail}
              style={{
                width: '100%',
                height: '52px',
                padding: '0 16px',
                border: prefilledEmail ? '1.5px solid #1F3864' : '1.5px solid #DEE2E6',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: prefilledEmail ? '#f8f9fa' : '#ffffff',
                cursor: prefilledEmail ? 'not-allowed' : 'text',
              }}
              onFocus={(e) => !prefilledEmail && (e.target.style.borderColor = '#1F3864')}
              onBlur={(e) => {
                if (!prefilledEmail) {
                  e.target.style.borderColor = '#DEE2E6'
                  handleBlur('email', e.target.value)
                }
              }}
            />
            {touched.email && fieldErrors.email && (
              <p style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 0 0' }}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Mín. 8 caracteres, 1 mayúscula y 1 número"
                style={{
                  width: '100%',
                  height: '52px',
                  padding: '0 48px 0 16px',
                  border: '1.5px solid #DEE2E6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#1F3864'}
                onBlur={(e) => {
                  e.target.style.borderColor = '#DEE2E6'
                  handleBlur('password', e.target.value)
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? (
                  <EyeSlash size={24} color="#6b7280" />
                ) : (
                  <Eye size={24} color="#6b7280" />
                )}
              </button>
            </div>
            {touched.password && fieldErrors.password && (
              <p style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 0 0' }}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleChange('confirm', e.target.value)}
                placeholder="Repetí tu contraseña"
                style={{
                  width: '100%',
                  height: '52px',
                  padding: '0 48px 0 16px',
                  border: '1.5px solid #DEE2E6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#1F3864'}
                onBlur={(e) => {
                  e.target.style.borderColor = '#DEE2E6'
                  handleBlur('confirm', e.target.value)
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showConfirmPassword ? (
                  <EyeSlash size={24} color="#6b7280" />
                ) : (
                  <Eye size={24} color="#6b7280" />
                )}
              </button>
            </div>
            {touched.confirm && fieldErrors.confirm && (
              <p style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 0 0' }}>
                {fieldErrors.confirm}
              </p>
            )}
          </div>

          <RegistrationCaptcha
            resetKey={captchaResetKey}
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            style={{
              width: '100%',
              height: '52px',
              backgroundColor: loading || !isFormValid ? '#9ca3af' : '#1F3864',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Creando cuenta...
              </>
            ) : (
              'Crear mi perfil gratuito'
            )}
          </button>

          {/* Error message */}
          {error && (
            <div style={{ textAlign: 'center', margin: '4px 0 0 0' }}>
              <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>
                {error}
              </p>
              {esMensajeEmailDuplicado(error) && (
                <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>
                  <a href="/auth" style={{ color: '#1F3864', fontWeight: 600, textDecoration: 'none' }}>
                    Ir a iniciar sesión →
                  </a>
                </p>
              )}
            </div>
          )}
          {fakeSuccess && !esMensajeConfirmacionEmail(fakeSuccess) && (
            <div style={{ textAlign: 'center', margin: '4px 0 0 0' }}>
              <p style={{ color: '#059669', fontSize: '14px', margin: 0 }}>
                {fakeSuccess}
              </p>
            </div>
          )}
        </form>

        {/* Secondary text */}
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280',
          marginTop: '24px',
        }}>
          ¿Ya tenés cuenta? <a href="/auth" style={{ color: '#1F3864', textDecoration: 'none', fontWeight: '500' }}>Iniciá sesión →</a>
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
