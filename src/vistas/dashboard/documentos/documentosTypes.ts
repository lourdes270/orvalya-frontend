export type DocEstado = {
  archivo: File | null
  fecha_vencimiento: string
  subiendo: boolean
  subido: boolean
  error: string
  declaracionAceptada: boolean
  versionActual: number | null
  /** Fecha de vencimiento ya guardada en BD (para avisos). */
  fechaVencimientoGuardada: string | null
}

export type DocumentoRow = {
  tipo_documento: string
  nombre?: string
  fecha_vencimiento: string | null
  version: number
  estado: string
  fecha_carga: string
}

export function emptyDocEstado(): DocEstado {
  return {
    archivo: null,
    fecha_vencimiento: '',
    subiendo: false,
    subido: false,
    error: '',
    declaracionAceptada: false,
    versionActual: null,
    fechaVencimientoGuardada: null,
  }
}

export function buildFileMetadata(file: File) {
  return {
    size: file.size,
    mime: file.type || 'application/octet-stream',
    filename: file.name,
    uploaded_at: new Date().toISOString(),
  }
}
