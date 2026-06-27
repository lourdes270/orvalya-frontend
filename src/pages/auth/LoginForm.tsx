import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { validarEmail } from '../../lib/validaciones'
import { s } from './styles'

export function LoginForm() {
  const { signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      await signInWithPassword({ email, password })
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
          value={password}
          onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: '' })) }}
          placeholder="••••••••"
          style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
        />
        {errors.password && <p style={s.error}>{errors.password}</p>}
      </div>
      {error && <p style={s.error}>{error}</p>}
      <button type="submit" style={s.btn} disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
