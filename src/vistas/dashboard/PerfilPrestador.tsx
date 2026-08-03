import { useState, useEffect, useRef, type CSSProperties } from 'react'
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

const btnPrimario: CSSProperties = {
  padding: '12px 20px',
  background: '#1F3864',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
}

const btnSecundario: CSSProperties = {
  padding: '12px 16px',
  background: '#fff',
  color: '#1F3864',
  border: '1px solid #DEE2E6',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
}

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

function formDesdePerfil(perfil: Perfil): FormState {
  return {
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
  }
}

function labelModalidad(valor: string): string {
  return TARIFA_MODALIDADES.find(o => o.value === valor)?.label ?? ''
}

function labelVehiculo(valor: string): string {
  return TIPOS_VEHICULO.find(o => o.value === valor)?.label ?? ''
}

function FilaLectura({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={labelStyle}>{label}</div>
      <p style={{
        margin: 0,
        fontSize: '15px',
        color: valor.trim() ? '#212529' : '#ADB5BD',
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
      }}>
        {valor.trim() || 'Sin completar'}
      </p>
    </div>
  )
}

export default function PerfilPrestador({ perfil, onPerfilUpdate }: PerfilPrestadorProps) {
  const [modo, setModo] = useState<'ver' | 'editar'>('ver')
  const [form, setForm] = useState<FormState>(() => formDesdePerfil(perfil))
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({})
  const [honeypot, setHoneypot] = useState('')
  const seccionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!perfil) return
    if (modo === 'ver') setForm(formDesdePerfil(perfil))
  }, [perfil, modo])

  const entrarEdicion = () => {
    setForm(formDesdePerfil(perfil))
    setError('')
    setErroresCampo({})
    setModo('editar')
    requestAnimationFrame(() => {
      seccionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const cancelarEdicion = () => {
    setForm(formDesdePerfil(perfil))
    setError('')
    setErroresCampo({})
    setModo('ver')
  }

  const guardar = async () => {
    if (!perfil) return
    if (isProfileHoneypotTriggered(honeypot, 'perfil-prestador')) {
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
      setModo('ver')
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
      const { error: updateError } = await supabase.from('perfiles').update(payload).eq('id', perfil.id)
      if (updateError) throw updateError
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
      setModo('ver')
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const campo = (
    label: string,
    key: 'nombre' | 'rut' | 'telefono' | 'whatsapp',
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

  const docsExtras = DOCUMENTACION_OPCIONES
    .filter(o => form.documentacion_adicional[o.key])
    .map(o => o.label)
    .join(' · ')

  const tarifaResumen = [
    form.tarifa_hora.trim() ? `USD ${form.tarifa_hora.trim()}/h` : '',
    labelModalidad(form.tarifa_modalidad),
    form.acepta_viatico
      ? (form.viatico_diario.trim() ? `Viático USD ${form.viatico_diario.trim()}` : 'Cobra viático')
      : '',
    form.tiene_vehiculo
      ? (labelVehiculo(form.tipo_vehiculo) ? `Vehículo: ${labelVehiculo(form.tipo_vehiculo)}` : 'Tiene vehículo')
      : '',
  ].filter(Boolean).join(' · ')

  if (modo === 'ver') {
    return (
      <div
        ref={seccionRef}
        style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
          <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: 0 }}>Mi perfil</h2>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#8C96A3', lineHeight: 1.4 }}>
          Así figuran tus datos. Tocá Editar perfil para cambiarlos.
        </p>

        <button type="button" onClick={entrarEdicion} style={{ ...btnPrimario, marginBottom: '20px' }}>
          Editar perfil
        </button>

        {guardado && (
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#2B8A3E', fontWeight: 500 }}>
            Cambios guardados
          </p>
        )}

        <FilaLectura label="Nombre de la empresa o persona" valor={form.nombre} />
        <FilaLectura label="RUT" valor={rutValorVisible(form.rut) || 'No informado'} />
        <FilaLectura label="Teléfono" valor={form.telefono} />
        <FilaLectura label="WhatsApp" valor={form.whatsapp} />
        <FilaLectura label="Tarifa y disponibilidad" valor={tarifaResumen} />
        <FilaLectura label="Zona de trabajo" valor={form.zona} />
        <FilaLectura label="Rango de edad" valor={form.rango_edad ? `${form.rango_edad} años` : ''} />
        <DescripcionServicioField raw={form.descripcion} />
        <FilaLectura label="Sobre mí" valor={form.sobre_mi} />
        <FilaLectura label="Mi experiencia" valor={form.experiencia} />
        <FilaLectura label="Cursos y estudios" valor={form.cursos} />
        <FilaLectura label="Documentación adicional" valor={docsExtras} />
      </div>
    )
  }

  return (
    <div
      ref={seccionRef}
      style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px', paddingBottom: '88px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
        <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: 0 }}>Editar perfil</h2>
        <button type="button" onClick={cancelarEdicion} style={{ ...btnSecundario, padding: '8px 12px', fontSize: '13px' }}>
          Cancelar
        </button>
      </div>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#8C96A3' }}>
        Cambiá lo que necesites y guardá al final.
      </p>

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

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Zona de trabajo</label>
        <div style={{
          padding: '10px 12px',
          background: '#F8F9FA',
          borderRadius: '8px',
          fontSize: '14px',
          color: form.zona ? '#212529' : '#ADB5BD',
          border: '1px solid #E9ECEF',
        }}>
          {form.zona || 'Sin zona definida'}
        </div>
        <p style={{ fontSize: '12px', color: '#8C96A3', margin: '6px 0 0' }}>
          Definida en el registro. Para cambiarla, contactá soporte.
        </p>
      </div>
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

      <div style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        margin: '16px -24px -24px',
        padding: '12px 24px calc(12px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(255,255,255,0.96)',
        borderTop: '1px solid #DEE2E6',
        display: 'flex',
        gap: '8px',
        zIndex: 20,
        backdropFilter: 'blur(6px)',
      }}>
        <button type="button" onClick={cancelarEdicion} style={{ ...btnSecundario, flex: '0 0 auto' }}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          style={{
            ...btnPrimario,
            flex: 1,
            background: guardado ? '#40C057' : '#1F3864',
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando ? 'Guardando...' : guardado ? 'Guardado ✓' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
