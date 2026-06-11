import { useState } from 'react'
import { COPY } from '../copy'
import { STYLES } from '../styles/onboarding.styles'
import type { OnboardingForm } from '../types'

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
    if (form.zona.trim().length === 0) {
      setErrores(prev => ({ ...prev, zona: COPY.paso2.campos.zona.error }))
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
            {COPY.paso2.campos.zona.label}
          </label>
          <input
            type="text"
            style={STYLES.input(isMobile)}
            placeholder={COPY.paso2.campos.zona.placeholder}
            value={form.zona}
            onChange={(e) => handleChange('zona', e.target.value)}
            onBlur={validarZona}
          />
          {errores.zona && <p style={STYLES.error()}>{errores.zona}</p>}
          <p style={STYLES.ayuda()}>{COPY.paso2.campos.zona.ayuda}</p>
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
