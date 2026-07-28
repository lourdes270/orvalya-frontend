import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OrvalyaLogo } from '../../components/OrvalyaLogo'
import { useAuth } from '../../contexts/useAuth'
import { esFlujoRecuperacionContrasena } from '../../lib/authHelpers'
import { mensajeErrorAuth, validarContrasena } from '../../lib/validaciones'
import { s } from './styles'

export default function ResetPasswordPage() {
  const { session, loading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [listo, setListo] = useState(false)
  const [esRecuperacion, setEsRecuperacion] = useState(() => esFlujoRecuperacionContrasena())

  useEffect(() => {
    if (esFlujoRecuperacionContrasena()) setEsRecuperacion(true)
  }, [session])

  const puedeRestablecer = esRecuperacion || !!session

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const passErr = validarContrasena(password)
    if (passErr) {
      setError(passErr)
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError('')
    setGuardando(true)
    try {
      await updatePassword(password)
      setListo(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000)
    } catch (err) {
      setError(mensajeErrorAuth(err, 'No pudimos actualizar la contraseña.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <OrvalyaLogo height={36} showText={false} />
          </div>
          <div style={s.logoSub}>Restablecer contraseña</div>
        </div>

        {loading && !session && (
          <p style={{ margin: 0, fontSize: '14px', color: '#8C96A3', textAlign: 'center' }}>
            Verificando enlace...
          </p>
        )}

        {!loading && !puedeRestablecer && (
          <div style={s.form}>
            <p style={{ margin: 0, fontSize: '14px', color: '#495057', lineHeight: 1.5 }}>
              El enlace no es válido o ya expiró. Pedí uno nuevo desde la pantalla de ingreso.
            </p>
            <Link to="/auth" style={{ ...s.btn, marginTop: '16px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              Ir a ingresar
            </Link>
          </div>
        )}

        {puedeRestablecer && listo && (
          <p style={{ margin: 0, fontSize: '14px', color: '#40C057', lineHeight: 1.5, textAlign: 'center' }}>
            Contraseña actualizada. Te redirigimos al panel...
          </p>
        )}

        {puedeRestablecer && !listo && !loading && (
          <form onSubmit={handleSubmit} style={s.form}>
            <p style={{ margin: 0, fontSize: '14px', color: '#495057', lineHeight: 1.5 }}>
              Elegí una nueva contraseña para tu cuenta.
            </p>
            <div style={s.field}>
              <label style={s.label}>Nueva contraseña</label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Mín. 8 caracteres, 1 mayúscula y 1 número"
                style={s.input}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Confirmar contraseña</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
                placeholder="Repetí tu contraseña"
                style={s.input}
              />
            </div>
            {error && <p style={s.error}>{error}</p>}
            <button type="submit" style={s.btn} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
