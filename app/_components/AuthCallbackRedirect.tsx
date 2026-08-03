'use client'

import { useEffect } from 'react'

/**
 * Tras Google OAuth, Supabase a veces redirige al Site URL (la portada `/`)
 * con `#access_token=...`. Esa página es SSR y no tiene AuthProvider, así que
 * el token queda muerto en la URL. Si detectamos un callback de auth fuera del
 * SPA, mandamos a /auth conservando hash y query para que lo procese.
 */
const RUTAS_SPA = [
  '/auth',
  '/onboarding',
  '/dashboard',
  '/admin',
  '/contratante',
  '/aceptar-terminos',
  '/contacto',
]

function esCallbackAuthEnUrl(): boolean {
  const hash = window.location.hash
  const params = new URLSearchParams(window.location.search)
  return (
    hash.includes('access_token')
    || hash.includes('error=')
    || hash.includes('refresh_token')
    || params.has('code')
    || params.has('error')
  )
}

function esRutaSpa(pathname: string): boolean {
  return RUTAS_SPA.some(p => pathname === p || pathname.startsWith(`${p}/`))
}

export function AuthCallbackRedirect() {
  useEffect(() => {
    if (!esCallbackAuthEnUrl()) return
    if (esRutaSpa(window.location.pathname)) return

    const { search, hash } = window.location
    window.location.replace(`/auth${search}${hash}`)
  }, [])

  return null
}
