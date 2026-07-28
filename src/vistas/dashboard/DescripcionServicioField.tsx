import { formatDescripcionServicio, isDescripcionJson } from '../../lib/formatDescripcionServicio'

interface DescripcionServicioFieldProps {
  raw: string
}

export function DescripcionServicioField({ raw }: DescripcionServicioFieldProps) {
  const isJson = isDescripcionJson(raw)
  const display = isJson ? formatDescripcionServicio(raw) : raw

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', color: '#495057', marginBottom: '6px', fontWeight: 500 }}>
        Descripción del servicio
      </label>
      {isJson ? (
        <div style={{
          padding: '12px',
          background: '#F8F9FA',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#212529',
          lineHeight: 1.5,
          border: '1px solid #E9ECEF',
        }}>
          {display || 'Sin servicios seleccionados'}
        </div>
      ) : (
        <textarea
          value={display}
          readOnly={false}
          rows={3}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #DEE2E6', borderRadius: '8px', fontSize: '14px', color: '#212529', resize: 'vertical', boxSizing: 'border-box' }}
        />
      )}
      {isJson && (
        <p style={{ fontSize: '12px', color: '#8C96A3', margin: '6px 0 0' }}>
          Servicios elegidos en el registro. Para cambiarlos, contactá soporte.
        </p>
      )}
    </div>
  )
}
