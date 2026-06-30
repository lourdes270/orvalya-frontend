import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { useContratanteProfile } from '../../hooks/useContratanteProfile'
import {
  crearLlamado,
  fetchMisLlamados,
  labelEstadoLlamado,
} from '../../lib/contratanteHelpers'
import type { Llamado, LlamadoForm } from '../../types/contratante'
import { RUBROS } from '../onboarding/data/rubros'
import { DEPARTAMENTOS } from '../onboarding/data/zonas'
import { statsGridStyle } from './dashboardLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  btnPrimary,
  cardStyle,
  inputStyle,
  labelStyle,
  MUTED,
  NAVY,
  TEAL,
} from '../contratante/contratanteStyles'

const emptyLlamado: LlamadoForm = {
  titulo: '',
  descripcion: '',
  rubro: '',
  zona: '',
  expires_at: '',
}

export default function DashboardContratante() {
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const { contratante, loading, perfilCompleto } = useContratanteProfile()
  const isMobile = useIsMobile(640)
  const [llamados, setLlamados] = useState<Llamado[]>([])
  const [cargandoLlamados, setCargandoLlamados] = useState(false)
  const [form, setForm] = useState<LlamadoForm>(emptyLlamado)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [publicando, setPublicando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!perfilCompleto || !contratante) return
    setCargandoLlamados(true)
    fetchMisLlamados(contratante.id)
      .then(setLlamados)
      .catch(console.error)
      .finally(() => setCargandoLlamados(false))
  }, [perfilCompleto, contratante])

  if (loading) {
    return <p style={{ color: MUTED }}>Cargando perfil de empresa...</p>
  }

  if (!perfilCompleto) {
    return (
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: NAVY }}>Completá tu perfil</h2>
        <p style={{ margin: '0 0 16px', color: MUTED, lineHeight: 1.5 }}>
          Antes de publicar un llamado, necesitamos los datos básicos de tu empresa o actividad.
        </p>
        <button type="button" style={btnPrimary} onClick={() => navigate('/contratante/perfil')}>
          Completar perfil de contratante
        </button>
      </div>
    )
  }

  const activos = llamados.filter(l => l.estado === 'activo').length
  const pendientes = llamados.filter(l => l.estado === 'pendiente_moderacion').length

  const validarLlamado = () => {
    const e: Record<string, string> = {}
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio.'
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria.'
    if (!form.rubro) e.rubro = 'Elegí un rubro.'
    if (!form.zona) e.zona = 'Elegí una zona.'
    return e
  }

  const handlePublicar = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!contratante) return
    const e = validarLlamado()
    if (Object.keys(e).length > 0) {
      setErrores(e)
      return
    }

    setErrores({})
    setMensaje('')
    setPublicando(true)
    try {
      const nuevo = await crearLlamado(contratante.id, form)
      setLlamados(prev => [nuevo, ...prev])
      setForm(emptyLlamado)
      setMensaje('Llamado enviado. Quedará visible cuando un administrador lo apruebe.')
    } catch (err) {
      console.error(err)
      setMensaje('No pudimos publicar el llamado. Intentá de nuevo.')
    } finally {
      setPublicando(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: MUTED }}>
          {contratante?.nombre_empresa} · {contratante?.zona}
        </p>
      </div>

      <div style={statsGridStyle(isMobile)}>
        <Stat titulo="Llamados activos" valor={String(activos)} desc="Visibles para prestadores" />
        <Stat titulo="En moderación" valor={String(pendientes)} desc="Esperando aprobación" />
        <Stat titulo="Total publicados" valor={String(llamados.length)} desc="Todos los estados" />
      </div>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: NAVY }}>
          Publicar un llamado
        </h2>
        <form onSubmit={handlePublicar}>
          <Campo label="Título" value={form.titulo} onChange={v => setForm(f => ({ ...f, titulo: v }))} error={errores.titulo} placeholder="Ej: Limpieza de oficinas en Carrasco" />
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={4}
              placeholder="Detalle del trabajo, frecuencia, requisitos..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            {errores.descripcion && <p style={{ color: '#dc3545', fontSize: '13px', margin: '6px 0 0' }}>{errores.descripcion}</p>}
          </div>
          <SelectCampo label="Rubro" value={form.rubro} onChange={v => setForm(f => ({ ...f, rubro: v }))} error={errores.rubro} options={RUBROS.map(r => ({ value: r.id, label: r.label }))} />
          <SelectCampo label="Zona" value={form.zona} onChange={v => setForm(f => ({ ...f, zona: v }))} error={errores.zona} options={DEPARTAMENTOS.map(d => ({ value: d, label: d }))} />
          <Campo label="Vencimiento (opcional)" type="date" value={form.expires_at} onChange={v => setForm(f => ({ ...f, expires_at: v }))} />
          {mensaje && <p style={{ margin: '0 0 12px', fontSize: '14px', color: mensaje.includes('No') ? '#dc3545' : TEAL }}>{mensaje}</p>}
          <button type="submit" style={btnPrimary} disabled={publicando}>
            {publicando ? 'Publicando...' : 'Publicar llamado'}
          </button>
        </form>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: NAVY }}>
          Mis llamados
        </h2>
        {cargandoLlamados ? (
          <p style={{ color: MUTED, margin: 0 }}>Cargando...</p>
        ) : llamados.length === 0 ? (
          <p style={{ color: MUTED, margin: 0, padding: '16px', background: '#F8F9FA', borderRadius: '8px', textAlign: 'center' }}>
            Todavía no publicaste llamados.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {llamados.map(l => (
              <article key={l.id} style={{ padding: '16px', border: '1px solid #E9ECEF', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: NAVY }}>{l.titulo}</h3>
                  <EstadoBadge estado={l.estado} />
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '14px', color: MUTED, lineHeight: 1.5 }}>{l.descripcion}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#ADB5BD' }}>
                  {l.rubro} · {l.zona} · {new Date(l.created_at).toLocaleDateString('es-UY')}
                </p>
                {l.estado === 'rechazado' && l.motivo_rechazo && (
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#dc3545' }}>
                    Motivo: {l.motivo_rechazo}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {perfil?.es_admin && (
        <p style={{ marginTop: '8px' }}>
          <Link to="/admin/moderacion" style={{ color: NAVY, fontWeight: 600 }}>Ir a moderación de llamados →</Link>
        </p>
      )}
    </div>
  )
}

function Stat({ titulo, valor, desc }: { titulo: string; valor: string; desc: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <p style={{ color: '#8C96A3', fontSize: '13px', margin: '0 0 8px' }}>{titulo}</p>
      <p style={{ color: NAVY, fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>{valor}</p>
      <p style={{ color: '#ADB5BD', fontSize: '12px', margin: 0 }}>{desc}</p>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: Llamado['estado'] }) {
  const colors: Record<Llamado['estado'], { bg: string; color: string }> = {
    pendiente_moderacion: { bg: '#FFF3CD', color: '#856404' },
    activo: { bg: '#D4EDDA', color: '#155724' },
    rechazado: { bg: '#F8D7DA', color: '#721C24' },
    cerrado: { bg: '#E9ECEF', color: '#495057' },
  }
  const c = colors[estado]
  return (
    <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: c.bg, color: c.color }}>
      {labelEstadoLlamado(estado)}
    </span>
  )
}

function Campo({ label, value, onChange, error, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; placeholder?: string
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={inputStyle} />
      {error && <p style={{ color: '#dc3545', fontSize: '13px', margin: '6px 0 0' }}>{error}</p>}
    </div>
  )
}

function SelectCampo({ label, value, onChange, error, options }: {
  label: string; value: string; onChange: (v: string) => void; error?: string
  options: { value: string; label: string }[]
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
        <option value="">Seleccioná</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ color: '#dc3545', fontSize: '13px', margin: '6px 0 0' }}>{error}</p>}
    </div>
  )
}
