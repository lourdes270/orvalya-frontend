import type { Components } from 'react-markdown'

const NAVY = '#0F2D52'
const BODY = '#374151'
const MUTED = '#6b7280'

export const legalPageLayout = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f4f8fb',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as const,
  stickyHeader: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    padding: '12px 20px',
    backgroundColor: 'rgba(244, 248, 251, 0.95)',
    backdropFilter: 'blur(6px)',
    borderBottom: '1px solid #E0EAF2',
  } as const,
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: NAVY,
    fontWeight: 600,
    fontSize: '14px',
    textDecoration: 'none',
  } as const,
  article: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '24px 20px 48px',
  } as const,
  markdown: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px 28px',
    border: '1px solid #E0EAF2',
    fontSize: '16px',
    lineHeight: 1.75,
    color: BODY,
  } as const,
  versionFooter: {
    marginTop: '20px',
    fontSize: '13px',
    color: MUTED,
    textAlign: 'center' as const,
  } as const,
}

export const legalMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{ margin: '28px 0 12px', fontSize: '22px', fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ margin: '24px 0 10px', fontSize: '18px', fontWeight: 700, color: NAVY, lineHeight: 1.35 }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ margin: '20px 0 8px', fontSize: '16px', fontWeight: 700, color: NAVY, lineHeight: 1.4 }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ margin: '0 0 14px' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0 0 14px', paddingLeft: '22px' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0 0 14px', paddingLeft: '22px' }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '8px' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700, color: NAVY }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: 'italic', color: MUTED }}>{children}</em>
  ),
}
