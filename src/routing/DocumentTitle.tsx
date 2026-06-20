import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === '/') document.title = 'Orvalya'
    else if (pathname.startsWith('/onboarding')) document.title = 'Registrate | Orvalya'
    else if (pathname.startsWith('/dashboard')) document.title = 'Mi perfil | Orvalya'
    else if (pathname.startsWith('/auth')) document.title = 'Iniciar sesión | Orvalya'
    else if (pathname.startsWith('/contacto/contratante')) document.title = 'Contacto empresas | Orvalya'
    else if (pathname.startsWith('/aceptar-terminos')) document.title = 'Aceptar términos | Orvalya'
    else if (pathname.startsWith('/terminos')) document.title = 'Términos | Orvalya'
    else if (pathname.startsWith('/privacidad')) document.title = 'Privacidad | Orvalya'
    else document.title = 'Orvalya'
  }, [pathname])

  return null
}
