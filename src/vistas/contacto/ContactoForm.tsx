import { useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import { validarEmail, validarTelefono } from '../../lib/validaciones'
import { buttonStyle, inputStyle, labelStyle, NAVY, TEAL } from './contactoStyles'

export interface ContactoFormFields {
  nombre: string
  email: string
  empresa: string
  telefono: string
  mensaje: string
}

interface ContactoFormProps {
  formspreeEndpoint: string
  successMessage: string
  hiddenFields?: Record<string, string>
}

const emptyForm: ContactoFormFields = {
  nombre: '',
  email: '',
  empresa: '',
  telefono: '',
  mensaje: '',
}

export default function ContactoForm({ formspreeEndpoint, successMessage, hiddenFields = {} }: ContactoFormProps) {
  const [form, setForm] = useState<ContactoFormFields>(emptyForm)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({})

  const handleChange = (campo: keyof ContactoFormFields, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (error) setError('')
    if (erroresCampo[campo]) {
      setErroresCampo(prev => {
        const { [campo]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrores: Record<string, string> = {}
    if (!form.nombre.trim()) nextErrores.nombre = 'El nombre es obligatorio.'
    const emailErr = validarEmail(form.email)
    if (emailErr) nextErrores.email = emailErr
    if (!form.mensaje.trim()) nextErrores.mensaje = 'El mensaje es obligatorio.'
    const telErr = validarTelefono(form.telefono, { etiqueta: 'teléfono' })
    if (telErr) nextErrores.telefono = telErr
    if (Object.keys(nextErrores).length > 0) {
      setErroresCampo(nextErrores)
      return
    }
    setErroresCampo({})
    if (!formspreeEndpoint) {
      setError('Formulario no configurado. Contactá a soporte.')
      return
    }

    setEnviando(true)
    setError('')

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...form,
          ...hiddenFields,
        }),
      })

      if (!response.ok) throw new Error('Error al enviar')

      setEnviado(true)
      setForm(emptyForm)
    } catch {
      setError('No pudimos enviar el formulario. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#E6FCF5',
          marginBottom: '16px',
        }}>
          <CheckCircle size={36} weight="fill" color={TEAL} />
        </div>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: NAVY, lineHeight: 1.5 }}>
          {successMessage}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={labelStyle}>Nombre</label>
        <input
          type="text"
          value={form.nombre}
          onChange={e => handleChange('nombre', e.target.value)}
          placeholder="Tu nombre"
          style={{ ...inputStyle, ...(erroresCampo.nombre ? { borderColor: '#dc2626' } : {}) }}
        />
        {erroresCampo.nombre && (
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#dc2626' }}>{erroresCampo.nombre}</p>
        )}
      </div>
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => handleChange('email', e.target.value)}
          placeholder="tu@empresa.com"
          style={{ ...inputStyle, ...(erroresCampo.email ? { borderColor: '#dc2626' } : {}) }}
        />
        {erroresCampo.email && (
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#dc2626' }}>{erroresCampo.email}</p>
        )}
      </div>
      <div>
        <label style={labelStyle}>Empresa</label>
        <input
          type="text"
          value={form.empresa}
          onChange={e => handleChange('empresa', e.target.value)}
          placeholder="Nombre de la empresa"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Teléfono</label>
        <input
          type="tel"
          inputMode="numeric"
          value={form.telefono}
          onChange={e => handleChange('telefono', e.target.value.replace(/\D/g, ''))}
          placeholder="099123456"
          style={{ ...inputStyle, ...(erroresCampo.telefono ? { borderColor: '#dc2626' } : {}) }}
        />
        {erroresCampo.telefono && (
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#dc2626' }}>{erroresCampo.telefono}</p>
        )}
      </div>
      <div>
        <label style={labelStyle}>Mensaje</label>
        <textarea
          value={form.mensaje}
          onChange={e => handleChange('mensaje', e.target.value)}
          placeholder="Contanos qué servicio necesitás..."
          rows={4}
          style={{
            ...inputStyle,
            resize: 'vertical',
            minHeight: '100px',
            ...(erroresCampo.mensaje ? { borderColor: '#dc2626' } : {}),
          }}
        />
        {erroresCampo.mensaje && (
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#dc2626' }}>{erroresCampo.mensaje}</p>
        )}
      </div>
      {error && (
        <p style={{ margin: 0, fontSize: '14px', color: '#dc2626' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={enviando}
        style={{
          ...buttonStyle,
          opacity: enviando ? 0.7 : 1,
          cursor: enviando ? 'not-allowed' : 'pointer',
        }}
      >
        {enviando ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  )
}
