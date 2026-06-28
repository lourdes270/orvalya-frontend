import {
  MENSAJE_CONFIRMACION_EMAIL,
  esMensajeConfirmacionEmail,
  mensajeErrorAuth,
  validarContrasena,
  validarEmail,
} from '../src/lib/validaciones.ts'

const CAPTCHA_VENCIDO_MSG = 'El captcha venció. Marcá la casilla otra vez y tocá Crear perfil.'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

let passed = 0
let failed = 0

function ok(label: string) {
  passed += 1
  console.log(`  ✓ ${label}`)
}

function fail(label: string, detail: string) {
  failed += 1
  console.error(`  ✗ ${label}: ${detail}`)
}

function assert(label: string, condition: boolean, detail = '') {
  if (condition) ok(label)
  else fail(label, detail)
}

console.log('\n=== Validaciones ===')
assert('email válido', validarEmail('test@gmail.com') === null)
assert('email inválido', validarEmail('sin-arroba') !== null)
assert('contraseña válida', validarContrasena('Temp1234!') === null)
assert('contraseña débil', validarContrasena('temp1234') !== null)
assert(
  'email duplicado traducido',
  mensajeErrorAuth({ message: 'User already registered', status: 400 }, 'x').includes('ya está registrado'),
)
assert(
  'email sin confirmar traducido',
  mensajeErrorAuth({ message: 'Email not confirmed' }, 'x').includes('confirmar tu email'),
)
assert('mensaje confirmación', esMensajeConfirmacionEmail(MENSAJE_CONFIRMACION_EMAIL))

console.log('\n=== verify-captcha (edge function) ===')
if (!SUPABASE_URL || !ANON_KEY) {
  fail('config', 'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
} else {
  const invoke = async (token: string) => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-captcha`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
        apikey: ANON_KEY,
      },
      body: JSON.stringify({ token, endpoint: 'register' }),
    })
    const body = await res.json().catch(() => ({}))
    return { status: res.status, body }
  }

  const vacio = await invoke('')
  assert('token vacío → 400', vacio.status === 400, `status ${vacio.status}`)

  const vencido = await invoke('token-expirado-de-prueba')
  const msgVencido = typeof vencido.body?.error === 'string' ? vencido.body.error : ''
  const aceptaVencido =
    msgVencido === CAPTCHA_VENCIDO_MSG
    || msgVencido.includes('captcha')
    || msgVencido.includes('Captcha')
  assert(
    'token inválido → mensaje claro (400)',
    vencido.status === 400 && aceptaVencido,
    `status ${vencido.status}, msg "${msgVencido}"`,
  )

  const rateLimitMsg = 'Demasiados intentos'
  if (msgVencido.includes(rateLimitMsg)) {
    console.log('  ⚠ IP en rate limit — esperá 15 min o probá desde otra red')
  }
}

console.log(`\n=== Resultado: ${passed} ok, ${failed} fallos ===\n`)
process.exit(failed > 0 ? 1 : 0)
