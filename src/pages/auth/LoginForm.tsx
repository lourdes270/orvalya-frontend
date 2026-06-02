import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { s } from './styles'

export function LoginForm() {
  const { signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={s.input} required />
      </div>
      <div style={s.field}>
        <label style={s.label}>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={s.input} required />
      </div>
      {error && <p style={s.error}>{error}</p>}
      <button type="submit" style={s.btn} disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}