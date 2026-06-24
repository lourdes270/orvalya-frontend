import { supabase } from './supabase'
import type { Perfil } from '../contexts/AuthContextType'
import type { OnboardingForm, SeleccionCategorias, EstadoFiscal } from '../pages/onboarding/types'

const TRIGGER_WAIT_MS = 1500

export function normalizarWhatsapp(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function esWhatsappValido(valor: string): boolean {
  return normalizarWhatsapp(valor).length >= 8
}

export function buildPrestadorPerfilUpdate(
  form: OnboardingForm,
  selecciones: SeleccionCategorias,
  estadoFiscal: EstadoFiscal | null,
) {
  const zonaValue = typeof form.zona === 'string' ? form.zona.trim() : JSON.stringify(form.zona)
  return {
    tipo: 'prestador' as const,
    nombre: form.nombre.trim(),
    email: form.email.trim(),
    telefono: form.telefono.trim(),
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

export async function refrescarPerfil(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Perfil
}
