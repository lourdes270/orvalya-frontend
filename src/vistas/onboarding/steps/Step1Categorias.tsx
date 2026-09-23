import { useState } from 'react'
import { COPY } from '../copy'
import { STYLES } from '../styles/onboarding.styles'
import { RUBROS } from '../data/rubros'
import { RUBROS_DESTACADOS_IDS } from '../data/listasFaciles'
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

function ordenarRubros() {
  const destacados = RUBROS_DESTACADOS_IDS
    .map(id => RUBROS.find(r => r.id === id))
    .filter((r): r is (typeof RUBROS)[number] => Boolean(r))
  const resto = RUBROS.filter(
    r => !(RUBROS_DESTACADOS_IDS as readonly string[]).includes(r.id),
  )
  return { destacados, resto }
}

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
  const { destacados, resto } = ordenarRubros()

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

  const renderRubro = (rubro: (typeof RUBROS)[number], destacado: boolean) => (
    <div key={rubro.id} style={{ position: 'relative' }}>
      {destacado && (
        <span style={{
          position: 'absolute',
          top: 8,
          right: 12,
          zIndex: 1,
          padding: '2px 8px',
          borderRadius: 999,
          background: '#00B4A6',
          color: '#fff',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          Top
        </span>
      )}
      <RubroCard
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
    </div>
  )

  const gridStyle = {
    display: isMobile ? 'block' as const : 'grid' as const,
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: isMobile ? '0' : '12px',
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

        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#00B4A6' }}>
          {COPY.paso1.destacados}
        </p>
        <div style={{ ...gridStyle, marginBottom: 20 }}>
          {destacados.map(r => renderRubro(r, true))}
        </div>

        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#4A6078' }}>
          {COPY.paso1.otros}
        </p>
        <div style={{ ...gridStyle, marginBottom: isMobile ? '88px' : '20px' }}>
          {resto.map(r => renderRubro(r, false))}
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
