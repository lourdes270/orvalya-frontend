import { useState, useEffect, type CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'
import type { Perfil } from '../../contexts/AuthContextType'
import { isDescripcionJson } from '../../lib/formatDescripcionServicio'
import { RANGOS_EDAD, selectRangoEdadStyle } from '../../lib/rangoEdad'
import { formatZonaDisplay } from './formatZona'
import PerfilPublicoCard from './PerfilPublicoCard'
import { DescripcionServicioField } from './DescripcionServicioField'

interface PerfilPrestadorProps {
  perfil: Perfil
  onPerfilUpdate: (perfil: Perfil) => void
}

type FormState = {
  nombre: string
  telefono: string
  whatsapp: string
  zona: string
  rut: string
  descripcion: string
  rango_edad: string
  tarifa_hora: string
  tarifa_modalidad: string
  acepta_viatico: boolean
  viatico_diario: string
  tiene_vehiculo: boolean
  tipo_vehiculo: string
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #DEE2E6',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#212529',
  boxSizing: 'border-box',
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: '#495057',
  marginBottom: '6px',
  fontWeight: 500,
}

const TARIFA_MODALIDADES = [
  { value: 'hora', label: 'Por hora' },
  { value: 'jornada', label: 'Por jornada (día completo)' },
  { value: 'tarea', label: 'Por tarea/trabajo puntual' },
] as const

const TIPOS_VEHICULO = [
  { value: 'moto', label: 'Moto' },
  { value: 'auto', label: 'Auto' },
  { value: 'camioneta', label: 'Camioneta' },
  { value: 'otro', label: 'Otro' },
] as const

function parseNumero(valor: string): number | null {
  const n = parseFloat(valor.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export default function PerfilPrestador({ perfil, onPerfilUpdate }: PerfilPrestadorProps) {
  const [form, setForm] = useState<FormState>({
    nombre: '',
    telefono: '',
    whatsapp: '',
    zona: '',
    rut: '',
    descripcion: '',
    rango_edad: '',
    tarifa_hora: '',
    tarifa_modalidad: '',
    acepta_viatico: false,
    viatico_diario: '',
    tiene_vehiculo: false,
    tipo_vehiculo: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!perfil) return
    setForm({
      nombre: perfil.nombre ?? '',
      telefono: perfil.telefono ?? '',
      whatsapp: perfil.whatsapp ?? '',
      zona: formatZonaDisplay(perfil.zona),
      rut: perfil.rut ?? '',
      descripcion: perfil.descripcion ?? '',
      rango_edad: perfil.rango_edad ?? '',
      tarifa_hora: perfil.tarifa_hora != null ? String(perfil.tarifa_hora) : '',
      tarifa_modalidad: perfil.tarifa_modalidad ?? '',
      acepta_viatico: perfil.acepta_viatico ?? false,
      viatico_diario: perfil.viatico_diario != null ? String(perfil.viatico_diario) : '',
      tiene_vehiculo: perfil.tiene_vehiculo ?? false,
      tipo_vehiculo: perfil.tipo_vehiculo ?? '',
    })
  }, [perfil])

  const guardar = async () => {
    if (!perfil) return
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setGuardando(true)
    setError('')
    try {
      const tarifa_hora = form.tarifa_hora.trim() ? parseNumero(form.tarifa_hora) : null
      const viatico_diario = form.acepta_viatico && form.viatico_diario.trim()
        ? parseNumero(form.viatico_diario)
        : null

      const payload: Record<string, string | number | boolean | null> = {
        nombre: form.nombre,
        telefono: form.telefono,
        whatsapp: form.whatsapp,
        rut: form.rut,
        rango_edad: form.rango_edad || null,
        tarifa_hora,
        tarifa_modalidad: form.tarifa_modalidad || null,
        acepta_viatico: form.acepta_viatico,
        viatico_diario,
        tiene_vehiculo: form.tiene_vehiculo,
        tipo_vehiculo: form.tiene_vehiculo && form.tipo_vehiculo ? form.tipo_vehiculo : null,
      }
      if (!isDescripcionJson(form.descripcion)) payload.descripcion = form.descripcion
      const { error } = await supabase.from('perfiles').update(payload).eq('id', perfil.id)
      if (error) throw error
      onPerfilUpdate({
        ...perfil,
        nombre: form.nombre,
        telefono: form.telefono,
        whatsapp: form.whatsapp,
        rut: form.rut,
        descripcion: form.descripcion,
        rango_edad: form.rango_edad || null,
        tarifa_hora,
        tarifa_modalidad: form.tarifa_modalidad || null,
        acepta_viatico: form.acepta_viatico,
        viatico_diario,
        tiene_vehiculo: form.tiene_vehiculo,
        tipo_vehiculo: form.tiene_vehiculo && form.tipo_vehiculo ? form.tipo_vehiculo : null,
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const campo = (label: string, key: 'nombre' | 'rut' | 'telefono' | 'whatsapp' | 'zona', placeholder: string) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )

  const campoNumericoUsd = (
    label: string,
    key: 'tarifa_hora' | 'viatico_diario',
    placeholder: string,
  ) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          background: '#F8F9FA',
          border: '1px solid #DEE2E6',
          borderRight: 'none',
          borderRadius: '8px 0 0 8px',
          fontSize: '14px',
          color: '#495057',
          fontWeight: 500,
        }}>$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form[key]}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          style={{ ...inputStyle, borderRadius: '0 8px 8px 0', flex: 1 }}
        />
      </div>
    </div>
  )

  const checkbox = (
    label: string,
    key: 'acepta_viatico' | 'tiene_vehiculo',
  ) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#495057', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.checked }))}
        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
      />
      <span>{label}</span>
    </label>
  )

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Mi perfil</h2>
      <PerfilPublicoCard perfil={{ ...perfil, nombre: form.nombre, rango_edad: form.rango_edad || null }} />
      {campo('Nombre de la empresa o persona', 'nombre', 'Ej: Limpieza Industrial García')}
      {campo('RUT', 'rut', 'Ej: 21234567-8')}
      {campo('Teléfono', 'telefono', 'Ej: 099 123 456')}
      {campo('WhatsApp', 'whatsapp', '099 123 456')}

      <div style={{ marginBottom: '20px', paddingTop: '4px', borderTop: '1px solid #F1F3F5' }}>
        <h3 style={{ color: '#1F3864', fontSize: '14px', fontWeight: 600, margin: '16px 0 16px' }}>
          Mi tarifa y disponibilidad
        </h3>
        {campoNumericoUsd('Tarifa por hora (USD)', 'tarifa_hora', 'Ej: 5')}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Modalidad de cobro</label>
          <select
            value={form.tarifa_modalidad}
            onChange={e => setForm(prev => ({ ...prev, tarifa_modalidad: e.target.value }))}
            style={{ ...inputStyle, background: '#fff' }}
          >
            <option value="">Seleccionar (opcional)</option>
            {TARIFA_MODALIDADES.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {checkbox('Cobro viático de transporte', 'acepta_viatico')}
        {form.acepta_viatico && campoNumericoUsd('Viático diario (USD)', 'viatico_diario', 'Ej: 3')}
        {checkbox('Tengo vehículo propio', 'tiene_vehiculo')}
        {form.tiene_vehiculo && (
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Tipo de vehículo</label>
            <select
              value={form.tipo_vehiculo}
              onChange={e => setForm(prev => ({ ...prev, tipo_vehiculo: e.target.value }))}
              style={{ ...inputStyle, background: '#fff' }}
            >
              <option value="">Seleccionar (opcional)</option>
              {TIPOS_VEHICULO.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {campo('Zona de trabajo', 'zona', 'Ej: Montevideo, Canelones')}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Rango de edad (opcional)</label>
        <select value={form.rango_edad} onChange={e => setForm(prev => ({ ...prev, rango_edad: e.target.value }))} style={selectRangoEdadStyle}>
          <option value="">Preferir no indicar</option>
          {RANGOS_EDAD.map(r => <option key={r} value={r}>{r} años</option>)}
        </select>
      </div>
      <DescripcionServicioField raw={form.descripcion} />
      {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}
      <button onClick={guardar} disabled={guardando} style={{ padding: '10px 24px', background: guardado ? '#40C057' : '#1F3864', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
        {guardando ? 'Guardando...' : guardado ? 'Guardado ✓' : 'Guardar perfil'}
      </button>
    </div>
  )
}
