import {
  useCallback, useEffect,
  useMemo, useState, type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthContextValue, type Perfil } from './AuthContextType'
import { esUsuarioDuplicadoSinError, lanzarErrorEmailDuplicado, urlRedirectoAuth, urlRedirectoPostOAuth } from '../lib/validaciones'
import { prepararBorradorParaOAuthOnboarding } from '../pages/onboarding/hooks/helpers'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)

  const fetchPerfil = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('fetchPerfil error:', error)
        setPerfil(null)
      } else {
        setPerfil(data ?? null)
      }
    } catch (err) {
      console.error('fetchPerfil catch:', err)
      setPerfil(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) setSession(null)
          return
        }
        
        if (mounted) {
          setSession(session)
          if (session?.user) {
            // Fetch perfil in background, don't wait for it
            fetchPerfil(session.user.id).catch(err => console.error('BG fetch error:', err))
          }
        }
      } catch (err) {
        console.error('Session error:', err)
        if (mounted) setSession(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      if (nextSession?.user) {
        // Fetch perfil in background, don't wait for it
        fetchPerfil(nextSession.user.id).catch(err => console.error('BG fetch error:', err))
      } else {
        setPerfil(null)
      }
      setLoading(false)
    })
    
    return () => { 
      mounted = false
      subscription?.unsubscribe() 
    }
  }, [fetchPerfil])

  const user = session?.user ?? null

  const signInWithPassword = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    }, [])

  const signUp = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const emailNorm = email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signUp({
        email: emailNorm,
        password,
        options: { emailRedirectTo: urlRedirectoAuth() },
      })
      if (error) throw error
      if (esUsuarioDuplicadoSinError(data.user)) lanzarErrorEmailDuplicado()
      return { session: data.session, user: data.user }
    }, [])

  const signInWithGoogle = useCallback(async (options?: { fromOnboarding?: boolean }) => {
    const fromOnboarding = options?.fromOnboarding === true
    if (fromOnboarding) {
      const { prepararBorradorParaOAuthOnboarding } = await import('../pages/onboarding/hooks/helpers')
      prepararBorradorParaOAuthOnboarding()
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: urlRedirectoPostOAuth(fromOnboarding) },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    localStorage.removeItem('orvalya_onboarding_draft')
    sessionStorage.removeItem('orvalya_onboarding_draft')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ loading, session, user, perfil, setPerfil, signInWithPassword, signUp, signInWithGoogle, signOut }),
    [loading, session, user, perfil, setPerfil, signInWithPassword, signUp, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}