export const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY as string | undefined

export function requireHcaptchaSiteKey(): string {
  if (!HCAPTCHA_SITE_KEY) {
    throw new Error(
      'Falta VITE_HCAPTCHA_SITE_KEY en .env. Configurala para habilitar el registro protegido.',
    )
  }
  return HCAPTCHA_SITE_KEY
}
