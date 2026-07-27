/**
 * Verifica lo que ve un crawler que NO ejecuta JavaScript (WhatsApp, Facebook,
 * y el primer pase de Googlebot): pide el HTML crudo y busca title, description,
 * Open Graph, canonical y JSON-LD.
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

type Chequeo = { url: string; etiqueta: string }

const RUTAS: Chequeo[] = [
  { url: '/prestadores', etiqueta: 'Listado prestadores' },
  { url: '/prestadores/rubro/limpieza', etiqueta: 'Prestadores por rubro' },
  { url: '/prestadores/rubro/limpieza/montevideo', etiqueta: 'Rubro + zona' },
  { url: '/prestadores/zona/artigas', etiqueta: 'Prestadores por zona' },
  { url: '/llamados', etiqueta: 'Listado llamados' },
  { url: '/llamados/rubro/limpieza', etiqueta: 'Llamados por rubro' },
  { url: '/robots.txt', etiqueta: 'robots.txt' },
  { url: '/sitemap.xml', etiqueta: 'sitemap.xml' },
]

function extraer(html: string, re: RegExp): string | null {
  const m = re.exec(html)
  return m ? m[1].trim() : null
}

function jsonLdTipos(html: string): string[] {
  const tipos: string[] = []
  const re = /<script type="application\/ld\+json">(.*?)<\/script>/gs
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    try {
      const obj = JSON.parse(m[1]) as { '@type'?: string }
      if (obj['@type']) tipos.push(obj['@type'])
    } catch { /* ignorar */ }
  }
  return tipos
}

/** Toma una URL real del sitemap para probar el detalle de un prestador y de un llamado. */
async function rutasDinamicas(): Promise<Chequeo[]> {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text()
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  const out: Chequeo[] = []

  const perfil = locs.find(u => /\/prestadores\/[^/]+$/.test(u) && !u.includes('/rubro/') && !u.includes('/zona/'))
  const llamado = locs.find(u => /\/llamados\/[^/]+$/.test(u) && !u.includes('/rubro/') && !u.includes('/zona/'))

  if (perfil) out.push({ url: new URL(perfil).pathname, etiqueta: 'Perfil de prestador' })
  if (llamado) out.push({ url: new URL(llamado).pathname, etiqueta: 'Detalle de llamado' })
  return out
}

async function main() {
  let fallos = 0

  const imagen = await fetch(`${BASE}/opengraph-image`)
  console.log(`\n── Imagen de preview (${imagen.status}) ${imagen.headers.get('content-type')}`)
  if (imagen.status !== 200) fallos++

  for (const { url, etiqueta } of [...RUTAS, ...(await rutasDinamicas())]) {
    const res = await fetch(BASE + url, {
      headers: { 'User-Agent': 'WhatsApp/2.23 (facebookexternalhit/1.1)' },
    })
    const html = await res.text()

    if (url.endsWith('.txt') || url.endsWith('.xml')) {
      const urls = (html.match(/<loc>/g) ?? []).length
      console.log(`\n── ${etiqueta} (${res.status})`)
      console.log(url.endsWith('.xml') ? `  URLs en el sitemap: ${urls}` : `  ${html.split('\n').slice(0, 6).join(' | ')}`)
      if (res.status !== 200) fallos++
      continue
    }

    const title = extraer(html, /<title>([^<]*)<\/title>/)
    const desc = extraer(html, /<meta name="description" content="([^"]*)"/)
    const ogTitle = extraer(html, /<meta property="og:title" content="([^"]*)"/)
    const ogImg = extraer(html, /<meta property="og:image[^"]*" content="([^"]*)"/)
    const canonical = extraer(html, /<link rel="canonical" href="([^"]*)"/)
    const robots = extraer(html, /<meta name="robots" content="([^"]*)"/)
    const lang = extraer(html, /<html lang="([^"]*)"/)
    const h1 = extraer(html, /<h1[^>]*>(.*?)<\/h1>/s)
    const enlaces = (html.match(/<a\s/g) ?? []).length
    const tipos = jsonLdTipos(html)

    const ok = Boolean(title && desc && ogTitle && canonical && h1)
    if (!ok || res.status !== 200) fallos++

    console.log(`\n── ${etiqueta} · ${url} (${res.status}) ${ok ? 'OK' : 'INCOMPLETO'}`)
    console.log(`  lang:      ${lang}`)
    console.log(`  title:     ${title}`)
    console.log(`  desc:      ${desc?.slice(0, 90)}`)
    console.log(`  og:title:  ${ogTitle}`)
    console.log(`  og:image:  ${ogImg ?? '(ninguna)'}`)
    console.log(`  canonical: ${canonical}`)
    console.log(`  robots:    ${robots ?? '(por defecto: index)'}`)
    console.log(`  h1:        ${h1?.replace(/<[^>]*>/g, '')}`)
    console.log(`  JSON-LD:   ${tipos.join(', ') || '(ninguno)'}`)
    console.log(`  links <a>: ${enlaces}`)
  }

  console.log(`\n${fallos === 0 ? 'TODO OK' : `${fallos} rutas con problemas`}`)
  if (fallos > 0) process.exit(1)
}

main().catch(e => { console.error(e); process.exit(1) })
