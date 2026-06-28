import { useState } from 'react'
import { EnvelopeSimple } from '@phosphor-icons/react'
import { supabase } from '../../../lib/supabase'

interface ConfirmacionEmailPanelProps {
  email: string
  isMobile: boolean
}

export function ConfirmacionEmailPanel({ email, isMobile }: ConfirmacionEmailPanelProps) {
  const [reenviando, setReenviando] = useState(false)
  const [reenviado, setReenviado] = useState(false)
  const [errorReenvio, setErrorReenvio] = useState('')

  const reenviar = async () => {
    setReenviando(true)
    setErrorReenvio('')
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      })
      if (error) throw error
      setReenviado(true)
    } catch {
      setErrorReenvio('No pudimos reenviar el email. Esperá unos minutos e intentá de nuevo.')
    } finally {
      setReenviando(false)
    }
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
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#E6FCF5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <EnvelopeSimple size={36} weight="fill" color="#40C057" />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1F3864', margin: '0 0 8px' }}>
          Revisá tu email
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 }}>
          Te mandamos un mail a <strong style={{ color: '#212529' }}>{email}</strong> para confirmar tu cuenta.
        </p>

        <ol style={{
          textAlign: 'left',
          margin: '0 0 24px',
          padding: '16px 16px 16px 32px',
          background: '#f8f9fa',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#495057',
          lineHeight: 1.7,
        }}>
          <li>Abrí Gmail (o tu correo).</li>
          <li>Buscá un mail de Orvalya. Si no está, mirá <strong>Spam</strong> o <strong>Promociones</strong>.</li>
          <li>Tocá el botón <strong>Confirmar mi cuenta</strong>.</li>
          <li>Te vamos a llevar solo a aceptar los términos. <strong>No tenés que cargar todo de nuevo.</strong></li>
        </ol>

        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px', lineHeight: 1.5 }}>
          Si el botón del mail no abre la página, iniciá sesión acá con tu email y contraseña.
        </p>

        <a
          href="/auth"
          style={{
            display: 'block',
            width: '100%',
            height: '52px',
            lineHeight: '52px',
            backgroundColor: '#1F3864',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '8px',
            textDecoration: 'none',
            marginBottom: '16px',
          }}
        >
          Ir a iniciar sesión
        </a>

        <button
          type="button"
          onClick={reenviar}
          disabled={reenviando || reenviado}
          style={{
            background: 'none',
            border: 'none',
            color: reenviado ? '#40C057' : '#1F3864',
            fontSize: '14px',
            fontWeight: 500,
            cursor: reenviando || reenviado ? 'default' : 'pointer',
            textDecoration: reenviado ? 'none' : 'underline',
          }}
        >
          {reenviando ? 'Reenviando...' : reenviado ? 'Email reenviado ✓' : '¿No te llegó? Reenviar email'}
        </button>
        {errorReenvio && (
          <p style={{ color: '#dc2626', fontSize: '13px', margin: '12px 0 0' }}>{errorReenvio}</p>
        )}
      </div>
    </div>
  )
}
