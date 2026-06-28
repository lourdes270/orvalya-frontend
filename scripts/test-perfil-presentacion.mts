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

console.log('\n=== Migración SQL ===')
const migration = readFileSync(resolve(root, 'supabase/migrations/007_perfil_presentacion.sql'), 'utf8')
for (const col of ['sobre_mi', 'experiencia', 'cursos', 'documentacion_adicional']) {
  assert(`columna ${col} en migración`, migration.includes(col))
}

console.log('\n=== PerfilPrestador UI ===')
const perfil = readFileSync(resolve(root, 'src/pages/dashboard/PerfilPrestador.tsx'), 'utf8')
assert('sección Presentación profesional', perfil.includes('Presentación profesional'))
assert('campo Sobre mí', perfil.includes('Sobre mí'))
assert('campo Mi experiencia', perfil.includes('Mi experiencia'))
assert('campo Cursos y estudios', perfil.includes('Cursos y estudios'))
assert('límite 300 sobre_mi', perfil.includes("'sobre_mi'") && perfil.includes('300'))
assert('límite 400 experiencia', perfil.includes("'experiencia'") && perfil.includes('400'))
assert('checkbox Carné de salud', perfil.includes('Carné de salud vigente'))
assert('checkbox Libreta de conducir', perfil.includes('Libreta de conducir'))
assert('checkbox Habilitación municipal', perfil.includes('Habilitación municipal'))
assert('guarda sobre_mi en payload', perfil.includes('sobre_mi: form.sobre_mi'))
assert('guarda documentacion_adicional', perfil.includes('documentacion_adicional: form.documentacion_adicional'))

console.log('\n=== Tipos Perfil ===')
const types = readFileSync(resolve(root, 'src/contexts/AuthContextType.ts'), 'utf8')
assert('tipo sobre_mi', types.includes('sobre_mi?:'))
assert('tipo documentacion_adicional', types.includes('documentacion_adicional?:'))

console.log(`\n=== Resultado: ${passed} ok, ${failed} fallos ===\n`)
process.exit(failed > 0 ? 1 : 0)
