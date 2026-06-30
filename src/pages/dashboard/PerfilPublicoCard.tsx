import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Perfil } from '../../contexts/AuthContextType'
import { formatDescripcionServicio } from '../../lib/formatDescripcionServicio'
import { urlPerfilPublicoPrestador } from '../../lib/prestadorPublicoHelpers'
import { formatZonaDisplay } from './formatZona'

interface PerfilPublicoCardProps {
  perfil: Perfil
  serviciosTexto?: string
}

export default function PerfilPublicoCard({ perfil, serviciosTexto }: PerfilPublicoCardProps) {
  const [copiado, setCopiado] = useState(false)
  const servicios = serviciosTexto ?? formatDescripcionServicio(perfil.descripcion)
  const zona = formatZonaDisplay(perfil.zona)
  const linkPublico = urlPerfilPublicoPrestador(perfil.id)

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkPublico)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      window.prompt('Copiá este link:', linkPublico)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #F4F8FB 0%, #fff 100%)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      border: '1px solid #E0EAF2',
      textAlign: 'center',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#8C96A3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Así te ven quienes te contratan
      </p>
      <div style={{
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        margin: '0 auto 12px',
        overflow: 'hidden',
        background: '#E9ECEF',
        border: '3px solid #fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {perfil.avatar_url ? (
          <img src={perfil.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>👤</div>
        )}
      </div>
      <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#1F3864' }}>
        {perfil.nombre || 'Tu nombre'}
      </h3>
      {perfil.rango_edad && (
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#ADB5BD' }}>{perfil.rango_edad} años</p>
      )}
      {servicios && (
        <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#495057', lineHeight: 1.4 }}>{servicios}</p>
      )}
      {zona && <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#8C96A3' }}>{zona}</p>}

      <div style={{
        padding: '14px',
        borderRadius: '10px',
        background: '#fff',
        border: '1px solid #DEE2E6',
        textAlign: 'left',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#1F3864' }}>
          Tu perfil público
        </p>
        <p style={{ margin: '0 0 10px', fontSize: '12px', lineHeight: 1.45, color: '#8C96A3' }}>
          Compartí este link con empresas. No muestra teléfono ni email.
        </p>
        <p style={{
          margin: '0 0 12px',
          fontSize: '11px',
          wordBreak: 'break-all',
          color: '#495057',
          background: '#F8F9FA',
          padding: '8px 10px',
          borderRadius: '6px',
        }}>
          {linkPublico}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Link
            to={`/prestadores/${perfil.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '10px 14px',
              background: '#1F3864',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Ver perfil público
          </Link>
          <button
            type="button"
            onClick={copiarLink}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '10px 14px',
              background: '#fff',
              color: '#1F3864',
              border: '1.5px solid #DEE2E6',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copiado ? 'Link copiado ✓' : 'Copiar link'}
          </button>
        </div>
      </div>
    </div>
  )
}
