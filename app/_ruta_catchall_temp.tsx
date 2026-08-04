import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SpaMount from './SpaMount'
import { absoluteUrl } from '../../src/lib/seo'

type Props = { params: Promise<{ ruta: string[] }> }

/** Rutas de la app privada: no deben entrar al índice de Google. */
const PRIVADAS = ['auth', 'dashboard', 'onboarding', 'admin', 'contratante', 'aceptar-terminos']

/** Rutas públicas que todavía atiende el SPA (ver src/App.tsx). */
const PUBLICAS = ['contacto']

/**
 * Este catch-all monta el SPA, así que sin esta lista cualquier URL inventada
 * respondería 200 con HTML indexable: un "soft 404" que le hace gastar
 * presupuesto de rastreo a Google. Lo que no está acá devuelve 404 de verdad.
 */
function esRutaConocida(ruta: string[]): boolean {
  return PRIVADAS.includes(ruta[0]) || PUBLICAS.includes(ruta[0])
}

/**
 * Metadata propia de las páginas públicas que atiende el SPA. Sin esto,
 * heredan title/description/canonical de la home (root layout) y Google
 * las trata como un duplicado de "/" en vez de indexarlas por su cuenta.
 */
const METADATA_PUBLICA: Record<string, Metadata> = {
  'contacto/contratante': {
    title: 'Contratá con documentación al día — Empresas',
    description:
      'Empresas y pymes que tercerizan servicios en Uruguay: escribinos para llevar el legajo, los certificados y los vencimientos de cada prestador ordenados y al día.',
    alternates: { canonical: '/contacto/contratante' },
    openGraph: {
      type: 'website',
      title: 'Contratá con documentación al día — Orvalya para empresas',
      description:
        'Empresas y pymes que tercerizan servicios en Uruguay: escribinos para llevar el legajo, los certificados y los vencimientos de cada prestador ordenados y al día.',
      url: absoluteUrl('/contacto/contratante'),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Contratá con documentación al día — Orvalya para empresas',
      description:
        'Empresas y pymes que tercerizan servicios en Uruguay: escribinos para llevar el legajo, los certificados y los vencimientos de cada prestador ordenados y al día.',
    },
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ruta } = await params

  if (PRIVADAS.includes(ruta[0])) {
    return { robots: { index: false, follow: false } }
  }
  return METADATA_PUBLICA[ruta.join('/')] ?? {}
}

export default async function Page({ params }: Props) {
  const { ruta } = await params
  if (!esRutaConocida(ruta)) notFound()

  return <SpaMount />
}
