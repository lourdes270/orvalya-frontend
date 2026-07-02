import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Perfil } from '../contexts/AuthContextType'
import type { OnboardingForm, SeleccionCategorias, EstadoFiscal } from '../pages/onboarding/types'
import { esIntentoRegistroContratante, limpiarRegistroContratante } from './registroConstants'
import { normalizarTelefono, validarTelefono } from './validaciones'

const TRIGGER_WAIT_MS = 1500

export function normalizarWhatsapp(valor: string): string {
  return normalizarTelefono(valor)
}

export function esWhatsappValido(valor: string): boolean {
  return validarTelefono(valor, { requerido: true, etiqueta: 'WhatsApp' }) === null
}

export function buildPrestadorPerfilUpdate(
  form: OnboardingForm,
  selecciones: SeleccionCategorias,
  estadoFiscal: EstadoFiscal | null,
) {
  const zonaValue = typeof form.zona === 'string' ? form.zona.trim() : JSON.stringify(form.zona)
  return {
    tipo: 'prestador' as const,
    nombre: `${form.nombre.trim()} ${form.apellido.trim()}`.trim(),
    email: form.email.trim().toLowerCase(),
    telefono: normalizarTelefono(form.telefono),
    zona: zonaValue,
    whatsapp: normalizarWhatsapp(form.whatsapp),
    descripcion: JSON.stringify(selecciones),
    rut: estadoFiscal === 'activo' ? 'pendiente_verificacion' : estadoFiscal,
    rango_edad: form.rango_edad?.trim() || null,
  }
}

export async function esperarPerfilTrigger(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, TRIGGER_WAIT_MS))
}

export async function activarPerfilContratante(email: string): Promise<Perfil> {
  await esperarPerfilTrigger()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No autenticado')

  const { error: updateError } = await supabase
    .from('perfiles')
    .update({ tipo: 'contratante', email: email.trim() })
    .eq('id', user.id)

  if (updateError) throw updateError

  const { data, error: fetchError } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (fetchError || !data) throw fetchError ?? new Error('Perfil no encontrado')
  return data as Perfil
}

export async function activarPerfilContratanteSiCorresponde(
  user: User,
  perfil: Perfil | null,
): Promise<Perfil | null> {
  if (perfil?.tipo === 'contratante') return perfil
  if (!esIntentoRegistroContratante(user) || !user.email) return perfil
  if (perfil && perfil.tipo !== 'pendiente') return perfil

  const activado = await activarPerfilContratante(user.email)
  limpiarRegistroContratante()
  return activado
}

export async function refrescarPerfil(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Perfil
}
