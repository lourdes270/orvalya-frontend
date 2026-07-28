import type { NextConfig } from 'next'

/**
 * Las variables del proyecto siguen nombrándose VITE_* en .env (Next las carga solo).
 * Acá las re-exponemos con el prefijo que Next inyecta en el bundle del cliente,
 * para no tener que duplicar secretos ni reconfigurar Vercel.
 */
const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ?? '',
  NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.VITE_HCAPTCHA_SITE_KEY ?? '',
  NEXT_PUBLIC_FORMSPREE_CONTRATANTE_URL: process.env.VITE_FORMSPREE_CONTRATANTE_URL ?? '',
  NEXT_PUBLIC_SITE_URL: process.env.SITE_URL ?? 'https://www.orvalya.com',
}

const supabaseHost = (() => {
  try {
    return new URL(publicEnv.NEXT_PUBLIC_SUPABASE_URL).hostname
  } catch {
    return '*.supabase.co'
  }
})()

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.hcaptcha.com https://hcaptcha.com",
  "style-src 'self' 'unsafe-inline' https://*.hcaptcha.com",
  "img-src 'self' data: blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.hcaptcha.com https://hcaptcha.com https://formspree.io",
  "frame-src https://*.hcaptcha.com https://hcaptcha.com",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  env: publicEnv,
  reactStrictMode: true,
  // El repo vive dentro de una carpeta que tiene su propio lockfile; sin esto Next
  // infiere mal la raíz del workspace.
  turbopack: { root: import.meta.dirname },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: supabaseHost }],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
