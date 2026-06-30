import type { Perfil } from '../contexts/AuthContextType'

/** Admin temporal por email. Reemplazar por es_admin en BD cuando haya panel de roles. */
export const ADMIN_EMAIL = 'lourdes.graciela.mendaro@gmail.com'

export function esAdminPlataforma(
  email: string | null | undefined,
  perfil?: Pick<Perfil, 'es_admin'> | null,
): boolean {
  if (perfil?.es_admin) return true
  return email?.trim().toLowerCase() === ADMIN_EMAIL
}
