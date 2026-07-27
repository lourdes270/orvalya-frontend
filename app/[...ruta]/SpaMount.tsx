'use client'

import dynamic from 'next/dynamic'

/**
 * La app existente (React Router + Supabase en localStorage) se monta solo en el
 * cliente. Cubre las rutas que no necesitan SEO: auth, onboarding, dashboard, admin.
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
  return <AppSpa />
}
