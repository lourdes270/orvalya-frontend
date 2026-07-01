import type { Perfil } from '../contexts/AuthContextType'

/** Admin de plataforma: solo el flag es_admin en BD (ver migración 008/011). */
export function esAdminPlataforma(
  _email: string | null | undefined,
  perfil?: Pick<Perfil, 'es_admin'> | null,
): boolean {
  return perfil?.es_admin === true
}
