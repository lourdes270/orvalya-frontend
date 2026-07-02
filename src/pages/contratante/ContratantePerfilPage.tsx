import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { useContratanteProfile } from '../../hooks/useContratanteProfile'
import { crearContratante } from '../../lib/contratanteHelpers'
import { isProfileHoneypotTriggered } from '../../lib/botProtection/profileHoneypot'
import { MENSAJE_RUT_DUPLICADO, rutYaRegistrado } from '../../lib/rutHelpers'
import { normalizarRutContratante, normalizarTelefono, validarEmail, validarRutContratante, validarTelefono } from '../../lib/validaciones'
import { HoneypotField } from '../../components/botProtection/HoneypotField'
import { RUBROS } from '../onboarding/data/rubros'
import { DEPARTAMENTOS } from '../onboarding/data/zonas'
import type { ContratantePerfilForm, TipoContratante } from '../../types/contratante'
import {
  btnPrimary,
  cardStyle,
  inputStyle,
  labelStyle,
  pageStyle,
  NAVY,
  MUTED,
} from './contratanteStyles'

const emptyForm = (email: string): ContratantePerfilForm => ({
  nombre_empresa: '',
  rut: '',
  tipo_contratante: 'empresa',
  rubro_principal: '',
  zona: '',
  email,
  telefono: '',
})

export default function ContratantePerfilPage() {
  const { user, perfil } = useAuth()
  const { perfilCompleto, loading } = useContratanteProfile()
  const navigate = useNavigate()
  const [form, setForm] = useState<ContratantePerfilForm>(() => emptyForm(user?.email ?? perfil?.email ?? ''))
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [general, setGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  if (perfil?.tipo !== 'contratante') {
    return <Navigate to="/dashboard" replace />
  }

  if (!loading && perfilCompleto) {
    return <Navigate to="/dashboard" replace />
  }

  const validar = () => {
    const e: Record<string, string> = {}
    if (!form.nombre_empresa.trim()) e.nombre_empresa = 'El nombre es obligatorio.'
    if (form.tipo_contratante === 'empresa' || form.rut.trim()) {
      const rutErr = validarRutContratante(form.rut)
      if (rutErr) e.rut = rutErr
    }
    const emailErr = validarEmail(form.email)
    if (emailErr) e.email = emailErr
    if (!form.rubro_principal) e.rubro_principal = 'Elegí un rubro principal.'
    if (!form.zona) e.zona = 'Elegí una zona.'
    const telErr = validarTelefono(form.telefono, { requerido: true, etiqueta: 'WhatsApp' })
    if (telErr) e.telefono = telErr
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (isProfileHoneypotTriggered(honeypot, 'perfil-contratante')) {
      navigate('/dashboard', { replace: true })
      return
    }
    const e = validar()
    if (Object.keys(e).length > 0) {
      setErrores(e)
      return
    }
    if (!user?.id) return

    setErrores({})
    setGeneral('')
    setGuardando(true)
    try {
      const rutNormalizado = normalizarRutContratante(form.rut)
      if (await rutYaRegistrado(rutNormalizado, user.id)) {
        setErrores({ rut: MENSAJE_RUT_DUPLICADO })
        return
      }
      await crearContratante(user.id, {
        ...form,
        rut: rutNormalizado,
        telefono: normalizarTelefono(form.telefono),
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      const msg = typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === '23505'
        ? MENSAJE_RUT_DUPLICADO
        : 'No pudimos guardar tu perfil. Revisá los datos e intentá de nuevo.'
      setGeneral(msg)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 700, color: NAVY }}>
          Completá tu perfil de empresa
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: '15px', lineHeight: 1.6, color: MUTED }}>
          Estos datos te permiten publicar llamados de servicio en Orvalya.
        </p>

        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Tipo de contratante</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['empresa', 'persona_fisica'] as TipoContratante[]).map(tipo => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tipo_contratante: tipo }))}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: form.tipo_contratante === tipo ? `2px solid ${NAVY}` : `1.5px solid #DEE2E6`,
                    background: form.tipo_contratante === tipo ? '#EEF2FF' : '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {tipo === 'empresa' ? 'Empresa' : 'Persona física'}
                </button>
              ))}
            </div>
          </div>

          <Campo
            label={form.tipo_contratante === 'empresa' ? 'Nombre de la empresa' : 'Nombre completo'}
            value={form.nombre_empresa}
            onChange={v => setForm(f => ({ ...f, nombre_empresa: v }))}
            error={errores.nombre_empresa}
            autoCapitalize="words"
            capitalize={form.tipo_contratante === 'empresa'}
          />

          <Campo
            label="RUT"
            value={form.rut}
            onChange={v => setForm(f => ({ ...f, rut: normalizarRutContratante(v).slice(0, 12) }))}
            error={errores.rut}
            placeholder="12345678"
            inputMode="numeric"
          />

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Rubro principal</label>
            <select
              value={form.rubro_principal}
              onChange={e => setForm(f => ({ ...f, rubro_principal: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Seleccioná un rubro</option>
              {RUBROS.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            {errores.rubro_principal && <p style={{ color: '#dc3545', fontSize: '13px', margin: '6px 0 0' }}>{errores.rubro_principal}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Zona / departamento</label>
            <select
              value={form.zona}
              onChange={e => setForm(f => ({ ...f, zona: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Seleccioná un departamento</option>
              {DEPARTAMENTOS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errores.zona && <p style={{ color: '#dc3545', fontSize: '13px', margin: '6px 0 0' }}>{errores.zona}</p>}
          </div>

          <Campo
            label="Email"
            type="email"
            value={form.email}
            onChange={v => setForm(f => ({ ...f, email: v }))}
            error={errores.email}
          />

          <Campo
            label="WhatsApp"
            value={form.telefono}
            onChange={v => setForm(f => ({ ...f, telefono: v }))}
            error={errores.telefono}
            placeholder="099123456"
            inputMode="tel"
            required
          />

          {general && <p style={{ color: '#dc3545', fontSize: '14px', margin: '0 0 16px' }}>{general}</p>}

          <HoneypotField value={honeypot} onChange={setHoneypot} />

          <button type="submit" style={{ ...btnPrimary, width: '100%' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Campo({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  inputMode,
  autoCapitalize,
  capitalize = false,
  required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoCapitalize?: React.HTMLAttributes<HTMLInputElement>['autoCapitalize']
  capitalize?: boolean
  required?: boolean
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoCapitalize={autoCapitalize}
        required={required}
        onChange={e => onChange(e.target.value)}
        style={{
          ...inputStyle,
          ...(capitalize ? { textTransform: 'capitalize' as const } : {}),
        }}
      />
      {error && <p style={{ color: '#dc3545', fontSize: '13px', margin: '6px 0 0' }}>{error}</p>}
    </div>
  )
}
