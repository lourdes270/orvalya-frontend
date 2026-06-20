import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan variables VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
    'Configuralas en .env en la raíz del proyecto (Vite no lee src/.env).'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
