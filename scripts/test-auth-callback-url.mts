/**
 * Genera una URL de callback (#access_token=...) para probar el flujo post-confirmación.
 * Requiere .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const envPath = resolve(import.meta.dirname, '../.env')
  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !anon) {
  console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env')
  process.exit(1)
}

const supabase = createClient(url, anon)
const email = `callback.test.${Date.now()}@test.orvalya.com`
const password = 'Test123456!'

async function main() {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: 'http://localhost:5173/auth' },
  })

  if (signUpError) {
    console.error('SIGNUP_ERROR:', signUpError.message)
    process.exit(1)
  }

  let session = signUpData.session

  if (!session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      console.log('NO_SESSION')
      console.log('EMAIL:', email)
      console.log('REASON:', signInError.message)
      console.log('HINT: Confirm email está activo — probá con usuario existente confirmado.')
      process.exit(2)
    }
    session = signInData.session
  }

  if (!session) {
    console.error('Sin sesión disponible')
    process.exit(1)
  }

  const { access_token, refresh_token, expires_in, token_type } = session
  const hash = new URLSearchParams({
    access_token,
    refresh_token,
    expires_in: String(expires_in),
    token_type,
    type: 'signup',
  })

  console.log('CALLBACK_URL:http://localhost:5173/auth#' + hash.toString())
  console.log('USER_ID:' + session.user.id)
  console.log('EMAIL:' + email)

  await supabase.auth.signOut()
}

main()
