import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/': 'Orvalya',
  '/quienes-somos': 'Quiénes Somos | Orvalya',
  '/como-funciona': 'Cómo Funciona | Orvalya',
  '/contratante/perfil': 'Perfil de empresa | Orvalya',
  '/admin/moderacion': 'Moderación | Orvalya',
  '/terminos': 'Términos y Condiciones | Orvalya',
  '/privacidad': 'Política de Privacidad | Orvalya',
}

function setRobotsMeta(content: string | null) {
  const existing = document.querySelector('meta[name="robots"]')
  if (!content) {
    existing?.remove()
    return
  }
  let meta = existing as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'robots'
    document.head.appendChild(meta)
  }
  meta.content = content
}

export function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === '/') document.title = TITLES['/']
    else if (pathname.startsWith('/quienes-somos')) document.title = TITLES['/quienes-somos']
    else if (pathname.startsWith('/como-funciona')) document.title = TITLES['/como-funciona']
    else if (pathname.startsWith('/contratante/perfil')) document.title = TITLES['/contratante/perfil']
    else if (pathname.startsWith('/admin/moderacion')) document.title = TITLES['/admin/moderacion']
    else if (pathname.startsWith('/terminos')) document.title = TITLES['/terminos']
    else if (pathname.startsWith('/privacidad')) document.title = TITLES['/privacidad']
    else if (pathname.startsWith('/onboarding')) document.title = 'Registrate | Orvalya'
    else if (pathname.startsWith('/dashboard')) document.title = 'Mi perfil | Orvalya'
    else if (pathname.startsWith('/auth')) document.title = 'Iniciar sesión | Orvalya'
    else if (pathname.startsWith('/contacto/contratante')) document.title = 'Contacto empresas | Orvalya'
    else if (pathname.startsWith('/aceptar-terminos')) document.title = 'Aceptar términos | Orvalya'
    else document.title = 'Orvalya'

    const isLegal = pathname.startsWith('/terminos') || pathname.startsWith('/privacidad')
    setRobotsMeta(isLegal ? 'index, follow' : null)
  }, [pathname])

  return null
}
