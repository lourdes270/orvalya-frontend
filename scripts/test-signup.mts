/**
 * E2E parcial: verifica signUp de Supabase (sin UI captcha).
 * El gate captcha se prueba aparte vía verify-captcha + runRegistrationGuard.
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL!
const anon = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(url, anon)

const email = `test.bot.${Date.now()}@test.orvalya.com`
const password = 'Test123456!'

async function main() {
  console.log('SIGNUP_EMAIL:', email)

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    console.log('SIGNUP_ERROR:', error.message)
    process.exit(1)
  }
  console.log('SIGNUP_OK:', data.user?.id ?? 'no-user-id')
}

main()
