const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

async function main() {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text()
  const url = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1])
    .find(u => /\/llamados\/[^/]+$/.test(u) && !u.includes('/rubro/') && !u.includes('/zona/'))

  if (!url) {
    console.log('No hay llamados abiertos en el sitemap.')
    return
  }

  const html = await (await fetch(new URL(url).pathname, { headers: {} }).catch(() => fetch(BASE + new URL(url).pathname))).text()
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]

  for (const b of bloques) {
    const obj = JSON.parse(b[1]) as Record<string, unknown>
    if (obj['@type'] !== 'JobPosting') continue

    console.log(JSON.stringify(obj, null, 2))

    // Campos que Google exige para mostrar la oferta en el recuadro de empleos.
    const requeridos = ['title', 'description', 'datePosted', 'hiringOrganization', 'jobLocation']
    const faltan = requeridos.filter(k => !obj[k])
    console.log(`\nRequeridos por Google: ${faltan.length === 0 ? 'todos presentes' : `FALTAN ${faltan.join(', ')}`}`)
    console.log(`validThrough (recomendado): ${obj.validThrough ? 'sí' : 'no'}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
