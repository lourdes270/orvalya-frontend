import { useState } from 'react'
import { COPY } from '../copy'
import { STYLES } from '../styles/onboarding.styles'
import { normalizarWhatsapp } from '../../../lib/registroHelpers'
import { normalizarTelefono, validarEmail, validarTelefono } from '../../../lib/validaciones'
import type { OnboardingForm, ZonasSeleccion } from '../types'
import { DEPARTAMENTOS, ZONAS_MONTEVIDEO } from '../data/zonas'
import {
  NIVELES_FORMACION,
  PAISES_TELEFONO,
  opcionesAnioNacimiento,
  opcionesDia,
  opcionesMes,
  rangoEdadDesdeFecha,
  selectFacilStyle,
} from '../data/listasFaciles'

const CARACTERES_NO_NOMBRE = /[^\p{L}\s]/gu

function filtrarNombre(valor: string): string {
  const limpio = valor.replace(CARACTERES_NO_NOMBRE, '')
  return limpio.replace(/(^|\s)(\p{L})/gu, (_, espacio, letra) => espacio + letra.toUpperCase())
}

interface Step2DatosBasicosProps {
  form: OnboardingForm
  setForm: (form: OnboardingForm) => void
  isMobile: boolean
  onAvanzar: () => void
  onVolver: () => void
  puedeAvanzar: () => boolean
}

// Datos básicos del prestador
export default function Step2DatosBasicos({
  form,
  setForm,
  isMobile,
  onAvanzar,
  onVolver,
  puedeAvanzar,
}: Step2DatosBasicosProps) {
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [nacDia, setNacDia] = useState(0)
  const [nacMes, setNacMes] = useState(0)
  const [nacAnio, setNacAnio] = useState(0)

  const zonasVacias: ZonasSeleccion = {
    todoUruguay: false,
    departamentos: [],
    zonasMontevideo: [],
  }

  const getZonas = (zona: string | ZonasSeleccion): ZonasSeleccion => {
    if (typeof zona !== 'string') return zona
    if (!zona.trim()) return zonasVacias
    try {
      const parsed = JSON.parse(zona) as ZonasSeleccion
      if (typeof parsed.todoUruguay === 'boolean') return parsed
    } catch {
      // formato antiguo: string plano
    }
    return zonasVacias
  }

  const zonas = getZonas(form.zona)

  const validarNombreCampo = () => {
    if (form.nombre.trim().length === 0) {
      setErrores(prev => ({ ...prev, nombre: COPY.paso2.campos.nombre.error }))
    } else {
      setErrores(prev => {
        const { nombre, ...rest } = prev
        return rest
      })
    }
  }

  const validarApellidoCampo = () => {
    if (form.apellido.trim().length === 0) {
      setErrores(prev => ({ ...prev, apellido: COPY.paso2.campos.apellido.error }))
    } else {
      setErrores(prev => {
        const { apellido, ...rest } = prev
        return rest
      })
    }
  }

  const validarEmailCampo = () => {
    const error = validarEmail(form.email)
    if (error) {
      setErrores(prev => ({ ...prev, email: error }))
    } else {
      setErrores(prev => {
        const { email, ...rest } = prev
        return rest
      })
    }
  }

  const validarTelefonoCampo = () => {
    const error = validarTelefono(form.telefono, { requerido: true })
    if (error) {
      setErrores(prev => ({ ...prev, telefono: error }))
    } else {
      setErrores(prev => {
        const { telefono, ...rest } = prev
        return rest
      })
    }
  }

  const validarZona = () => {
    const z = getZonas(form.zona)
    if (z.departamentos.length === 0 && !z.todoUruguay) {
      setErrores(prev => ({ ...prev, zona: 'Elegí al menos una zona donde podés trabajar.' }))
    } else {
      setErrores(prev => {
        const { zona, ...rest } = prev
        return rest
      })
    }
  }

  const validarWhatsapp = () => {
    if (form.whatsapp_igual_telefono) {
      setErrores(prev => {
        const { whatsapp, ...rest } = prev
        return rest
      })
      return
    }
    const error = validarTelefono(form.whatsapp, { requerido: true, etiqueta: 'WhatsApp' })
    if (error) {
      setErrores(prev => ({ ...prev, whatsapp: error }))
    } else {
      setErrores(prev => {
        const { whatsapp, ...rest } = prev
        return rest
      })
    }
  }

  const handleNombreChange = (campo: 'nombre' | 'apellido', valor: string) => {
    handleChange(campo, filtrarNombre(valor))
  }

  const handleEmailChange = (valor: string) => {
    handleChange('email', valor.toLowerCase())
  }

  const handleTelefonoChange = (valor: string) => {
    const tel = normalizarTelefono(valor)
    if (form.whatsapp_igual_telefono) {
      setForm({ ...form, telefono: tel, whatsapp: tel })
    } else {
      setForm({ ...form, telefono: tel })
    }
    if (errores.telefono || errores.whatsapp) {
      setErrores(prev => {
        const next = { ...prev }
        delete next.telefono
        if (form.whatsapp_igual_telefono) delete next.whatsapp
        return next
      })
    }
  }

  const handleWhatsappChange = (valor: string) => {
    handleChange('whatsapp', normalizarWhatsapp(valor))
  }

  const handleWhatsappIgual = (checked: boolean) => {
    setForm({
      ...form,
      whatsapp_igual_telefono: checked,
      whatsapp: checked ? form.telefono : form.whatsapp,
    })
    if (checked) {
      setErrores(prev => {
        const { whatsapp, ...rest } = prev
        return rest
      })
    }
  }

  const handleNacimiento = (dia: number, mes: number, anio: number) => {
    setNacDia(dia)
    setNacMes(mes)
    setNacAnio(anio)
    const rango = rangoEdadDesdeFecha(dia, mes, anio)
    setForm({ ...form, rango_edad: rango })
  }

  const handleChange = (campo: keyof OnboardingForm, valor: string | boolean) => {
    setForm({ ...form, [campo]: valor })
    if (typeof campo === 'string' && errores[campo]) {
      setErrores(prev => {
        const { [campo]: _, ...rest } = prev
        return rest
      })
    }
  }

  const toggleTodoUruguay = () => {
    const newZonas: ZonasSeleccion = {
      todoUruguay: !zonas.todoUruguay,
      departamentos: !zonas.todoUruguay ? [...DEPARTAMENTOS] : [],
      zonasMontevideo: !zonas.todoUruguay ? [...ZONAS_MONTEVIDEO] : [],
    }
    setForm({ ...form, zona: newZonas })
    if (errores.zona) {
      setErrores(prev => {
        const { zona, ...rest } = prev
        return rest
      })
    }
  }

  const toggleDepartamento = (depto: string) => {
    const newDepartamentos = zonas.departamentos.includes(depto)
      ? zonas.departamentos.filter(d => d !== depto)
      : [...zonas.departamentos, depto]
    
    // If Montevideo is deselected, clear Montevideo zones
    const newZonasMontevideo = depto === 'Montevideo' && !zonas.departamentos.includes(depto)
      ? []
      : zonas.zonasMontevideo

    const newZonas: ZonasSeleccion = {
      ...zonas,
      todoUruguay: false,
      departamentos: newDepartamentos,
      zonasMontevideo: newZonasMontevideo,
    }
    setForm({ ...form, zona: newZonas })
    if (errores.zona) {
      setErrores(prev => {
        const { zona, ...rest } = prev
        return rest
      })
    }
  }

  const toggleZonaMontevideo = (zona: string) => {
    const newZonasMontevideo = zonas.zonasMontevideo.includes(zona)
      ? zonas.zonasMontevideo.filter(z => z !== zona)
      : [...zonas.zonasMontevideo, zona]
    
    const newZonas: ZonasSeleccion = {
      ...zonas,
      zonasMontevideo: newZonasMontevideo,
    }
    setForm({ ...form, zona: newZonas })
  }

  const getShortZoneLabel = (zona: string): string => {
    const labels: Record<string, string> = {
      'Zona Centro': 'Centro',
      'Zona Este': 'Este',
      'Zona Oeste': 'Oeste',
      'Zona Norte': 'Norte',
      'Zona Sur': 'Sur',
      'Todo Montevideo': 'Todo Mvd',
    }
    return labels[zona] || zona
  }

  return (
    <div style={STYLES.wrapper(isMobile)}>
      <div style={{ position: 'relative', ...STYLES.card(isMobile) }}>
        {isMobile && (
          <button type="button" style={STYLES.botonVolver()} onClick={onVolver}>
            {COPY.botones.volver}
          </button>
        )}
        <h1 style={{ ...STYLES.titulo(isMobile), paddingTop: isMobile ? '48px' : '0' }}>
          {COPY.paso2.titulo}
        </h1>
        <p style={STYLES.subtitulo()}>{COPY.paso2.subtitulo}</p>
        <div style={{ marginBottom: isMobile ? '88px' : '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px' }}>
            {COPY.paso2.campos.nombre.label}
          </label>
          <input
            type="text"
            autoComplete="given-name"
            style={{
              ...STYLES.input(isMobile),
              height: isMobile ? '52px' : undefined,
              fontSize: isMobile ? '16px' : undefined,
            }}
            placeholder={COPY.paso2.campos.nombre.placeholder}
            value={form.nombre}
            onChange={(e) => handleNombreChange('nombre', e.target.value)}
            onBlur={validarNombreCampo}
          />
          {errores.nombre && <p style={STYLES.error()}>{errores.nombre}</p>}
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '20px' }}>
            {COPY.paso2.campos.apellido.label}
          </label>
          <input
            type="text"
            autoComplete="family-name"
            style={{
              ...STYLES.input(isMobile),
              height: isMobile ? '52px' : undefined,
              fontSize: isMobile ? '16px' : undefined,
            }}
            placeholder={COPY.paso2.campos.apellido.placeholder}
            value={form.apellido}
            onChange={(e) => handleNombreChange('apellido', e.target.value)}
            onBlur={validarApellidoCampo}
          />
          {errores.apellido && <p style={STYLES.error()}>{errores.apellido}</p>}
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '20px' }}>
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            style={{
              ...STYLES.input(isMobile),
              height: isMobile ? '52px' : undefined,
              fontSize: isMobile ? '16px' : undefined,
            }}
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={validarEmailCampo}
          />
          {errores.email && <p style={STYLES.error()}>{errores.email}</p>}
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '20px' }}>
            {COPY.paso2.campos.telefono.label}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              aria-label="Código de país"
              value={form.telefono_pais}
              onChange={e => handleChange('telefono_pais', e.target.value)}
              style={{
                ...selectFacilStyle(isMobile),
                width: isMobile ? 120 : 130,
                flexShrink: 0,
              }}
            >
              {PAISES_TELEFONO.map(p => (
                <option key={p.code} value={p.dial}>{p.flag} {p.label}</option>
              ))}
            </select>
            <input
              type="tel"
              autoComplete="tel-national"
              style={{
                ...STYLES.input(isMobile),
                height: isMobile ? '52px' : undefined,
                fontSize: isMobile ? '16px' : undefined,
                flex: 1,
              }}
              placeholder={COPY.paso2.campos.telefono.placeholder}
              inputMode="numeric"
              value={form.telefono}
              onChange={(e) => handleTelefonoChange(e.target.value)}
              onBlur={validarTelefonoCampo}
            />
          </div>
          {errores.telefono && <p style={STYLES.error()}>{errores.telefono}</p>}

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 14,
            fontSize: 14,
            color: '#212529',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={form.whatsapp_igual_telefono}
              onChange={e => handleWhatsappIgual(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            {COPY.paso2.campos.whatsapp.igualTelefono}
          </label>

          {!form.whatsapp_igual_telefono && (
            <>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '16px' }}>
                {COPY.paso2.campos.whatsapp.label}
              </label>
              <input
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                style={{
                  ...STYLES.input(isMobile),
                  height: isMobile ? '52px' : undefined,
                  fontSize: isMobile ? '16px' : undefined,
                }}
                placeholder={COPY.paso2.campos.whatsapp.placeholder}
                value={form.whatsapp}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                onBlur={validarWhatsapp}
              />
              {errores.whatsapp && <p style={STYLES.error()}>{errores.whatsapp}</p>}
            </>
          )}
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '20px' }}>
            Zonas de trabajo
          </label>
          
          {/* Todo Uruguay button */}
          <button
            type="button"
            onClick={toggleTodoUruguay}
            onBlur={validarZona}
            style={{
              width: '100%',
              height: isMobile ? '48px' : undefined,
              padding: isMobile ? '0' : '14px',
              border: zonas.todoUruguay ? 'none' : '1.5px solid #DEE2E6',
              borderRadius: '8px',
              backgroundColor: zonas.todoUruguay ? '#1F3864' : '#ffffff',
              color: zonas.todoUruguay ? '#ffffff' : '#1F3864',
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '20px',
              transition: 'all 0.2s',
            }}
          >
            {zonas.todoUruguay ? '✓ Todo Uruguay seleccionado' : 'Todo Uruguay'}
          </button>

          {/* Department chips */}
          {!zonas.todoUruguay && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {DEPARTAMENTOS.map((depto) => (
                <button
                  key={depto}
                  type="button"
                  onClick={() => toggleDepartamento(depto)}
                  onBlur={validarZona}
                  style={{
                    padding: isMobile ? '8px 12px' : '10px 14px',
                    border: zonas.departamentos.includes(depto) ? '1.5px solid #1F3864' : '1.5px solid #DEE2E6',
                    borderRadius: '20px',
                    backgroundColor: zonas.departamentos.includes(depto) ? '#EEF2FF' : '#ffffff',
                    color: zonas.departamentos.includes(depto) ? '#1F3864' : '#6b7280',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: zonas.departamentos.includes(depto) ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  {depto}
                  {zonas.departamentos.includes(depto) && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#1F3864',
                      borderRadius: '50%',
                      color: '#ffffff',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Montevideo zones (shown only if Montevideo is selected) */}
          {zonas.departamentos.includes('Montevideo') && !zonas.todoUruguay && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '20px',
            }}>
              {ZONAS_MONTEVIDEO.map((zona) => (
                <button
                  key={zona}
                  type="button"
                  onClick={() => toggleZonaMontevideo(zona)}
                  style={{
                    padding: isMobile ? '8px 12px' : '10px 14px',
                    border: zonas.zonasMontevideo.includes(zona) ? '1.5px solid #1F3864' : '1.5px solid #DEE2E6',
                    borderRadius: '20px',
                    backgroundColor: zonas.zonasMontevideo.includes(zona) ? '#EEF2FF' : '#ffffff',
                    color: zonas.zonasMontevideo.includes(zona) ? '#1F3864' : '#6b7280',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: zonas.zonasMontevideo.includes(zona) ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  {isMobile ? getShortZoneLabel(zona) : zona}
                  {zonas.zonasMontevideo.includes(zona) && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#1F3864',
                      borderRadius: '50%',
                      color: '#ffffff',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {errores.zona && <p style={STYLES.error()}>{errores.zona}</p>}

          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '20px' }}>
            {COPY.paso2.campos.nacimiento.label}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8 }}>
            <select
              aria-label="Día"
              value={nacDia || ''}
              onChange={e => handleNacimiento(Number(e.target.value) || 0, nacMes, nacAnio)}
              style={selectFacilStyle(isMobile)}
            >
              <option value="">Día</option>
              {opcionesDia().map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              aria-label="Mes"
              value={nacMes || ''}
              onChange={e => handleNacimiento(nacDia, Number(e.target.value) || 0, nacAnio)}
              style={selectFacilStyle(isMobile)}
            >
              <option value="">Mes</option>
              {opcionesMes().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select
              aria-label="Año"
              value={nacAnio || ''}
              onChange={e => handleNacimiento(nacDia, nacMes, Number(e.target.value) || 0)}
              style={selectFacilStyle(isMobile)}
            >
              <option value="">Año</option>
              {opcionesAnioNacimiento().map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <p style={STYLES.ayuda()}>{COPY.paso2.campos.nacimiento.ayuda}</p>

          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '16px' }}>
            {COPY.paso2.campos.formacion.label}
          </label>
          <select
            value={form.formacion}
            onChange={e => handleChange('formacion', e.target.value)}
            style={selectFacilStyle(isMobile)}
          >
            {NIVELES_FORMACION.map(n => (
              <option key={n.value || 'vacio'} value={n.value}>{n.label}</option>
            ))}
          </select>
          <p style={STYLES.ayuda()}>{COPY.paso2.campos.formacion.ayuda}</p>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" style={{ ...STYLES.botonPrimario(isMobile), background: '#ffffff', color: '#1F3864', border: '1.5px solid #DEE2E6' }} onClick={onVolver}>
              {COPY.botones.volver}
            </button>
            <button
              type="button"
              style={{
                ...STYLES.botonPrimario(isMobile),
                ...(puedeAvanzar() ? {} : STYLES.botonDeshabilitado()),
              }}
              onClick={onAvanzar}
              disabled={!puedeAvanzar()}
            >
              {COPY.botones.siguiente}
            </button>
          </div>
        )}
        {isMobile && (
          <div style={STYLES.botonFixedBottom()}>
            <button
              type="button"
              style={{
                ...STYLES.botonPrimario(isMobile),
                ...(puedeAvanzar() ? {} : STYLES.botonDeshabilitado()),
              }}
              onClick={onAvanzar}
              disabled={!puedeAvanzar()}
            >
              {COPY.botones.siguiente}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
