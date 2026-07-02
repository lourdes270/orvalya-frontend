import { useEffect, useState } from 'react'
import { hasCurrentLegalAcceptance, tieneAceptacionLegalOptimista } from '../lib/legalAcceptance'

export function useLegalGate(userId: string | undefined) {
  const [checking, setChecking] = useState(() => !userId || tieneAceptacionLegalOptimista(userId))
  const [accepted, setAccepted] = useState(() => (userId ? tieneAceptacionLegalOptimista(userId) : false))

  useEffect(() => {
    if (!userId) {
      setChecking(false)
      setAccepted(false)
      return
    }

    if (tieneAceptacionLegalOptimista(userId)) {
      setAccepted(true)
      setChecking(false)
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
