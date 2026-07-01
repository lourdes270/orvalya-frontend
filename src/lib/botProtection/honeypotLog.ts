export function logHoneypotAttempt(
  source: 'auth-register' | 'onboarding-step4' | 'perfil-prestador' | 'perfil-contratante',
) {
  console.warn('[bot-protection] honeypot triggered', {
    source,
    at: new Date().toISOString(),
  })
}
