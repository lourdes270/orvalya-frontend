import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import AuthPage from './pages/auth/AuthPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import LandingPage from './pages/landing/LandingPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import NotFoundPage from './pages/NotFoundPage'

function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === '/') {
      document.title = 'Orvalya'
    } else if (pathname.startsWith('/onboarding')) {
      document.title = 'Registrate | Orvalya'
    } else if (pathname.startsWith('/dashboard')) {
      document.title = 'Mi perfil | Orvalya'
    } else if (pathname.startsWith('/auth')) {
      document.title = 'Iniciar sesión | Orvalya'
    } else {
      document.title = 'Orvalya'
    }
  }, [pathname])

  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, perfil, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#8C96A3' }}>Cargando...</div>
  if (!session) return <Navigate to="/" replace />
  if (!perfil) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#8C96A3' }}>Cargando perfil...</div>
  if (perfil.tipo === 'pendiente') return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DocumentTitle />
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}