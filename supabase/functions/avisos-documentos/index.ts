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

type AvisoEmail = {
  id: string
  prestador_id: string
  titulo: string
  cuerpo: string
}

async function sendResendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('AVISOS_FROM_EMAIL') ?? 'Orvalya <avisos@orvalya.com>'
  if (!apiKey) {
    console.warn('RESEND_API_KEY no configurada — se omiten emails')
    return false
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
    }),
  })

  if (!res.ok) {
    console.error('Resend error:', await res.text())
    return false
  }
  return true
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Método no permitido' }, 405)
  }

  // Proteger con secret opcional (cron / GitHub Action)
  const cronSecret = Deno.env.get('AVISOS_CRON_SECRET')
  if (cronSecret) {
    const header = req.headers.get('x-cron-secret')
    if (header !== cronSecret) {
      return json({ ok: false, error: 'No autorizado' }, 401)
    }
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const admin = createClient(supabaseUrl, getServiceRoleKey())

    const { data: generated, error: genErr } = await admin.rpc('generar_avisos_documentos')
    if (genErr) {
      console.error('generar_avisos_documentos:', genErr)
      return json({ ok: false, error: genErr.message }, 500)
    }

    const { data: pending, error: pendErr } = await admin
      .from('avisos_documentos')
      .select('id, prestador_id, titulo, cuerpo')
      .eq('canal', 'email')
      .is('leido_at', null)
      .order('enviado_en', { ascending: true })
      .limit(50)

    if (pendErr) {
      console.error('fetch email avisos:', pendErr)
      return json({ ok: false, error: pendErr.message }, 500)
    }

    let emailsSent = 0
    const avisos = (pending ?? []) as AvisoEmail[]

    for (const aviso of avisos) {
      const { data: perfil } = await admin
        .from('perfiles')
        .select('email')
        .eq('id', aviso.prestador_id)
        .maybeSingle()

      const email = perfil?.email?.trim()
      if (!email) {
        await admin.from('avisos_documentos').update({ leido_at: new Date().toISOString() }).eq('id', aviso.id)
        continue
      }

      const sent = await sendResendEmail(
        email,
        aviso.titulo,
        `${aviso.cuerpo}\n\nEntrá a Orvalya → Documentos para actualizarlo.\nhttps://orvalya.com/dashboard`,
      )

      if (sent) {
        emailsSent += 1
        await admin.from('avisos_documentos').update({ leido_at: new Date().toISOString() }).eq('id', aviso.id)
      }
    }

    return json({
      ok: true,
      avisos_generados: generated ?? 0,
      emails_enviados: emailsSent,
      emails_pendientes: avisos.length - emailsSent,
    })
  } catch (err) {
    console.error(err)
    return json({ ok: false, error: err instanceof Error ? err.message : 'Error interno' }, 500)
  }
})
