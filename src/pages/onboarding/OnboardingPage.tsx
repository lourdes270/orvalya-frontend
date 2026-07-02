import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { capturarRegistroDesdeUrl, esIntentoRegistroContratante, esRegistroContratante } from '../../lib/registroConstants'
import { activarPerfilContratanteSiCorresponde } from '../../lib/registroHelpers'
import { hasCurrentLegalAcceptance } from '../../lib/legalAcceptance'
import Step0TipoPerfil from './steps/Step0TipoPerfil'
import Step1Categorias from './steps/Step1Categorias'
import Step2DatosBasicos from './steps/Step2DatosBasicos'
import Step3Fiscalizacion from './steps/Step3Fiscalizacion'
import Step4Registro from './steps/Step4Registro'
import ProgressBar from './components/ProgressBar'
import { useOnboardingForm } from './hooks/useOnboardingForm'
import { useAuth } from '../../contexts/useAuth'
import { intentarCompletarOnboardingPendiente, restaurarBorradorOnboardingSiFalta } from './hooks/helpers'

function PantallaCarga({ texto }: { texto: string }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '15px' }}>
      {texto}
    </div>
  )
}

export default function OnboardingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { session, perfil, setPerfil, loading: authLoading } = useAuth()
  const pasoParam = searchParams.get('paso')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [completandoPendiente, setCompletandoPendiente] = useState(false)
  const [sinDatosPrevios, setSinDatosPrevios] = useState(false)
  const {
    form, selecciones, estadoFiscal, loading, error, fakeSuccess,
    setForm, setEstadoFiscal, toggleSubrubro, puedeAvanzar, guardarYFinalizar, handleRegistro,
  } = useOnboardingForm()

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
    if (!session?.user || !esIntentoRegistroContratante(session.user)) return

    let activo = true
    setCompletandoPendiente(true)

    activarPerfilContratanteSiCorresponde(session.user, perfil)
      .then(async actualizado => {
        if (!activo) return
        if (actualizado) setPerfil(actualizado)
        const acepto = await hasCurrentLegalAcceptance(session.user.id)
        navigate(acepto ? '/contratante/perfil' : '/aceptar-terminos', { replace: true })
      })
      .catch(err => console.error('onboarding contratante:', err))
      .finally(() => {
        if (activo) setCompletandoPendiente(false)
      })

    return () => { activo = false }
  }, [session?.user, perfil, setPerfil, navigate])

  useEffect(() => {
    if (!session?.user || perfil?.tipo !== 'pendiente') return
    if (esIntentoRegistroContratante(session.user)) return

    let activo = true
    setCompletandoPendiente(true)
    setSinDatosPrevios(false)

    intentarCompletarOnboardingPendiente(session.user, setPerfil, navigate)
      .then(result => {
        if (activo && result === 'sin_datos') setSinDatosPrevios(true)
      })
      .finally(() => {
        if (activo) setCompletandoPendiente(false)
      })

    return () => { activo = false }
  }, [session?.user?.id, perfil?.tipo, setPerfil, navigate])

  const esperandoPerfil = !!session && perfil === null

  if (esRegistroContratante() || esIntentoRegistroContratante(session?.user)) {
    return <PantallaCarga texto={completandoPendiente ? 'Preparando tu cuenta...' : 'Cargando...'} />
  }

  if (authLoading || esperandoPerfil || completandoPendiente) {
    return <PantallaCarga texto={completandoPendiente ? 'Finalizando tu perfil...' : 'Cargando...'} />
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

  const pasoNum = parseInt(pasoParam)
  const yaTieneCuenta = !!session && perfil?.tipo === 'pendiente'
  const nav = (dir: number) => { window.location.href = `/onboarding?paso=${pasoNum + dir}` }

  return (
    <>
      {isMobile && pasoNum >= 1 && pasoNum <= 3 && (
        <ProgressBar pasoActual={pasoNum as 1 | 2 | 3} isMobile />
      )}
      {pasoNum === 1 && (
        <Step1Categorias form={form} selecciones={selecciones} setForm={setForm} toggleSubrubro={toggleSubrubro} isMobile={isMobile} onAvanzar={() => nav(1)} puedeAvanzar={() => puedeAvanzar(1)} />
      )}
      {pasoNum === 2 && (
        <Step2DatosBasicos form={form} setForm={setForm} isMobile={isMobile} onAvanzar={() => nav(1)} onVolver={() => nav(-1)} puedeAvanzar={() => puedeAvanzar(2)} />
      )}
      {pasoNum === 3 && (
        <Step3Fiscalizacion estadoFiscal={estadoFiscal} setEstadoFiscal={setEstadoFiscal} isMobile={isMobile} onVolver={() => nav(-1)} onFinalizar={guardarYFinalizar} loading={loading} />
      )}
      {pasoNum === 4 && !yaTieneCuenta && (
        <Step4Registro isMobile={isMobile} onRegistrar={handleRegistro} loading={loading} error={error} fakeSuccess={fakeSuccess} email={form.email} />
      )}
      {pasoNum === 4 && yaTieneCuenta && !sinDatosPrevios && completandoPendiente && (
        <PantallaCarga texto="Finalizando tu perfil..." />
      )}
      {pasoNum === 4 && yaTieneCuenta && sinDatosPrevios && (
        <Navigate to="/onboarding?paso=0" replace />
      )}
      {error && pasoNum !== 4 && (
        <div style={{ position: 'fixed', bottom: '100px', left: '20px', right: '20px', padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>{error}</div>
      )}
    </>
  )
}
