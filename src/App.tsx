import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthPage from './vistas/auth/AuthPage'
import ResetPasswordPage from './vistas/auth/ResetPasswordPage'
import DashboardPage from './vistas/dashboard/DashboardPage'
import LandingPage from './vistas/landing/LandingPage'
import QuienesSomosPage from './vistas/landing/QuienesSomosPage'
import ComoFuncionaPage from './vistas/landing/ComoFuncionaPage'
import OnboardingPage from './vistas/onboarding/OnboardingPage'
import NotFoundPage from './vistas/NotFoundPage'
import ContratantePerfilPage from './vistas/contratante/ContratantePerfilPage'
import AdminModeracionPage from './vistas/admin/AdminModeracionPage'
import ContactoContratante from './vistas/contacto/ContactoContratante'
import LegalAcceptancePage from './vistas/legal/LegalAcceptancePage'
import TerminosPage from './vistas/legal/TerminosPage'
import PrivacidadPage from './vistas/legal/PrivacidadPage'
import { ProtectedRoute, PublicRoute, LegalAcceptanceRoute } from './routing/RouteGuards'
import { DocumentTitle } from './routing/DocumentTitle'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DocumentTitle />
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/quienes-somos" element={<PublicRoute><QuienesSomosPage /></PublicRoute>} />
          <Route path="/como-funciona" element={<PublicRoute><ComoFuncionaPage /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/auth/restablecer-contrasena" element={<ResetPasswordPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/contacto/contratante" element={<PublicRoute><ContactoContratante /></PublicRoute>} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/aceptar-terminos" element={<LegalAcceptanceRoute><LegalAcceptancePage /></LegalAcceptanceRoute>} />
          {/* /prestadores, /prestadores/[slug] y /llamados los sirve Next con render
              de servidor (ver app/). No van acá o quedarían dos implementaciones. */}
          <Route path="/contratante/perfil" element={<ProtectedRoute><ContratantePerfilPage /></ProtectedRoute>} />
          <Route path="/admin/moderacion" element={<ProtectedRoute><AdminModeracionPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
