/** Best-effort: IP pública vía servicio externo; puede fallar o quedar null. */
export async function fetchClientIp(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const data = (await res.json()) as { ip?: string }
    return data.ip ?? null
  } catch {
    return null
  }
}

export function getUserAgent(): string | null {
  return typeof navigator !== 'undefined' ? navigator.userAgent : null
}
