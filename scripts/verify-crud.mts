import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.e2e' })

const url = process.env.E2E_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !serviceKey || !anonKey) {
  console.error('Faltan credenciales en .env.e2e')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  const tables = [
    'perfiles',
    'documentos',
    'aceptaciones_legales',
    'contratantes',
    'llamados',
    'contratos',
    'reportes_llamados',
  ]

  console.log('=== TABLAS (service_role) ===')
  for (const table of tables) {
    const result = await admin.from(table).select('*', { count: 'exact', head: true })
    const { count, error, status, statusText } = result as typeof result & { status?: number; statusText?: string }
    console.log(
      `${table}: ${error ? `ERROR ${error.code ?? status ?? '?'} ${error.message ?? statusText ?? JSON.stringify(error)}` : `OK (rows=${count ?? 0})`}`,
    )
  }

  // contratos: prueba lectura directa
  const contratosProbe = await admin.from('contratos').select('id').limit(1)
  if (contratosProbe.error) {
    console.log('contratos detail:', contratosProbe.error.code, contratosProbe.error.message, contratosProbe.error.details, contratosProbe.error.hint)
  }

  console.log('\n=== COLUMNAS documentos (versionado) ===')
  const { error: docColErr } = await admin
    .from('documentos')
    .select('tipo_documento,version,declaracion_jurada_aceptada,metadata')
    .limit(0)
  console.log(docColErr ? `FALTA: ${docColErr.message}` : 'OK')

  console.log('\n=== STORAGE BUCKETS ===')
  const { data: buckets, error: bucketErr } = await admin.storage.listBuckets()
  if (bucketErr) {
    console.log('ERROR:', bucketErr.message)
  } else {
    for (const b of buckets ?? []) {
      console.log(`${b.id} public=${b.public}`)
    }
  }

  const adminEmail = process.env.E2E_ADMIN_EMAIL
  const adminPass = process.env.E2E_ADMIN_PASSWORD

  // Usuario temporal para probar CRUD authenticated sin depender del admin E2E
  const probeEmail = `crud-probe-${Date.now()}@e2e.orvalya.test`
  const probePass = process.env.E2E_TEST_PASSWORD ?? 'OrvalyaE2E2026!'
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: probeEmail,
    password: probePass,
    email_confirm: true,
  })
  if (createErr || !created.user) {
    console.log('\n=== Usuario probe === FAIL', createErr?.message)
    return
  }
  const probeId = created.user.id
  await admin.from('perfiles').upsert({
    id: probeId,
    email: probeEmail,
    tipo: 'prestador',
    nombre: 'CRUD Probe',
  })

  const user = createClient(url, anonKey, { auth: { persistSession: false } })
  const { error: signInErr } = await user.auth.signInWithPassword({
    email: probeEmail,
    password: probePass,
  })
  if (signInErr) {
    console.log('\n=== SignIn probe === FAIL', signInErr.message)
    await admin.auth.admin.deleteUser(probeId)
    return
  }

  console.log(`\n=== CRUD authenticated (usuario probe) ===`)

  const tests: Array<[string, () => Promise<{ error: { code?: string; message: string } | null }>]> = [
    ['perfiles SELECT', () => user.from('perfiles').select('id').eq('id', probeId).maybeSingle()],
    [
      'perfiles UPDATE',
      () => user.from('perfiles').update({ nombre: 'CRUD Probe OK' }).eq('id', probeId).select('id').maybeSingle(),
    ],
    [
      'aceptaciones_legales INSERT',
      () => user.from('aceptaciones_legales').insert({
        user_id: probeId,
        version_terminos: '2026-06-19',
        version_privacidad: '2026-06-19',
      }).select('id').single(),
    ],
    [
      'aceptaciones_legales SELECT',
      () => user.from('aceptaciones_legales').select('id').eq('user_id', probeId).limit(1),
    ],
    ['documentos SELECT', () => user.from('documentos').select('id').eq('prestador_id', probeId).limit(1)],
    [
      'documentos INSERT',
      () => user.from('documentos').insert({
        prestador_id: probeId,
        tipo_documento: 'certificado_dgi',
        nombre: 'certificado_dgi',
        archivo_url: `${probeId}/certificado_dgi/v1.pdf`,
        fecha_vencimiento: '2027-12-31',
        declaracion_jurada_aceptada: true,
        estado: 'vigente',
        version: 1,
      }).select('id').single(),
    ],
    ['storage avatars upload', async () => {
      const blob = new Blob(['x'], { type: 'image/jpeg' })
      const r = await user.storage.from('avatars').upload(`${probeId}/avatar.jpg`, blob, { upsert: true })
      return { error: r.error ? { message: r.error.message } : null }
    }],
    ['storage documentos upload', async () => {
      const blob = new Blob(['%PDF'], { type: 'application/pdf' })
      const r = await user.storage.from('documentos').upload(`${probeId}/certificado_dgi/v1.pdf`, blob, { upsert: false })
      return { error: r.error ? { message: r.error.message } : null }
    }],
    ['RPC rut_ya_registrado', async () => {
      const r = await user.rpc('rut_ya_registrado', { p_rut: '123456789012', p_exclude_user_id: probeId })
      return { error: r.error ? { code: r.error.code, message: r.error.message } : null }
    }],
    ['RPC fetch_prestador_publico', async () => {
      const r = await user.rpc('fetch_prestador_publico', { p_id: probeId })
      return { error: r.error ? { code: r.error.code, message: r.error.message } : null }
    }],
  ]

  for (const [name, fn] of tests) {
    const { error } = await fn()
    console.log(`${name}: ${error ? `FAIL ${error.code ?? ''} ${error.message}` : 'OK'}`)
  }

  // Admin E2E (opcional)
  if (adminEmail && adminPass) {
    const adminUser = createClient(url, anonKey, { auth: { persistSession: false } })
    const { data: authData, error: authErr } = await adminUser.auth.signInWithPassword({
      email: adminEmail,
      password: adminPass,
    })
    if (!authErr && authData.user) {
      console.log(`\n=== Admin E2E (${adminEmail}) ===`)
      const adminTests: Array<[string, () => Promise<{ error: { code?: string; message: string } | null }>]> = [
        [
          'llamados SELECT moderación',
          () => adminUser.from('llamados').select('id').eq('estado', 'pendiente_moderacion').limit(1),
        ],
        ['contratantes SELECT', () => adminUser.from('contratantes').select('id').limit(1)],
      ]
      for (const [name, fn] of adminTests) {
        const { error } = await fn()
        console.log(`${name}: ${error ? `FAIL ${error.code ?? ''} ${error.message}` : 'OK'}`)
      }
    } else {
      console.log(`\n=== Admin E2E === SKIP (${authErr?.message ?? 'sin credenciales'})`)
    }
  }

  await admin.auth.admin.deleteUser(probeId)

  // Probe contratante + llamados
  const ctEmail = `crud-ct-${Date.now()}@e2e.orvalya.test`
  const { data: ctCreated, error: ctCreateErr } = await admin.auth.admin.createUser({
    email: ctEmail,
    password: probePass,
    email_confirm: true,
  })
  if (!ctCreateErr && ctCreated.user) {
    const ctId = ctCreated.user.id
    await admin.from('perfiles').upsert({ id: ctId, email: ctEmail, tipo: 'contratante', nombre: 'CT Probe' })
    const ct = createClient(url, anonKey, { auth: { persistSession: false } })
    await ct.auth.signInWithPassword({ email: ctEmail, password: probePass })
    console.log('\n=== CRUD contratante (usuario probe) ===')
    const ctTests: Array<[string, () => Promise<{ error: { code?: string; message: string } | null }>]> = [
      [
        'contratantes INSERT',
        () => ct.from('contratantes').insert({
          id: ctId,
          nombre_empresa: 'Probe SA',
          rut: `99${String(Date.now()).slice(-10)}`,
          tipo_contratante: 'empresa',
          rubro_principal: 'oficios',
          zona: 'Montevideo',
          email: ctEmail,
        }).select('id').single(),
      ],
      ['contratantes SELECT', () => ct.from('contratantes').select('id').eq('id', ctId).maybeSingle()],
      [
        'llamados INSERT',
        () => ct.from('llamados').insert({
          contratante_id: ctId,
          titulo: 'Probe llamado',
          descripcion: 'Test CRUD',
          rubro: 'oficios',
          zona: 'Montevideo',
          estado: 'pendiente_moderacion',
        }).select('id').single(),
      ],
      ['llamados SELECT', () => ct.from('llamados').select('id').eq('contratante_id', ctId).limit(1)],
    ]
    for (const [name, fn] of ctTests) {
      const { error } = await fn()
      console.log(`${name}: ${error ? `FAIL ${error.code ?? ''} ${error.message}` : 'OK'}`)
    }
    await admin.from('llamados').delete().eq('contratante_id', ctId)
    await admin.from('contratantes').delete().eq('id', ctId)
    await admin.auth.admin.deleteUser(ctId)
    console.log('Usuario contratante probe eliminado.')
  }

  console.log('\nUsuario probe eliminado.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
