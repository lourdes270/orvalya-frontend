/**
 * IP del cliente: no usamos servicios externos (CSP, redes lentas, celulares modestos).
 * El campo ip_address en aceptaciones_legales queda null; es opcional para auditoría.
 */
export async function fetchClientIp(): Promise<string | null> {
  return null
}

export function getUserAgent(): string | null {
  return typeof navigator !== 'undefined' ? navigator.userAgent : null
}
