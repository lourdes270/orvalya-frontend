import { CheckCircle, ArrowsClockwise, Plant } from '@phosphor-icons/react'
import { COPY } from '../copy'
import { STYLES } from '../styles/onboarding.styles'
import OpcionFiscal from '../components/OpcionFiscal'
import type { EstadoFiscal } from '../types'

interface Step3FiscalizacionProps {
  estadoFiscal: EstadoFiscal | null
  setEstadoFiscal: (estado: EstadoFiscal) => void
  isMobile: boolean
  onVolver: () => void
  onFinalizar: () => void
  loading: boolean
}

// Selección de situación fiscal
export default function Step3Fiscalizacion({
  estadoFiscal,
  setEstadoFiscal,
  isMobile,
  onVolver,
  onFinalizar,
  loading,
}: Step3FiscalizacionProps) {
  const opciones = [
    {
      value: 'activo' as EstadoFiscal,
      icono: <CheckCircle weight="light" size={28} color="#40C057" />,
      titulo: 'Tengo RUT activo',
      descripcion: 'Estoy registrado en DGI y trabajo formalmente.',
    },
    {
      value: 'tramite' as EstadoFiscal,
      icono: <ArrowsClockwise weight="light" size={28} color="#FAB005" />,
      titulo: 'Estoy en trámite',
      descripcion: 'Me estoy formalizando. Ya casi.',
    },
    {
      value: 'sin_rut' as EstadoFiscal,
      icono: <Plant weight="light" size={28} color="#1F3864" />,
      titulo: 'Todavía no tengo RUT',
      descripcion: 'Trabajo de forma independiente.',
    },
  ]

  return (
    <div style={STYLES.wrapper(isMobile)}>
      <div style={{ position: 'relative', ...STYLES.card(isMobile) }}>
        {isMobile && (
          <button type="button" style={STYLES.botonVolver()} onClick={onVolver}>
            {COPY.botones.volver}
          </button>
        )}
        <h1 style={{ ...STYLES.titulo(isMobile), paddingTop: isMobile ? '48px' : '0' }}>
          {COPY.paso3.titulo}
        </h1>
        <p style={STYLES.subtitulo()}>{COPY.paso3.subtitulo}</p>
        <div style={{ marginBottom: isMobile ? '88px' : '20px' }}>
          {opciones.map((op) => (
            <OpcionFiscal
              key={op.value}
              icono={op.icono}
              titulo={op.titulo}
              descripcion={op.descripcion}
              seleccionado={estadoFiscal === op.value}
              onSelect={() => setEstadoFiscal(op.value)}
            />
          ))}
          <p style={STYLES.notaVerde()}>{COPY.paso3.nota}</p>
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
                ...(estadoFiscal ? {} : STYLES.botonDeshabilitado()),
              }}
              onClick={onFinalizar}
              disabled={!estadoFiscal || loading}
            >
              {loading ? 'Guardando...' : COPY.botones.comenzar}
            </button>
          </div>
        )}
        {isMobile && estadoFiscal && (
          <div style={STYLES.botonFixedBottom()}>
            <button
              type="button"
              style={STYLES.botonPrimario(isMobile)}
              onClick={onFinalizar}
              disabled={loading}
            >
              {loading ? 'Guardando...' : COPY.botones.comenzar}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
