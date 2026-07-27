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
  minHeight: '56px',
  borderRadius: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

export const sectionPadding: CSSProperties = {
  padding: '80px 20px',
}

export const sectionPaddingDesktop: CSSProperties = {
  padding: '100px 24px',
}

export const heroTitleStyle = (isMobile: boolean): CSSProperties => ({
  margin: '0 0 20px',
  fontSize: isMobile ? '2.8rem' : 'clamp(2.5rem, 4vw, 3.25rem)',
  fontWeight: 800,
  color: NAVY,
  lineHeight: 1.15,
  letterSpacing: '-0.03em',
})

export const sectionTitleStyle: CSSProperties = {
  margin: '0 0 20px',
  fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
  fontWeight: 800,
  color: NAVY,
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
}

export const sectionSubtitleStyle: CSSProperties = {
  margin: '0 0 32px',
  fontSize: '17px',
  fontWeight: 600,
  lineHeight: 1.6,
  color: TEXT_BODY,
  maxWidth: '36ch',
}

export const sectionBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: '16px',
  lineHeight: 1.6,
  color: TEXT_BODY,
}

export const bodyTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '16px',
  lineHeight: 1.6,
  color: TEXT_BODY,
}

export const badgePillStyle: CSSProperties = {
  display: 'inline-block',
  margin: '0 0 20px',
  padding: '10px 18px',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: TEAL,
  background: '#fff',
  border: `2px solid ${TEAL}`,
  borderRadius: '999px',
}

export const benefitCardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  padding: '28px 24px',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 4px 20px rgba(15, 45, 82, 0.06)',
  transition: 'box-shadow 0.25s ease, transform 0.25s ease',
}

export const iconBoxLargeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  background: SURFACE,
  marginBottom: '18px',
  flexShrink: 0,
}
