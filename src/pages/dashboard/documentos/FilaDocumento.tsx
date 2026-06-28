import { useRef, useState } from 'react'
import { DECLARACION_JURADA } from './documentosConfig'
import type { DocEstado } from './documentosTypes'
import DocumentHistory from './DocumentHistory'

interface FilaDocumentoProps {
  docKey: string
  prestadorId: string
  nombre: string
  estado: DocEstado
  onChange: (c: Partial<DocEstado>) => void
  onSubir: () => void
}

export default function FilaDocumento({
  docKey, prestadorId, nombre, estado, onChange, onSubir,
}: FilaDocumentoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [verHistorial, setVerHistorial] = useState(false)
  const canUpload = estado.archivo && estado.fecha_vencimiento && estado.declaracionAceptada && !estado.subiendo

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #F1F3F5' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{estado.subido ? '✅' : '⬜'}</span>
          <div>
            <span style={{ fontWeight: 500, color: '#1F3864', fontSize: '14px' }}>{nombre}</span>
            {estado.versionActual != null && (
              <span style={{ display: 'block', fontSize: '11px', color: '#8C96A3' }}>v{estado.versionActual} vigente</span>
            )}
          </div>
        </div>
        <button type="button" onClick={() => setVerHistorial(v => !v)}
          style={{ background: 'none', border: 'none', color: '#1F3864', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
          {verHistorial ? 'Ocultar historial' : 'Ver historial'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
        <input type="date" value={estado.fecha_vencimiento}
          title="Fecha de vencimiento del certificado"
          onChange={e => onChange({ fecha_vencimiento: e.target.value })}
          style={{ padding: '6px 10px', border: '1px solid #DEE2E6', borderRadius: '6px', fontSize: '13px' }} />
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
          onChange={e => onChange({ archivo: e.target.files?.[0] ?? null, declaracionAceptada: false })} />
        <button type="button" onClick={() => inputRef.current?.click()}
          style={{ padding: '6px 12px', background: '#F8F9FA', border: '1px solid #DEE2E6', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
          {estado.archivo ? estado.archivo.name.slice(0, 24) : 'Seleccionar archivo'}
        </button>
      </div>

      <label style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '13px', color: '#495057', cursor: 'pointer' }}>
        <input type="checkbox" checked={estado.declaracionAceptada}
          onChange={e => onChange({ declaracionAceptada: e.target.checked })}
          style={{ marginTop: '2px' }} />
        <span>{DECLARACION_JURADA}</span>
      </label>

      <button type="button" onClick={onSubir} disabled={!canUpload}
        style={{
          marginTop: '10px', padding: '8px 16px',
          background: estado.subido ? '#40C057' : '#1F3864', color: '#fff',
          border: 'none', borderRadius: '6px', fontSize: '13px',
          cursor: canUpload ? 'pointer' : 'not-allowed', opacity: canUpload ? 1 : 0.5,
        }}>
        {estado.subiendo ? 'Subiendo...' : estado.subido ? 'Subir nueva versión' : 'Subir'}
      </button>

      {estado.error && <p style={{ color: '#FA5252', fontSize: '12px', margin: '6px 0 0' }}>{estado.error}</p>}
      <DocumentHistory prestadorId={prestadorId} tipoDocumento={docKey} open={verHistorial} />
    </div>
  )
}
