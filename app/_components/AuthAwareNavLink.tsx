'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../src/lib/supabase'

/**
 * El link de "Iniciar sesión" del header público es un <a> estático porque
 * PublicShell es un Server Component y la sesión de Supabase vive en
 * localStorage del browser (no en cookies), así que el servidor no puede
 * saber si hay sesión activa. Este componente cliente arranca mostrando
 * "Iniciar sesión" (mismo comportamiento de siempre, sin regresión) y lo
 * reemplaza por "Mi cuenta" en cuanto confirma que hay sesión.
 */
export function AuthAwareNavLink() {
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    let activo = true

    supabase.auth.getSession().then(({ data }) => {
      if (activo && data.session) setSignedIn(true)
    })

    const { data: subscripcion } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (activo) setSignedIn(!!session)
    })

    return () => {
      activo = false
      subscripcion.subscription.unsubscribe()
    }
  }, [])

  if (signedIn) {
    return <a className="ov-login" href="/dashboard">Mi cuenta</a>
  }
  return <a className="ov-login" href="/auth">Iniciar sesión</a>
}
