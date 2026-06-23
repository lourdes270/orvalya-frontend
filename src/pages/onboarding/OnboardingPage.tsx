import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Step0TipoPerfil from './steps/Step0TipoPerfil'
import Step1FotoPerfil from './steps/Step1FotoPerfil'
import Step1Categorias from './steps/Step1Categorias'
import Step2DatosBasicos from './steps/Step2DatosBasicos'
import Step3Fiscalizacion from './steps/Step3Fiscalizacion'
import Step4Registro from './steps/Step4Registro'
import ProgressBar from './components/ProgressBar'
import { useOnboardingForm } from './hooks/useOnboardingForm'

export default function OnboardingPage() {
  const [searchParams] = useSearchParams()
  const pasoParam = searchParams.get('paso')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const formState = useOnboardingForm()
  const {
    form, selecciones, estadoFiscal, loading, error, fakeSuccess,
    setForm, setEstadoFiscal, toggleSubrubro, avatarDataUrl,
    handleAvatarFile, puedeAvanzar, guardarYFinalizar, handleRegistro,
  } = formState

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  if (!pasoParam || pasoParam === '0') return <Step0TipoPerfil isMobile={isMobile} />

  const pasoNum = parseInt(pasoParam)
  const nav = (dir: number) => { window.location.href = `/onboarding?paso=${pasoNum + dir}` }

  return (
    <>
      {isMobile && pasoNum >= 1 && pasoNum <= 4 && (
        <ProgressBar pasoActual={pasoNum as 1 | 2 | 3 | 4} isMobile />
      )}
      {pasoNum === 1 && (
        <Step1FotoPerfil
          previewUrl={avatarDataUrl}
          isMobile={isMobile}
          onSelectFile={handleAvatarFile}
          onAvanzar={() => nav(1)}
          onOmitir={() => nav(1)}
        />
      )}
      {pasoNum === 2 && (
        <Step1Categorias form={form} selecciones={selecciones} setForm={setForm} toggleSubrubro={toggleSubrubro} isMobile={isMobile} onAvanzar={() => nav(1)} puedeAvanzar={() => puedeAvanzar(2)} />
      )}
      {pasoNum === 3 && (
        <Step2DatosBasicos form={form} setForm={setForm} isMobile={isMobile} onAvanzar={() => nav(1)} onVolver={() => nav(-1)} puedeAvanzar={() => puedeAvanzar(3)} />
      )}
      {pasoNum === 4 && (
        <Step3Fiscalizacion estadoFiscal={estadoFiscal} setEstadoFiscal={setEstadoFiscal} isMobile={isMobile} onVolver={() => nav(-1)} onFinalizar={guardarYFinalizar} loading={loading} />
      )}
      {pasoNum === 5 && (
        <Step4Registro isMobile={isMobile} onRegistrar={handleRegistro} loading={loading} error={error} fakeSuccess={fakeSuccess} email={form.email} />
      )}
      {error && pasoNum !== 5 && (
        <div style={{ position: 'fixed', bottom: '100px', left: '20px', right: '20px', padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>{error}</div>
      )}
    </>
  )
}
