import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { List, X } from '@phosphor-icons/react'
import { OrvalyaLogo } from '../../components/OrvalyaLogo'
import { useIsMobile } from '../../hooks/useIsMobile'
import { NAV_LINKS } from './landingContent'
import { BORDER, NAVY, TEAL, touchButtonBase } from './landingStyles'

const navLinkStyle = (active: boolean) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: active ? TEAL : NAVY,
  textDecoration: 'none',
  padding: '8px 0',
  borderBottom: active ? `2px solid ${TEAL}` : '2px solid transparent',
} as const)

export default function LandingHeader() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isMobile = useIsMobile(768)
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header style={{
      borderBottom: `1px solid ${BORDER}`,
      background: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: isMobile ? '14px 16px' : '16px 24px',
        maxWidth: '1040px',
        margin: '0 auto',
      }}>
        <Link
          to="/"
          onClick={closeMenu}
          style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="Orvalya — inicio"
        >
          <OrvalyaLogo height={isMobile ? 30 : 34} showText />
        </Link>

        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              style={{
                ...touchButtonBase,
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: NAVY,
                border: `1.5px solid ${BORDER}`,
                fontSize: '13px',
                minHeight: '40px',
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="landing-nav-menu"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuOpen(open => !open)}
              style={{
                ...touchButtonBase,
                width: '40px',
                minHeight: '40px',
                padding: 0,
                background: menuOpen ? '#EAF6F4' : 'transparent',
                color: NAVY,
                border: `1.5px solid ${BORDER}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {menuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            marginLeft: 'auto',
          }}>
            <nav aria-label="Navegación principal" style={{ display: 'flex', gap: '24px' }}>
              {NAV_LINKS.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  style={navLinkStyle(pathname === path)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              style={{
                ...touchButtonBase,
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: NAVY,
                border: `1.5px solid ${BORDER}`,
                fontSize: '14px',
              }}
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </div>

      {isMobile && menuOpen && (
        <nav
          id="landing-nav-menu"
          aria-label="Navegación principal"
          style={{
            borderTop: `1px solid ${BORDER}`,
            background: '#fff',
            padding: '8px 16px 16px',
          }}
        >
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={closeMenu}
              style={{
                display: 'block',
                padding: '12px 4px',
                fontSize: '15px',
                fontWeight: 600,
                color: pathname === path ? TEAL : NAVY,
                textDecoration: 'none',
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
