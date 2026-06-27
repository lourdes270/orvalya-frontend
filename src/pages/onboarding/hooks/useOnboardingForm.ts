import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/useAuth'
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
}

const defaultForm: OnboardingForm = {
  nombre: '',
  apellido: '',
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
    const parsed = JSON.parse(saved) as DraftData & { avatarDataUrl?: unknown }
    return {
      paso: parsed.paso,
      form: { ...defaultForm, ...parsed.form, rango_edad: parsed.form?.rango_edad ?? '' },
      selecciones: parsed.selecciones ?? {},
      estadoFiscal: parsed.estadoFiscal ?? null,
    }
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
  const [form, setForm] = useState<OnboardingForm>(draft?.form ?? defaultForm)
  const [selecciones, setSelecciones] = useState<SeleccionCategorias>(draft?.selecciones ?? {})
  const [estadoFiscal, setEstadoFiscal] = useState<EstadoFiscal | null>(draft?.estadoFiscal ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fakeSuccess, setFakeSuccess] = useState('')

  useEffect(() => {
    const data: DraftData = { paso, form, selecciones, estadoFiscal }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
  }, [paso, form, selecciones, estadoFiscal])

  const guardarYFinalizar = () => navigate('/onboarding?paso=4')

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
    loading,
    error,
    fakeSuccess,
    setPaso,
    setForm,
    setSelecciones,
    setEstadoFiscal,
    toggleSubrubro: (rubroId: string, subrubroId: string) => toggleSubrubro(rubroId, subrubroId, setSelecciones),
    puedeAvanzar: (p: PasoOnboarding) => puedeAvanzar(p, form, selecciones, estadoFiscal),
    guardarYFinalizar,
    handleRegistro,
  }
}
