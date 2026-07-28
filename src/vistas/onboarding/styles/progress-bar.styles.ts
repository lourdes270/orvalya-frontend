export const PROGRESS_BAR_STYLES = {
  mobile: (): React.CSSProperties => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: '#DEE2E6',
    zIndex: 100,
  }),
  fill: (width: string): React.CSSProperties => ({
    height: '100%',
    width,
    backgroundColor: '#1F3864',
    transition: 'width 0.3s ease',
  }),
  labels: (): React.CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '8px',
    fontSize: '11px',
    color: '#9ca3af',
  }),
  labelActive: (): React.CSSProperties => ({
    color: '#1F3864',
    fontWeight: 600,
  }),
}
