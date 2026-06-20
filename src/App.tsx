import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthPage from './pages/auth/AuthPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import LandingPage from './pages/landing/LandingPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import NotFoundPage from './pages/NotFoundPage'
import ContactoContratante from './pages/contacto/ContactoContratante'
import LegalAcceptancePage from './pages/legal/LegalAcceptancePage'
import TerminosPage from './pages/legal/TerminosPage'
import PrivacidadPage from './pages/legal/PrivacidadPage'
import { ProtectedRoute, PublicRoute, LegalAcceptanceRoute } from './routing/RouteGuards'
import { DocumentTitle } from './routing/DocumentTitle'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DocumentTitle />
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/contacto/contratante" element={<PublicRoute><ContactoContratante /></PublicRoute>} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/aceptar-terminos" element={<LegalAcceptanceRoute><LegalAcceptancePage /></LegalAcceptanceRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
