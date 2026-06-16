import { useState } from 'react'
import { Eye, EyeSlash, CheckCircle } from '@phosphor-icons/react'

interface Step4RegistroProps {
  isMobile: boolean
  onRegistrar: (email: string, password: string) => Promise<void>
  loading: boolean
  error: string
  email: string
}

export default function Step4Registro({
  isMobile,
  onRegistrar,
  loading,
  error,
  email: initialEmail,
}: Step4RegistroProps) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false })
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', confirm: '' })

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'email':
        return value.includes('@') ? '' : 'El email debe contener @'
      case 'password':
        return value.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres'
      case 'confirm':
        return value === password ? '' : 'Las contraseñas no coinciden'
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
        setEmail(value)
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
  const isFormValid = email && password && confirmPassword && !hasErrors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    await onRegistrar(email, password)
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
          marginBottom: '32px',
        }}>
          Guardalo gratis para aparecer en búsquedas
        </p>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: '#DEE2E6',
          marginBottom: '32px',
        }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@email.com"
              readOnly={!!initialEmail}
              style={{
                width: '100%',
                height: '52px',
                padding: '0 16px',
                border: initialEmail ? '1.5px solid #1F3864' : '1.5px solid #DEE2E6',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: initialEmail ? '#f8f9fa' : '#ffffff',
                cursor: initialEmail ? 'not-allowed' : 'text',
              }}
              onFocus={(e) => !initialEmail && (e.target.style.borderColor = '#1F3864')}
              onBlur={(e) => {
                if (!initialEmail) {
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
                placeholder="Mínimo 6 caracteres"
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
            <p style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center', margin: '4px 0 0 0' }}>
              {error}
            </p>
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
