import type { Metadata, Viewport } from 'next'
import { OG_IMAGE_DEFAULT, SITE_NAME, SITE_URL } from '../src/lib/seo'
import { AuthCallbackRedirect } from './_components/AuthCallbackRedirect'
import '../src/index.css'
import '../src/vistas/landing/landing.css'
import './publico.css'
import './landing.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Orvalya — Monotributistas, unipersonales y pymes en Uruguay',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Web app para monotributistas, unipersonales, independientes y pymes en Uruguay. ' +
    'Ofrecé o contratá servicios con documentación verificada en los 19 departamentos.',
  keywords: [
    'monotributista',
    'monotributo',
    'unipersonal',
    'pyme',
    'independiente',
    'freelancer',
    'tercerizados',
    'Uruguay',
    'Orvalya',
  ],
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'es_UY',
    url: SITE_URL,
    title: 'Orvalya — Monotributistas, unipersonales y pymes en Uruguay',
    description:
      'Independientes, monotributistas, unipersonales y pymes con documentación verificada en Uruguay.',
    images: [{ url: OG_IMAGE_DEFAULT, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orvalya — Monotributistas, unipersonales y pymes en Uruguay',
    description:
      'Independientes, monotributistas, unipersonales y pymes con documentación verificada en Uruguay.',
    images: [OG_IMAGE_DEFAULT],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo192.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: '35ctQ33G81VBz7ezJpnVKUpWhth0CjtYv0HI8eRkMeA',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F2D52',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY">
      <body>
        <AuthCallbackRedirect />
        {children}
      </body>
    </html>
  )
}
