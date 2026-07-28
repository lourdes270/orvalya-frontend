import type { MetadataRoute } from 'next'
import { absoluteUrl } from '../src/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Rutas privadas o sin valor de búsqueda: no gastar presupuesto de rastreo.
        disallow: [
          '/dashboard',
          '/onboarding',
          '/admin',
          '/auth',
          '/aceptar-terminos',
          '/contratante',
          '/*?pagina=',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}
