import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { esAdminPlataforma } from '../../lib/adminHelpers'
import {
  fetchLlamadosPendientes,
  labelEstadoLlamado,
  moderarLlamado,
} from '../../lib/contratanteHelpers'
import type { Llamado } from '../../types/contratante'
import { RUBROS } from '../onboarding/data/rubros'
import { btnOutline, btnPrimary, cardStyle, MUTED, NAVY, pageStyle } from '../contratante/contratanteStyles'

const rubroLabel = (id: string) => RUBROS.find(r => r.id === id)?.label ?? id

export default function AdminModeracionPage() {
  const { user, perfil, signOut } = useAuth()
  const navigate = useNavigate()
  const [llamados, setLlamados] = useState<Llamado[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)
  const [motivos, setMotivos] = useState<Record<string, string>>({})

  const esAdmin = esAdminPlataforma(user?.email, perfil)

  useEffect(() => {
    if (!esAdmin) return
    fetchLlamadosPendientes()
      .then(setLlamados)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [esAdmin])

  if (!esAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const handleModerar = async (id: string, estado: 'activo' | 'rechazado') => {
    setProcesando(id)
    try {
      await moderarLlamado(id, estado, motivos[id])
      setLlamados(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
      alert('No se pudo moderar el llamado.')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', color: NAVY }}>Moderación de llamados</h1>
            <p style={{ margin: 0, color: MUTED, fontSize: '14px' }}>Cola de llamados pendientes de aprobación</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/dashboard" style={{ ...btnOutline, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Dashboard
            </Link>
            <button type="button" style={btnOutline} onClick={() => signOut().then(() => navigate('/'))}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: MUTED }}>Cargando cola...</p>
        ) : llamados.length === 0 ? (
          <div style={cardStyle}>
            <p style={{ margin: 0, color: MUTED, textAlign: 'center' }}>No hay llamados pendientes de moderación.</p>
          </div>
        ) : (
          llamados.map(l => (
            <article key={l.id} style={cardStyle}>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: NAVY }}>{l.titulo}</h2>
              <p style={{ margin: '0 0 12px', color: MUTED, lineHeight: 1.55 }}>{l.descripcion}</p>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#ADB5BD' }}>
                {rubroLabel(l.rubro)} · {l.zona} · {labelEstadoLlamado(l.estado)} · {new Date(l.created_at).toLocaleString('es-UY')}
              </p>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: NAVY, marginBottom: '6px' }}>
                  Motivo de rechazo (si aplica)
                </label>
                <input
                  value={motivos[l.id] ?? ''}
                  onChange={e => setMotivos(prev => ({ ...prev, [l.id]: e.target.value }))}
                  placeholder="Solo si vas a rechazar"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #DEE2E6', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={btnPrimary}
                  disabled={procesando === l.id}
                  onClick={() => handleModerar(l.id, 'activo')}
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  style={{ ...btnOutline, borderColor: '#dc3545', color: '#dc3545' }}
                  disabled={procesando === l.id}
                  onClick={() => handleModerar(l.id, 'rechazado')}
                >
                  Rechazar
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
