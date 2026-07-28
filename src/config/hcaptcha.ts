// next.config.ts re-expone VITE_HCAPTCHA_SITE_KEY con este nombre, y la deja en ''
// cuando falta, así que normalizamos para que requireHcaptchaSiteKey avise.
export const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || undefined

export function requireHcaptchaSiteKey(): string {
  if (!HCAPTCHA_SITE_KEY) {
    throw new Error(
      'Falta VITE_HCAPTCHA_SITE_KEY en .env. Configurala para habilitar el registro protegido.',
    )
  }
  return HCAPTCHA_SITE_KEY
}
