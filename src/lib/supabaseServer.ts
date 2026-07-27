import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY_PUBLIC, SUPABASE_URL_PUBLIC } from './supabase'

/**
 * Cliente para Server Components. Solo lee datos públicos vía RPC con el rol `anon`,
 * así que no necesita sesión ni cookies; sin persistencia para no compartir estado
 * entre requests del servidor.
 */
export const supabaseServer: SupabaseClient = createClient(
  SUPABASE_URL_PUBLIC,
  SUPABASE_ANON_KEY_PUBLIC,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-orvalya-render': 'server' } },
  },
)
