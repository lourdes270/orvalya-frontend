import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/useAuth'
import { cropImageSquare } from '../../../lib/cropImageSquare'
import type {
  PasoOnboarding,
  OnboardingForm,
  SeleccionCategorias,
  EstadoFiscal,
} from '../types'
import type { RegistrationBotPayload } from '../../../lib/botProtection/types'
import { toggleSubrubro, puedeAvanzar, registrarUsuario } from './helpers'

const DRAFT_KEY = 'orvalya_onboarding_draft'

interface DraftData {
  paso: PasoOnboarding
  form: OnboardingForm
  selecciones: SeleccionCategorias
  estadoFiscal: EstadoFiscal | null
  avatarDataUrl: string | null
}

const defaultForm: OnboardingForm = {
  nombre: '',
  email: '',
  telefono: '',
  zona: '',
  whatsapp: '',
  otroTexto: '',
  rango_edad: '',
}

function loadDraft(): DraftData | null {
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (!saved) return null
    return JSON.parse(saved) as DraftData
  } catch {
    localStorage.removeItem(DRAFT_KEY)
    return null
  }
}

export function useOnboardingForm() {
  const { setPerfil } = useAuth()
  const navigate = useNavigate()
  const draft = loadDraft()
  const [paso, setPaso] = useState<PasoOnboarding>(draft?.paso ?? 0)
  const [form, setForm] = useState<OnboardingForm>({ ...defaultForm, ...draft?.form, rango_edad: draft?.form?.rango_edad ?? '' })
  const [selecciones, setSelecciones] = useState<SeleccionCategorias>(draft?.selecciones ?? {})
  const [estadoFiscal, setEstadoFiscal] = useState<EstadoFiscal | null>(draft?.estadoFiscal ?? null)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(draft?.avatarDataUrl ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fakeSuccess, setFakeSuccess] = useState('')

  useEffect(() => {
    const data: DraftData = { paso, form, selecciones, estadoFiscal, avatarDataUrl }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
  }, [paso, form, selecciones, estadoFiscal, avatarDataUrl])

  const guardarYFinalizar = () => navigate('/onboarding?paso=5')

  const handleAvatarFile = useCallback(async (file: File) => {
    const blob = await cropImageSquare(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarDataUrl(reader.result as string)
    reader.readAsDataURL(blob)
  }, [])

  const handleRegistro = async (email: string, password: string, bot: RegistrationBotPayload) => {
    setLoading(true)
    setError('')
    setFakeSuccess('')
    await registrarUsuario(
      form.email || email,
      password,
      bot,
      form,
      selecciones,
      estadoFiscal,
      avatarDataUrl,
      setPerfil,
      navigate,
      setError,
      setFakeSuccess,
    )
    setLoading(false)
  }

  return {
    paso,
    form,
    selecciones,
    estadoFiscal,
    avatarDataUrl,
    loading,
    error,
    fakeSuccess,
    setPaso,
    setForm,
    setSelecciones,
    setEstadoFiscal,
    handleAvatarFile,
    toggleSubrubro: (rubroId: string, subrubroId: string) => toggleSubrubro(rubroId, subrubroId, setSelecciones),
    puedeAvanzar: (p: PasoOnboarding) => puedeAvanzar(p, form, selecciones, estadoFiscal),
    guardarYFinalizar,
    handleRegistro,
  }
}
