import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_MSG = 'Demasiados intentos. Esperá 15 minutos e intentá de nuevo.'
const CAPTCHA_VENCIDO_MSG = 'El captcha venció. Marcá la casilla otra vez y tocá Crear perfil.'
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 12

function esCaptchaVencido(codes: unknown): boolean {
  if (!Array.isArray(codes)) return false
  return codes.some((code) =>
    code === 'expired-input-response'
    || code === 'invalid-input-response'
    || code === 'timeout-or-duplicate'
  )
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? req.headers.get('cf-connecting-ip') ?? 'unknown'
}

function getServiceRoleKey(): string {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (legacy) return legacy

  const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (secretKeysRaw) {
    const parsed = JSON.parse(secretKeysRaw) as Record<string, string>
    return parsed.service_role ?? parsed.secret ?? Object.values(parsed)[0]
  }

  throw new Error('Service role key no disponible')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ success: false, error: 'Método no permitido' }, 405)
  }

  try {
    const { token, endpoint = 'register' } = await req.json()
    if (!token || typeof token !== 'string') {
      return json({ success: false, error: 'Token captcha requerido' }, 400)
    }

    const secret = Deno.env.get('HCAPTCHA_SECRET_KEY')
    if (!secret) {
      console.error('HCAPTCHA_SECRET_KEY no configurada')
      return json({ success: false, error: 'Configuración incompleta' }, 500)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = getServiceRoleKey()
    const admin = createClient(supabaseUrl, serviceKey)

    const ip = getClientIp(req)
    const since = new Date(Date.now() - WINDOW_MS).toISOString()

    const { count, error: countError } = await admin
      .from('rate_limit_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('endpoint', endpoint)
      .eq('ip_address', ip)
      .gte('attempted_at', since)

    if (countError) {
      console.error('rate_limit count error:', countError)
      return json({ success: false, error: 'Error interno' }, 500)
    }

    if ((count ?? 0) >= MAX_ATTEMPTS) {
      return json({ success: false, error: RATE_LIMIT_MSG }, 429)
    }

    const verifyRes = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })

    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      const codes = verifyData['error-codes']
      if (esCaptchaVencido(codes)) {
        return json({ success: false, error: CAPTCHA_VENCIDO_MSG }, 400)
      }
      console.warn('hcaptcha verify failed:', codes)
      const { error: insertError } = await admin.from('rate_limit_attempts').insert({ ip_address: ip, endpoint })
      if (insertError) console.error('rate_limit insert error:', insertError)
      return json({ success: false, error: 'No pudimos verificar el captcha. Intentá de nuevo.' }, 400)
    }

    const { error: insertError } = await admin.from('rate_limit_attempts').insert({ ip_address: ip, endpoint })
    if (insertError) {
      console.error('rate_limit insert error:', insertError)
    }

    return json({ success: true })
  } catch (err) {
    console.error('verify-captcha error:', err)
    return json({ success: false, error: 'Error interno' }, 500)
  }
})
