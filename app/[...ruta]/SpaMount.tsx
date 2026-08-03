'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

/**
 * La app existente (React Router + Supabase en localStorage) se monta solo en el
 * cliente. Cubre las rutas que no necesitan SEO: auth, onboarding, dashboard, admin.
 *
 * key={pathname}: Next navega con history.pushState, y BrowserRouter solo escucha
 * popstate. Sin remount al cambiar la URL, React Router se queda con la location
 * vieja y muestra el 404 del SPA (p. ej. al ir de / a /auth con <Link>).
 */
const AppSpa = dynamic(() => import('../../src/App'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      minHeight: '100svh',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#8C96A3',
    }}>
      Cargando...
    </div>
  ),
})

export default function SpaMount() {
  const pathname = usePathname()
  return <AppSpa key={pathname} />
}
