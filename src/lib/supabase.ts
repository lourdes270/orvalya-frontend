import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
    'En local van en .env; en Vercel, en Settings > Environment Variables, ' +
    'habilitadas para Preview y no solo para Production: si no, el build de ' +
    'los PR falla al prerenderizar /sitemap.xml. ' +
    'next.config.ts las re-expone como NEXT_PUBLIC_*.'
  )
}

export const SUPABASE_URL_PUBLIC = SUPABASE_URL
export const SUPABASE_ANON_KEY_PUBLIC = SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
