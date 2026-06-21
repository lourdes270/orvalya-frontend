import type { RegistrationBotPayload, RegistrationGuardResult } from './types'
import { logHoneypotAttempt } from './honeypotLog'
import { verifyCaptchaToken } from './verifyCaptcha'

export async function runRegistrationGuard(
  payload: RegistrationBotPayload,
  source: 'auth-register' | 'onboarding-step4',
): Promise<RegistrationGuardResult> {
  if (payload.honeypot.trim().length > 0) {
    logHoneypotAttempt(source)
    return { ok: false, kind: 'honeypot' }
  }

  if (!payload.captchaToken) {
    return { ok: false, kind: 'error', message: 'Completá la verificación captcha antes de continuar.' }
  }

  const captcha = await verifyCaptchaToken(payload.captchaToken)
  if (!captcha.ok) {
    return { ok: false, kind: 'error', message: captcha.message }
  }

  return { ok: true }
}

export const FAKE_REGISTRATION_SUCCESS_MSG =
  'Te enviamos un correo para confirmar tu cuenta. Revisá tu bandeja de entrada.'
