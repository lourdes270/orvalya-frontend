import { supabase } from './supabase'

export type AvisoDocumento = {
  id: string
  tipo_documento: string
  umbral_dias: number
  titulo: string
  cuerpo: string
  enviado_en: string
  leido_at: string | null
}

export async function fetchAvisosDocumentosInApp(prestadorId: string): Promise<AvisoDocumento[]> {
  const { data, error } = await supabase
    .from('avisos_documentos')
    .select('id, tipo_documento, umbral_dias, titulo, cuerpo, enviado_en, leido_at')
    .eq('prestador_id', prestadorId)
    .eq('canal', 'in_app')
    .order('enviado_en', { ascending: false })
    .limit(10)

  if (error) {
    // Tabla aún no migrada: no romper el dashboard
    if (error.code === 'PGRST205' || error.message?.includes('avisos_documentos')) return []
    console.error('fetchAvisosDocumentosInApp:', error.message)
    return []
  }
  return (data ?? []) as AvisoDocumento[]
}

export async function marcarAvisoLeido(avisoId: string): Promise<void> {
  const { error } = await supabase
    .from('avisos_documentos')
    .update({ leido_at: new Date().toISOString() })
    .eq('id', avisoId)
  if (error) console.error('marcarAvisoLeido:', error.message)
}
