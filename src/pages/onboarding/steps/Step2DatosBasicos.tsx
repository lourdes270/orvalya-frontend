import { useState } from 'react'
import { COPY } from '../copy'
import { STYLES } from '../styles/onboarding.styles'
import type { OnboardingForm, ZonasSeleccion } from '../types'
import { DEPARTAMENTOS, ZONAS_MONTEVIDEO } from '../data/zonas'

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

  const validarNombre = () => {
    if (form.nombre.trim().length === 0) {
      setErrores(prev => ({ ...prev, nombre: 'El nombre es obligatorio' }))
    } else {
      setErrores(prev => {
        const { nombre, ...rest } = prev
        return rest
      })
    }
  }

  const validarEmail = () => {
    if (form.email.trim().length === 0) {
      setErrores(prev => ({ ...prev, email: 'El email es obligatorio' }))
    } else if (!form.email.includes('@')) {
      setErrores(prev => ({ ...prev, email: 'El email debe contener @' }))
    } else {
      setErrores(prev => {
        const { email, ...rest } = prev
        return rest
      })
    }
  }

  const validarTelefono = () => {
    if (form.telefono.trim().length === 0) {
      setErrores(prev => ({ ...prev, telefono: 'El teléfono es obligatorio' }))
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

  const handleChange = (campo: keyof OnboardingForm, valor: string) => {
    setForm({ ...form, [campo]: valor })
    if (errores[campo]) {
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
            style={{
              ...STYLES.input(isMobile),
              height: isMobile ? '52px' : undefined,
              fontSize: isMobile ? '16px' : undefined,
            }}
            placeholder={COPY.paso2.campos.nombre.placeholder}
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            onBlur={validarNombre}
          />
          {errores.nombre && <p style={STYLES.error()}>{errores.nombre}</p>}
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '20px' }}>
            Email
          </label>
          <input
            type="email"
            style={{
              ...STYLES.input(isMobile),
              height: isMobile ? '52px' : undefined,
              fontSize: isMobile ? '16px' : undefined,
            }}
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={validarEmail}
          />
          {errores.email && <p style={STYLES.error()}>{errores.email}</p>}
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '20px' }}>
            Teléfono
          </label>
          <input
            type="tel"
            style={{
              ...STYLES.input(isMobile),
              height: isMobile ? '52px' : undefined,
              fontSize: isMobile ? '16px' : undefined,
            }}
            placeholder="099 123 456"
            value={form.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            onBlur={validarTelefono}
          />
          {errores.telefono && <p style={STYLES.error()}>{errores.telefono}</p>}
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
            {COPY.paso2.campos.whatsapp.label}
          </label>
          <input
            type="text"
            style={{
              ...STYLES.input(isMobile),
              height: isMobile ? '52px' : undefined,
              fontSize: isMobile ? '16px' : undefined,
            }}
            placeholder={COPY.paso2.campos.whatsapp.placeholder}
            value={form.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
          />
          <p style={STYLES.ayuda()}>{COPY.paso2.campos.whatsapp.ayuda}</p>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#212529', marginBottom: '6px', marginTop: '20px' }}>
            {COPY.paso2.campos.rangoEdad.label}
          </label>
          <select
            value={form.rango_edad}
            onChange={(e) => handleChange('rango_edad', e.target.value)}
            style={{
              ...STYLES.input(isMobile),
              height: isMobile ? '52px' : undefined,
              fontSize: isMobile ? '16px' : undefined,
            }}
          >
            <option value="">Preferir no indicar</option>
            {['18-25', '26-35', '36-45', '46-55', '55+'].map(r => (
              <option key={r} value={r}>{r} años</option>
            ))}
          </select>
          <p style={STYLES.ayuda()}>{COPY.paso2.campos.rangoEdad.ayuda}</p>
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
