import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
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

console.log('\n=== emailRedirectTo en signUp ===')
const helpers = readFileSync(resolve(root, 'src/pages/onboarding/hooks/helpers.ts'), 'utf8')
const authCtx = readFileSync(resolve(root, 'src/contexts/AuthContext.tsx'), 'utf8')
const validaciones = readFileSync(resolve(root, 'src/lib/validaciones.ts'), 'utf8')

assert('onboarding signUp usa urlRedirectoAuth', helpers.includes('emailRedirectTo: urlRedirectoAuth()'))
assert('onboarding NO usa onboarding completar', !helpers.includes('urlRedirectoOnboardingCompletar'))
assert('AuthContext signUp usa urlRedirectoAuth', authCtx.includes('emailRedirectTo: urlRedirectoAuth()'))
assert('urlRedirectoAuth apunta a /auth', validaciones.includes("return `${window.location.origin}/auth`"))
assert('sin urlRedirectoOnboardingCompletar', !validaciones.includes('urlRedirectoOnboardingCompletar'))
assert('borrador en metadata se mantiene', helpers.includes('onboarding_borrador'))

console.log('\n=== Panel confirmación email ===')
const panel = readFileSync(resolve(root, 'src/pages/onboarding/components/ConfirmacionEmailPanel.tsx'), 'utf8')
assert('menciona iniciar sesión', panel.includes('iniciar sesión'))

console.log(`\n=== Resultado: ${passed} ok, ${failed} fallos ===\n`)
process.exit(failed > 0 ? 1 : 0)
