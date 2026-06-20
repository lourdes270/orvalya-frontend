import type { CSSProperties } from 'react'

export const NAVY = '#0F2D52'
export const TEAL = '#00B4A6'

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #E0EAF2',
  borderRadius: '8px',
  fontSize: '16px',
  color: NAVY,
  boxSizing: 'border-box',
  outline: 'none',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: NAVY,
  marginBottom: '6px',
}

export const buttonStyle: CSSProperties = {
  width: '100%',
  padding: '14px 24px',
  backgroundColor: TEAL,
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(0, 180, 166, 0.35)',
}
