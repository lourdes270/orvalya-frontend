import type { CSSProperties } from 'react'

export const NAVY = '#0F2D52'
export const TEAL = '#00B4A6'
export const BORDER = '#D8E3ED'
export const MUTED = '#4A6078'

export const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#F8F9FA',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

export const cardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '16px',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: NAVY,
  marginBottom: '6px',
}

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: `1.5px solid ${BORDER}`,
  fontSize: '15px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

export const btnPrimary: CSSProperties = {
  minHeight: '48px',
  padding: '12px 20px',
  background: TEAL,
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export const btnOutline: CSSProperties = {
  minHeight: '44px',
  padding: '10px 16px',
  background: '#fff',
  color: NAVY,
  border: `1.5px solid ${BORDER}`,
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
