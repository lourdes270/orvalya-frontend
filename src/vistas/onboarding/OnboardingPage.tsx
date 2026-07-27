import { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { capturarRegistroDesdeUrl, esIntentoRegistroContratante, esRegistroContratante } from '../../lib/registroConstants'
import { resolverFlujoContratante } from '../../lib/registroHelpers'
import Step0TipoPerfil from './steps/Step0TipoPerfil'
import Step1Categorias from './steps/Step1Categorias'
import Step2DatosBasicos from './steps/Step2DatosBasicos'
import Step3Fiscalizacion from './steps/Step3Fiscalizacion'
import Step4Registro from './steps/Step4Registro'
import ProgressBar from './components/ProgressBar'
import { useOnboardingForm } from './hooks/useOnboardingForm'
import { useAuth } from '../../contexts/useAuth'
import {
  intentarCompletarOnboardingPendiente,
  obtenerBorradorOnboarding,
  restaurarBorradorOnboardingSiFalta,
} from './hooks/helpers'
import type { PasoOnboarding } from './types'

function PantallaCarga({ texto, secundario }: { texto: string; secundario?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      textAlign: 'center',
      gap: '8px',
    }}>
      <p style={{ color: '#374151', fontSize: '16px', margin: 0 }}>{texto}</p>
      {secundario && <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{secundario}</p>}
    </div>
  )
}

export default function OnboardingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { session, perfil, setPerfil, loading: authLoading, postAuthPending } = useAuth()
  const pasoParam = searchParams.get('paso')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [completandoPendiente, setCompletandoPendiente] = useState(false)
  const [sinDatosPrevios, setSinDatosPrevios] = useState(false)
  const [cargaLarga, setCargaLarga] = useState(false)
  const contratanteProcesado = useRef(false)
  const {
    form, selecciones, estadoFiscal, loading, error, fakeSuccess,
    setForm, setEstadoFiscal, setPaso, toggleSubrubro, puedeAvanzar, guardarYFinalizar, handleRegistro,
  } = useOnboardingForm()

  useEffect(() => {
    if (pasoParam) {
      const n = Number.parseInt(pasoParam, 10)
      if (!Number.isNaN(n) && n >= 0 && n <= 4) {
        setPaso(n as PasoOnboarding)
      }
    }
  }, [pasoParam, setPaso])

  useEffect(() => {
    restaurarBorradorOnboardingSiFalta()
    capturarRegistroDesdeUrl()
  }, [])

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setCargaLarga(true), 10_000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!session?.user || contratanteProcesado.current) return
    if (!esIntentoRegistroContratante(session.user)) return

    contratanteProcesado.current = true
    let activo = true
    setCompletandoPendiente(true)

    resolverFlujoContratante(session.user, perfil, navigate)
      .then(({ perfil: actualizado, redirigido }) => {
        if (!activo) return
        if (actualizado) setPerfil(actualizado)
        if (!redirigido) contratanteProcesado.current = false
      })
      .catch(err => {
        console.error('onboarding contratante:', err)
        contratanteProcesado.current = false
      })
      .finally(() => {
        if (activo) setCompletandoPendiente(false)
      })

    return () => { activo = false }
  }, [session?.user?.id, setPerfil, navigate])

  useEffect(() => {
    if (!session?.user || perfil?.tipo !== 'pendiente') return
    if (esIntentoRegistroContratante(session.user)) return

    const draft = obtenerBorradorOnboarding(session.user)
    setSinDatosPrevios(!draft)
  }, [session?.user?.id, perfil?.tipo])

  const esperandoPerfil = !!session && perfil === null
  const preparandoContratante = !!session?.user && esIntentoRegistroContratante(session.user)

  if (esRegistroContratante() && !session && !authLoading && !postAuthPending) {
    return <Navigate to="/auth" replace />
  }

  if (postAuthPending || authLoading) {
    return <PantallaCarga texto="Ingresando a tu cuenta..." secundario="Un momento, estamos verificando tu email." />
  }

  if (preparandoContratante && (completandoPendiente || esperandoPerfil)) {
    return <PantallaCarga texto="Preparando tu cuenta de empresa..." secundario="No hace falta elegir servicios." />
  }

  if (esperandoPerfil) {
    return (
      <PantallaCarga
        texto="Cargando..."
        secundario={cargaLarga ? 'Si tarda mucho, recargá la página o volvé a iniciar sesión.' : undefined}
      />
    )
  }

  if (!pasoParam || pasoParam === '0') {
    return (
      <>
        {sinDatosPrevios && session && perfil?.tipo === 'pendiente' && (
          <div style={{
            maxWidth: '520px',
            margin: '16px auto 0',
            padding: '12px 16px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            color: '#856404',
            fontSize: '14px',
            lineHeight: 1.5,
          }}>
            No encontramos los datos que cargaste antes. Elegí <strong>Necesito contratar servicios</strong> si sos empresa, o <strong>Ofrezco servicios</strong> si querés registrarte como prestador.
          </div>
        )}
        <Step0TipoPerfil isMobile={isMobile} />
      </>
    )
  }

  const pasoNum = parseInt(pasoParam, 10)
  if (Number.isNaN(pasoNum) || pasoNum < 1 || pasoNum > 4) {
    return <Navigate to="/onboarding?paso=0" replace />
  }

  const yaTieneCuenta = !!session && perfil?.tipo === 'pendiente'

  const irAPaso = (destino: number) => {
    setPaso(destino as PasoOnboarding)
    navigate(`/onboarding?paso=${destino}`)
  }

  const finalizarPaso3 = async () => {
    if (yaTieneCuenta && session?.user) {
      setCompletandoPendiente(true)
      await intentarCompletarOnboardingPendiente(session.user, setPerfil, navigate)
      setCompletandoPendiente(false)
      return
    }
    guardarYFinalizar()
  }

  if (pasoNum === 4 && yaTieneCuenta) {
    return <Navigate to="/onboarding?paso=3" replace />
  }

  return (
    <>
      {completandoPendiente && (
        <PantallaCarga texto="Finalizando tu perfil..." />
      )}
      {!completandoPendiente && (
        <>
          {isMobile && pasoNum >= 1 && pasoNum <= 3 && (
            <ProgressBar pasoActual={pasoNum as 1 | 2 | 3} isMobile />
          )}
          {pasoNum === 1 && (
            <Step1Categorias
              form={form}
              selecciones={selecciones}
              setForm={setForm}
              toggleSubrubro={toggleSubrubro}
              isMobile={isMobile}
              onAvanzar={() => irAPaso(2)}
              onVolver={() => irAPaso(0)}
              puedeAvanzar={() => puedeAvanzar(1)}
            />
          )}
          {pasoNum === 2 && (
            <Step2DatosBasicos
              form={form}
              setForm={setForm}
              isMobile={isMobile}
              onAvanzar={() => irAPaso(3)}
              onVolver={() => irAPaso(1)}
              puedeAvanzar={() => puedeAvanzar(2)}
            />
          )}
          {pasoNum === 3 && (
            <Step3Fiscalizacion
              estadoFiscal={estadoFiscal}
              setEstadoFiscal={setEstadoFiscal}
              isMobile={isMobile}
              onVolver={() => irAPaso(2)}
              onFinalizar={finalizarPaso3}
              loading={loading || completandoPendiente}
            />
          )}
          {pasoNum === 4 && !yaTieneCuenta && (
            <Step4Registro
              isMobile={isMobile}
              onRegistrar={handleRegistro}
              onVolver={() => irAPaso(3)}
              loading={loading}
              error={error}
              fakeSuccess={fakeSuccess}
              email={form.email}
            />
          )}
          {error && pasoNum !== 4 && (
            <div style={{ position: 'fixed', bottom: '100px', left: '20px', right: '20px', padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>{error}</div>
          )}
        </>
      )}
    </>
  )
}
