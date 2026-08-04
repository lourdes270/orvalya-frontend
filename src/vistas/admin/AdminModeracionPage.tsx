import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { esAdminPlataforma } from '../../lib/adminHelpers'
import { irAPaginaPublica } from '../../lib/navegacionPublica'
import {
  ERROR_MOTIVO_RECHAZO_REQUERIDO,
  fetchLlamadosSinRevisar,
  labelEstadoLlamado,
  moderarLlamado,
} from '../../lib/contratanteHelpers'
import type { Llamado } from '../../types/contratante'
import { getRubroLabel } from '../onboarding/data/rubros'
import { btnOutline, btnPrimary, cardStyle, MUTED, NAVY, pageStyle } from '../contratante/contratanteStyles'

const rubroLabel = (id: string) => getRubroLabel(id)

export default function AdminModeracionPage() {
  const { user, perfil, signOut } = useAuth()
  const [llamados, setLlamados] = useState<Llamado[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)
  const [motivos, setMotivos] = useState<Record<string, string>>({})
  const [erroresMotivo, setErroresMotivo] = useState<Record<string, string>>({})

  const esAdmin = esAdminPlataforma(user?.email, perfil)

  useEffect(() => {
    if (!esAdmin) return
    fetchLlamadosSinRevisar()
      .then(setLlamados)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [esAdmin])

  if (!esAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const handleModerar = async (id: string, estado: 'activo' | 'rechazado') => {
    if (estado === 'rechazado' && !motivos[id]?.trim()) {
      setErroresMotivo(prev => ({ ...prev, [id]: ERROR_MOTIVO_RECHAZO_REQUERIDO }))
      return
    }

    setErroresMotivo(prev => {
      const { [id]: _, ...rest } = prev
      return rest
    })
    setProcesando(id)
    try {
      await moderarLlamado(id, estado, motivos[id])
      setLlamados(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'No se pudo moderar el llamado.'
      if (msg === ERROR_MOTIVO_RECHAZO_REQUERIDO) {
        setErroresMotivo(prev => ({ ...prev, [id]: msg }))
      } else {
        alert(msg)
      }
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', color: NAVY }}>Llamados sin revisar</h1>
            <p style={{ margin: 0, color: MUTED, fontSize: '14px' }}>
              Se publican al instante. Esta es la revisión posterior: marcalos como revisados o rechazalos para bajarlos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/dashboard" style={{ ...btnOutline, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Dashboard
            </Link>
            <button type="button" style={btnOutline} onClick={() => signOut().then(() => irAPaginaPublica('/'))}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: MUTED }}>Cargando cola...</p>
        ) : llamados.length === 0 ? (
          <div style={cardStyle}>
            <p style={{ margin: 0, color: MUTED, textAlign: 'center' }}>No hay llamados nuevos por revisar.</p>
          </div>
        ) : (
          llamados.map(l => (
            <article key={l.id} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: NAVY }}>{l.titulo}</h2>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: '#155724', background: '#D4EDDA',
                  borderRadius: '999px', padding: '2px 8px', textTransform: 'uppercase',
                }}>
                  Ya publicado
                </span>
              </div>
              <p style={{ margin: '0 0 12px', color: MUTED, lineHeight: 1.55 }}>{l.descripcion}</p>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#ADB5BD' }}>
                {rubroLabel(l.rubro)} · {l.zona} · {labelEstadoLlamado(l.estado)} · {new Date(l.created_at).toLocaleString('es-UY')}
              </p>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                  Motivo de rechazo (obligatorio para rechazar)
                </label>
                <input
                  value={motivos[l.id] ?? ''}
                  onChange={e => {
                    const value = e.target.value
                    setMotivos(prev => ({ ...prev, [l.id]: value }))
                    if (value.trim()) {
                      setErroresMotivo(prev => {
                        const { [l.id]: _, ...rest } = prev
                        return rest
                      })
                    }
                  }}
                  placeholder="Ej: El título no describe claramente el servicio"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${erroresMotivo[l.id] ? '#dc3545' : '#DEE2E6'}`,
                    boxSizing: 'border-box',
                  }}
                />
                {erroresMotivo[l.id] && (
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#dc3545' }}>{erroresMotivo[l.id]}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={btnPrimary}
                  disabled={procesando === l.id}
                  onClick={() => handleModerar(l.id, 'activo')}
                >
                  Marcar revisado
                </button>
                <button
                  type="button"
                  style={{ ...btnOutline, borderColor: '#dc3545', color: '#dc3545' }}
                  disabled={procesando === l.id || !motivos[l.id]?.trim()}
                  onClick={() => handleModerar(l.id, 'rechazado')}
                >
                  Rechazar y bajar
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
