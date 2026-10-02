import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
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

function getAnonKey(): string {
  const legacy = Deno.env.get('SUPABASE_ANON_KEY')
  if (legacy) return legacy
  const publishableRaw = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  if (publishableRaw) {
    const parsed = JSON.parse(publishableRaw) as Record<string, string>
    return parsed.anon ?? parsed.publishable ?? Object.values(parsed)[0]
  }
  throw new Error('Anon key no disponible')
}

function bearerToken(req: Request): string {
  const header = req.headers.get('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return ''
  return header.slice('Bearer '.length).trim()
}

function esRateLimit(error: { code?: string; message?: string }): boolean {
  return error.code === 'P0001' || (error.message ?? '').includes('rate_limit_exceeded')
}

async function sendResendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('AVISOS_FROM_EMAIL') ?? 'Orvalya <avisos@orvalya.com>'
  if (!apiKey) {
    console.warn('RESEND_API_KEY no configurada — se omite el email')
    return false
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  })

  if (!res.ok) {
    console.error('Resend error:', await res.text())
    return false
  }
  return true
}

/**
 * Se llama desde el cliente (contratante autenticado) justo después de publicar
 * un llamado. Solo recibe el id: todo lo demás se re-lee acá con service role
 * para no confiar en texto que mande el cliente en el cuerpo del mail.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Método no permitido' }, 405)
  }

  // Autenticación: hay un JWT y Auth confirma que corresponde a un usuario.
  const token = bearerToken(req)
  if (!token) {
    return json({ ok: false, error: 'No autorizado' }, 401)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const userClient = createClient(supabaseUrl, getAnonKey(), {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser(token)
    if (userErr || !userData.user) {
      return json({ ok: false, error: 'No autorizado' }, 401)
    }
    const user = userData.user

    const { llamado_id } = await req.json()
    if (!llamado_id || typeof llamado_id !== 'string') {
      return json({ ok: false, error: 'llamado_id requerido' }, 400)
    }

    const admin = createClient(supabaseUrl, getServiceRoleKey())

    const { data: llamado, error: llamadoErr } = await admin
      .from('llamados')
      .select('id, titulo, descripcion, rubro, zona, estado, created_at, contratante_id')
      .eq('id', llamado_id)
      .maybeSingle()

    if (llamadoErr || !llamado) {
      return json({ ok: false, error: 'Llamado no encontrado' }, 404)
    }

    // Autorización: el JWT identifica a alguien; esto exige que sea el dueño.
    if (llamado.contratante_id !== user.id) {
      return json({ ok: false, error: 'Prohibido' }, 403)
    }

    const { error: limitErr } = await admin.rpc('enforce_notificar_llamado_limits', {
      p_user: user.id,
      p_llamado: llamado_id,
    })
    if (limitErr) {
      if (esRateLimit(limitErr)) {
        return json({ ok: false, error: 'rate_limit_exceeded' }, 429)
      }
      console.error('enforce_notificar_llamado_limits:', limitErr)
      return json({ ok: false, error: limitErr.message }, 500)
    }

    const { data: contratante } = await admin
      .from('contratantes')
      .select('nombre_empresa')
      .eq('id', llamado.contratante_id)
      .maybeSingle()

    const { data: admins, error: adminsErr } = await admin
      .from('perfiles')
      .select('email')
      .eq('es_admin', true)

    if (adminsErr) {
      console.error('fetch admins:', adminsErr)
      return json({ ok: false, error: adminsErr.message }, 500)
    }

    const destinatarios = (admins ?? [])
      .map(a => a.email?.trim())
      .filter((e): e is string => !!e)

    if (destinatarios.length === 0) {
      console.warn('Sin admins con email para notificar')
      return json({ ok: true, emails_enviados: 0 })
    }

    const empresa = contratante?.nombre_empresa ?? 'Empresa sin nombre'
    const subject = `Nuevo llamado publicado: ${llamado.titulo}`
    const text =
      `${empresa} publicó un llamado nuevo, ya está activo y visible en el sitio.\n\n` +
      `Título: ${llamado.titulo}\n` +
      `Rubro: ${llamado.rubro}\n` +
      `Zona: ${llamado.zona}\n` +
      `Descripción: ${llamado.descripcion}\n\n` +
      `Revisalo acá: https://www.orvalya.com/admin/moderacion`

    let enviados = 0
    for (const email of destinatarios) {
      const ok = await sendResendEmail(email, subject, text)
      if (ok) enviados += 1
    }

    return json({ ok: true, emails_enviados: enviados, emails_totales: destinatarios.length })
  } catch (err) {
    console.error(err)
    return json({ ok: false, error: err instanceof Error ? err.message : 'Error interno' }, 500)
  }
})
