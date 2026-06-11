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
  puedeAvanzar: () => boolean
}

// Selección de categorías y subrubros
export default function Step1Categorias({
  form,
  selecciones,
  setForm,
  toggleSubrubro,
  isMobile,
  onAvanzar,
  puedeAvanzar,
}: Step1CategoriasProps) {
  const [rubroAbierto, setRubroAbierto] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [textoLibrePorRubro, setTextoLibrePorRubro] = useState<Record<string, string>>({})

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

  return (
    <div style={STYLES.wrapper(isMobile)}>
      <div style={STYLES.card(isMobile)}>
        <h1 style={STYLES.titulo(isMobile)}>{COPY.paso1.titulo}</h1>
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
              textoLibre={textoLibrePorRubro[rubro.id] || ''}
              isMobile={isMobile}
            />
          ))}
        </div>
        {error && <p style={STYLES.error()}>{error}</p>}
        {!isMobile && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
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
