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
          <div style={s.logoText}>Orvalya</div>
          <div style={s.logoSub}>Servicios verificados en Uruguay</div>
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

 
 