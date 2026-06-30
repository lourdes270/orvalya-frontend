import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { useContratanteProfile } from '../../hooks/useContratanteProfile'
import { crearContratante } from '../../lib/contratanteHelpers'
import { validarEmail, validarTelefono } from '../../lib/validaciones'
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

  if (perfil?.tipo !== 'contratante') {
    return <Navigate to="/dashboard" replace />
  }

  if (!loading && perfilCompleto) {
    return <Navigate to="/dashboard" replace />
  }

  const validar = () => {
    const e: Record<string, string> = {}
    if (!form.nombre_empresa.trim()) e.nombre_empresa = 'El nombre es obligatorio.'
    if (!form.rut.trim()) e.rut = 'El RUT es obligatorio.'
    const emailErr = validarEmail(form.email)
    if (emailErr) e.email = emailErr
    if (!form.rubro_principal) e.rubro_principal = 'Elegí un rubro principal.'
    if (!form.zona) e.zona = 'Elegí una zona.'
    const telErr = validarTelefono(form.telefono, { requerido: false, etiqueta: 'teléfono' })
    if (telErr) e.telefono = telErr
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
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
      await crearContratante(user.id, form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      setGeneral('No pudimos guardar tu perfil. Revisá los datos e intentá de nuevo.')
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
          />

          <Campo
            label="RUT"
            value={form.rut}
            onChange={v => setForm(f => ({ ...f, rut: v }))}
            error={errores.rut}
            placeholder="12.345.678-9"
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
            label="Teléfono (opcional)"
            value={form.telefono}
            onChange={v => setForm(f => ({ ...f, telefono: v }))}
            error={errores.telefono}
            placeholder="099 123 456"
          />

          {general && <p style={{ color: '#dc3545', fontSize: '14px', margin: '0 0 16px' }}>{general}</p>}

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
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: string
  placeholder?: string
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={inputStyle}
      />
      {error && <p style={{ color: '#dc3545', fontSize: '13px', margin: '6px 0 0' }}>{error}</p>}
    </div>
  )
}
