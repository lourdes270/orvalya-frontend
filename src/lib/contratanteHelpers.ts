import { supabase } from './supabase'
import type {
  Contratante,
  ContratantePerfilForm,
  EstadoLlamado,
  Llamado,
  LlamadoForm,
} from '../types/contratante'
import { sanitizeText } from './sanitize'

export async function fetchContratante(userId: string): Promise<Contratante | null> {
  const { data, error } = await supabase
    .from('contratantes')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as Contratante | null
}

export async function crearContratante(
  userId: string,
  form: ContratantePerfilForm,
): Promise<Contratante> {
  const payload = {
    id: userId,
    nombre_empresa: sanitizeText(form.nombre_empresa),
    rut: form.rut.trim(),
    tipo_contratante: form.tipo_contratante,
    rubro_principal: form.rubro_principal,
    zona: form.zona,
    email: form.email.trim().toLowerCase(),
    telefono: form.telefono.trim() || null,
  }

  const { data, error } = await supabase
    .from('contratantes')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error
  return data as Contratante
}

export async function fetchMisLlamados(contratanteId: string): Promise<Llamado[]> {
  const { data, error } = await supabase
    .from('llamados')
    .select('*')
    .eq('contratante_id', contratanteId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Llamado[]
}

export async function crearLlamado(
  contratanteId: string,
  form: LlamadoForm,
): Promise<Llamado> {
  const payload = {
    contratante_id: contratanteId,
    titulo: sanitizeText(form.titulo),
    descripcion: sanitizeText(form.descripcion),
    rubro: form.rubro,
    zona: form.zona,
    // El trigger guard_llamado_moderacion_fields fuerza esto igual: se publica
    // directo, sin espera. Ver migración 024.
    estado: 'activo' as const,
    expires_at: form.expires_at.trim() ? new Date(form.expires_at).toISOString() : null,
  }

  const { data, error } = await supabase
    .from('llamados')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error

  notificarLlamadoNuevo(data.id).catch(err =>
    console.error('No se pudo avisar al admin del llamado nuevo:', err),
  )

  return data as Llamado
}

/**
 * Aviso "por las dudas" al admin de que se publicó un llamado, para que lo
 * revise después (moderación posterior, no bloquea la publicación). Si falla
 * el envío del mail no rompe el flujo de publicar: el llamado ya quedó activo.
 */
async function notificarLlamadoNuevo(llamadoId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('notificar-llamado', {
    body: { llamado_id: llamadoId },
  })
  if (error) throw error
}

export function llamadoEsEditable(estado: EstadoLlamado): boolean {
  return estado !== 'cerrado'
}

export function llamadoToForm(llamado: Llamado): LlamadoForm {
  return {
    titulo: llamado.titulo,
    descripcion: llamado.descripcion,
    rubro: llamado.rubro,
    zona: llamado.zona,
    expires_at: llamado.expires_at ? llamado.expires_at.slice(0, 10) : '',
  }
}

export async function actualizarLlamado(
  llamadoId: string,
  form: LlamadoForm,
): Promise<Llamado> {
  const payload = {
    titulo: sanitizeText(form.titulo),
    descripcion: sanitizeText(form.descripcion),
    rubro: form.rubro,
    zona: form.zona,
    expires_at: form.expires_at.trim() ? new Date(form.expires_at).toISOString() : null,
  }

  const { data, error } = await supabase
    .from('llamados')
    .update(payload)
    .eq('id', llamadoId)
    .select('*')
    .single()

  if (error) throw error
  return data as Llamado
}

/**
 * Llamados ya activos (publicados al instante) que el admin todavía no revisó.
 * "Sin revisar" = activo con moderado_at NULL. Ver migración 024: ya no existe
 * una cola de "pendiente_moderacion" para llamados nuevos, es revisión posterior.
 */
export async function fetchLlamadosSinRevisar(): Promise<Llamado[]> {
  const { data, error } = await supabase
    .from('llamados')
    .select('*')
    .eq('estado', 'activo')
    .is('moderado_at', null)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Llamado[]
}

export const ERROR_MOTIVO_RECHAZO_REQUERIDO = 'El motivo de rechazo es obligatorio.'

export async function moderarLlamado(
  llamadoId: string,
  estado: Extract<EstadoLlamado, 'activo' | 'rechazado'>,
  motivoRechazo?: string,
): Promise<Llamado> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No autenticado')

  const motivo = motivoRechazo?.trim() ?? ''
  if (estado === 'rechazado' && !motivo) {
    throw new Error(ERROR_MOTIVO_RECHAZO_REQUERIDO)
  }

  const payload = {
    estado,
    moderado_por: user.id,
    moderado_at: new Date().toISOString(),
    motivo_rechazo: estado === 'rechazado' ? motivo : null,
  }

  const { data, error } = await supabase
    .from('llamados')
    .update(payload)
    .eq('id', llamadoId)
    .select('*')
    .single()

  if (error) throw error
  return data as Llamado
}

export function labelEstadoLlamado(estado: EstadoLlamado): string {
  const labels: Record<EstadoLlamado, string> = {
    pendiente_moderacion: 'Pendiente de moderación',
    activo: 'Activo',
    rechazado: 'Rechazado',
    cerrado: 'Cerrado',
  }
  return labels[estado]
}
