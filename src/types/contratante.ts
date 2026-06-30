export type TipoContratante = 'empresa' | 'persona_fisica'

export type EstadoLlamado =
  | 'pendiente_moderacion'
  | 'activo'
  | 'rechazado'
  | 'cerrado'

export type Contratante = {
  id: string
  nombre_empresa: string
  rut: string
  rut_verificado: boolean
  tipo_contratante: TipoContratante
  rubro_principal: string | null
  zona: string | null
  email: string
  email_verificado: boolean
  telefono: string | null
  created_at: string
  updated_at: string
}

export type Llamado = {
  id: string
  contratante_id: string
  titulo: string
  descripcion: string
  rubro: string
  zona: string
  estado: EstadoLlamado
  moderado_por: string | null
  moderado_at: string | null
  motivo_rechazo: string | null
  reportes_count: number
  created_at: string
  expires_at: string | null
}

export type ContratantePerfilForm = {
  nombre_empresa: string
  rut: string
  tipo_contratante: TipoContratante
  rubro_principal: string
  zona: string
  email: string
  telefono: string
}

export type LlamadoForm = {
  titulo: string
  descripcion: string
  rubro: string
  zona: string
  expires_at: string
}
