import { supabase } from './supabase'

export type UploadAvatarResult =
  | { ok: true; url: string }
  | { ok: false; message: string }

function pathDesdeUrlPublica(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null
  try {
    const u = new URL(avatarUrl)
    const marker = '/storage/v1/object/public/avatars/'
    const idx = u.pathname.indexOf(marker)
    if (idx < 0) return null
    return decodeURIComponent(u.pathname.slice(idx + marker.length))
  } catch {
    return null
  }
}

/**
 * Sube un avatar nuevo con ruta única (evita cache CDN y problemas de upsert).
 */
export async function uploadAvatar(
  userId: string,
  blob: Blob,
  avatarUrlAnterior?: string | null,
): Promise<UploadAvatarResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.id) {
    return { ok: false, message: 'Tu sesión expiró. Cerrá sesión e ingresá de nuevo.' }
  }

  if (user.id !== userId) {
    return { ok: false, message: 'No se pudo verificar tu cuenta para subir la foto.' }
  }

  const path = `${user.id}/avatar-${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, blob, {
      upsert: false,
      contentType: 'image/jpeg',
      cacheControl: '31536000',
    })

  if (uploadError) {
    console.error('uploadAvatar:', uploadError.message)
    return {
      ok: false,
      message: `No se pudo subir la imagen: ${uploadError.message}`,
    }
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const avatarUrl = data.publicUrl

  const { data: updated, error: updateError } = await supabase
    .from('perfiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)
    .select('avatar_url')
    .maybeSingle()

  if (updateError) {
    console.error('update avatar_url:', updateError.message)
    return {
      ok: false,
      message: `La imagen subió, pero no se guardó en tu perfil: ${updateError.message}`,
    }
  }

  if (!updated?.avatar_url) {
    return {
      ok: false,
      message: 'La imagen subió, pero el perfil no se actualizó. Probá cerrar sesión e ingresar de nuevo.',
    }
  }

  // Limpieza best-effort del archivo anterior (misma carpeta del usuario)
  const anterior = pathDesdeUrlPublica(avatarUrlAnterior)
  if (anterior && anterior !== path && anterior.startsWith(`${user.id}/`)) {
    void supabase.storage.from('avatars').remove([anterior])
  }

  return { ok: true, url: updated.avatar_url }
}
