import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'

const opciones = [
  {
    tipo: 'prestador',
    titulo: 'Soy prestador de servicios',
    descripcion: 'Ofrezco servicios como empresa o monotributista con RUT activo.',
    icono: '🏢',
  },
  {
    tipo: 'contratante',
    titulo: 'Soy empresa contratante',
    descripcion: 'Contrato servicios de terceros y necesito gestionar el cumplimiento.',
    icono: '📋',
  },
]

export default function OnboardingPage() {
  const { perfil, setPerfil } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const elegirPerfil = async (tipo: string) => {
    if (!perfil) return
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ tipo })
        .eq('id', perfil.id)
      if (error) throw error
      setPerfil({ ...perfil, tipo: tipo as 'prestador' | 'contratante' })
      navigate('/dashboard')
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '48px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>
          ¿Cómo vas a usar Orvalya?
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '15px' }}>
          Elegí tu perfil. Esto define qué funciones tenés disponibles.
        </p>

        {opciones.map((op) => (
          <button
            key={op.tipo}
            onClick={() => elegirPerfil(op.tipo)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '20px 24px',
              marginBottom: '16px',
              border: '1.5px solid #e5e7eb',
              borderRadius: '10px',
              backgroundColor: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b5bdb')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
          >
            <span style={{ fontSize: '28px' }}>{op.icono}</span>
            <div>
              <div style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>
                {op.titulo}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {op.descripcion}
              </div>
            </div>
          </button>
        ))}

        {error && <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
      </div>
    </div>
  )
}