import Link from 'next/link'
import { RUBROS } from '../../src/vistas/onboarding/data/rubros'
import { DEPARTAMENTOS } from '../../src/vistas/onboarding/data/zonas'
import { rutaListado, slugDeDepartamento } from '../../src/lib/seo'
import { rutaListadoLlamados } from '../../src/lib/llamadosPublicos'

const NAV_LINKS = [
  { label: 'Independientes', href: '/prestadores' },
  { label: 'Trabajos', href: '/llamados' },
  { label: 'Cómo Funciona', href: '/como-funciona' },
]

const NAV_SECUNDARIA = [
  { label: 'Quiénes Somos', href: '/quienes-somos' },
  { label: 'Cómo Funciona', href: '/como-funciona' },
]

/** Rubros y departamentos con más volumen de búsqueda, para enlazado interno. */
const RUBROS_DESTACADOS = RUBROS.filter(r => r.id !== 'otro' && r.subrubros.length > 0).slice(0, 6)
const DEPARTAMENTOS_DESTACADOS = ['Montevideo', 'Canelones', 'Maldonado', 'Salto', 'Colonia', 'Paysandú']
  .filter(d => (DEPARTAMENTOS as readonly string[]).includes(d))

function Header() {
  return (
    <header className="ov-header">
      <div className="ov-header-inner">
        <Link href="/" aria-label="Orvalya — inicio" style={{ display: 'inline-flex', flexShrink: 0 }}>
          <img
            src="/orvalya_logo.png"
            alt="Orvalya"
            height={32}
            style={{ display: 'block', width: 'auto', maxHeight: 32 }}
          />
        </Link>

        <nav className="ov-nav" aria-label="Navegación principal">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
          <a className="ov-login" href="/auth">Iniciar sesión</a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="ov-footer">
      <div className="ov-footer-inner">
        <div className="ov-footer-cols">
          <div>
            <h2>Servicios</h2>
            {RUBROS_DESTACADOS.map(r => (
              <Link key={r.id} href={rutaListado({ rubro: r.id })}>{r.label}</Link>
            ))}
          </div>
          <div>
            <h2>Departamentos</h2>
            {DEPARTAMENTOS_DESTACADOS.map(d => (
              <Link key={d} href={rutaListado({ zona: d })}>Independientes en {d}</Link>
            ))}
          </div>
          <div>
            <h2>Trabajos</h2>
            <Link href="/llamados">Todos los llamados abiertos</Link>
            {RUBROS_DESTACADOS.slice(0, 4).map(r => (
              <Link key={r.id} href={rutaListadoLlamados({ rubro: r.id })}>
                Trabajos de {r.label.toLowerCase()}
              </Link>
            ))}
          </div>
          <div>
            <h2>Orvalya</h2>
            <Link href="/prestadores">Todos los prestadores independientes</Link>
            {NAV_SECUNDARIA.map(l => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
            <a href="/contacto/contratante">Soy empresa</a>
          </div>
        </div>

        <div className="ov-footer-legal">
          <p style={{ margin: '0 0 6px', fontSize: '13px' }}>
            <Link href="/terminos">Términos y Condiciones</Link>
            <span style={{ color: '#d8e3ed', margin: '0 8px' }}>|</span>
            <Link href="/privacidad">Política de Privacidad</Link>
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#4a6078' }}>
            Orvalya © {new Date().getFullYear()} · Uruguay
          </p>
        </div>
      </div>
    </footer>
  )
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ov-shell">
      <Header />
      <main className="ov-main">{children}</main>
      <Footer />
    </div>
  )
}

export { slugDeDepartamento }
