export type PasoOnboarding = 0 | 1 | 2 | 3 | 4
export type TipoPerfil = 'prestador' | 'contratante'
export type EstadoFiscal = 'activo' | 'tramite' | 'sin_rut'

export interface SubRubro {
  id: string
  label: string
}

export interface Rubro {
  id: string
  icono?: React.ReactNode
  label: string
  subrubros: SubRubro[]
  tieneTextoLibre?: boolean
}

export interface OnboardingForm {
  nombre: string
  zona: string
  whatsapp: string
  otroTexto: string
}

export interface SeleccionCategorias {
  [rubroId: string]: string[]
}
