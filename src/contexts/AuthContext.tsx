import {
  useCallback, useEffect,
  useMemo, useRef, useState, type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthContextValue, type Perfil } from './AuthContextType'
import { esUsuarioDuplicadoSinError, lanzarErrorEmailDuplicado, urlRedirectoAuth, urlRedirectoPostOAuth } from '../lib/validaciones'
import {
  esCallbackOAuth,
  getOnboardingResumePath,
  limpiarUrlOAuth,
  prepararBorradorParaOAuthOnboarding,
  restaurarBorradorOnboardingSiFalta,
} from '../pages/onboarding/hooks/helpers'

async function fetchPerfilData(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return (data ?? null) as Perfil | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [postAuthPending, setPostAuthPending] = useState(() => esCallbackOAuth())
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const oauthHandled = useRef(false)

  const fetchPerfil = useCallback(async (userId: string) => {
    try {
      const data = await fetchPerfilData(userId)
      setPerfil(data)
    } catch (err) {
      console.error('fetchPerfil catch:', err)
      setPerfil(null)
    }
  }, [])

  const redirigirTrasGoogle = useCallback(async (userId: string) => {
    if (oauthHandled.current) return
    oauthHandled.current = true
    setPostAuthPending(true)

    try {
      restaurarBorradorOnboardingSiFalta()

      let perfilData = await fetchPerfilData(userId)
      if (!perfilData) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        perfilData = await fetchPerfilData(userId)
      }
      if (perfilData) setPerfil(perfilData)

      const enOnboarding = window.location.pathname.startsWith('/onboarding')
      if (enOnboarding) return

      if (perfilData && perfilData.tipo !== 'pendiente') {
        navigate('/dashboard', { replace: true })
        return
      }

      navigate(getOnboardingResumePath(), { replace: true })
    } finally {
      limpiarUrlOAuth()
      setPostAuthPending(false)
    }
  }, [navigate])

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
            if (esCallbackOAuth()) {
              await redirigirTrasGoogle(session.user.id)
            } else {
              fetchPerfil(session.user.id).catch(err => console.error('BG fetch error:', err))
            }
          } else if (esCallbackOAuth()) {
            setPostAuthPending(false)
            limpiarUrlOAuth()
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      if (nextSession?.user) {
        if (event === 'SIGNED_IN' && esCallbackOAuth()) {
          await redirigirTrasGoogle(nextSession.user.id)
        } else {
          fetchPerfil(nextSession.user.id).catch(err => console.error('BG fetch error:', err))
        }
      } else {
        setPerfil(null)
        oauthHandled.current = false
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [fetchPerfil, redirigirTrasGoogle])

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
    if (fromOnboarding) prepararBorradorParaOAuthOnboarding()
    oauthHandled.current = false
    setPostAuthPending(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: urlRedirectoPostOAuth(fromOnboarding) },
    })
    if (error) {
      setPostAuthPending(false)
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    localStorage.removeItem('orvalya_onboarding_draft')
    sessionStorage.removeItem('orvalya_onboarding_draft')
    oauthHandled.current = false
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ loading, postAuthPending, session, user, perfil, setPerfil, signInWithPassword, signUp, signInWithGoogle, signOut }),
    [loading, postAuthPending, session, user, perfil, setPerfil, signInWithPassword, signUp, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
