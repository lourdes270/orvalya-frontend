import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { HoneypotField } from '../../components/botProtection/HoneypotField'
import { RegistrationCaptcha } from '../../components/botProtection/RegistrationCaptcha'
import {
  FAKE_REGISTRATION_SUCCESS_MSG,
  runRegistrationGuard,
} from '../../lib/botProtection/runRegistrationGuard'
import { REGISTRO_TIPO_KEY, limpiarRegistroContratante } from '../../lib/registroConstants'
import { activarPerfilContratante } from '../../lib/registroHelpers'
import { mensajeErrorAuth, validarContrasena, validarEmail, MENSAJE_CONFIRMACION_EMAIL } from '../../lib/validaciones'
import { ConfirmacionEmailPanel } from '../onboarding/components/ConfirmacionEmailPanel'
import { s } from './styles'

export function RegisterForm() {
  const { signUp, setPerfil } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaResetKey, setCaptchaResetKey] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState('')
  const [emailConfirmado, setEmailConfirmado] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!errors.general) return
    setCaptchaToken(null)
    setCaptchaResetKey(k => k + 1)
  }, [errors.general])

  const validate = () => {
    const e: Record<string, string> = {}
    const emailErr = validarEmail(email)
    if (emailErr) e.email = emailErr
    const passErr = validarContrasena(password)
    if (passErr) e.password = passErr
    if (password !== confirm) e.confirm = 'Las contraseñas no coinciden.'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSuccessMsg('')
    setLoading(true)
    try {
      const guard = await runRegistrationGuard(
        { captchaToken: captchaToken ?? '', honeypot },
        'auth-register',
      )
      if (!guard.ok) {
        if (guard.kind === 'honeypot') {
          setSuccessMsg(FAKE_REGISTRATION_SUCCESS_MSG)
          return
        }
        setErrors({ general: guard.message })
        return
      }

      const emailNorm = email.trim().toLowerCase()
      const { session } = await signUp({ email: emailNorm, password })

      if (!session) {
        setEmailConfirmado(emailNorm)
        setSuccessMsg(MENSAJE_CONFIRMACION_EMAIL)
        return
      }

      const tipoRegistro = sessionStorage.getItem(REGISTRO_TIPO_KEY)
      if (tipoRegistro === 'contratante') {
        const perfil = await activarPerfilContratante(emailNorm)
        setPerfil(perfil)
        limpiarRegistroContratante()
        localStorage.removeItem('orvalya_onboarding_draft')
        sessionStorage.removeItem('orvalya_onboarding_draft')
      }

      navigate('/aceptar-terminos')
    } catch (err: unknown) {
      setErrors({ general: mensajeErrorAuth(err, 'Error al crear la cuenta.') })
    } finally {
      setLoading(false)
    }
  }

  if (successMsg === MENSAJE_CONFIRMACION_EMAIL && emailConfirmado) {
    return <ConfirmacionEmailPanel email={emailConfirmado} isMobile={false} />
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...s.form, position: 'relative' }}>
      <HoneypotField value={honeypot} onChange={setHoneypot} />
      <div style={s.field}>
        <label style={s.label}>Email</label>
        <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={{ ...s.input, ...(errors.email ? s.inputError : {}) }} />
        {errors.email && <p style={s.error}>{errors.email}</p>}
      </div>
      <div style={s.field}>
        <label style={s.label}>Contraseña</label>
        <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mín. 8 caracteres, 1 mayúscula y 1 número" style={{ ...s.input, ...(errors.password ? s.inputError : {}) }} />
        {errors.password && <p style={s.error}>{errors.password}</p>}
      </div>
      <div style={s.field}>
        <label style={s.label}>Confirmar contraseña</label>
        <input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repetí tu contraseña" style={{ ...s.input, ...(errors.confirm ? s.inputError : {}) }} />
        {errors.confirm && <p style={s.error}>{errors.confirm}</p>}
      </div>
      <RegistrationCaptcha
        resetKey={captchaResetKey}
        onVerify={setCaptchaToken}
        onExpire={() => setCaptchaToken(null)}
      />
      {errors.general && <p style={s.error}>{errors.general}</p>}
      {successMsg && <p style={{ ...s.error, color: '#059669' }}>{successMsg}</p>}
      <button type="submit" style={s.btn} disabled={loading || !captchaToken}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
