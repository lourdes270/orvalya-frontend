import { useEffect, useState } from 'react'
import { hasCurrentLegalAcceptance } from '../lib/legalAcceptance'

export function useLegalGate(userId: string | undefined) {
  const [checking, setChecking] = useState(true)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!userId) {
      setChecking(false)
      setAccepted(false)
      return
    }

    let mounted = true
    setChecking(true)

    hasCurrentLegalAcceptance(userId)
      .then(ok => { if (mounted) setAccepted(ok) })
      .catch(() => { if (mounted) setAccepted(false) })
      .finally(() => { if (mounted) setChecking(false) })

    return () => { mounted = false }
  }, [userId])

  return { checking, accepted, setAccepted }
}
