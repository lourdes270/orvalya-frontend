import { useState, useEffect, type CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'
import type { DocumentacionAdicional, Perfil } from '../../contexts/AuthContextType'
import { isDescripcionJson } from '../../lib/formatDescripcionServicio'
import { RANGOS_EDAD, selectRangoEdadStyle } from '../../lib/rangoEdad'
import { formatZonaDisplay } from './formatZona'
import { DescripcionServicioField } from './DescripcionServicioField'
import { normalizarTelefono, validarTelefono } from '../../lib/validaciones'
import { sanitizeText } from '../../lib/sanitize'
import { MENSAJE_RUT_DUPLICADO, rutYaRegistrado } from '../../lib/rutHelpers'
import { HoneypotField } from '../../components/botProtection/HoneypotField'
import { isProfileHoneypotTriggered } from '../../lib/botProtection/profileHoneypot'

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
  sobre_mi: string
  experiencia: string
  cursos: string
  documentacion_adicional: DocumentacionAdicional
}

const DOCUMENTACION_OPCIONES = [
  { key: 'carne_salud', label: 'Carné de salud vigente' },
  { key: 'libreta_conducir', label: 'Libreta de conducir' },
  { key: 'habilitacion_municipal', label: 'Habilitación municipal' },
] as const satisfies ReadonlyArray<{ key: keyof DocumentacionAdicional; label: string }>

const DOCUMENTACION_VACIA: DocumentacionAdicional = {
  carne_salud: false,
  libreta_conducir: false,
  habilitacion_municipal: false,
}

function parseDocumentacionAdicional(valor: unknown): DocumentacionAdicional {
  if (!valor || typeof valor !== 'object') return { ...DOCUMENTACION_VACIA }
  const data = valor as Record<string, unknown>
  return {
    carne_salud: data.carne_salud === true,
    libreta_conducir: data.libreta_conducir === true,
    habilitacion_municipal: data.habilitacion_municipal === true,
  }
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

function rutValorVisible(rut: string): string {
  const t = rut.trim()
  if (!t || t === 'pendiente_verificacion') return ''
  return rut
}

function rutSinInformar(rut: string): boolean {
  const t = rut.trim()
  return !t || t === 'pendiente_verificacion'
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
    sobre_mi: '',
    experiencia: '',
    cursos: '',
    documentacion_adicional: { ...DOCUMENTACION_VACIA },
  })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({})
  const [honeypot, setHoneypot] = useState('')

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
      sobre_mi: perfil.sobre_mi ?? '',
      experiencia: perfil.experiencia ?? '',
      cursos: perfil.cursos ?? '',
      documentacion_adicional: parseDocumentacionAdicional(perfil.documentacion_adicional),
    })
  }, [perfil])

  const guardar = async () => {
    if (!perfil) return
    if (isProfileHoneypotTriggered(honeypot, 'perfil-prestador')) {
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
      return
    }
    const nextErrores: Record<string, string> = {}
    if (!form.nombre.trim()) nextErrores.nombre = 'El nombre es obligatorio.'
    const telErr = validarTelefono(form.telefono, { etiqueta: 'teléfono' })
    if (telErr) nextErrores.telefono = telErr
    const waErr = validarTelefono(form.whatsapp, { etiqueta: 'WhatsApp' })
    if (waErr) nextErrores.whatsapp = waErr
    if (Object.keys(nextErrores).length > 0) {
      setErroresCampo(nextErrores)
      setError('')
      return
    }
    setErroresCampo({})
    setGuardando(true)
    setError('')
    try {
      const rutVisible = form.rut.trim()
      if (rutVisible && await rutYaRegistrado(rutVisible, perfil.id)) {
        setErroresCampo({ rut: MENSAJE_RUT_DUPLICADO })
        return
      }

      const telefono = form.telefono.trim() ? normalizarTelefono(form.telefono) : ''
      const whatsapp = form.whatsapp.trim() ? normalizarTelefono(form.whatsapp) : ''
      const tarifa_hora = form.tarifa_hora.trim() ? parseNumero(form.tarifa_hora) : null
      const viatico_diario = form.acepta_viatico && form.viatico_diario.trim()
        ? parseNumero(form.viatico_diario)
        : null

      const payload: Record<string, string | number | boolean | null | DocumentacionAdicional> = {
        nombre: sanitizeText(form.nombre),
        telefono,
        whatsapp,
        rut: rutVisible,
        rango_edad: form.rango_edad || null,
        tarifa_hora,
        tarifa_modalidad: form.tarifa_modalidad || null,
        acepta_viatico: form.acepta_viatico,
        viatico_diario,
        tiene_vehiculo: form.tiene_vehiculo,
        tipo_vehiculo: form.tiene_vehiculo && form.tipo_vehiculo ? form.tipo_vehiculo : null,
        sobre_mi: sanitizeText(form.sobre_mi) || null,
        experiencia: sanitizeText(form.experiencia) || null,
        cursos: sanitizeText(form.cursos) || null,
        documentacion_adicional: form.documentacion_adicional,
      }
      if (!isDescripcionJson(form.descripcion)) payload.descripcion = sanitizeText(form.descripcion)
      const { error } = await supabase.from('perfiles').update(payload).eq('id', perfil.id)
      if (error) throw error
      onPerfilUpdate({
        ...perfil,
        nombre: form.nombre,
        telefono,
        whatsapp,
        rut: form.rut,
        descripcion: form.descripcion,
        rango_edad: form.rango_edad || null,
        tarifa_hora,
        tarifa_modalidad: form.tarifa_modalidad || null,
        acepta_viatico: form.acepta_viatico,
        viatico_diario,
        tiene_vehiculo: form.tiene_vehiculo,
        tipo_vehiculo: form.tiene_vehiculo && form.tipo_vehiculo ? form.tipo_vehiculo : null,
        sobre_mi: form.sobre_mi.trim() || null,
        experiencia: form.experiencia.trim() || null,
        cursos: form.cursos.trim() || null,
        documentacion_adicional: form.documentacion_adicional,
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const campo = (
    label: string,
    key: 'nombre' | 'rut' | 'telefono' | 'whatsapp' | 'zona',
    placeholder: string,
    opciones?: { inputMode?: 'numeric'; normalizar?: boolean },
  ) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        inputMode={opciones?.inputMode}
        value={form[key]}
        onChange={e => {
          const valor = opciones?.normalizar ? normalizarTelefono(e.target.value) : e.target.value
          setForm(prev => ({ ...prev, [key]: valor }))
          if (erroresCampo[key]) {
            setErroresCampo(prev => {
              const { [key]: _, ...rest } = prev
              return rest
            })
          }
        }}
        placeholder={placeholder}
        style={{
          ...inputStyle,
          ...(erroresCampo[key] ? { borderColor: '#dc2626' } : {}),
        }}
      />
      {erroresCampo[key] && (
        <p style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 0' }}>{erroresCampo[key]}</p>
      )}
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

  const textareaConLimite = (
    titulo: string,
    key: 'sobre_mi' | 'experiencia' | 'cursos',
    maximo: number,
    placeholder: string,
  ) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={labelStyle}>{titulo}</label>
      <textarea
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value.slice(0, maximo) }))}
        placeholder={placeholder}
        maxLength={maximo}
        rows={4}
        spellCheck={true}
        autoCorrect="on"
        autoCapitalize="sentences"
        style={{
          ...inputStyle,
          resize: 'vertical',
          minHeight: '96px',
          lineHeight: 1.5,
        }}
      />
      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8C96A3', textAlign: 'right' }}>
        {form[key].length}/{maximo}
      </p>
    </div>
  )

  const toggleDocumentacion = (key: keyof DocumentacionAdicional) => {
    setForm(prev => ({
      ...prev,
      documentacion_adicional: {
        ...prev.documentacion_adicional,
        [key]: !prev.documentacion_adicional[key],
      },
    }))
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Mi perfil</h2>
      {campo('Nombre de la empresa o persona', 'nombre', 'Ej: Limpieza Industrial García')}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>RUT</label>
        <input
          type="text"
          value={rutValorVisible(form.rut)}
          onChange={e => {
            setForm(prev => ({ ...prev, rut: e.target.value }))
            if (erroresCampo.rut) {
              setErroresCampo(prev => {
                const { rut: _, ...rest } = prev
                return rest
              })
            }
          }}
          placeholder="No informado"
          style={{
            ...inputStyle,
            ...(rutSinInformar(form.rut) ? { color: '#ADB5BD' } : {}),
            ...(erroresCampo.rut ? { borderColor: '#dc2626' } : {}),
          }}
        />
        {erroresCampo.rut && (
          <p style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 0' }}>{erroresCampo.rut}</p>
        )}
      </div>
      {campo('Teléfono', 'telefono', 'Ej: 099123456', { inputMode: 'numeric', normalizar: true })}
      {campo('WhatsApp', 'whatsapp', '099123456', { inputMode: 'numeric', normalizar: true })}

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

      <div style={{ marginBottom: '20px', paddingTop: '4px', borderTop: '1px solid #F1F3F5' }}>
        <h3 style={{ color: '#1F3864', fontSize: '14px', fontWeight: 600, margin: '16px 0 16px' }}>
          Presentación profesional
        </h3>
        {textareaConLimite(
          'Sobre mí',
          'sobre_mi',
          300,
          'Ej: Albañil con 8 años de experiencia en construcción residencial e industrial. Especializado en revoque, mampostería y terminaciones. Puntual, responsable y con referencias verificables.',
        )}
        {textareaConLimite(
          'Mi experiencia',
          'experiencia',
          400,
          'Ej: 2018-2024 — Empresa Constructora del Este, Montevideo. Tareas de mampostería, revoques y colocación de cerámicos. 2015-2018 — Trabajos independientes en Canelones y Maldonado.',
        )}
        {textareaConLimite(
          'Cursos y estudios',
          'cursos',
          300,
          'Ej: Curso de Seguridad e Higiene Laboral (MTSS, 2022). Bachillerato completo (UTU, 2014). Curso de Instalaciones Sanitarias Básicas (CECAP, 2020).',
        )}
        <div style={{ marginBottom: '8px' }}>
          <label style={labelStyle}>Documentación adicional (opcional)</label>
          {DOCUMENTACION_OPCIONES.map(opcion => (
            <label
              key={opcion.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontSize: '13px',
                color: '#495057',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={!!form.documentacion_adicional[opcion.key]}
                onChange={() => toggleDocumentacion(opcion.key)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>{opcion.label}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}
      <HoneypotField value={honeypot} onChange={setHoneypot} />
      <button onClick={guardar} disabled={guardando} style={{ padding: '10px 24px', background: guardado ? '#40C057' : '#1F3864', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
        {guardando ? 'Guardando...' : guardado ? 'Guardado ✓' : 'Guardar perfil'}
      </button>
    </div>
  )
}
