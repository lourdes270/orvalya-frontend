export const DOCUMENTOS_CONFIG = [
  {
    key: 'certificado_dgi',
    nombre: 'Certificado DGI',
    ayuda: 'Comprobá que no tenés deudas fiscales. Pedilo en el sitio de DGI.',
  },
  {
    key: 'certificado_bps',
    nombre: 'Certificado BPS',
    ayuda: 'Acredita situación regular ante la seguridad social.',
  },
  {
    key: 'constancia_bse',
    nombre: 'Constancia BSE',
    ayuda: 'Seguro de accidentes laborales al día (Banco de Seguros).',
  },
] as const

export type TipoDocumento = typeof DOCUMENTOS_CONFIG[number]['key']

export const DECLARACION_JURADA =
  'Declaro que este documento es auténtico, está vigente y no ha sido editado ni alterado.'

export const DISCLAIMER_DOCUMENTO =
  'Documento declarado por el prestador. Orvalya no verifica su autenticidad.'
