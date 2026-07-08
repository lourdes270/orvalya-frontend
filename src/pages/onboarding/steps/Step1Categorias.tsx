import { useState } from 'react'
import { COPY } from '../copy'
import { STYLES } from '../styles/onboarding.styles'
import { RUBROS } from '../data/rubros'
import { RUBRO_ICONOS } from '../data/iconos'
import RubroCard from '../components/RubroCard'
import type { OnboardingForm, SeleccionCategorias } from '../types'

interface Step1CategoriasProps {
  form: OnboardingForm
  selecciones: SeleccionCategorias
  setForm: (form: OnboardingForm) => void
  toggleSubrubro: (rubroId: string, subrubroId: string) => void
  isMobile: boolean
  onAvanzar: () => void
  onVolver: () => void
  puedeAvanzar: () => boolean
}

function textoLibreInicial(form: OnboardingForm, selecciones: SeleccionCategorias): Record<string, string> {
  if (!form.otroTexto.trim()) return {}
  const rubroOtro = RUBROS.find(r => r.id === 'otro')
  if (rubroOtro && (selecciones.otro?.length ?? 0) > 0) {
    return { otro: form.otroTexto }
  }
  return { otro: form.otroTexto }
}

// Selección de categorías y subrubros
export default function Step1Categorias({
  form,
  selecciones,
  setForm,
  toggleSubrubro,
  isMobile,
  onAvanzar,
  onVolver,
  puedeAvanzar,
}: Step1CategoriasProps) {
  const [rubroAbierto, setRubroAbierto] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [textoLibrePorRubro, setTextoLibrePorRubro] = useState<Record<string, string>>(
    () => textoLibreInicial(form, selecciones),
  )

  const handleAvanzar = () => {
    if (!puedeAvanzar()) {
      setError(COPY.paso1.errorSinSeleccion)
      return
    }
    setError('')
    onAvanzar()
  }

  const handleToggleRubro = (rubroId: string) => {
    setRubroAbierto(prev => (prev === rubroId ? null : rubroId))
  }

  const handleTextoLibreChange = (rubroId: string, texto: string) => {
    setTextoLibrePorRubro(prev => ({ ...prev, [rubroId]: texto }))
    setForm({ ...form, otroTexto: texto })
  }

  const botonVolverSecundario = {
    ...STYLES.botonPrimario(isMobile),
    background: '#ffffff',
    color: '#1F3864',
    border: '1.5px solid #DEE2E6',
  }

  return (
    <div style={STYLES.wrapper(isMobile)}>
      <div style={{ position: 'relative', ...STYLES.card(isMobile) }}>
        {isMobile && (
          <button type="button" style={STYLES.botonVolver()} onClick={onVolver} aria-label={COPY.botones.volver}>
            {COPY.botones.volver}
          </button>
        )}
        <h1 style={{ ...STYLES.titulo(isMobile), paddingTop: isMobile ? '48px' : '0' }}>
          {COPY.paso1.titulo}
        </h1>
        <p style={STYLES.subtitulo()}>{COPY.paso1.subtitulo}</p>
        <div style={{
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: isMobile ? '0' : '12px',
          marginBottom: isMobile ? '88px' : '20px',
        }}>
          {RUBROS.map((rubro) => (
            <RubroCard
              key={rubro.id}
              rubro={rubro}
              icono={RUBRO_ICONOS[rubro.id]}
              subrubrosSeleccionados={selecciones[rubro.id] || []}
              estaAbierto={rubroAbierto === rubro.id}
              onToggleAbierto={() => handleToggleRubro(rubro.id)}
              onToggleSubrubro={(subrubroId) => toggleSubrubro(rubro.id, subrubroId)}
              onTextoLibreChange={(texto) => handleTextoLibreChange(rubro.id, texto)}
              textoLibre={textoLibrePorRubro[rubro.id] || (rubro.id === 'otro' ? form.otroTexto : '')}
              isMobile={isMobile}
            />
          ))}
        </div>
        {error && <p style={STYLES.error()}>{error}</p>}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" style={botonVolverSecundario} onClick={onVolver}>
              {COPY.botones.volver}
            </button>
            <button
              type="button"
              style={{
                ...STYLES.botonPrimario(isMobile),
                ...(puedeAvanzar() ? {} : STYLES.botonDeshabilitado()),
              }}
              onClick={handleAvanzar}
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
              onClick={handleAvanzar}
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
