import type { CSSProperties } from 'react'

export const NAVY = '#0F2D52'
export const TEAL = '#00B4A6'
export const TEXT_BODY = '#243B53'
export const TEXT_MUTED = '#4A6078'
export const SURFACE = '#F4F8FB'
export const BORDER = '#D8E3ED'

export const pageShellStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#fff',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: TEXT_BODY,
  display: 'flex',
  flexDirection: 'column',
}

export const touchButtonBase: CSSProperties = {
  minHeight: '48px',
  borderRadius: '10px',
  fontWeight: 600,
  cursor: 'pointer',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

export const sectionTitleStyle: CSSProperties = {
  margin: '0 0 16px',
  fontSize: 'clamp(22px, 4vw, 28px)',
  fontWeight: 700,
  color: NAVY,
  letterSpacing: '-0.02em',
  lineHeight: 1.25,
}

export const sectionBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: '16px',
  lineHeight: 1.7,
  color: TEXT_BODY,
}

export const benefitCardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: '12px',
  padding: '20px',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 2px 12px rgba(15, 45, 82, 0.04)',
}

export const iconBoxStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  background: SURFACE,
  marginBottom: '14px',
  flexShrink: 0,
}
