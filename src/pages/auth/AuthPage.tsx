import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton'
import { OrvalyaLogo } from '../../components/OrvalyaLogo'
import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { s } from './styles'

type Tab = 'login' | 'register'

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login')

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <OrvalyaLogo height={32} />
          </div>
          <div style={s.logoSub}>Servicios verificados en Uruguay</div>
        </div>
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
      </div>
    </div>
  )
}
