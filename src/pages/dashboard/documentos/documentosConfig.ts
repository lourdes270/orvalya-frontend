export const DOCUMENTOS_CONFIG = [
  { key: 'certificado_dgi', nombre: 'Certificado DGI' },
  { key: 'certificado_bps', nombre: 'Certificado BPS' },
  { key: 'constancia_bse', nombre: 'Constancia BSE' },
] as const

export type TipoDocumento = typeof DOCUMENTOS_CONFIG[number]['key']

export const DECLARACION_JURADA =
  'Declaro que este documento es auténtico, está vigente y no ha sido editado ni alterado.'
