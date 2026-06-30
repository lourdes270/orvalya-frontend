import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton'
import { OrvalyaLogo } from '../../components/OrvalyaLogo'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { esRegistroContratante, limpiarRegistroContratante, marcarRegistroContratante } from '../../lib/registroConstants'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { s } from './styles'

type Tab = 'login' | 'register'

export default function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>(() => (esRegistroContratante() ? 'register' : 'login'))
  const esEmpresa = esRegistroContratante()

  useEffect(() => {
    if (esRegistroContratante()) setTab('register')
  }, [])

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <OrvalyaLogo height={36} showText={false} />
          </div>
          <div style={s.logoSub}>Servicios verificados en Uruguay</div>
        </div>

        {esEmpresa && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 14px',
            background: '#EAF6F4',
            border: '1px solid #00B4A6',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#1b3a5c',
          }}>
            Estás registrando una <strong>empresa contratante</strong>. Vas a poder publicar llamados y buscar prestadores.
          </div>
        )}

        <GoogleAuthButton />
        <div style={s.divider}>
          <span style={s.dividerLine} />
          <span style={s.dividerText}>o con email</span>
          <span style={s.dividerLine} />
        </div>
        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(tab === 'login' ? s.tabActive : {}) }}
            onClick={() => setTab('login')}
          >
            Ingresar
          </button>
          <button
            style={{ ...s.tab, ...(tab === 'register' ? s.tabActive : {}) }}
            onClick={() => setTab('register')}
          >
            Registrarse
          </button>
        </div>
        {tab === 'login' ? <LoginForm /> : <RegisterForm />}

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', lineHeight: 1.6, color: '#6b7280' }}>
          {esEmpresa ? (
            <button
              type="button"
              onClick={() => {
                limpiarRegistroContratante()
                navigate('/onboarding')
              }}
              style={{ background: 'none', border: 'none', color: '#2E75B6', cursor: 'pointer', padding: 0, fontSize: '13px' }}
            >
              ¿Ofrecés servicios? Registrate como prestador
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                marcarRegistroContratante()
                setTab('register')
              }}
              style={{ background: 'none', border: 'none', color: '#2E75B6', cursor: 'pointer', padding: 0, fontSize: '13px' }}
            >
              ¿Sos empresa y buscás prestadores? Registrate acá
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
