import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/useAuth'
import type {
  PasoOnboarding,
  OnboardingForm,
  SeleccionCategorias,
  EstadoFiscal,
} from '../types'
import { toggleSubrubro, puedeAvanzar, registrarUsuario } from './helpers'

const DRAFT_KEY = 'orvalya_onboarding_draft'

interface DraftData {
  paso: PasoOnboarding
  form: OnboardingForm
  selecciones: SeleccionCategorias
  estadoFiscal: EstadoFiscal | null
}

export function useOnboardingForm() {
  const { setPerfil } = useAuth()
  const navigate = useNavigate()
  const [paso, setPaso] = useState<PasoOnboarding>(0)
  const [form, setForm] = useState<OnboardingForm>({
    nombre: '',
    email: '',
    telefono: '',
    zona: '',
    whatsapp: '',
    otroTexto: '',
  })
  const [selecciones, setSelecciones] = useState<SeleccionCategorias>({})
  const [estadoFiscal, setEstadoFiscal] = useState<EstadoFiscal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      try {
        const data: DraftData = JSON.parse(saved)
        setPaso(data.paso)
        setForm(data.form)
        setSelecciones(data.selecciones)
        setEstadoFiscal(data.estadoFiscal)
      } catch {
        localStorage.removeItem(DRAFT_KEY)
      }
    }
  }, [])

  const saveDraft = () => {
    const data: DraftData = { paso, form, selecciones, estadoFiscal }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
  }

  useEffect(() => {
    saveDraft()
  }, [paso, form, selecciones, estadoFiscal])

  const guardarYFinalizar = () => {
    navigate('/onboarding?paso=4')
  }

  const handleRegistro = async (email: string, password: string) => {
    setLoading(true)
    setError('')
    // Use the email from form (Step2) instead of the email parameter (Step4)
    await registrarUsuario(form.email || email, password, form, selecciones, estadoFiscal, setPerfil, navigate, setError)
    setLoading(false)
  }

  return {
    paso,
    form,
    selecciones,
    estadoFiscal,
    loading,
    error,
    setPaso,
    setForm,
    setSelecciones,
    setEstadoFiscal,
    toggleSubrubro: (rubroId: string, subrubroId: string) => toggleSubrubro(rubroId, subrubroId, setSelecciones),
    puedeAvanzar: () => puedeAvanzar(paso, form, selecciones, estadoFiscal),
    guardarYFinalizar,
    handleRegistro,
  }
}
