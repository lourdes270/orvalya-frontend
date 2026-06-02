import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
 
export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
 
  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }
 
  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', padding: '40px 16px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#FFF', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '40px' }}>
        <h1 style={{ color: '#1F3864', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Bienvenida a Orvalya
        </h1>
        <p style={{ color: '#8C96A3', fontSize: '14px', marginBottom: '32px' }}>
          {user?.email}
        </p>
        <p style={{ color: '#495057', marginBottom: '32px' }}>
          Dashboard en construcción — próximo paso: elegir tu tipo de perfil.
        </p>
        <button
          onClick={handleSignOut}
          style={{ padding: '10px 20px', background: '#F8F9FA', border: '1.5px solid #DEE2E6', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#495057' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}