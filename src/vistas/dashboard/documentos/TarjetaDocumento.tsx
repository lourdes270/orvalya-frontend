import { useRef, useState, type CSSProperties } from 'react'
import { validateUploadFile } from '../../../lib/fileValidation'
import {
  colorEstadoTemporal,
  diasHastaVencimiento,
  estadoTemporalDocumento,
  formatFechaUy,
  labelEstadoTemporal,
} from '../../../lib/documentoVencimiento'
import { DECLARACION_JURADA, DISCLAIMER_DOCUMENTO } from './documentosConfig'
import type { DocEstado } from './documentosTypes'
import DocumentHistory from './DocumentHistory'

interface TarjetaDocumentoProps {
  docKey: string
  prestadorId: string
  nombre: string
  ayuda: string
  estado: DocEstado
  onChange: (c: Partial<DocEstado>) => void
  onSubir: () => void
}

export default function TarjetaDocumento({
  docKey, prestadorId, nombre, ayuda, estado, onChange, onSubir,
}: TarjetaDocumentoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [verHistorial, setVerHistorial] = useState(false)
  const [expandido, setExpandido] = useState(!estado.subido)

  const fechaRef = estado.fechaVencimientoGuardada ?? estado.fecha_vencimiento
  const temporal = estadoTemporalDocumento({
    subido: estado.subido,
    fechaVencimiento: fechaRef,
  })
  const dias = diasHastaVencimiento(fechaRef)
  const colors = colorEstadoTemporal(temporal)
  const canUpload = Boolean(estado.archivo && estado.fecha_vencimiento && estado.declaracionAceptada && !estado.subiendo)

  return (
    <article
      style={{
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        borderLeft: `4px solid ${colors.accent}`,
        background: '#fff',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F2D52' }}>{nombre}</h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '6px',
                background: colors.bg,
                color: colors.color,
              }}
            >
              {labelEstadoTemporal(temporal, dias)}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#667085', lineHeight: 1.45 }}>{ayuda}</p>
          {estado.subido && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#98A2B3' }}>
              Vence {formatFechaUy(fechaRef)}
              {estado.versionActual != null ? ` · v${estado.versionActual}` : ''}
            </p>
          )}
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ADB5BD', lineHeight: 1.4 }}>
            {DISCLAIMER_DOCUMENTO}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {estado.subido && (
            <button
              type="button"
              onClick={() => setVerHistorial(v => !v)}
              style={btnGhost}
            >
              {verHistorial ? 'Ocultar historial' : 'Historial'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpandido(v => !v)}
            style={btnGhost}
          >
            {expandido ? 'Cerrar' : estado.subido ? 'Actualizar' : 'Cargar'}
          </button>
        </div>
      </div>

      {expandido && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #F2F4F7' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 140px' }}>
              <span style={labelMini}>Fecha de vencimiento</span>
              <input
                type="date"
                value={estado.fecha_vencimiento}
                title="Fecha de vencimiento del certificado"
                onChange={e => onChange({ fecha_vencimiento: e.target.value })}
                style={inputMini}
              />
            </label>
            <div style={{ flex: '1 1 160px' }}>
              <span style={labelMini}>Archivo (PDF o imagen)</span>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={async e => {
                  const file = e.target.files?.[0] ?? null
                  if (!file) {
                    onChange({ archivo: null, declaracionAceptada: false, error: '' })
                    return
                  }
                  const validacion = await validateUploadFile(file)
                  if (!validacion.ok) {
                    onChange({ archivo: null, declaracionAceptada: false, error: validacion.message })
                    e.target.value = ''
                    return
                  }
                  onChange({ archivo: file, declaracionAceptada: false, error: '' })
                }}
              />
              <button type="button" onClick={() => inputRef.current?.click()} style={{ ...inputMini, cursor: 'pointer', textAlign: 'left' }}>
                {estado.archivo ? estado.archivo.name.slice(0, 28) : 'Elegir archivo'}
              </button>
            </div>
          </div>

          <label style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '13px', color: '#475467', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={estado.declaracionAceptada}
              onChange={e => onChange({ declaracionAceptada: e.target.checked })}
              style={{ marginTop: '2px' }}
            />
            <span>{DECLARACION_JURADA}</span>
          </label>

          <button
            type="button"
            onClick={onSubir}
            disabled={!canUpload}
            style={{
              marginTop: '12px',
              minHeight: '40px',
              padding: '8px 16px',
              background: canUpload ? '#0F2D52' : '#D0D5DD',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: canUpload ? 'pointer' : 'not-allowed',
            }}
          >
            {estado.subiendo ? 'Subiendo...' : estado.subido ? 'Guardar nueva versión' : 'Guardar documento'}
          </button>

          {estado.error && (
            <p style={{ color: '#D92D20', fontSize: '12px', margin: '8px 0 0' }}>{estado.error}</p>
          )}
        </div>
      )}

      <DocumentHistory prestadorId={prestadorId} tipoDocumento={docKey} open={verHistorial} />
    </article>
  )
}

const labelMini: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#344054',
  marginBottom: '4px',
}

const inputMini: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #D0D5DD',
  borderRadius: '8px',
  fontSize: '13px',
  boxSizing: 'border-box',
  background: '#fff',
  fontFamily: 'inherit',
}

const btnGhost: CSSProperties = {
  padding: '6px 10px',
  background: '#F9FAFB',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#0F2D52',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
