import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { usuarioUsaEmailPassword, usuarioUsaGoogle } from '../../lib/authHelpers'
import { mensajeErrorAuth, validarContrasena } from '../../lib/validaciones'

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '16px',
} as const

export default function CuentaSeguridadPanel() {
  const { user, updatePassword, resetPasswordForEmail, signOut } = useAuth()
  const navigate = useNavigate()
  const usaEmail = usuarioUsaEmailPassword(user)
  const usaGoogle = usuarioUsaGoogle(user)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [enviandoEmail, setEnviandoEmail] = useState(false)

  const handleCambiar = async (e: React.FormEvent) => {
    e.preventDefault()
    const passErr = validarContrasena(password)
    if (passErr) {
      setError(passErr)
      setMensaje('')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      setMensaje('')
      return
    }
    setError('')
    setMensaje('')
    setGuardando(true)
    try {
      await updatePassword(password)
      setPassword('')
      setConfirm('')
      setMensaje('Contraseña actualizada correctamente.')
    } catch (err) {
      setError(mensajeErrorAuth(err, 'No pudimos actualizar la contraseña.'))
    } finally {
      setGuardando(false)
    }
  }

  const handleEnviarEmail = async () => {
    if (!user?.email) return
    setError('')
    setMensaje('')
    setEnviandoEmail(true)
    try {
      await resetPasswordForEmail(user.email)
      setMensaje('Te enviamos un email con un enlace para restablecer la contraseña.')
    } catch (err) {
      setError(mensajeErrorAuth(err, 'No pudimos enviar el email.'))
    } finally {
      setEnviandoEmail(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (usaGoogle && !usaEmail) {
    return (
      <div style={cardStyle}>
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#495057', lineHeight: 1.5 }}>
          Tu cuenta usa <strong>Google</strong>. La contraseña se gestiona desde tu cuenta de Google, no desde Orvalya.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            background: '#fff',
            border: '1.5px solid #DEE2E6',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#495057',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
        Seguridad de la cuenta
      </h2>

      {usaEmail && (
        <>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#495057', lineHeight: 1.5 }}>
            {usaGoogle
              ? 'También tenés acceso con email y contraseña. Podés actualizarla acá o pedir un enlace por email.'
              : 'Actualizá tu contraseña o pedí un enlace de restablecimiento por email.'}
          </p>
          <form onSubmit={handleCambiar} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '6px' }}>
                Nueva contraseña
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); setMensaje('') }}
                placeholder="Mín. 8 caracteres, 1 mayúscula y 1 número"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #DEE2E6', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '6px' }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); setMensaje('') }}
                placeholder="Repetí tu contraseña"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #DEE2E6', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            {error && <p style={{ margin: 0, fontSize: '12px', color: '#DC3545' }}>{error}</p>}
            {mensaje && <p style={{ margin: 0, fontSize: '12px', color: '#40C057' }}>{mensaje}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="submit"
                disabled={guardando}
                style={{
                  padding: '10px 16px',
                  background: '#1F3864',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  opacity: guardando ? 0.7 : 1,
                }}
              >
                {guardando ? 'Guardando...' : 'Actualizar contraseña'}
              </button>
              <button
                type="button"
                onClick={handleEnviarEmail}
                disabled={enviandoEmail}
                style={{
                  padding: '10px 16px',
                  background: '#fff',
                  color: '#495057',
                  border: '1.5px solid #DEE2E6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: enviandoEmail ? 'not-allowed' : 'pointer',
                }}
              >
                {enviandoEmail ? 'Enviando...' : 'Enviar enlace por email'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
