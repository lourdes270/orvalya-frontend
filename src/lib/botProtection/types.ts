export interface RegistrationBotPayload {
  captchaToken: string
  honeypot: string
}

export type RegistrationGuardResult =
  | { ok: true }
  | { ok: false; kind: 'honeypot' }
  | { ok: false; kind: 'error'; message: string }
