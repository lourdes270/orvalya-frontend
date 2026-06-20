import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import LegalAcceptance from './LegalAcceptance'
import { legalStyles } from './legalCopy'

export default function LegalAcceptancePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div style={legalStyles.page}>
      <LegalAcceptance
        userId={user.id}
        onAccepted={() => navigate('/dashboard', { replace: true })}
      />
    </div>
  )
}
