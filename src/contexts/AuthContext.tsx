import {
  useCallback, useEffect,
  useMemo, useState, type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthContextValue, type Perfil } from './AuthContextType'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)

  const fetchPerfil = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) console.error('fetchPerfil error:', error)
    setPerfil(data ?? null)
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error
        if (!mounted) return
        setSession(data.session ?? null)
        if (data.session?.user) fetchPerfil(data.session.user.id)
      })
      .catch(() => { if (!mounted) return; setSession(null) })
      .finally(() => { if (!mounted) return; setLoading(false) })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      if (nextSession?.user) fetchPerfil(nextSession.user.id)
      else setPerfil(null)
      setLoading(false)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [fetchPerfil])

  const user = session?.user ?? null

  const signInWithPassword = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    }, [])

  const signUp = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ loading, session, user, perfil, setPerfil, signInWithPassword, signUp, signOut }),
    [loading, session, user, perfil, setPerfil, signInWithPassword, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}