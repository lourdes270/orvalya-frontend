import { supabase } from '../../../lib/supabase'
import { buildFileMetadata } from './documentosTypes'

interface UploadParams {
  prestadorId: string
  tipoDocumento: string
  archivo: File
  fechaVencimiento: string
}

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  return error?.code === 'PGRST204' || (error?.message?.includes('column') ?? false)
}

async function insertLegacyDocument(
  prestadorId: string,
  tipoDocumento: string,
  path: string,
  fechaVencimiento: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('documentos').upsert({
    prestador_id: prestadorId,
    nombre: tipoDocumento,
    archivo_url: path,
    fecha_vencimiento: fechaVencimiento,
  }, { onConflict: 'prestador_id,nombre' })

  return { error: error?.message ?? null }
}

export async function uploadDocumentVersion({
  prestadorId,
  tipoDocumento,
  archivo,
  fechaVencimiento,
}: UploadParams): Promise<{ error: string | null; version?: number }> {
  const ext = archivo.name.split('.').pop()?.toLowerCase() ?? 'bin'

  const { data: prevRows } = await supabase
    .from('documentos')
    .select('version')
    .eq('prestador_id', prestadorId)
    .or(`tipo_documento.eq.${tipoDocumento},nombre.eq.${tipoDocumento}`)
    .order('version', { ascending: false })
    .limit(1)

  const nextVersion = (prevRows?.[0]?.version ?? 0) + 1
  const path = `${prestadorId}/${tipoDocumento}/v${nextVersion}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documentos')
    .upload(path, archivo, { upsert: false })

  if (uploadError) return { error: uploadError.message }

  const metadata = buildFileMetadata(archivo)
  const { error: insertError } = await supabase.from('documentos').insert({
    prestador_id: prestadorId,
    tipo_documento: tipoDocumento,
    nombre: tipoDocumento,
    archivo_url: path,
    fecha_vencimiento: fechaVencimiento,
    declaracion_jurada_aceptada: true,
    estado: 'vigente',
    version: nextVersion,
    metadata,
  })

  if (insertError && isMissingColumnError(insertError)) {
    const legacy = await insertLegacyDocument(prestadorId, tipoDocumento, path, fechaVencimiento)
    return legacy.error ? { error: legacy.error } : { error: null, version: 1 }
  }

  if (insertError) return { error: insertError.message }
  return { error: null, version: nextVersion }
}

export async function fetchVigenteDocuments(prestadorId: string) {
  const versioned = await supabase
    .from('documentos')
    .select('tipo_documento, nombre, fecha_vencimiento, version, estado, fecha_carga, created_at')
    .eq('prestador_id', prestadorId)
    .eq('estado', 'vigente')

  if (!versioned.error) return versioned

  return supabase
    .from('documentos')
    .select('tipo_documento, nombre, fecha_vencimiento, version, estado, fecha_carga, created_at')
    .eq('prestador_id', prestadorId)
    .in('estado', ['pendiente', 'aprobado', 'vigente'])
}

export async function fetchDocumentHistory(prestadorId: string, tipoDocumento: string) {
  const { data, error } = await supabase
    .from('documentos')
    .select('version, estado, fecha_carga, fecha_vencimiento, created_at')
    .eq('prestador_id', prestadorId)
    .or(`tipo_documento.eq.${tipoDocumento},nombre.eq.${tipoDocumento}`)
    .order('version', { ascending: false })

  if (!error) return { data, error }

  return supabase
    .from('documentos')
    .select('version, estado, fecha_carga, fecha_vencimiento, created_at')
    .eq('prestador_id', prestadorId)
    .eq('nombre', tipoDocumento)
    .order('created_at', { ascending: false })
}
