import { supabase } from '../supabase'

const RATE_LIMIT_MSG = 'Demasiados intentos. Esperá 15 minutos e intentá de nuevo.'
export const CAPTCHA_VENCIDO_MSG = 'El captcha venció. Marcá la casilla otra vez y tocá Crear perfil.'

function extractErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const err = (data as { error?: string }).error
    if (err === RATE_LIMIT_MSG) return RATE_LIMIT_MSG
    if (err === CAPTCHA_VENCIDO_MSG) return CAPTCHA_VENCIDO_MSG
    if (err) return err
  }
  return fallback
}

export async function verifyCaptchaToken(token: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data, error } = await supabase.functions.invoke('verify-captcha', {
    body: { token, endpoint: 'register' },
  })

  if (data?.success) return { ok: true }

  if (data?.error === RATE_LIMIT_MSG || error?.message?.includes('429')) {
    return { ok: false, message: RATE_LIMIT_MSG }
  }

  if (error) {
    const ctx = (error as { context?: { json?: () => Promise<unknown> } }).context
    if (ctx?.json) {
      try {
        const body = await ctx.json()
        return { ok: false, message: extractErrorMessage(body, 'No pudimos verificar el captcha. Intentá de nuevo.') }
      } catch {
        /* ignore parse errors */
      }
    }
    return { ok: false, message: extractErrorMessage(data, 'No pudimos verificar el captcha. Intentá de nuevo.') }
  }

  return { ok: false, message: extractErrorMessage(data, 'Verificación captcha fallida. Intentá de nuevo.') }
}
