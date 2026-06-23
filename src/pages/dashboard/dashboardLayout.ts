export function statsGridStyle(isMobile: boolean): React.CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  }
}
