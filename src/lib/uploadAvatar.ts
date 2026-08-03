import { supabase } from './supabase'

export type UploadAvatarResult =
  | { ok: true; url: string }
  | { ok: false; message: string }

async function uploadToPath(path: string, blob: Blob) {
  return supabase.storage
    .from('avatars')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' })
}

/**
 * Sube/reemplaza el avatar del prestador.
 * Si el upsert falla (p. ej. política UPDATE sin WITH CHECK), borra e inserta de nuevo.
 */
export async function uploadAvatar(userId: string, blob: Blob): Promise<UploadAvatarResult> {
  const path = `${userId}/avatar.jpg`

  let { error: uploadError } = await uploadToPath(path, blob)

  if (uploadError) {
    // Fallback: borrar el archivo viejo e insertar (evita depender del upsert)
    await supabase.storage.from('avatars').remove([path])
    const retry = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: false, contentType: 'image/jpeg', cacheControl: '3600' })
    uploadError = retry.error
  }

  if (uploadError) {
    console.error('uploadAvatar:', uploadError.message)
    return {
      ok: false,
      message: 'No se pudo subir la imagen al servidor. Probá de nuevo en unos segundos.',
    }
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // Cache-buster: misma ruta; sin query la UI puede seguir mostrando la foto vieja.
  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from('perfiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  if (updateError) {
    console.error('update avatar_url:', updateError.message)
    return {
      ok: false,
      message: 'La imagen subió, pero no se pudo guardar en tu perfil. Intentá de nuevo.',
    }
  }

  return { ok: true, url: avatarUrl }
}
