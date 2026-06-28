const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MENSAJE_CONTRASENA =
  'La contraseña debe tener al menos 8 caracteres, incluir una mayúscula y un número.'

export const MENSAJE_CONFIRMACION_EMAIL =
  '¡Listo! Te enviamos un email para confirmar tu cuenta.'

export const MENSAJE_EMAIL_DUPLICADO =
  'Este email ya está registrado. ¿Querés iniciar sesión?'

const ERROR_EMAIL_DUPLICADO = {
  message: 'User already registered',
  code: 'user_already_exists',
  status: 400,
} as const

export function esUsuarioDuplicadoSinError(
  user: { identities?: { id: string }[] } | null | undefined,
): boolean {
  return !!user && Array.isArray(user.identities) && user.identities.length === 0
}

export function lanzarErrorEmailDuplicado(): never {
  throw { ...ERROR_EMAIL_DUPLICADO }
}

export function esMensajeEmailDuplicado(mensaje: string): boolean {
  return mensaje === MENSAJE_EMAIL_DUPLICADO
}

export function esMensajeConfirmacionEmail(mensaje: string): boolean {
  return mensaje === MENSAJE_CONFIRMACION_EMAIL
}

export function urlRedirectoAuth(): string {
  return `${window.location.origin}/auth`
}

/** Tras OAuth (Google): ProtectedRoute envía a /aceptar-terminos o muestra /dashboard. */
export function urlRedirectoPostOAuth(): string {
  return `${window.location.origin}/dashboard`
}

export function validarEmail(valor: string): string | null {
  const trimmed = valor.trim()
  if (!trimmed) return 'El email es obligatorio.'
  if (!trimmed.includes('@')) return 'Ingresá un email válido con @ y dominio.'
  const [, dominio] = trimmed.split('@')
  if (!dominio || !dominio.includes('.')) return 'Ingresá un email válido con @ y dominio.'
  if (!EMAIL_REGEX.test(trimmed)) return 'Ingresá un email válido con @ y dominio.'
  return null
}

export function validarContrasena(valor: string): string | null {
  if (valor.length < 8 || !/[A-Z]/.test(valor) || !/\d/.test(valor)) {
    return MENSAJE_CONTRASENA
  }
  return null
}

export function normalizarTelefono(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function validarTelefono(
  valor: string,
  opciones?: { requerido?: boolean; etiqueta?: string },
): string | null {
  const etiqueta = opciones?.etiqueta ?? 'teléfono'
  const trimmed = valor.trim()
  if (!trimmed) {
    return opciones?.requerido ? `El ${etiqueta} es obligatorio.` : null
  }
  if (/[^\d\s\-()+ ]/.test(trimmed)) {
    return `El ${etiqueta} solo puede contener números.`
  }
  const digitos = normalizarTelefono(trimmed)
  if (digitos.length < 8) {
    return `El ${etiqueta} debe tener al menos 8 dígitos.`
  }
  if (digitos.length > 15) {
    return `El ${etiqueta} no puede superar los 15 dígitos.`
  }
  return null
}

export function esErrorEmailDuplicado(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const e = err as { message?: string; code?: string; status?: number }
  if (e.code === 'user_already_exists') return true
  if (typeof e.message === 'string') {
    if (/already (been )?registered/i.test(e.message)) return true
    if (/email.*already.*(exists|registered|in use)/i.test(e.message)) return true
  }
  if (
    (e.status === 400 || e.status === 422) &&
    typeof e.message === 'string' &&
    /registered|already exists/i.test(e.message)
  ) {
    return true
  }
  return false
}

function traducirMensajeAuth(mensaje: string): string {
  const normalizado = mensaje.toLowerCase()
  if (/email not confirmed|confirm your email|email.*not.*confirmed/.test(normalizado)) {
    return 'Tenés que confirmar tu email antes de iniciar sesión. Revisá tu bandeja de entrada.'
  }
  if (/already (been )?registered|already exists|user.*registered/.test(normalizado)) {
    return MENSAJE_EMAIL_DUPLICADO
  }
  if (/invalid login credentials/.test(normalizado)) {
    return 'Email o contraseña incorrectos.'
  }
  if (/password.*(least|weak|short)|weak password/.test(normalizado)) {
    return MENSAJE_CONTRASENA
  }
  if (/invalid.*email|email.*invalid/.test(normalizado)) {
    return 'Ingresá un email válido con @ y dominio.'
  }
  if (/signup.*disabled|signups not allowed/.test(normalizado)) {
    return 'El registro no está habilitado en este momento.'
  }
  if (/rate limit|too many requests/.test(normalizado)) {
    return 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
  }
  return mensaje
}

export function mensajeErrorAuth(err: unknown, fallback: string): string {
  if (esErrorEmailDuplicado(err)) return MENSAJE_EMAIL_DUPLICADO
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message?: string }).message
    if (typeof msg === 'string' && msg.trim()) return traducirMensajeAuth(msg)
  }
  if (err instanceof Error && err.message) return traducirMensajeAuth(err.message)
  return fallback
}
