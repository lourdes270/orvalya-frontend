import { ImageResponse } from 'next/og'

export const alt = 'Orvalya — Prestadores independientes verificados en Uruguay'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Imagen de preview para WhatsApp, Facebook y X.
 * Satori exige display:flex explícito en todo div con más de un hijo.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #0F2D52 0%, #14406F 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 44 }}>
          <div style={{ display: 'flex', width: 22, height: 22, borderRadius: 11, background: '#00B4A6' }} />
          <div style={{ display: 'flex', marginLeft: 18, fontSize: 36, fontWeight: 700, color: '#fff' }}>
            Orvalya
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
          Prestadores independientes
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 68,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.03em',
            marginTop: 6,
          }}
        >
          en Uruguay
        </div>

        <div style={{ display: 'flex', marginTop: 34, fontSize: 30, color: '#9FC4E4' }}>
          Unipersonales · Monotributistas · 19 departamentos
        </div>
      </div>
    ),
    size,
  )
}
