import { useEffect, useState } from 'react'
import { fetchDocumentHistory } from './uploadDocument'

interface HistoryRow {
  version: number
  estado: string
  fecha_carga?: string
  created_at?: string
  fecha_vencimiento: string | null
}

interface DocumentHistoryProps {
  prestadorId: string
  tipoDocumento: string
  open: boolean
}

export default function DocumentHistory({ prestadorId, tipoDocumento, open }: DocumentHistoryProps) {
  const [rows, setRows] = useState<HistoryRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchDocumentHistory(prestadorId, tipoDocumento)
      .then(({ data }) => setRows(data ?? []))
      .finally(() => setLoading(false))
  }, [open, prestadorId, tipoDocumento])

  if (!open) return null

  return (
    <div style={{ marginTop: '10px', padding: '12px', background: '#F8F9FA', borderRadius: '8px' }}>
      <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#1F3864' }}>Historial de versiones</p>
      {loading && <p style={{ margin: 0, fontSize: '12px', color: '#8C96A3' }}>Cargando...</p>}
      {!loading && rows.length === 0 && (
        <p style={{ margin: 0, fontSize: '12px', color: '#8C96A3' }}>Sin versiones anteriores.</p>
      )}
      {!loading && rows.map(r => (
        <div key={r.version} style={{
          display: 'flex', justifyContent: 'space-between', gap: '8px',
          fontSize: '12px', color: '#495057', padding: '4px 0',
          borderBottom: '1px solid #E9ECEF',
        }}>
          <span>v{r.version} · {r.estado}</span>
          <span>{new Date(r.fecha_carga ?? r.created_at ?? '').toLocaleDateString('es-UY')}</span>
        </div>
      ))}
    </div>
  )
}
