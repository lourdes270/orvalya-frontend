/** Llamados creados por Playwright E2E usan títulos con este prefijo. */
export const PREFIJO_LLAMADO_E2E = 'E2E '

export function esLlamadoDePrueba(titulo: string): boolean {
  return titulo.startsWith(PREFIJO_LLAMADO_E2E)
}
