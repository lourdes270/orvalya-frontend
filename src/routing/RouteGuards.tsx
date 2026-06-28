import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { useLegalGate } from '../hooks/useLegalGate'
import { getOnboardingResumePath } from '../pages/onboarding/hooks/helpers'

function LoadingScreen({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#8C96A3' }}>
      {text}
    </div>
  )
}

function NavigateOnboardingPendiente() {
  const [path, setPath] = useState<string | null>(null)

  useEffect(() => {
    setPath(getOnboardingResumePath())
  }, [])

  if (!path) return <LoadingScreen text="Cargando..." />
  return <Navigate to={path} replace />
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, perfil, loading } = useAuth()
  const { checking, accepted } = useLegalGate(session?.user?.id)

  if (loading || checking) return <LoadingScreen text="Cargando..." />
  if (!session) return <Navigate to="/" replace />
  if (!perfil) return <LoadingScreen text="Cargando perfil..." />
  if (perfil.tipo === 'pendiente') return <NavigateOnboardingPendiente />
  if (!accepted) return <Navigate to="/aceptar-terminos" replace />
  return <>{children}</>
}

export function SessionRoute({ children }: { children: React.ReactNode }) {
  const { session, perfil, loading } = useAuth()
  if (loading) return <LoadingScreen text="Cargando..." />
  if (!session) return <Navigate to="/auth" replace />
  if (perfil?.tipo === 'pendiente') return <NavigateOnboardingPendiente />
  return <>{children}</>
}

export function LegalAcceptanceRoute({ children }: { children: React.ReactNode }) {
  const { session, perfil, loading } = useAuth()
  const { checking, accepted } = useLegalGate(session?.user?.id)

  if (loading || checking) return <LoadingScreen text="Cargando..." />
  if (!session) return <Navigate to="/auth" replace />
  if (perfil?.tipo === 'pendiente') return <NavigateOnboardingPendiente />
  if (accepted) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
