import { logHoneypotAttempt } from './honeypotLog'

export type ProfileHoneypotSource = 'perfil-prestador' | 'perfil-contratante'

export function isProfileHoneypotTriggered(
  honeypot: string,
  source: ProfileHoneypotSource,
): boolean {
  if (honeypot.trim().length === 0) return false
  logHoneypotAttempt(source)
  return true
}
