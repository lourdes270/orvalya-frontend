import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { REGISTRO_TIPO_KEY } from '../../lib/registroConstants'
import { activarPerfilContratante } from '../../lib/registroHelpers'
import { validarEmail } from '../../lib/validaciones'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { s } from './styles'

export function LoginForm() {
  const { signInWithPassword, setPerfil } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false)

  if (mostrarRecuperar) {
    return <ForgotPasswordForm onBack={() => setMostrarRecuperar(false)} />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fieldErrs: Record<string, string> = {}
    const emailErr = validarEmail(email)
    if (emailErr) fieldErrs.email = emailErr
    if (!password.trim()) fieldErrs.password = 'La contraseña es obligatoria.'
    if (Object.keys(fieldErrs).length > 0) {
      setErrors(fieldErrs)
      setError('')
      return
    }
    setErrors({})
    setError('')
    setLoading(true)
    try {
      const emailNorm = email.trim().toLowerCase()
      await signInWithPassword({ email: emailNorm, password })

      const tipoRegistro = sessionStorage.getItem(REGISTRO_TIPO_KEY)
      if (tipoRegistro === 'contratante') {
        const perfilActualizado = await activarPerfilContratante(emailNorm)
        setPerfil(perfilActualizado)
        sessionStorage.removeItem(REGISTRO_TIPO_KEY)
      }

      navigate('/dashboard')
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      <div style={s.field}>
        <label style={s.label}>Email</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '' })) }}
          placeholder="tu@email.com"
          style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
        />
        {errors.email && <p style={s.error}>{errors.email}</p>}
      </div>
      <div style={s.field}>
        <label style={s.label}>Contraseña</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: '' })) }}
          placeholder="••••••••"
          style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
        />
        {errors.password && <p style={s.error}>{errors.password}</p>}
        <button
          type="button"
          onClick={() => { setMostrarRecuperar(true); setError('') }}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2E75B6', fontSize: '12px', cursor: 'pointer', padding: 0 }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      {error && <p style={s.error}>{error}</p>}
      <button type="submit" style={s.btn} disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
