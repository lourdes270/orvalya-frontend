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

  // Initialize zonas if not already set
  const zonas = (typeof form.zona === 'string' ? null : form.zona) || {
    todoUruguay: false,
    departamentos: [],
    zonasMontevideo: [],
  }

  const validarNombre = () => {
    if (form.nombre.trim().length === 0) {
      setErrores(prev => ({ ...prev, nombre: COPY.paso2.campos.nombre.error }))
    } else {
      setErrores(prev => {
        const { nombre, ...rest } = prev
        return rest
      })
    }
  }

  const validarZona = () => {
    const z = typeof form.zona === 'string' ? null : form.zona
    if (!z || (z.departamentos.length === 0 && !z.todoUruguay)) {
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
    setForm({ ...form, zona: JSON.stringify(newZonas) })
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
    setForm({ ...form, zona: JSON.stringify(newZonas) })
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
    setForm({ ...form, zona: JSON.stringify(newZonas) })
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
            style={STYLES.input(isMobile)}
            placeholder={COPY.paso2.campos.nombre.placeholder}
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            onBlur={validarNombre}
          />
          {errores.nombre && <p style={STYLES.error()}>{errores.nombre}</p>}
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
              padding: '14px',
              border: zonas.todoUruguay ? 'none' : '1.5px solid #DEE2E6',
              borderRadius: '8px',
              backgroundColor: zonas.todoUruguay ? '#1F3864' : '#ffffff',
              color: zonas.todoUruguay ? '#ffffff' : '#1F3864',
              fontSize: '16px',
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: zonas.departamentos.includes('Montevideo') ? '20px' : '0' }}>
              {DEPARTAMENTOS.map((depto) => (
                <button
                  key={depto}
                  type="button"
                  onClick={() => toggleDepartamento(depto)}
                  onBlur={validarZona}
                  style={{
                    padding: '10px 14px',
                    border: zonas.departamentos.includes(depto) ? '1.5px solid #1F3864' : '1.5px solid #DEE2E6',
                    borderRadius: '20px',
                    backgroundColor: zonas.departamentos.includes(depto) ? '#EEF2FF' : '#ffffff',
                    color: zonas.departamentos.includes(depto) ? '#1F3864' : '#6b7280',
                    fontSize: '14px',
                    fontWeight: zonas.departamentos.includes(depto) ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {depto}
                </button>
              ))}
            </div>
          )}

          {/* Montevideo zones (shown only if Montevideo is selected) */}
          {zonas.departamentos.includes('Montevideo') && !zonas.todoUruguay && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {ZONAS_MONTEVIDEO.map((zona) => (
                <button
                  key={zona}
                  type="button"
                  onClick={() => toggleZonaMontevideo(zona)}
                  style={{
                    padding: '10px 14px',
                    border: zonas.zonasMontevideo.includes(zona) ? '1.5px solid #1F3864' : '1.5px solid #DEE2E6',
                    borderRadius: '20px',
                    backgroundColor: zonas.zonasMontevideo.includes(zona) ? '#EEF2FF' : '#ffffff',
                    color: zonas.zonasMontevideo.includes(zona) ? '#1F3864' : '#6b7280',
                    fontSize: '14px',
                    fontWeight: zonas.zonasMontevideo.includes(zona) ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {zona}
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
            style={STYLES.input(isMobile)}
            placeholder={COPY.paso2.campos.whatsapp.placeholder}
            value={form.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
          />
          <p style={STYLES.ayuda()}>{COPY.paso2.campos.whatsapp.ayuda}</p>
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
