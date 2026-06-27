import { supabase } from '../../../lib/supabase'
import {
  FAKE_REGISTRATION_SUCCESS_MSG,
  runRegistrationGuard,
} from '../../../lib/botProtection/runRegistrationGuard'
import type { RegistrationBotPayload } from '../../../lib/botProtection/types'
import { buildPrestadorPerfilUpdate, esWhatsappValido } from '../../../lib/registroHelpers'
import { mensajeErrorAuth, validarEmail, validarTelefono } from '../../../lib/validaciones'
import type { OnboardingForm, SeleccionCategorias, EstadoFiscal, PasoOnboarding } from '../types'

const DRAFT_KEY = 'orvalya_onboarding_draft'

export async function fetchPerfilFromSupabase(setPerfil: (p: any) => void, setError: (e: string) => void, setIsLoading: (l: boolean) => void) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (perfilError) throw perfilError
      if (perfilData) {
        setPerfil(perfilData)
        setIsLoading(false)
      } else {
        setError('No encontramos tu perfil. Por favor contactá a soporte.')
        setIsLoading(false)
      }
    } else {
      setError('No estás autenticado. Por favor iniciá sesión.')
      setIsLoading(false)
    }
  } catch {
    setError('No pudimos cargar tu perfil. Por favor recargá la página.')
    setIsLoading(false)
  }
}

export async function guardarPerfil(
  perfil: any,
  form: OnboardingForm,
  selecciones: SeleccionCategorias,
  estadoFiscal: EstadoFiscal | null,
  setPerfil: (p: any) => void,
  navigate: (to: string) => void,
  setError: (e: string) => void
) {
  if (!perfil || !perfil.id) {
    setError('No pudimos identificar tu perfil. Por favor recargá la página.')
    return
  }
  try {
    const payload = buildPrestadorPerfilUpdate(form, selecciones, estadoFiscal)
    const { error: updateError } = await supabase
      .from('perfiles')
      .update(payload)
      .eq('id', perfil.id)
    if (updateError) throw updateError
    setPerfil({ ...perfil, ...payload })
    localStorage.removeItem(DRAFT_KEY)
    navigate('/dashboard')
  } catch {
    setError('No pudimos guardar tu perfil. Revisá tu conexión e intentá de nuevo.')
  }
}

export function toggleSubrubro(rubroId: string, subrubroId: string, setSelecciones: (s: (prev: SeleccionCategorias) => SeleccionCategorias) => void) {
  setSelecciones(prev => {
    const current = prev[rubroId] || []
    const exists = current.includes(subrubroId)
    const updated = exists ? current.filter(id => id !== subrubroId) : [...current, subrubroId]
    return { ...prev, [rubroId]: updated }
  })
}

export function puedeAvanzar(paso: PasoOnboarding, form: OnboardingForm, selecciones: SeleccionCategorias, estadoFiscal: EstadoFiscal | null): boolean {
  switch (paso) {
    case 1:
      return Object.values(selecciones).some(arr => arr.length > 0) || form.otroTexto.trim().length > 0
    case 2:
      if (form.nombre.trim().length === 0 || form.apellido.trim().length === 0) return false
      if (validarEmail(form.email)) return false
      if (validarTelefono(form.telefono, { requerido: true })) return false
      if (!esWhatsappValido(form.whatsapp)) return false
      if (typeof form.zona === 'string') {
        return form.zona.trim().length > 0
      }
      return form.zona.todoUruguay || form.zona.departamentos.length > 0
    case 3:
      return estadoFiscal !== null
    default:
      return true
  }
}

export async function registrarUsuario(
  email: string,
  password: string,
  bot: RegistrationBotPayload,
  form: OnboardingForm,
  selecciones: SeleccionCategorias,
  estadoFiscal: EstadoFiscal | null,
  setPerfil: (p: any) => void,
  navigate: (to: string) => void,
  setError: (e: string) => void,
  setFakeSuccess?: (msg: string) => void,
) {
  try {
    const guard = await runRegistrationGuard(bot, 'onboarding-step4')
    if (!guard.ok) {
      if (guard.kind === 'honeypot') {
        setFakeSuccess?.(FAKE_REGISTRATION_SUCCESS_MSG)
        return
      }
      setError(guard.message)
      return
    }

    const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) throw signUpError
    if (!user) throw new Error('No se pudo crear el usuario')

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError

    await new Promise(resolve => setTimeout(resolve, 1500))

    const payload = buildPrestadorPerfilUpdate(form, selecciones, estadoFiscal)
    const { error: updateError } = await supabase
      .from('perfiles')
      .update(payload)
      .eq('id', user.id)

    if (updateError) throw updateError

    const { data: perfilResult } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setPerfil(perfilResult)
    localStorage.removeItem(DRAFT_KEY)
    navigate('/aceptar-terminos')
  } catch (err: unknown) {
    setError(mensajeErrorAuth(err, 'No pudimos crear tu cuenta. Por favor intentá de nuevo.'))
  }
}
