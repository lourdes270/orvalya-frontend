import { supabase } from './supabase'

export async function uploadAvatar(userId: string, blob: Blob): Promise<string | null> {
  const path = `${userId}/avatar.jpg`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })

  if (uploadError) {
    console.error('uploadAvatar:', uploadError.message)
    return null
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // Cache-buster: misma ruta en storage; sin query la UI puede seguir mostrando la foto vieja.
  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from('perfiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  if (updateError) {
    console.error('update avatar_url:', updateError.message)
    return null
  }

  return avatarUrl
}
