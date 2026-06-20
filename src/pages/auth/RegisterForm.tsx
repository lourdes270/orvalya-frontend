import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { REGISTRO_TIPO_KEY } from '../../lib/registroConstants'
import { activarPerfilContratante } from '../../lib/registroHelpers'
import { s } from './styles'

export function RegisterForm() {
  const { signUp, signInWithPassword, setPerfil } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email.includes('@')) e.email = 'Ingresá un email válido.'
    if (password.length < 8) e.password = 'Mínimo 8 caracteres.'
    if (password !== confirm) e.confirm = 'Las contraseñas no coinciden.'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await signUp({ email, password })
      await signInWithPassword({ email, password })

      const tipoRegistro = sessionStorage.getItem(REGISTRO_TIPO_KEY)
      if (tipoRegistro === 'contratante') {
        const perfil = await activarPerfilContratante(email)
        setPerfil(perfil)
        sessionStorage.removeItem(REGISTRO_TIPO_KEY)
      }

      navigate('/aceptar-terminos')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear la cuenta.'
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      <div style={s.field}>
        <label style={s.label}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={{ ...s.input, ...(errors.email ? s.inputError : {}) }} />
        {errors.email && <p style={s.error}>{errors.email}</p>}
      </div>
      <div style={s.field}>
        <label style={s.label}>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" style={{ ...s.input, ...(errors.password ? s.inputError : {}) }} />
        {errors.password && <p style={s.error}>{errors.password}</p>}
      </div>
      <div style={s.field}>
        <label style={s.label}>Confirmar contraseña</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repetí tu contraseña" style={{ ...s.input, ...(errors.confirm ? s.inputError : {}) }} />
        {errors.confirm && <p style={s.error}>{errors.confirm}</p>}
      </div>
      {errors.general && <p style={s.error}>{errors.general}</p>}
      <button type="submit" style={s.btn} disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}