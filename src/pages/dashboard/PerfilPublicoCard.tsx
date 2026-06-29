import type { Perfil } from '../../contexts/AuthContextType'
import { formatDescripcionServicio } from '../../lib/formatDescripcionServicio'
import { formatZonaDisplay } from './formatZona'

interface PerfilPublicoCardProps {
  perfil: Perfil
  serviciosTexto?: string
}

export default function PerfilPublicoCard({ perfil, serviciosTexto }: PerfilPublicoCardProps) {
  const servicios = serviciosTexto ?? formatDescripcionServicio(perfil.descripcion)
  const zona = formatZonaDisplay(perfil.zona)

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
      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#8C96A3' }}>Imagen de empresa</p>
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
          <img src={perfil.avatar_url} alt="Imagen de empresa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      {zona && <p style={{ margin: 0, fontSize: '13px', color: '#8C96A3' }}>{zona}</p>}
    </div>
  )
}
