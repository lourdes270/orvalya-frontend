import { useState } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { mensajeErrorAuth, validarEmail } from '../../lib/validaciones'
import { s } from './styles'

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailErr = validarEmail(email)
    if (emailErr) {
      setError(emailErr)
      return
    }
    setError('')
    setLoading(true)
    try {
      await resetPasswordForEmail(email.trim().toLowerCase())
      setEnviado(true)
    } catch (err) {
      setError(mensajeErrorAuth(err, 'No pudimos enviar el email. Intentá de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div style={s.form}>
        <p style={{ margin: 0, fontSize: '14px', color: '#495057', lineHeight: 1.5 }}>
          Si existe una cuenta con ese email, te enviamos un enlace para restablecer la contraseña.
          Revisá tu bandeja de entrada.
        </p>
        <button type="button" style={{ ...s.btn, marginTop: '16px' }} onClick={onBack}>
          Volver a ingresar
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      <p style={{ margin: 0, fontSize: '14px', color: '#495057', lineHeight: 1.5 }}>
        Te enviaremos un enlace a tu email para elegir una nueva contraseña.
      </p>
      <div style={s.field}>
        <label style={s.label}>Email</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder="tu@email.com"
          style={{ ...s.input, ...(error && !email.trim() ? s.inputError : {}) }}
        />
      </div>
      {error && <p style={s.error}>{error}</p>}
      <button type="submit" style={s.btn} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar enlace'}
      </button>
      <button
        type="button"
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: '#2E75B6', fontSize: '13px', cursor: 'pointer', padding: 0 }}
      >
        Volver a ingresar
      </button>
    </form>
  )
}
