import { useCallback, useEffect, useState } from 'react'
import { fetchContratante } from '../lib/contratanteHelpers'
import type { Contratante } from '../types/contratante'
import { useAuth } from '../contexts/useAuth'

export function useContratanteProfile() {
  const { user, perfil } = useAuth()
  const [contratante, setContratante] = useState<Contratante | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!user?.id || perfil?.tipo !== 'contratante') {
      setContratante(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchContratante(user.id)
      setContratante(data)
    } catch (err) {
      console.error(err)
      setError('No pudimos cargar tu perfil de empresa.')
      setContratante(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id, perfil?.tipo])

  useEffect(() => {
    reload().catch(console.error)
  }, [reload])

  return {
    contratante,
    loading,
    error,
    reload,
    perfilCompleto: !!contratante,
    esContratante: perfil?.tipo === 'contratante',
  }
}
