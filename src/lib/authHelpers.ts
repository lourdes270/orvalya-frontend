import type { User } from '@supabase/supabase-js'

export function usuarioUsaEmailPassword(user: User | null | undefined): boolean {
  if (!user) return false
  const providers = user.app_metadata?.providers
  if (Array.isArray(providers) && providers.includes('email')) return true
  return user.identities?.some(i => i.provider === 'email') ?? false
}

export function usuarioUsaGoogle(user: User | null | undefined): boolean {
  if (!user) return false
  const providers = user.app_metadata?.providers
  if (Array.isArray(providers) && providers.includes('google')) return true
  return user.identities?.some(i => i.provider === 'google') ?? false
}

export function urlRedirectoResetPassword(): string {
  return `${window.location.origin}/auth/restablecer-contrasena`
}

export function esFlujoRecuperacionContrasena(): boolean {
  const hash = window.location.hash
  return hash.includes('type=recovery')
}
