import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SpaMount from './SpaMount'

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ruta } = await params

  if (PRIVADAS.includes(ruta[0])) {
    return { robots: { index: false, follow: false } }
  }
  return {}
}

export default async function Page({ params }: Props) {
  const { ruta } = await params
  if (!esRutaConocida(ruta)) notFound()

  return <SpaMount />
}
