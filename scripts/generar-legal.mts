/**
 * Los .md de legales son la fuente de verdad, pero Turbopack no soporta el
 * `?raw` de Vite. Generamos módulos TS equivalentes antes de compilar.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const DOCS = ['terminos', 'privacidad'] as const

for (const doc of DOCS) {
  const md = readFileSync(resolve(raiz, `src/content/legal/${doc}.md`), 'utf8')
  const destino = resolve(raiz, `src/content/legal/${doc}.gen.ts`)

  const salida =
    `// Generado por scripts/generar-legal.mts desde ${doc}.md — no editar a mano.\n` +
    `const contenido = ${JSON.stringify(md)}\n\nexport default contenido\n`

  writeFileSync(destino, salida, 'utf8')
  console.log(`${doc}.gen.ts · ${md.length} caracteres`)
}
