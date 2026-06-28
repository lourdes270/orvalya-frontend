import { supabase } from '../../../lib/supabase'
import {
  FAKE_REGISTRATION_SUCCESS_MSG,
  runRegistrationGuard,
} from '../../../lib/botProtection/runRegistrationGuard'
import type { RegistrationBotPayload } from '../../../lib/botProtection/types'
import { buildPrestadorPerfilUpdate, esWhatsappValido } from '../../../lib/registroHelpers'
import { esUsuarioDuplicadoSinError, lanzarErrorEmailDuplicado, mensajeErrorAuth, MENSAJE_CONFIRMACION_EMAIL, validarEmail, validarTelefono, urlRedirectoAuth } from '../../../lib/validaciones'
import type { OnboardingForm, SeleccionCategorias, EstadoFiscal, PasoOnboarding } from '../types'

const DRAFT_KEY = 'orvalya_onboarding_draft'

interface OnboardingDraft {
  paso: PasoOnboarding
  form: OnboardingForm
  selecciones: SeleccionCategorias
  estadoFiscal: EstadoFiscal | null
}

function cargarBorradorOnboarding(): OnboardingDraft | null {
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (!saved) return null
    return JSON.parse(saved) as OnboardingDraft
  } catch {
    return null
  }
}

export async function intentarCompletarOnboardingPendiente(
  userId: string,
  setPerfil: (p: any) => void,
  navigate: (to: string) => void,
): Promise<boolean> {
  const draft = cargarBorradorOnboarding()
  if (!draft || !puedeAvanzar(3, draft.form, draft.selecciones, draft.estadoFiscal)) {
    return false
  }

  const payload = buildPrestadorPerfilUpdate(draft.form, draft.selecciones, draft.estadoFiscal)
  const { error: updateError } = await supabase
    .from('perfiles')
    .update(payload)
    .eq('id', userId)
  if (updateError) return false

  const { data: perfilResult } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (perfilResult) setPerfil(perfilResult)
  localStorage.removeItem(DRAFT_KEY)
  navigate('/aceptar-terminos')
  return true
}

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

    const emailNorm = email.trim().toLowerCase()
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: emailNorm,
      password,
      options: { emailRedirectTo: urlRedirectoAuth() },
    })
    if (signUpError) throw signUpError
    if (esUsuarioDuplicadoSinError(signUpData.user)) lanzarErrorEmailDuplicado()
    const user = signUpData.user
    if (!user) throw new Error('No se pudo crear el usuario')

    if (!signUpData.session) {
      setFakeSuccess?.(MENSAJE_CONFIRMACION_EMAIL)
      return
    }

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
