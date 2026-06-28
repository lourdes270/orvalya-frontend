import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { useLegalGate } from '../hooks/useLegalGate'
import { esCallbackOAuth, getOnboardingResumePath } from '../pages/onboarding/hooks/helpers'

function LoadingScreen({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#8C96A3' }}>
      {text}
    </div>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, perfil, loading, postAuthPending } = useAuth()
  const { checking, accepted } = useLegalGate(session?.user?.id)

  if (loading || postAuthPending || checking || esCallbackOAuth()) {
    return <LoadingScreen text="Cargando..." />
  }
  if (!session) return <Navigate to="/auth" replace />
  if (!perfil) return <LoadingScreen text="Cargando perfil..." />
  if (perfil.tipo === 'pendiente') {
    return <Navigate to={getOnboardingResumePath()} replace />
  }
  if (!accepted) return <Navigate to="/aceptar-terminos" replace />
  return <>{children}</>
}

export function SessionRoute({ children }: { children: React.ReactNode }) {
  const { session, perfil, loading, postAuthPending } = useAuth()
  if (loading || postAuthPending || esCallbackOAuth()) return <LoadingScreen text="Cargando..." />
  if (!session) return <Navigate to="/auth" replace />
  if (perfil?.tipo === 'pendiente') {
    return <Navigate to={getOnboardingResumePath()} replace />
  }
  return <>{children}</>
}

export function LegalAcceptanceRoute({ children }: { children: React.ReactNode }) {
  const { session, perfil, loading, postAuthPending } = useAuth()
  const { checking, accepted } = useLegalGate(session?.user?.id)

  if (loading || postAuthPending || checking || esCallbackOAuth()) {
    return <LoadingScreen text="Cargando..." />
  }
  if (!session) return <Navigate to="/auth" replace />
  if (perfil?.tipo === 'pendiente') {
    return <Navigate to={getOnboardingResumePath()} replace />
  }
  if (accepted) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, perfil, loading, postAuthPending } = useAuth()

  if (loading || postAuthPending || esCallbackOAuth()) {
    return <LoadingScreen text="Ingresando..." />
  }
  if (session && perfil === null) {
    return <LoadingScreen text="Cargando perfil..." />
  }
  if (session && perfil) {
    if (perfil.tipo === 'pendiente') {
      return <Navigate to={getOnboardingResumePath()} replace />
    }
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
