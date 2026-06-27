const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MENSAJE_CONTRASENA =
  'La contraseña debe tener al menos 8 caracteres, incluir una mayúscula y un número.'

export const MENSAJE_EMAIL_DUPLICADO =
  'Este email ya está registrado. ¿Querés iniciar sesión?'

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
  if (typeof e.message === 'string' && /already (been )?registered/i.test(e.message)) return true
  if (e.status === 422 && typeof e.message === 'string' && /registered/i.test(e.message)) return true
  return false
}

export function mensajeErrorAuth(err: unknown, fallback: string): string {
  if (esErrorEmailDuplicado(err)) return MENSAJE_EMAIL_DUPLICADO
  if (err instanceof Error && err.message) return err.message
  return fallback
}
