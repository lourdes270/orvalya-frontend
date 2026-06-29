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
  esCallbackAuth,
  getOnboardingResumePath,
  intentarCompletarOnboardingPendiente,
  limpiarUrlOAuth,
  prepararBorradorParaOAuthOnboarding,
  restaurarBorradorOnboardingSiFalta,
} from '../pages/onboarding/hooks/helpers'

const CALLBACK_TIMEOUT_MS = 12_000

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
  const [postAuthPending, setPostAuthPending] = useState(() => esCallbackAuth())
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const callbackHandled = useRef(false)
  const esperandoCallback = useRef(esCallbackAuth())

  const fetchPerfil = useCallback(async (userId: string) => {
    try {
      const data = await fetchPerfilData(userId)
      setPerfil(data)
    } catch (err) {
      console.error('fetchPerfil catch:', err)
      setPerfil(null)
    }
  }, [])

  const finalizarCallback = useCallback(() => {
    limpiarUrlOAuth()
    esperandoCallback.current = false
    setPostAuthPending(false)
  }, [])

  const enrutarTrasAutenticacion = useCallback(async (activeSession: Session) => {
    const user = activeSession.user
    restaurarBorradorOnboardingSiFalta()

    let perfilData = await fetchPerfilData(user.id)
    if (!perfilData) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      perfilData = await fetchPerfilData(user.id)
    }
    if (perfilData) setPerfil(perfilData)

    if (window.location.pathname.startsWith('/onboarding')) return

    if (perfilData && perfilData.tipo !== 'pendiente') {
      navigate('/dashboard', { replace: true })
      return
    }

    const result = await intentarCompletarOnboardingPendiente(user, setPerfil, navigate)
    if (result !== 'sin_datos') return

    navigate(getOnboardingResumePath(user), { replace: true })
  }, [navigate])

  const procesarCallbackAuth = useCallback(async (activeSession: Session | null) => {
    if (!esperandoCallback.current && !esCallbackAuth()) return
    if (callbackHandled.current) return
    if (!activeSession?.user) return

    callbackHandled.current = true
    setPostAuthPending(true)

    try {
      await enrutarTrasAutenticacion(activeSession)
    } catch (err) {
      console.error('procesarCallbackAuth error:', err)
    } finally {
      finalizarCallback()
    }
  }, [enrutarTrasAutenticacion, finalizarCallback])

  useEffect(() => {
    let mounted = true
    let callbackTimeout: ReturnType<typeof setTimeout> | undefined

    const liberarSiCallbackFallido = () => {
      if (!mounted || !esperandoCallback.current || callbackHandled.current) return
      console.warn('Callback de auth sin sesión; liberando pantalla de carga.')
      finalizarCallback()
    }

    if (esperandoCallback.current) {
      callbackTimeout = setTimeout(liberarSiCallbackFallido, CALLBACK_TIMEOUT_MS)
    }

    const initSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setSession(null)
          return
        }

        setSession(initialSession)

        if (initialSession?.user) {
          if (esperandoCallback.current || esCallbackAuth()) {
            await procesarCallbackAuth(initialSession)
          } else {
            fetchPerfil(initialSession.user.id).catch(err => console.error('BG fetch error:', err))
          }
        } else if (esCallbackAuth()) {
          // Hash presente pero sesión aún no lista: onAuthStateChange la procesará.
          setPostAuthPending(true)
        } else {
          setPostAuthPending(false)
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
        const esRetornoAuth = esperandoCallback.current || esCallbackAuth()
        if (esRetornoAuth && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
          await procesarCallbackAuth(nextSession)
        } else if (!callbackHandled.current) {
          fetchPerfil(nextSession.user.id).catch(err => console.error('BG fetch error:', err))
        }
      } else {
        setPerfil(null)
        callbackHandled.current = false
        if (!esCallbackAuth()) {
          setPostAuthPending(false)
          esperandoCallback.current = false
        }
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      if (callbackTimeout) clearTimeout(callbackTimeout)
      subscription?.unsubscribe()
    }
  }, [fetchPerfil, finalizarCallback, procesarCallbackAuth])

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
    callbackHandled.current = false
    esperandoCallback.current = true
    setPostAuthPending(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: urlRedirectoPostOAuth(fromOnboarding) },
    })
    if (error) {
      esperandoCallback.current = false
      setPostAuthPending(false)
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    localStorage.removeItem('orvalya_onboarding_draft')
    sessionStorage.removeItem('orvalya_onboarding_draft')
    callbackHandled.current = false
    esperandoCallback.current = false
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ loading, postAuthPending, session, user, perfil, setPerfil, signInWithPassword, signUp, signInWithGoogle, signOut }),
    [loading, postAuthPending, session, user, perfil, setPerfil, signInWithPassword, signUp, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
