import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import AuthPage from './pages/auth/AuthPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'

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
        <Routes>
          <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}