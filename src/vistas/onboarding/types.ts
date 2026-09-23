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

export interface ZonasSeleccion {
  todoUruguay: boolean
  departamentos: string[]
  zonasMontevideo: string[]
}

export interface OnboardingForm {
  nombre: string
  apellido: string
  email: string
  telefono: string
  /** Prefijo país del teléfono (solo dígitos, ej. 598). */
  telefono_pais: string
  zona: string | ZonasSeleccion
  /** Obligatorio: mínimo 8 dígitos numéricos */
  whatsapp: string
  /** Si true, WhatsApp = teléfono (menos fricción). */
  whatsapp_igual_telefono: boolean
  otroTexto: string
  rango_edad: string
  /** Nivel educativo breve (opcional) → se guarda en perfiles.cursos */
  formacion: string
}

export interface SeleccionCategorias {
  [rubroId: string]: string[]
}
