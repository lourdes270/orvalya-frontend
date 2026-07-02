import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import LegalAcceptance from './LegalAcceptance'
import { legalStyles } from './legalCopy'

export default function LegalAcceptancePage() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleAccepted = () => {
    const destino = perfil?.tipo === 'contratante' ? '/contratante/perfil' : '/dashboard'
    navigate(destino, { replace: true })
  }

  return (
    <div style={legalStyles.page}>
      <LegalAcceptance userId={user.id} onAccepted={handleAccepted} />
    </div>
  )
}
