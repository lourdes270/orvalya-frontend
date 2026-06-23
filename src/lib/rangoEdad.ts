export const RANGOS_EDAD = ['18-25', '26-35', '36-45', '46-55', '55+'] as const

export type RangoEdad = (typeof RANGOS_EDAD)[number]

export const selectRangoEdadStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #DEE2E6',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#212529',
  background: '#fff',
  boxSizing: 'border-box',
}
